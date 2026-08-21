# 🚀 Astro-Breaker

> Jogo web arcade retrô que combina a mecânica clássica de quebra-tijolos (*Breakout / Arkanoid*) com a temática e dinâmicas de combate espacial (*Space Invaders*).

---

## 🕹️ Funcionalidades e Mecânicas

- **Core Loop Viciante**: Lance e rebata esferas de energia para eliminar formações alienígenas invasoras.
- **Física de Rebatida Angular**: O ângulo de reflexão da esfera varia dinamicamente de acordo com o ponto de contato na nave (estilo *Arkanoid*).
- **Inimigos Alienígenas**:
  - 🟢 **Alien Verde**: 1 hit (100 pts)
  - 🔴 **Alien Vermelho Blindado**: 3 hits com marcadores visuais de dano (250 pts)
  - 🟣 **Alien Móvel**: Movimenta-se em patrulha horizontal rápida (400 pts)
  - 🛸 **Nave-Mãe (Boss)**: Chefe na Fase 5 com barra de vida e múltiplos pontos de impacto (1500 pts)
- **Power-Ups (Drop de 15%+)**:
  - ⚡ **Canhão Laser**: Atire lasers verticais com a tecla `Espaço` por 10 segundos.
  - ✦ **Multi-Ball**: Multiplica todas as esferas ativas na tela.
  - ⟷ **Nave Expandida**: Aumenta a largura da nave por 15 segundos.
  - ♥ **Vida Extra**: Recupera uma vida da nave.
- **Áudio Chiptune 8-Bit Procedural**:
  - Sons de rebatida sintetizados, lasers ("pew pew"), explosões com ruído branco filtrado e trilha sonora de fundo estilo fliperama (Web Audio API nativa).
- **VFX & Efeitos Visuais**:
  - Explosões de partículas na cor do alien destruído, propulsão da nave, rastro luminoso neon da bolinha e fundo estelar em paralaxe.
  - Filtro CRT / Scanlines retrô ativável.
- **Multiplataforma**: Suporte para Desktop (Teclado/Mouse) e Mobile (Controles de toque virtuais).

---

## 🎮 Controles

| Ação | Teclado | Mouse / Touch |
| :--- | :--- | :--- |
| **Mover Nave** | `◄` `►` ou `A` / `D` | Arrastar no Canvas / Botões `◀` `▶` |
| **Lançar Bola / Atirar Laser** | `Espaço` / `W` / `▲` | Clique / Toque no botão `⚡ AÇÃO` |
| **Pausar Jogo** | `P` ou `Esc` | Botão `⏸ PAUSAR` |
| **Ligar/Desligar Som** | `M` | Botão `🔊 SOM` |

---

## 🛠️ Como Executar o Projeto

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Iniciar Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a URL indicada no terminal (geralmente `http://localhost:3000`).

3. **Gerar Versão para Produção**:
   ```bash
   npm run build
   ```
