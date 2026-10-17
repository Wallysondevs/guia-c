#!/usr/bin/env node
/* =====================================================================
   Gera assets/c/ (o C de verdade do "Experimente" do Guia C):
     c-worker.js            worker: núcleo do @yowasp/clang (remendado) + tools/c-src/*
     llvm.core.wasm.gz      o Clang/LLD 22 em WebAssembly, gzip -9
     sysroot.tar.gz         só o que C precisa: cabeçalhos da wasi-libc e os genéricos
                            do Clang; libc.a etc. da wasi-libc; compiler-rt;
                            guia-rt.o e libguia.a (fontes em tools/c-src/). Sem libc++.
     manifesto.json, LICENSE-*.txt, LEIA.md (este último é escrito à mão)
   e atualiza o tamanho do download em assets/csim.js.

   Uso:  cd tools && npm install && node construir-c.mjs
   (adaptado de tools/construir-cpp.mjs do Guia C++)
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { remendarBundleYowasp } from "./c-src/remendo.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..");
const SAIDA = path.join(RAIZ, "assets/c");
const NM = path.join(AQUI, "node_modules");
const PKG = path.join(NM, "@yowasp/clang");
const GEN = path.join(PKG, "gen");
const require = createRequire(import.meta.url);
const VERSAO_PKG = JSON.parse(fs.readFileSync(path.join(PKG, "package.json"), "utf8")).version;

const t0 = Date.now();
const log = (...a) => console.log("[" + ((Date.now() - t0) / 1000).toFixed(1) + "s]", ...a);
fs.mkdirSync(SAIDA, { recursive: true });

/* ---------- 0. núcleo do YoWASP (remendado) ---------- */
const NUCLEO = path.join(NM, ".guia-c", "nucleo.mjs");
fs.mkdirSync(path.dirname(NUCLEO), { recursive: true });
fs.writeFileSync(NUCLEO, remendarBundleYowasp(fs.readFileSync(path.join(GEN, "bundle.js"), "utf8")));
const Y = await import(pathToFileURL(NUCLEO).href);
const M = await import(pathToFileURL(path.join(AQUI, "c-src/motor.mjs")).href);

/* ---------- 1. sysroot enxuto (só C) ---------- */
log("montando o sysroot…");
const orig = M.lerTar(fs.readFileSync(path.join(GEN, "llvm-resources.tar")));
const sys = { include: {}, lib: { "wasm32-wasip1": {}, "wasm32-unknown-wasip1": {} } };
// cabeçalhos do Clang: só os genéricos (nada de intrínsecos de x86/ARM/CUDA…)
const CLANG_H = /^(__stdarg_.*|__stddef_.*|__float_.*|stdarg|stddef|stdint|stdbool|stdalign|stdatomic|stdnoreturn|stdckdint|stdcountof|stddefer|float|limits|iso646|varargs|inttypes|tgmath|wasm_simd128|__wasm_.*|unwind|ptrauth|stdmchar|builtins|__clang_wasm.*)\.h$/;
for (const [n, v] of Object.entries(orig.include)) {
  if (v instanceof Uint8Array) { if (CLANG_H.test(n)) sys.include[n] = v; }
}
sys.include["wasm32-wasip1"] = orig.include["wasm32-wasip1"];
const libOrig = orig.lib["wasm32-wasip1"];
for (const f of ["crt1-command.o", "crt1.o", "libc.a", "libm.a", "libdl.a", "libpthread.a", "librt.a", "libutil.a", "libxnet.a", "libresolv.a", "libcrypt.a", "libsetjmp.a",
  "libwasi-emulated-getpid.a", "libwasi-emulated-mman.a", "libwasi-emulated-process-clocks.a", "libwasi-emulated-signal.a", "libc-printscan-long-double.a"]) {
  if (libOrig[f]) sys.lib["wasm32-wasip1"][f] = libOrig[f];
}
sys.lib["wasm32-unknown-wasip1"]["libclang_rt.builtins.a"] = orig.lib["wasm32-unknown-wasip1"]["libclang_rt.builtins.a"];

