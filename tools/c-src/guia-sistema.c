// Guia C: system() no editor (libguia.a). Não há shell no navegador: o comando
// "não existe", como num sistema sem /bin/sh. Mesmo formato de retorno do Linux
// (status do wait: 127 << 8, ou seja, WEXITSTATUS == 127).
#include <stdio.h>

int system(const char *comando) {
    if (!comando) return 0; // 0 = "não há interpretador de comandos"
    fprintf(stderr, "sh: 1: %s: not found\n", comando);
    return 127 << 8;
}
