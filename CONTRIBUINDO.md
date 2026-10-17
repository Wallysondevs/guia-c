# Como escrever uma página do Guia C

O guia é uma **escola**, estilo W3Schools, para quem **nunca programou**. **Uma aula = um assunto**. O dono do projeto reclamou de outro guia que juntava vários comandos numa página. Nunca mostre código "seco":
- explique cada linha (anatomia);
- mostre a saída real;
- mostre o que acontece quando dá errado (a mensagem real do compilador ou do programa);
- deixe o leitor praticar no editor do guia, que **compila e roda C de verdade** no navegador.

## 1. Esqueleto do arquivo
Igual ao do Guia C++. Use como modelo `~/guia-cpp/variaveis.html` (só a estrutura: cabeçalho, `<main>`, blocos, rodapé). Troque:
- `<title>C TEMA — descrição | Guia C</title>`;
- `<h1>C <span class="hl">TEMA</span></h1>`;
- a caixa `.trycpp` por **`.tryc`**.

Menu, selo e Anterior/Próximo vêm de `assets/site.js` (`NIVEIS`). **Não mude a `NIVEIS`**. Links internos só para páginas que estão nela (mesmo que ainda não existam: outro autor está escrevendo).

## 2. Ordem de uma aula
1. Intro.
2. "Você vai aprender".
3. A ideia antes do código (comparação do dia a dia).
4. Do simples ao completo, uma novidade por vez, com `dl.anatomy` ou tabela "linha → o que faz".
5. **Saída real** depois de cada exemplo.
6. **Pelo menos dois "Experimente"** (`.tryc`) por aula: um no meio e uma missão no fim.
7. Formas diferentes + "qual usar".
8. **Quando dá errado** (`div.cenario`): código, mensagem real do compilador ou do programa, o que significa, como consertar.
9. Referência (`table.ref`).
10. Exercícios (3 ou mais: `.exercise`, `.mc`).
11. Resumo.

Páginas de **Projetos** seguem o passo a passo (versão 1, 2, 3… do programa, cada uma com um `.tryc`). Páginas de **Referência** são tabelas, com poucos `.tryc` (pode ser um só). `quiz.html` usa só `.mc`.

## 3. Componentes

### Código C para ler
```html
<pre class="file" data-file="ola.c">#include &lt;stdio.h&gt;

int main(void) {
    printf("Olá, mundo!\n");
    return 0;
}
</pre>
```
Dentro de `<pre>`, escape `&lt; &gt; &amp;`. Isso vale **sempre** em C: `#include &lt;stdio.h&gt;`, `&amp;idade` no `scanf`, `p-&gt;nome`, `a &amp;&amp; b`, `x &lt;&lt; 2`.

### Terminal (`pre.term`)
Igual aos outros guias:
- `$ ` = `ana@notebook:~$`;
- `> ` = continuação;
- `«` = anotação.

Use-o para `gcc`, `./programa`, `make`, `cmake`, `gdb`, `valgrind`.

### Editor "Experimente" (`.tryc`), com compilador real
```html
<div class="tryc" data-goal="out:Olá, Ana!">
<p class="try-task"><strong>Missão:</strong> troque "mundo" por "Ana" e clique em Rodar.</p>
<pre class="script">#include &lt;stdio.h&gt;

int main(void) {
    printf("Olá, mundo!\n");
    return 0;
}
</pre>
<pre class="solucao">#include &lt;stdio.h&gt;

int main(void) {
    printf("Olá, Ana!\n");
    return 0;
}
</pre>
</div>
```
- **Rodar** compila o código com um **compilador C real** (Clang compilado para WebAssembly, carregado na primeira vez que o leitor clica em Rodar), com `-std=c23 -Wall -Wextra`, e roda o programa.
  - A caixa mostra os erros e avisos de compilação, a saída do programa e o código de saída.
  - O compilador do editor é o **Clang**; os `pre.term` mostram o **gcc**. As mensagens dizem a mesma coisa com palavras diferentes. A aula `simulador.html` explica.