/* ---------- 2. o compilador (no Node) para gerar guia-rt.o e libguia.a ---------- */
const modulos = {};
for (const f of ["llvm.core.wasm", "llvm.core2.wasm", "llvm.core3.wasm", "llvm.core4.wasm"]) modulos[f] = new WebAssembly.Module(fs.readFileSync(path.join(GEN, f)));
let C = M.criarCompilador({ Y, modulos, sysroot: sys });
const fonte = (n) => fs.readFileSync(path.join(AQUI, "c-src", n), "utf8");
function objeto(nome) {
  const r = C.executarDriver(["clang", "-std=c23", "-O2", "-Wall", "-Wextra", "-c", nome, "-o", nome.replace(/\.c$/, ".o")], [{ nome, codigo: fonte(nome) }]);
  if (r.exit) throw new Error(nome + ":\n" + r.saida);
  return r.ler(nome.replace(/\.c$/, ".o"));
}
log("compilando guia-rt.o e libguia.a…");
sys.lib["wasm32-wasip1"]["guia-rt.o"] = objeto("guia-rt.c").slice();
{
  const sisO = objeto("guia-sistema.c").slice();
  const r = C.ferramenta(["ar", "rcs", "libguia.a", "guia-sistema.o"], [{ nome: "guia-sistema.o", codigo: sisO }]);
  if (r.exit) throw new Error("ar: " + r.saida);
  sys.lib["wasm32-wasip1"]["libguia.a"] = r.ler("libguia.a").slice();
}
C = M.criarCompilador({ Y, modulos, sysroot: sys });
{
  // confere: um programa simples compila e liga com as opções do editor
  const r = await C.compilar({ arquivos: [{ nome: "programa.c", codigo: "#include <stdio.h>\n#include <setjmp.h>\n#include <math.h>\nint main(void) { jmp_buf b; if (!setjmp(b)) longjmp(b, 1); printf(\"%f\\n\", sqrt(2.0)); return 0; }\n" }] });
  if (!r.ok) throw new Error("o programa de teste não compilou:\n" + M.semAnsi(r.diag));
  log("programa de teste compilou em", r.ms, "ms");
}

/* ---------- 3. arquivos de saída ---------- */
function tarUstar(arvore) {
  const partes = [];
  const cab = (nome, tam, tipo) => {
    const b = Buffer.alloc(512);
    let n = nome, pre = "";
    if (Buffer.byteLength(n) > 100) { const i = n.lastIndexOf("/", 154); pre = n.slice(0, i); n = n.slice(i + 1); }
    b.write(n, 0, 100); b.write(tipo === "5" ? "0000755\0" : "0000644\0", 100); b.write("0000000\0", 108); b.write("0000000\0", 116);
    b.write(tam.toString(8).padStart(11, "0") + "\0", 124); b.write("00000000000\0", 136);
    b.write("        ", 148); b.write(tipo, 156); b.write("ustar\0" + "00", 257); b.write(pre, 345, 155);
    let s = 0; for (const x of b) s += x;
    b.write(s.toString(8).padStart(6, "0") + "\0 ", 148);
    return b;
  };
  (function anda(d, pref) {
    for (const k of Object.keys(d).sort()) {
      const v = d[k], nome = pref + k;
      if (v instanceof Uint8Array) {
        partes.push(cab(nome, v.length, "0"), Buffer.from(v));
        const r = v.length % 512; if (r) partes.push(Buffer.alloc(512 - r));
      } else { partes.push(cab(nome + "/", 0, "5")); anda(v, nome + "/"); }
    }
  })(arvore, "");
  partes.push(Buffer.alloc(1024));
  return Buffer.concat(partes);
}
const gz = (b) => zlib.gzipSync(b, { level: 9 });
function gravarGz(nome, dados) {
  const z = gz(dados);
  fs.mkdirSync(path.dirname(path.join(SAIDA, nome)), { recursive: true });
  fs.writeFileSync(path.join(SAIDA, nome + ".gz"), z);
  log(nome + ".gz:", dados.length, "→", z.length, "bytes");
  return { arquivo: nome, bytes: dados.length, bytesGz: z.length, sha1: crypto.createHash("sha1").update(dados).digest("hex").slice(0, 12) };
}
const infoSys = gravarGz("sysroot.tar", tarUstar(sys));
const wasmCore = fs.readFileSync(path.join(GEN, "llvm.core.wasm"));
const destinoWasm = path.join(SAIDA, "llvm.core.wasm.gz");
let infoWasm;
const sha = crypto.createHash("sha1").update(wasmCore).digest("hex").slice(0, 12);
const marca = path.join(SAIDA, ".llvm.core.sha1");
if (fs.existsSync(destinoWasm) && fs.existsSync(marca) && fs.readFileSync(marca, "utf8") === sha) {
  infoWasm = { arquivo: "llvm.core.wasm", bytes: wasmCore.length, bytesGz: fs.statSync(destinoWasm).size, sha1: sha };
  log("llvm.core.wasm.gz já está atualizado");
} else { infoWasm = gravarGz("llvm.core.wasm", wasmCore); fs.writeFileSync(marca, sha); }
const versao = crypto.createHash("sha1").update([infoWasm.sha1, infoSys.sha1, fonte("motor.mjs"), fonte("worker.mjs")].join(",")).digest("hex").slice(0, 10);
const manifesto = { versao, pacote: VERSAO_PKG, wasm: infoWasm, sysroot: infoSys, pchs: [] };

