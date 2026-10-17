// Guia C: ligado a todo programa do editor (guia-rt.o, com -Wl,--wrap=abort).
// Não muda o que o programa faz; só deixa o WebAssembly parecido com o Linux:
// 1. o programa roda na pasta /home/ana (onde ficam as abas da caixa);
// 2. abort() (e assert) avisa o editor (sinal 6, SIGABRT) antes de parar o programa;
// 3. antes de ler o teclado (stdin), a saída que está no buffer do stdout aparece,
//    como na glibc: printf("Nome: ") sem \n e depois scanf mostra "Nome: " antes de
//    esperar. A musl (base da wasi-libc) não faz isso sozinha;
// 4. raise(SIGTERM) etc. sem tratador termina o programa como no Linux (o editor
//    mostra "Terminado" e o código 128 + sinal), em vez da mensagem em inglês da
//    emulação de sinais da wasi-libc.
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

_Noreturn void __real_abort(void);
__attribute__((import_module("guia"), import_name("sinal"))) void guia_sinal(int);

__attribute__((constructor(101))) static void guia_pasta_inicial(void) { (void)chdir("/home/ana"); }

_Noreturn void __wrap_abort(void) {
    guia_sinal(6);
    __builtin_trap();
}

size_t __real___stdio_read(FILE *f, unsigned char *buf, size_t len);
size_t __wrap___stdio_read(FILE *f, unsigned char *buf, size_t len) {
    if (f == stdin) fflush(stdout);
    return __real___stdio_read(f, buf, len);
}

int __real_raise(int sig);
int __wrap_raise(int sig) {
    if (sig > 0 && sig < 32 && sig != SIGKILL && sig != SIGSTOP) {
        void (*h)(int) = signal(sig, SIG_DFL);
        signal(sig, h);
        if (h == SIG_IGN) return 0;
        if (h == SIG_DFL) {
            if (sig == SIGCHLD || sig == SIGCONT || sig == SIGURG || sig == SIGWINCH) return 0;
            guia_sinal(sig);
            __builtin_trap();
        }
    } else if (sig == SIGKILL) {
        guia_sinal(sig);
        __builtin_trap();
    }
    return __real_raise(sig);
}
