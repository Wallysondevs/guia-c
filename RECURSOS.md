# Regras de recursos para os agentes (leia antes de começar)

Até 20 agentes trabalham ao mesmo tempo **na mesma máquina** (16 GB, a do dono do projeto). Ela é desligada à noite: o que não estiver no git se perde.

1. **Um processo pesado por vez.** Nada de rodar vários `gcc`/`node`/`lab` em paralelo (`&`, `xargs -P`). Sempre com `timeout` (`timeout 60` para o lab, `timeout 3` para programas que podem travar, `timeout 300` para o testador).
2. **Sem subagentes.** Você mesmo faz o trabalho.
3. **Não varra o disco** (`find /`, `grep -r /home`). Leia só o que precisa: `~/guia-c`, `~/guia-cpp` (modelo), `~/guia-c-lab`.
4. **Nunca `pkill`/`killall`.** Mata processos de outros agentes. Use `kill %1` ou `kill $!` no que você mesmo iniciou.
5. **Rascunhos só em `SCRATCH/SEU-NOME/`** (o caminho do scratchpad está no seu pedido). Nunca em `/tmp` solto e nunca na pasta do guia.
6. **Laboratório com o seu nome:** `~/guia-c-lab/lab -n SEU-NOME …`. Nunca use o nome de outro.
7. **Commit cedo e sempre** — a cada página terminada (ou a cada ~20 min de trabalho):
   ```bash
   cd ~/guia-c && git add pagina.html && git commit -q -m "pagina: o que mudou" -- pagina.html
   ```
   - Faça commit **só dos seus arquivos** (sempre com `-- arquivos` no fim). Nunca `git add -A`, `git commit -a`, `git stash`, `git reset`, `git checkout -- .`, `git rebase`, `git push`.
   - Se der `index.lock`, espere 2 s e tente de novo (outro agente está commitando). Não apague o lock.
8. **Não edite arquivos dos outros.** `assets/site.js`, `assets/style.css`, `CONTRIBUINDO.md` e `tools/` são do coordenador e do agente do simulador. Achou um problema neles? Anote no fim do seu relatório.
9. **Nada da máquina real** nas páginas: nenhum nome real, fuso real, MAC/IP real. Só a Ana (`/home/ana`, `notebook`).