- **Vários arquivos** (para `.h`/`.c`, arquivos de dados `.txt`/`.csv`): vários `<pre class="script" data-file="…">` na mesma caixa, que viram abas.
  - Todos os `.c` são compilados juntos.
  - Os outros arquivos ficam na pasta em que o programa roda.
- `data-stdin="…"`: entrada para `scanf`/`fgets`/`getchar`. Sem `data-stdin`, o programa pode **pedir a entrada e o leitor digita** no terminal da caixa.
- `data-args="…"`: o que chega em `argv`.
- `data-flags="…"`: troca **todas** as opções de compilação, por exemplo `data-flags="-std=c17 -Wall -Wextra"` ou `-O2`. Escreva a linha inteira.
- Sem `data-goal`: caixa livre.
- Com `data-goal`: missão, e o `pre.solucao` é **obrigatório**. Com várias abas, use um `pre.solucao data-file="…"` para cada arquivo que muda.

### Metas (`data-goal`, separadas por vírgula; `\,` = vírgula literal)
| Meta | Verdade quando… |
| --- | --- |
| `out:TEXTO` / `outre:REGEX` | a saída do programa (stdout e stderr, como no terminal) contém / casa |
| `compila` | compilou sem erros |
| `erro:TEXTO` | a compilação **falhou** e a mensagem contém o texto (missões "provoque o erro"). Use um trecho que exista no Clang **e** no gcc, ou uma regex com as duas formas (veja abaixo) |
| `aviso:TEXTO` | a compilação deu um aviso contendo o texto, por exemplo `aviso:unused variable` |
| `semaviso` | compilou sem nenhum aviso |
| `exit:N` | o programa terminou com o código N |
| `src:REGEX` | o código do leitor casa com a regex (para exigir um recurso, como `src:for\s*\(`) |

**Regras exatas (decididas antes de escrever; não invente outras):**
- **Regex** (`outre:`, `src:`, `erro:/…/`, `aviso:/…/`): é a regex normal do JavaScript. `|` é alternativa e `\|` é uma barra vertical literal. Exemplo: `erro:/undeclared identifier|undeclared \(first use/`.
- `out:` e `outre:` olham **só a saída do programa** (stdout e stderr, na ordem). Nunca olham as mensagens do compilador. Se o programa não compilou, são falsas.
- `outre:` aplica a regex **à saída inteira, sem flags**: `^` e `$` são o começo e o fim de toda a saída, não de cada linha. Escreva `\n` para as quebras: `outre:^Olá\nTchau\n$`.
- `erro:` e `aviso:` aceitam texto ou `/regex/`, também com flags (`/…/i`). `erro:` também vale para erro do ligador. `aviso:` olha cada linha `warning:`.
- `exit:N` é o código do **programa** e é falso se ele não compilou.
- `src:` aplica a regex ao código de todas as abas, com a flag `m`.
- **Escapes no `data-goal`:** `\,` é vírgula literal; `\\` é uma barra invertida literal; qualquer outro `\x` fica como está (`\d`, `\n`, `\|` das regex não mudam). Uma vírgula sem escape só separa metas quando vem seguida do nome de uma meta. `>` e `&gt;` são a mesma coisa.
- O **código inicial não pode cumprir a meta**, e a **solução tem de cumprir** (o testador confere).
- **A meta não pode depender** do que muda entre o editor e o gcc (seção 4): tamanho de `long` e de ponteiro, endereços impressos com `%p`, números do `rand()`, data/hora, mensagens do compilador escritas de um jeito só.

### Outros blocos
`dl.anatomy`, `div.note/.tip/.warning/.cenario`, `ol.passo`, `div.table-wrap > table.ref`, `.exercise`, `.mc`, `figure`, `<span class="versao">C23</span>`.

No `.exercise`, `data-answer="a|b"` aceita respostas alternativas. Para uma barra vertical dentro da resposta (`||`, `|=`), escreva `\|`.

