# assets/c — o compilador C do "Experimente"

Gerado por `tools/construir-c.mjs` (menos este arquivo). Não edite à mão.

| Arquivo | O que é |
| --- | --- |
| `c-worker.js` | Web Worker: núcleo do `@yowasp/clang` (runtime WASI do YoWASP + cola do jco, com 2 remendos de `tools/c-src/remendo.mjs`) + `tools/c-src/motor.mjs` (driver do clang, executor WASI dos programas, entrada linha a linha) + `tools/c-src/worker.mjs` |
| `llvm.core.wasm.gz` | Clang/LLD 22.1 (`clang version 22.1.0 (https://codeberg.org/YoWASP/llvm-project 9560ae0f2cc4…)`) em WebAssembly, do pacote npm `@yowasp/clang@22.0.0-git20542-10`, gzip -9. É o mesmo arquivo do Guia C++ |
| `sysroot.tar.gz` | `/usr` do compilador, **só o que C precisa**: cabeçalhos da wasi-libc e os genéricos do Clang (sem intrínsecos de x86/ARM/CUDA e sem libc++); `libc.a`, `libsetjmp.a`, `libwasi-emulated-*.a` etc. da wasi-libc do pacote; `libclang_rt.builtins.a`; `guia-rt.o` e `libguia.a` (fontes em `tools/c-src/`) |
| `manifesto.json` | tamanhos e hashes; `versao` dá nome ao cache do navegador (`guia-c-VERSAO`) |
| `LICENSE-*.txt` | LLVM (Apache-2.0 WITH LLVM-exception: Clang, LLD, compiler-rt), wasi-libc (MIT/Apache-2.0) + musl (MIT), YoWASP (ISC) |

Download na primeira vez: cerca de 23,4 MB (22,8 MB do compilador + 0,6 MB do sysroot). Não há cabeçalho pré-compilado: um programa com `#include <stdio.h>` compila em 0,1 a 0,3 s (Chrome e Node).

Teste no navegador: sirva a raiz do site e abra `/tools/demo.html` (caixas de todos os tipos). Para testar o modo sem JSPI no Chrome, defina `window.CSIM_SEM_JSPI = true` antes de carregar `csim.js`.

## Como o código vira programa
1. O worker pergunta ao driver (`clang -### …`) quais comandos rodar.
2. Roda o `cc1` de cada `.c`.
3. Roda o `wasm-ld` com os extras do guia:
   - `guia-rt.o` e `--wrap=abort,__stdio_read,raise`: a pasta `/home/ana`; o sinal do `abort`; a saída do `printf` que aparece antes de ler o teclado (como na glibc; a musl não faz isso); `raise(SIGTERM)` sem tratador termina como no Linux (`Terminado`, 143);
   - `-lguia` (`system()` responde `sh: 1: …: not found`), `-lsetjmp`, `-lwasi-emulated-signal/process-clocks/getpid`;
   - pilha de 8 MB (`--stack-first`);
   - no máximo 256 MB de memória.
4. Opções internas, que o leitor não vê:
   - `-fsanitize=null -fsanitize-trap=null`: um ponteiro nulo vira "Falha de segmentação";
   - `-mllvm -wasm-enable-sjlj`: `setjmp`/`longjmp` com as exceções do WebAssembly;
   - `-D_WASI_EMULATED_SIGNAL/PROCESS_CLOCKS/GETPID`;
   - cores ANSI nos diagnósticos.
5. O programa (WASI preview1) roda em `motor.mjs/rodarPrograma`:
   - sistema de arquivos em memória;
   - stdout como terminal (com buffer de linha);
   - entrada linha a linha, que pausa com JSPI (`WebAssembly.Suspending`) ou, sem JSPI, roda o programa de novo com as linhas já digitadas;
   - traps viram sinais (134, 136, 139).

## Regenerar
```bash
cd tools && npm install            # @yowasp/clang 22.0.0-git20542-10 + esbuild (versões em package.json)
node construir-c.mjs
```
Depois de regenerar, rode `node tools/testar-missoes.js` em todas as páginas.
