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
É o **Clang oficial (LLVM) compilado para WebAssembly** (pacote `@yowasp/clang`, licença ISC), com a **wasi-libc** (a biblioteca C, baseada na musl). É o mesmo motor do Guia C++, sem a parte de C++. Tudo fica hospedado no próprio site (`assets/c/`) e só é baixado quando o leitor clica em **Rodar**. Detalhes técnicos e como regenerar: `assets/c/LEIA.md`.

> **Esta seção é mantida pelo agente do simulador.** Enquanto ele não termina, valem as linhas gerais abaixo (herdadas do Guia C++). Antes de escrever uma frase do tipo "no editor…", confira com `node tools/sim.js` no motor **final**. No Guia C++ duas aulas ficaram erradas porque o motor mudou no meio do caminho.

### O que o leitor vê
- `$ clang -std=c23 -Wall -Wextra programa.c -o programa` (ou o `data-flags`), os erros e avisos do Clang com cores, `$ ./programa` e a saída.
- Quando o programa morre: `Falha de segmentação (imagem do núcleo gravada)` (139), `Abortado (imagem do núcleo gravada)` (134), `Exceção de ponto flutuante (imagem do núcleo gravada)` (136); no fim, `[código de saída: N]`.
- O executável tem o nome do primeiro `.c` sem a extensão. Sem `data-file`, o arquivo é `programa.c`.

### O que funciona (previsto; o agente confirma)
- C23 inteiro: `bool`/`true`/`false` sem include, `nullptr`, `constexpr`, `typeof`, `auto`, `[[nodiscard]]`, separador de dígitos `1'000'000`, `static_assert`. `-std=c17`, `-std=c11`, `-std=c99` pelo `data-flags`.
- `stdio.h` (printf, scanf, fgets, getchar, fopen…), `string.h`, `stdlib.h` (malloc, free, qsort, bsearch, strtol, rand, exit, atexit, getenv), `ctype.h`, `math.h` (sem precisar de `-lm`), `time.h`, `stdint.h`, `stdarg.h`, `assert.h`, `errno.h`, `setjmp.h`.
- Entrada interativa, `data-stdin`, arquivos numa pasta em memória (`/home/ana`), `argc/argv`, `exit(N)`.
- Ponteiro nulo → Falha de segmentação (139); divisão inteira por zero → 136; `abort()`/`assert` → 134; recursão infinita → pilha estourada.

### O que não funciona (deixe só no `pre.term`)
- `fork`, `exec`, `system()`, `pthread`, sockets, sinais vindos de fora, `gdb`, `valgrind` e sanitizers.
- Erros de memória que não são ponteiro nulo (índice fora do array, `free` duplo, usar memória já liberada) **podem passar calados** no editor: no WebAssembly a memória é organizada de outro jeito. Mostre o efeito real no `pre.term` do laboratório (com `-fsanitize=address` ou `valgrind`).

### Editor (Clang + wasi-libc, WebAssembly de 32 bits) × gcc (glibc, Linux de 64 bits)
| Assunto | Editor | gcc 15 do laboratório |
| --- | --- | --- |
| `sizeof(long)`, ponteiro, `size_t` | 4, 4, 4 | 8, 8, 8 |
| `LONG_MAX` | 2147483647 | 9223372036854775807 |
| `%p` | endereços pequenos (`0x1fff0`) | `0x7ffd…` (muda a cada execução) |
| `rand()` com `srand(42)` | sequência da musl | sequência da glibc (outra) |
| Mensagens do compilador | `error: use of undeclared identifier 'x'` (aspas retas) | `error: ‘x’ undeclared (first use in this function)` (aspas curvas) |
| Fuso horário | UTC | `-03` (America/Sao_Paulo) |

### Ferramentas (Node 24)
- `node tools/sim.js arquivo.c [--stdin "Ana\n29"] [--com outro.c] [--flags "…"] [--nativo] [-- args]`: compila e roda como o editor; `--nativo` mostra também o gcc do laboratório e as diferenças.
- `node tools/testar-missoes.js suas-paginas.html [-v] [--nativo]`: confere as missões (inicial não cumpre, solução cumpre), os `&lt;`/`&amp;` dentro dos `<pre>`, as metas e as regex.

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
- **Saída com buffer:** quando o programa morre (segfault), o que estava no `printf` sem `\n`… ou mesmo com `\n` mas indo para um pipe, pode **não aparecer**. Com `-i` a saída vai para um pipe (buffer cheio); com `-t` é terminal (buffer de linha). Para mostrar o que o leitor vê no terminal dele, use `-t`.
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