## 4. O editor do guia: C real no navegador (`assets/csim.js`)
É o **Clang 22.1 oficial (LLVM) compilado para WebAssembly** (pacote `@yowasp/clang`, licença ISC), com a **wasi-libc** (a biblioteca C, baseada na musl). É o mesmo motor do Guia C++, sem a parte de C++. Tudo fica hospedado no próprio site (`assets/c/`) e só é baixado quando o leitor clica em **Rodar**. O programa gerado (WebAssembly) roda no navegador, num Web Worker. Detalhes técnicos e como regenerar: `assets/c/LEIA.md`.

> **Esta seção é mantida pelo agente do simulador.** Tudo aqui foi conferido no motor final com `node tools/sim.js` e `--nativo` (gcc 15.2 do laboratório). Antes de escrever uma frase do tipo "no editor…" que não esteja aqui, confira com `node tools/sim.js`.

### O que o leitor vê
- `$ clang -std=c23 -Wall -Wextra programa.c -o programa` (ou o `data-flags`), os erros e avisos do Clang com cores, `$ ./programa` (mais os argumentos) e a saída.
- Quando o programa morre: `Falha de segmentação (imagem do núcleo gravada)` (139), `Abortado (imagem do núcleo gravada)` (134), `Exceção de ponto flutuante (imagem do núcleo gravada)` (136), `Terminado` (143, de um `raise(SIGTERM)`); no fim, `[código de saída: N]`.
- O executável tem o nome do primeiro `.c` sem a extensão: `ola.c` vira `./ola`. Sem `data-file`, o arquivo é `programa.c`.
- **`data-flags` substitui todas as opções.** Escreva a linha inteira: `data-flags="-std=c17 -Wall -Wextra"`.
- Debaixo de cada caixa há uma nota: "O editor compila com o Clang; os terminais das aulas mostram o gcc", com link para `simulador.html`.

### Download e tempo
- **Primeira vez:** cerca de **23 MB** (o compilador tem 22,8 MB; os cabeçalhos e a biblioteca C, 0,6 MB). O navegador guarda tudo (Cache API): nas próximas visitas não há download.
- **Compilação:** de 0,1 a 0,3 s por programa (Chrome e Node, nesta máquina). Não há cabeçalho pré-compilado: o `<stdio.h>` do C é pequeno.

### O que funciona
- **C23 inteiro:** `bool`/`true`/`false` sem include, `nullptr`, `constexpr`, `typeof`, `auto`, `[[nodiscard]]`, `static_assert`, `1'000'000`, `0b1010`, `#embed "dados.txt"` (com o arquivo numa aba). `__STDC_VERSION__` vale `202311`.
  - `-std=c17`, `-std=c11` e `-std=c99` funcionam pelo `data-flags` (`__STDC_VERSION__` = `201710`, `201112`, `199901`). Com `-std=c17`, `bool`, `nullptr` e `constexpr` dão `error: use of undeclared identifier 'bool'` (sem `#include <stdbool.h>`).
- **Bibliotecas:** `stdio.h` (printf, scanf, fgets, getchar, fopen, perror…), `string.h`, `stdlib.h` (malloc, free, qsort, bsearch, strtol, rand/srand, exit, atexit, getenv), `ctype.h`, `math.h`, `time.h`, `stdint.h`, `inttypes.h`, `stdarg.h`, `assert.h`, `errno.h`, `limits.h`, `float.h`, `stdckdint.h`, `setjmp.h` (`setjmp`/`longjmp` funcionam), `signal.h` (`signal`/`raise`), `unistd.h` (`getpid`, `sleep`, `getcwd`), `strdup`.
  - `getline` (POSIX, não é do C padrão) só existe com `#define _POSIX_C_SOURCE 200809L` antes dos `#include`, **nos dois**: sem isso, o Clang dá `use of undeclared identifier 'getline'` e o gcc `implicit declaration of function ‘getline’` (com `-std=c23`).
  - **`math.h` não precisa de `-lm` no editor**, e `-lm` no `data-flags` é aceito. No gcc **precisa**: `sqrt(x)` com variável e sem `-lm` dá `referência não definida para "sqrt"`.
