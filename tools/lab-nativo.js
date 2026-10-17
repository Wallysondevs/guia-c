/* Compila e roda com o gcc 15 NATIVO do laboratório (~/guia-c-lab/lab) para
   comparar com o Clang 22 em WebAssembly do editor. Um processo por vez, timeout 60;
   o programa roda com timeout 10. Pasta pessoal própria e única por execução
   (vários autores rodam ao mesmo tempo), apagada quando o processo termina. */
"use strict";
const { spawnSync } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");

const LAB = path.join(os.homedir(), "guia-c-lab/lab");
const NOME = "tm-" + process.pid + "-" + Math.random().toString(36).slice(2, 8);
const PASTA = path.join(os.homedir(), "guia-c-lab/homes", NOME);
let usada = false;
process.on("exit", () => { if (usada) { try { fs.rmSync(PASTA, { recursive: true, force: true }); } catch (e) { /* ok */ } } });
for (const sinal of ["SIGINT", "SIGTERM"]) process.on(sinal, () => process.exit(130));

function b64(s) { return Buffer.from(s, "utf8").toString("base64"); }
function q(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; }

/** arquivos: [{nome, codigo}]; opts: {flags: "…", args: [...], stdin: string|null, compilador: "gcc"|"clang"}
 *  → { compilou, diag, saida (stdout+stderr do programa), exit, versao } */
function rodar(arquivos, opts) {
  opts = opts || {};
  if (!fs.existsSync(LAB)) throw new Error("laboratório não encontrado em " + LAB);
  usada = true;
  const cc = opts.compilador || "gcc";
  const fontes = arquivos.filter((a) => /\.c$/i.test(a.nome)).map((a) => a.nome);
  const prog = (fontes[0] || arquivos[0].nome).replace(/^.*\//, "").replace(/\.[^.]*$/, "") || "programa";
  const flags = opts.flags === undefined || opts.flags === null ? "-std=c23 -Wall -Wextra" : opts.flags;
  // math.h: o editor não precisa de -lm; no terminal a aula ensina a pôr. Na comparação, o gcc ganha o -lm sozinho.
  const libs = /^\s*#\s*include\s*<math\.h>/m.test(arquivos.map((a) => a.codigo).join("\n")) && !/(^|\s)-lm(\s|$)/.test(flags) ? " -lm" : "";
  const entrada = opts.stdin !== null && opts.stdin !== undefined ? "printf %s " + q(b64(opts.stdin)) + " | base64 -d > /tmp/entrada.txt" : ": > /tmp/entrada.txt";
  const script = [
    "cd /home/ana && rm -rf ./* ./.[!.]* 2>/dev/null; cd /home/ana",
    arquivos.map((a) => 'mkdir -p "$(dirname ' + q(a.nome) + ')" && printf %s ' + q(b64(a.codigo)) + " | base64 -d > " + q(a.nome)).join("\n"),
    entrada,
    "echo @@COMPILA@@",
    // bibliotecas (-lm, -lpthread…) depois das fontes, como se escreve no terminal (antes delas o ligador não as usa)
    cc + " " + flags.split(/\s+/).filter((f) => f && !/^-l/.test(f)).join(" ") + " " + fontes.map(q).join(" ") + " -o " + q(prog) + " " + flags.split(/\s+/).filter((f) => /^-l/.test(f)).join(" ") + libs + " 2>&1",
    'echo "@@CEXIT@@$?"',
    // stdbuf -oL: saída em linhas, como num terminal (senão um programa que aborta perde o que estava no buffer)
    "if [ -x " + q(prog) + " ]; then timeout 10 stdbuf -oL -eL ./" + q(prog) + " " + (opts.args || []).map(q).join(" ") + " < /tmp/entrada.txt 2>&1 | grep -v '^timeout: o comando monitorado'; echo \"@@EXIT@@${PIPESTATUS[0]}\"; fi",
    cc + " --version | head -1",
  ].join("\n");
  const r = spawnSync("timeout", ["60", LAB, "-n", NOME, "-N", "--", "bash", "-s"], { input: script, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw r.error;
  const s = r.stdout + (r.stderr || "");
  const m = /@@COMPILA@@\n([\s\S]*?)@@CEXIT@@(\d+)\n(?:([\s\S]*?)@@EXIT@@(\d+)\n)?([^\n]*)/.exec(s);
  if (!m) return { compilou: false, diag: s, saida: "", exit: null, versao: "?" };
  return { compilou: m[2] === "0", diag: m[1], saida: m[3] || "", exit: m[4] !== undefined ? +m[4] : null, versao: (m[5] || cc).replace(/^gcc \(Ubuntu [^)]*\) /, "gcc ").replace(/^Ubuntu clang version/, "clang").trim() };
}

// Diferenças linha a linha (LCS simples).  "- " = editor (Clang/wasi-libc), "+ " = nativo (gcc/glibc)
function diferencas(a, b) {
  if (String(a) === String(b)) return [];
  const linhas = (s) => { s = String(s).replace(/\n$/, ""); return s === "" ? [] : s.split("\n").slice(0, 600); };
  const A = linhas(a), B = linhas(b);
  const n = A.length, m = B.length, L = [];
  for (let i = 0; i <= n; i++) L.push(new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const r = []; let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { i++; j++; }
    else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { r.push("+ " + B[j]); j++; }
    else { r.push("- " + A[i]); i++; }
  }
  return r;
}

// Diferenças conhecidas entre o editor (Clang + wasi-libc + WebAssembly 32 bits) e o gcc (glibc, Linux 64 bits).
const CONHECIDAS = [
  [/Assertion .*failed/, "assert (wasi-libc × glibc)"],
  [/0x[0-9a-f]{3,}|\(nil\)|\b0{8}\b/i, "endereços de memória (%p)"],
  [/double free|free\(\): invalid|corrupted|malloc\(\)/, "erros do malloc (a glibc detecta e avisa; a wasi-libc não)"],
];
function classificar(dif, fonte) {
  const r = new Set();
  for (const l of dif) for (const [re, t] of CONHECIDAS) if (re.test(l)) r.add(t);
  if (fonte && /\brand\s*\(/.test(fonte)) r.add("números sorteados (o rand() da wasi-libc/musl e o da glibc dão sequências diferentes)");
  if (fonte && /\bsizeof\b|LONG_MAX|LONG_MIN|SIZE_MAX|ULONG_MAX|%zu|%ld|%p/.test(fonte)) r.add("tamanhos: o WebAssembly é de 32 bits (ponteiro, long e size_t com 4 bytes; no Linux, 8)");
  if (fonte && /\b(time\s*\(|localtime|gmtime|clock\s*\(|strftime|ctime|getpid)\b/.test(fonte)) r.add("horário, tempo medido e PID");
  return Array.from(r);
}

function mostrarDiferencas(wasm, nativo, prefixo, fonte) {
  prefixo = prefixo || "  ";
  const d = diferencas(wasm, nativo);
  if (!d.length) { console.log(prefixo + "saídas idênticas"); return 0; }
  const c = classificar(d, fonte);
  console.log(prefixo + "diferenças (- editor, + gcc)" + (c.length ? " — esperado: " + c.join("; ") : "") + ":");
  d.slice(0, 20).forEach((l) => console.log(prefixo + "  " + l));
  if (d.length > 20) console.log(prefixo + "  … (" + (d.length - 20) + " linhas a mais)");
  return d.length;
}

module.exports = { rodar, diferencas, classificar, mostrarDiferencas, LAB };