/* ---------- 4. o worker ---------- */
const esbuild = require(path.join(NM, "esbuild"));
const cores = {};
for (const f of ["llvm.core2.wasm", "llvm.core3.wasm", "llvm.core4.wasm"]) cores[f] = fs.readFileSync(path.join(GEN, f)).toString("base64");
await esbuild.build({
  entryPoints: [path.join(AQUI, "c-src/worker.mjs")],
  bundle: true, format: "iife", platform: "browser", target: ["es2022"], minify: true, legalComments: "eof",
  alias: { "yowasp-nucleo": NUCLEO },
  define: { __MANIFESTO__: JSON.stringify(manifesto), __CORES_PEQUENOS__: JSON.stringify(cores), "import.meta.url": "self.location.href" },
  external: ["node:fs/promises"],
  banner: { js: "/* Guia C — Clang/LLD 22.1 em WebAssembly (@yowasp/clang " + VERSAO_PKG + ", ISC; LLVM: Apache-2.0 WITH LLVM-exception). Gerado por tools/construir-c.mjs; fonte em tools/c-src/. */" },
  outfile: path.join(SAIDA, "c-worker.js"),
  logLevel: "warning",
});
log("c-worker.js:", fs.statSync(path.join(SAIDA, "c-worker.js")).size, "bytes");

/* ---------- 5. licenças e tamanhos ---------- */
fs.copyFileSync(path.join(AQUI, "licencas/LLVM-LICENSE.txt"), path.join(SAIDA, "LICENSE-LLVM.txt"));
fs.writeFileSync(path.join(SAIDA, "LICENSE-wasi-libc.txt"),
  "wasi-libc (https://github.com/WebAssembly/wasi-libc): Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT.\nTexto MIT abaixo; o musl (parte da wasi-libc) vem depois.\n\n" +
  fs.readFileSync(path.join(AQUI, "licencas/wasi-libc-LICENSE-MIT"), "utf8") + "\n\n==== musl ====\n\n" + fs.readFileSync(path.join(AQUI, "licencas/musl-COPYRIGHT"), "utf8"));
fs.copyFileSync(path.join(AQUI, "licencas/yowasp-ISC.txt"), path.join(SAIDA, "LICENSE-yowasp.txt"));
const total = infoWasm.bytesGz + infoSys.bytesGz;
const sim = path.join(RAIZ, "assets/csim.js");
if (fs.existsSync(sim)) {
  const s = fs.readFileSync(sim, "utf8");
  const novo = s.replace(/var C_BYTES = \d+;/, "var C_BYTES = " + total + ";");
  if (novo !== s) { fs.writeFileSync(sim, novo); log("assets/csim.js: C_BYTES =", total); }
}
fs.writeFileSync(path.join(SAIDA, "manifesto.json"), JSON.stringify(manifesto, null, 1) + "\n");
log("pronto. Download na primeira vez:", (total / 1e6).toFixed(1), "MB");