- **Entrada:** `scanf`, `fgets`, `getchar`.
  - Com `data-stdin`, cada linha aparece no terminal **no ponto em que o programa a lê**, como se o leitor tivesse digitado ali. Várias linhas: `data-stdin="Ana\n29"`.
  - **Sem `data-stdin`, o programa pausa e o leitor digita** no terminal da caixa: Enter envia, Ctrl+D encerra a entrada (fim de arquivo) e Ctrl+C para o programa. Funciona em qualquer navegador; nos que não têm JSPI, o editor roda o programa de novo desde o começo com as linhas já digitadas e esconde a saída repetida (um programa com `rand()` semeado pelo relógio pode mudar).
  - Um `printf("Nome: ")` sem `\n` aparece **antes** de o programa esperar a digitação, como no terminal do Linux.
- **stdout e stderr** saem intercalados na ordem, como no terminal; stdout tem buffer de linha (como num terminal).
- **Arquivos:** as abas que não são `.c` (`.h`, `.txt`, `.csv`) ficam na pasta do programa, `/home/ana`. `fopen`/`fprintf`/`fscanf`/`remove`/`rename` funcionam numa pasta em memória, que começa limpa a cada Rodar. `getcwd` dá `/home/ana` e `getenv("HOME")` dá `/home/ana`.
- `argc`/`argv` (`data-args`; `argv[0]` é `./programa`), `return N` e `exit(N)` (de 0 a 255, como no Linux: `exit(300)` dá 44), `atexit`.
- `time()`, `clock()`, `sleep()`, `getpid()`, `rand()`/`srand()`, VLAs.
- **Erros de execução, como no Linux:**
  - ponteiro nulo (`*p` com `p == NULL`) dá `Falha de segmentação`, 139, **só quando o seu código desreferencia**. Se quem escreve no endereço 0 é a biblioteca, nada acontece: `scanf("%d", idade)` sem `&`, com `idade` valendo 0, imprime `Você tem 0 anos.` e termina com 0. No gcc, isso dá `Falha de segmentação` e 139;
  - divisão inteira por zero dá `Exceção de ponto flutuante`, 136;
  - recursão infinita estoura a pilha (8 MB) e dá `Falha de segmentação`, 139;
  - `abort()` e `assert` falho dão `Abortado`, 134;
  - `raise(SIGTERM)` sem tratador dá `Terminado`, 143; com `signal(SIGTERM, tratador)`, o tratador roda.
  - O que estava no `printf` **sem `\n`** quando o programa morre (segfault, divisão por zero) **não aparece**, nos dois (no terminal do Linux também se perde).

### O que não funciona (deixe só no `pre.term`)
- `fork`, `exec`, `pthread`, sockets, sinais vindos de fora, `gdb`, `valgrind`.
- **`system("ls")`** compila, mas imprime `sh: 1: ls: not found` e devolve 32512 (não há shell).
- **Sanitizers:** `-fsanitize=address` no `data-flags` dá erro do ligador (`undefined symbol: __asan_…`).
- **Erros de memória que não são ponteiro nulo passam calados no editor** (no WebAssembly a memória é organizada de outro jeito):
  - índice fora do array (`v[5]` num `int v[3]`) lê um valor qualquer, sem erro;
  - usar memória já liberada lê o valor antigo (`7`), sem erro;
  - estouro de array na pilha (`scanf("%s", nome)` com texto maior que `char nome[8]`, `strcpy` grande) termina normalmente; no gcc dá `*** stack smashing detected ***: terminated` + `Abortado` (134);
  - **`free` duplo passa sem erro**, enquanto no gcc dá `free(): double free detected in tcache 2` + `Abortado` (134).
  - Mostre o efeito real no `pre.term` do laboratório (com `-fsanitize=address` ou `valgrind`).
