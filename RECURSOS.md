# Regras de recursos para os agentes (leia antes de começar)

**Todo o trabalho pesado roda na VPS, nunca no notebook.** O notebook do dono do projeto tem só 16 GB. Em 17/10/2026 o Ubuntu fechou o terminal por falta de memória, com 20 agentes rodando gcc, valgrind e o testador nele.

| Onde | O que fica lá |
|---|---|
| **VPS** (Debian 13, 8 núcleos, 31 GB) | O guia **de verdade**: `~/guia-c` (git), o laboratório `~/guia-c-lab/lab` (Ubuntu 26.04 com gcc 15.2 etc., saída idêntica à do notebook) e o Node 24. |
| **Notebook** | Só o seu rascunho (`SCRATCH/SEU-NOME/`) e cópias **antigas, só para leitura**: `~/guia-c` (estado de 17/10 de manhã) e `~/guia-cpp` (modelo). |

## Os 4 comandos (rodam no notebook, o trabalho acontece na VPS)

| Comando | O que faz |
|---|---|
| `~/guia-c-lab/vps 'comando'` | Roda um comando na VPS (a pasta inicial é a home da VPS). Ex.: `~/guia-c-lab/vps 'cat ~/guia-c/arrays.html'` |
| `~/guia-c-lab/vps '~/guia-c-lab/lab -n SEU-NOME -i' < cmds.txt` | Laboratório da Ana (o stdin passa pelo ssh). As opções são iguais às do CONTRIBUINDO §5: `-r`, `-i`, `-t`, `-N`, `--`. |
| `~/guia-c-lab/enviar SCRATCH/SEU-NOME/pagina.html` | Copia a página para `~/guia-c/` na VPS. |
| `~/guia-c-lab/testar [--nativo] pagina.html` | Testador de missões na VPS, com `timeout` incluso. |

## Fluxo de uma página
1. Escreva e edite a página **no rascunho**: `SCRATCH/SEU-NOME/pagina.html`, com Write/Edit. Nunca escreva em `~/guia-c` do notebook.
2. Rode as saídas reais no lab da VPS.
3. Mande a página com `enviar` e rode `testar` (e `testar --nativo`).
4. Commit **na VPS**, só dos seus arquivos:
   ```bash
   ~/guia-c-lab/vps 'cd ~/guia-c && git add pagina.html && git commit -q -m "pagina: aula nova" -- pagina.html'
   ```
   - Faça commit a cada página pronta.
   - Nunca use `git add -A`, `commit -a`, `stash`, `reset`, `checkout -- .`, `rebase` ou `push`.
   - Se der `index.lock`, espere 2 s e tente de novo.
5. Para corrigir, edite o rascunho, mande de novo e faça outro commit.

## Regras
1. **No notebook, nada pesado.** Nada de `gcc`, `node`, `valgrind` nem do lab local (`~/guia-c-lab/lab` sem `vps`). Lá, só ler, escrever no rascunho, usar `ssh`/`scp`, `grep` e `sed`.
2. **Na VPS você pode trabalhar à vontade**, mas um processo pesado por vez, por agente, e sempre com `timeout` (`timeout 60` no lab, `timeout 3` em programas que podem travar).
3. **Sem subagentes.**
4. **Nunca `pkill`/`killall`**, nem na VPS, onde rodam outros serviços do dono. Use `kill %1`/`kill $!`.
5. **Lab com o seu nome** (`-n SEU-NOME`).
6. **Não edite arquivos dos outros.** `assets/`, `tools/`, `CONTRIBUINDO.md`, `RECURSOS.md` e as páginas de outros autores ficam com eles. Achou um problema? Anote no fim do relatório.
7. **Nada de máquina real nas páginas.** Nenhum `ip-172-…`, o IP da VPS, nome real, fuso real, MAC ou IP real. Só a Ana (`/home/ana`, `notebook`). Nas saídas do valgrind, o PID (`==12345==`) e os endereços variam: pode deixar os da sua execução.
8. **O core dump do lab da VPS** sai como no notebook: `Falha de segmentação (imagem do núcleo gravada)` no `-t`. A VPS manda o core para `/bin/true` e nenhum arquivo `core` aparece.
