# Guia C

Site: https://wallysondevs.github.io/guia-c/

Curso de C (C23) em português, do zero ao avançado, feito para quem **nunca programou**. Funciona como uma escola: uma aula para cada assunto, organizadas em **3 níveis + projetos + referência** (146 páginas).

Cada aula explica o código linha por linha (anatomia), mostra a saída real, o que acontece quando dá errado (com a mensagem verdadeira do compilador ou do programa), formas diferentes de fazer e exercícios no fim. Todas as saídas e mensagens de erro foram conferidas com o **gcc 15.2**.

Para praticar, as páginas trazem o editor **Experimente** (`.tryc`), que **compila e roda C de verdade** no navegador:

- Edite o código, clique em **Rodar** e veja o comando de compilação, os erros e avisos e a saída do programa, com o código de saída no fim.
- Nas **missões**, a caixa confere se o seu programa chegou ao resultado pedido.

O editor usa `assets/csim.js` com o **Clang 22.1 (LLVM) compilado para WebAssembly** e a **wasi-libc**. Tudo fica hospedado no próprio site (`assets/c/`) e só é baixado no primeiro clique em **Rodar** (cerca de 23 MB); depois o navegador guarda tudo e as próximas visitas não baixam de novo.

Site 100% estático (HTML + CSS + JS, sem build e sem dependências externas): funciona no GitHub Pages. Para usar o editor no seu computador, sirva a raiz do site com um servidor local em vez de abrir o arquivo direto.

## Estrutura

```
index.html                 página inicial
<tema>.html                uma aula por tema
assets/style.css           visual
assets/site.js             níveis/menu (lista NIVEIS), Anterior/Próximo, anatomia, exercícios
assets/csim.js             o editor "Experimente" (caixas .tryc)
assets/c/                  o compilador do editor (Clang 22 em WebAssembly + wasi-libc); veja assets/c/LEIA.md
tools/sim.js               compila e roda um .c como o editor faria
tools/testar-missoes.js    testa todas as caixas "Experimente" com o mesmo Clang do navegador
tools/c-node.js            roda no Node o mesmo compilador do navegador (usado por sim.js e testar-missoes.js)
tools/lab-nativo.js        compara com o gcc 15 nativo do laboratório
tools/construir-c.mjs      gera a pasta assets/c/
tools/c-src/               fontes do motor do editor
tools/demo.html            página de teste com caixas de todos os tipos
tools/licencas/            licenças dos componentes do compilador
tools/package.json         dependências para regenerar o compilador
CONTRIBUINDO.md            como escrever uma aula
.nojekyll                  faz o GitHub Pages servir os arquivos como estão
```

## Testes

As ferramentas usam Node 24 e não precisam de `npm install`.

```bash
node tools/testar-missoes.js                 # todas as missões, com o mesmo Clang do navegador
node tools/testar-missoes.js pagina.html     # só estas páginas (-v mostra as saídas)
node tools/testar-missoes.js --nativo pagina.html   # compara também com o gcc 15 (precisa do laboratório)
node tools/sim.js programa.c                 # compila e roda um programa como o editor
```

Para testar no navegador, sirva a raiz do site e abra `/tools/demo.html`.

## Publicar no GitHub Pages

Envie a pasta para um repositório e ative **Settings → Pages → Deploy from a branch → main / (root)**.

## Adicionar uma aula

Leia `CONTRIBUINDO.md` e inclua a página na lista `NIVEIS` de `assets/site.js`.