- `printf("%s", 30)` (formato errado) no gcc dá `Falha de segmentação`; no editor imprime uma linha vazia. Os dois avisam na compilação.
- **`setlocale(LC_ALL, "")`** não muda nada no editor; no gcc do laboratório (pt_BR) ele faz o `printf("%.2f")` usar **vírgula** (`3,14`).
- **Limites:** 15 s rodando (sem contar a espera pela digitação); 2 MB de saída; **256 MB de memória** (um `malloc` maior devolve `NULL`); 8 MB de pilha.

### Editor (Clang + wasi-libc, WebAssembly de 32 bits) × gcc 15 (glibc, Linux de 64 bits)
Conferido com `tools/sim.js --nativo`. **Nas metas, use o que é igual nos dois**, ou uma regex com as duas formas.

| Assunto | Editor (Clang 22 + wasi-libc) | gcc 15.2 do laboratório (glibc) |
| --- | --- | --- |
| `sizeof(long)`, ponteiro, `size_t` | 4, 4, 4 (`long double` 16, `long long` 8) | 8, 8, 8 (`long double` 16, `long long` 8) |
| `LONG_MAX` | 2147483647 | 9223372036854775807 |
| `%p` | `0x7fffec` (pilha), `0x801640` (malloc); `NULL` sai `0` | `0x7ffd012f7710` (muda a cada execução); `NULL` sai `(nil)` |
| `srand(42)` e três `rand()` | `311430560 131117839 1110653038` | `1483128881 708592740 71876166` |
| Variável não declarada | `error: use of undeclared identifier 'idad'; did you mean 'idade'?` | `error: ‘idad’ undeclared (first use in this function); did you mean ‘idade’?` |
| Falta de `;` | `error: expected ';' after expression` | `error: expected ‘;’ before ‘return’` |
| Função sem declaração (C23) | `error: use of undeclared identifier 'dobro'` (com `-std=c17`: `error: call to undeclared function 'dobro'; ISO C99 and later do not support implicit function declarations [-Wimplicit-function-declaration]`) | `error: implicit declaration of function ‘dobro’ [-Wimplicit-function-declaration]` |
| `printf("%s\n", idade)` com `int` | `warning: format specifies type 'char *' but the argument has type 'int' [-Wformat]` | `warning: format ‘%s’ expects argument of type ‘char *’, but argument 2 has type ‘int’ [-Wformat=]` |
| Variável sem valor inicial | `warning: variable 'x' is uninitialized when used here [-Wuninitialized]` | `warning: ‘x’ is used uninitialized [-Wuninitialized]` |
| Variável não usada | `warning: unused variable 'x' [-Wunused-variable]` (igual, com aspas retas) | `warning: unused variable ‘x’ [-Wunused-variable]` |
| Função sem corpo (ligador) | `wasm-ld: error: /tmp/lig-62bf3f.o: undefined symbol: soma` + `clang: error: linker command failed with exit code 1` | `referência não definida para "soma"` + `collect2: error: ld returned 1 exit status` |
| Avisos que só um dá | Clang: índice constante fora do array (`array index 5 is past the end of the array`), recursão infinita (`all paths through this function will call itself`) | gcc: usar ponteiro depois do `free` (`pointer ‘p’ used after ‘free’ [-Wuse-after-free]`) |
| `assert(x > 0)` falho | `Assertion failed: x > 0 (programa.c: main: 3)` | ``programa: programa.c:3: main: Assertion `x > 0' failed.`` |
| `errno` de arquivo que não existe | `perror`: `No such file or directory` (igual); o número `ENOENT` vale 44 | mesma mensagem; `ENOENT` vale 2 |
| `free` duplo | passa calado | `free(): double free detected in tcache 2`, 134 |
| `math.h` | não precisa de `-lm` | `sqrt(x)` sem `-lm`: `referência não definida para "sqrt"` |
| Fuso horário | UTC (`localtime(0)` = `1970-01-01 00:00 UTC`) | `-03` (`1969-12-31 21:00 -03`) |
| `malloc` de 300 MB | `NULL` (limite de 256 MB) | funciona |
| `system("ls")` | `sh: 1: ls: not found`, 32512 | roda o `ls` |
| Ordem de avaliação dos argumentos (não especificada pelo C) | `printf("%d %d\n", remove("b.txt"), remove("b.txt"))` dá `0 -1` (da esquerda para a direita) | dá `-1 0` (da direita para a esquerda) |

Iguais nos dois: `int` com 4 bytes, `long long` com 8, `0.1 + 0.2` (`0.30000000000000004` com `%.17g`), a formatação do `printf` (`%5.2f`, `%-5d`, `%05d`, `%x`, `%o`, `%e`), `strtol`, `qsort`, as mensagens do `perror`, os códigos de saída (134, 136, 139), o estouro de `int` (`2147483647 + 1` = `-2147483648`) e a saída perdida do `printf` sem `\n` antes de um segfault.

**Para metas `erro:`**, use uma regex com as duas formas, por exemplo:
- variável não declarada: `erro:/undeclared identifier|undeclared \(first use/`;
- falta de `;`: `erro:expected ';'` só pega o Clang; use `erro:/expected ['‘];['’]/`;
- função sem declaração: `erro:/undeclared identifier 'dobro'|undeclared function 'dobro'|implicit declaration of function/`;
- ligador: `erro:/undefined symbol|undefined reference|referência não definida/`.

### Ferramentas (Node 24; não precisam de `npm install`)
- `node tools/sim.js arquivo.c`: compila e roda como o editor (mesmo Clang, mesma wasi-libc, mesmo terminal). É assim que você confere o comportamento do editor.
  - Opções: `--stdin "Ana\n29"`, `--com outro.c` (ou `.h`, `.txt`: uma aba), `--flags "…"`, `-- args` e `--nativo` (mostra também o gcc 15 do laboratório e as diferenças; `--clang-lab` usa o clang 21 do laboratório).
  - Sem `--stdin`, quem lê a entrada recebe fim de arquivo (no navegador o leitor digitaria).
- `node tools/testar-missoes.js suas-paginas.html`:
  - o código inicial **não** pode cumprir a meta, e a solução **tem** de cumprir;
  - confere também `&lt;`/`&amp;` em **todos** os `<pre>` da página (também `pre.file` e `pre.term`), as metas e as regex, e avisa se a caixa usa `trycpp` em vez de `tryc`;
  - guarda o resultado em cache; `-v` mostra as saídas.
- `node tools/testar-missoes.js --nativo página.html`: roda também no gcc 15 do laboratório e mostra as diferenças, sem contar como falha. As conhecidas, da tabela acima, saem marcadas como "esperado". Ele avisa quando, no gcc, a meta **não** seria cumprida.
- `tools/demo.html`: página de teste com caixas de todos os tipos (sirva a raiz do site e abra `/tools/demo.html`).

## 5. Fidelidade: o laboratório (`~/guia-c-lab/lab`)
É a máquina da Ana do Guia Bash: usuária `ana`, computador `notebook`, `/home/ana`, pt_BR. Ferramentas do Ubuntu 26.04: **gcc 15.2**, **clang 21.1**, **make 4.4**, **cmake 4.2**, **gdb 17.1**, **ninja** e **valgrind 3.26** (`valgrind --leak-check=full ./programa` funciona; compile com `-g` para ver `arquivo.c:linha`).
```bash
L=~/guia-c-lab/lab
printf '%s\n' 'mkdir -p c && cd c' "cat > ola.c <<'FIM'" '#include <stdio.h>' 'int main(void) { printf("Olá, mundo!\n"); return 0; }' 'FIM' 'gcc -std=c23 -Wall -Wextra ola.c -o ola' './ola' | timeout 60 $L -n SEUNOME -i
```
- Opções do `lab`: `-n SEUNOME` (pasta própria; **sempre** use a sua), `-r` (recomeça do zero), `-i` (transcrição no formato do `pre.term`), `-t` (terminal de verdade: precisa dele para ver `Falha de segmentação (imagem do núcleo gravada)` e o `gdb` interativo), `-N` (rede e processos isolados).
- **Comando padrão das aulas: `gcc -std=c23 -Wall -Wextra arquivo.c -o programa`.**
  - `primeiro-programa.html` usa o mínimo (`gcc ola.c -o ola`); `compilar.html` explica cada opção; daí em diante, sempre o comando padrão.
  - O gcc 15 já usa **gnu23** se você não pedir outro padrão (`__STDC_VERSION__` = `202311L`).
  - `math.h` no gcc: confira se precisa de `-lm` no seu exemplo e mostre o erro real se precisar.
- **O ligador (`ld`) e o `make` saem em português** no laboratório (`referência não definida para "main"`); mostre a saída real e cite o inglês (`undefined reference to`), que aparece em fóruns e no editor.
- **As mensagens do gcc saem em inglês**, com aspas tipográficas ‘assim’: copie como saíram e explique em português.
- **Saída com buffer:** quando o programa morre (segfault), o que estava no `printf` sem `\n`… ou mesmo com `\n` mas indo para um pipe, pode **não aparecer**. Com `-i` a saída vai para um pipe (buffer cheio); com `-t` é terminal (buffer de linha). Para mostrar o que o leitor vê no terminal dele, use `-t`. Para mostrar a entrada digitada no `-t`, mande-a com atraso, senão ela não aparece na tela: `{ echo ./prog; sleep 2; echo 29; sleep 1; echo exit; } | ~/guia-c-lab/vps '~/guia-c-lab/lab -n SEUNOME -t'`.
- **Exercícios `.exercise`:** o site corta os espaços do começo e do fim da resposta (`data-answer=" %c"` aceita `%c`). Se o espaço importa, peça a resposta entre aspas.
- Um processo por vez, sempre com `timeout 60`. Programas que travam rodam com `timeout 3`.
- **Privacidade:** nada da máquina real. Nas saídas do `gdb`, sanitizers e `valgrind`, os caminhos têm de ser `/home/ana/…`. Os PIDs (`==20397==`) podem ficar.

### Versões
O guia ensina **C23** (gcc 15 e Clang) e diz a alternativa antiga quando houver (muito código e muitos cursos ainda usam C99/C11).
- Marque recursos novos com `<span class="versao">C99</span>`, `C11`, `C23` etc.
- Datas: K&R C (1978), C89/C90 (ANSI), C99 (`//`, `bool` via `stdbool.h`, `for (int i…)`, `stdint.h`, VLAs), C11 (`_Generic`, `_Static_assert`, threads opcionais, `_Noreturn`), C17 (correções), C23 (`bool`/`true`/`false` palavras-chave, `nullptr`, `constexpr`, `typeof`, `auto`, atributos `[[…]]`, `#embed`, `1'000`, `0b1010`) e C2y (o próximo).
- **Confira no laboratório se cada recurso compila no gcc 15** antes de afirmar.

## 6. Escrita
- Português do Brasil, frases curtas, "você". O leitor nunca programou.
- Nomes em inglês ganham tradução: `printf` = "print formatted", imprimir formatado; `malloc` = "memory allocation", reservar memória.
- Exemplos com a vida da Ana: lista de compras, notas de alunos, uma lojinha, um jogo.
- Toda mensagem de erro é a real (do laboratório ou do `tools/sim.js`).
- Segurança e boas práticas desde o começo, sempre com o porquê:
  - inicialize as variáveis;
  - compile com `-Wall -Wextra`;
  - confira o retorno de `scanf`, `malloc`, `fopen`;
  - use `fgets` e `snprintf` (nunca `gets`; cuidado com `strcpy`/`sprintf`);
  - todo `malloc` tem o seu `free`.
- `int main(void)` e `return 0;` nos exemplos do Nível 1 (explique em `primeiro-programa.html` que o C99+ aceita omitir o `return 0` só no `main`).
