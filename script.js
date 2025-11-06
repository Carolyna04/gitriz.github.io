function showTime() {
};

document.addEventListener('DOMContentLoaded', () => {
  const instructions = document.getElementById('instructions');
  const close_button = document.getElementById('close');
  
  setTimeout(() => {
    if(instructions){
      instructions.showModal();
      
    }
  }, 3000);
  
  //adiciona a funcionalidade de fechar o dialogo ao clicar no botão close
  instructions.addEventListener('click', () => {
    instructions.close();
    });
    
    // Adiciona a funcionalidade de fechar o diálogo ao clicar fora dele
    instructions.addEventListener('click', (event) => {
      if(event.target === instructions){
      instructions.close();
      } 
    })



    // --- 1. CONFIGURAÇÃO GERAL ---
    
    // Elementos do DOM (a "interface")
    const tabuleiro = document.querySelector('.AreaJ');
    const elementoAtaques = document.getElementById('ataques-valor');
    const proximaPecaContainer = document.getElementById('proxima-peca-container');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const elementoRecorde = document.getElementById('recorde-valor');
    const elementoRecordeNome = document.getElementById('recorde-nome');
    const elementoCronometro = document.getElementById('cronometro-valor');
    const musicaJogo = document.getElementById('game-music');
    const volumeSlider = document.getElementById('volume-slider');

    // Elementos dos Modais
    const modalOverlay = document.getElementById('modal-overlay');
    const gameOverModal = document.getElementById('game-over-modal');
    const recordeModal = document.getElementById('recorde-modal');
    const finalScoreGameover = document.getElementById('final-score-gameover');
    const finalScoreRecorde = document.getElementById('final-score-recorde');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score-button');
    const closeGameoverButton = document.getElementById('close-gameover-button');
    
    // (NOVOS) Elementos do Modal Easter Egg
    const easterEggModal = document.getElementById('easter-egg-modal');
    const closeEasterEggButton = document.getElementById('close-easter-egg-button');


    // Constantes do Jogo
    const tamanhoQuadrado = 25;
    const LARGURA_TABULEIRO = 12; // 300px / 25px
    const ALTURA_TABULEIRO = 20;  // 500px / 25px
    const velocidadeQueda = 500;
    
    // Variáveis de Estado do Jogo (a "memória")
    let tabuleiroVirtual = criarTabuleiroVirtual();
    let pontuacaoAtaques = 0; // Conta PONTOS (1 por linha)
    let loopAtual = null;
    let isPaused = false;
    let isGameActive = false;
    
    let cronometroLoop = null;
    let segundosPassados = 0;

    // Carrega o recorde e o nome salvos do localStorage
    let recordeAtual = parseInt(localStorage.getItem('tetrisRecorde')) || 0;
    let nomeRecorde = localStorage.getItem('tetrisRecordeNome') || '---';
    
    // Catálogo de Peças
    const PECAS_DATA = {
        'tipo-I': {
            rotacoes: [
                [[1, 0], [1, 1], [1, 2], [1, 3]],
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                [[1, 0], [1, 1], [1, 2], [1, 3]],
                [[0, 1], [1, 1], [2, 1], [3, 1]]
            ],
            grelha: [
                { col: 4, lin: 4 }, { col: 4, lin: 4 },
                { col: 4, lin: 4 }, { col: 4, lin: 4 }
            ]
        },
        'tipo-O': {
            rotacoes: [
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]]
            ],
            grelha: [ { col: 2, lin: 2 }, { col: 2, lin: 2 }, { col: 2, lin: 2 }, { col: 2, lin: 2 } ]
        },
        'tipo-T': {
            rotacoes: [
                [[0, 1], [1, 1], [2, 1], [1, 0]],
                [[1, 0], [1, 1], [1, 2], [0, 1]],
                [[0, 1], [1, 1], [2, 1], [1, 2]],
                [[1, 0], [1, 1], [1, 2], [2, 1]]
            ],
            grelha: [ { col: 3, lin: 2 }, { col: 3, lin: 3 }, { col: 3, lin: 3 }, { col: 3, lin: 3 } ]
        },
        'tipo-S': {
            rotacoes: [
                [[1, 0], [2, 0], [0, 1], [1, 1]],
                [[0, 0], [0, 1], [1, 1], [1, 2]],
                [[1, 0], [2, 0], [0, 1], [1, 1]],
                [[0, 0], [0, 1], [1, 1], [1, 2]]
            ],
            grelha: [ { col: 3, lin: 2 }, { col: 2, lin: 3 }, { col: 3, lin: 2 }, { col: 2, lin: 3 } ]
        },
        'tipo-L': {
            rotacoes: [
                [[0, 0], [0, 1], [0, 2], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [0, 0]],
                [[0, 0], [1, 0], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [2, 2]]
            ],
            grelha: [ { col: 2, lin: 3 }, { col: 3, lin: 2 }, { col: 2, lin: 3 }, { col: 3, lin: 2 } ]
        },
        'tipo-J': {
            rotacoes: [
                [[1, 0], [1, 1], [1, 2], [0, 2]],
                [[0, 1], [1, 1], [2, 1], [2, 0]],
                [[0, 0], [0, 1], [0, 2], [1, 0]],
                [[0, 1], [1, 1], [2, 1], [0, 2]]
            ],
            grelha: [ { col: 2, lin: 3 }, { col: 3, lin: 2 }, { col: 2, lin: 3 }, { col: 3, lin: 2 } ]
        }
    };
    const tiposDePecas = Object.keys(PECAS_DATA);
    
    let proximoTipo = escolherTipoAleatorio();


    // --- 2. FUNÇÕES DO TABULEIRO VIRTUAL ---
    
    function criarTabuleiroVirtual() {
        return Array.from({ length: ALTURA_TABULEIRO }, () => 
            new Array(LARGURA_TABULEIRO).fill(0)
        );
    }
    
    function converterPixelsParaGrid(pixels) {
        return Math.floor(pixels / tamanhoQuadrado);
    }


    // --- 3. FUNÇÕES DE PONTUAÇÃO E TEMPO ---
    
    function atualizarPlacar() {
        elementoAtaques.textContent = pontuacaoAtaques;
    }

    function atualizarPlacarRecorde() {
        elementoRecorde.textContent = recordeAtual;
        elementoRecordeNome.textContent = nomeRecorde;
    }
    
    function formatarTempo(segundos) {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
    }

    function iniciarCronometro() {
        if (cronometroLoop) clearInterval(cronometroLoop);
        
        segundosPassados = 0;
        elementoCronometro.textContent = formatarTempo(segundosPassados);

        cronometroLoop = setInterval(() => {
            if (isGameActive && !isPaused) {
                segundosPassados++;
                elementoCronometro.textContent = formatarTempo(segundosPassados);
            }
        }, 1000);
    }

    // Lógica de Pontos (1 ponto por linha)
    function calcularPontos(linhasLimpas) {
        pontuacaoAtaques += linhasLimpas;
        atualizarPlacar();
    }


    // --- 4. FUNÇÃO DE LIMPEZA DE LINHA ---
    
    function verificarLinhasCompletas() {
        let linhasLimpasNestaRodada = 0;
        let linha = ALTURA_TABULEIRO - 1; 
        
        while (linha >= 0) {
            const linhaEstaCheia = tabuleiroVirtual[linha].every(celula => celula === 1);
            if (linhaEstaCheia) {
                linhasLimpasNestaRodada++;
                tabuleiroVirtual.splice(linha, 1);
                tabuleiroVirtual.unshift(new Array(LARGURA_TABULEIRO).fill(0));
                
                const linhaEmPixels = linha * tamanhoQuadrado;
                document.querySelectorAll('.quadradinho-estatico').forEach(bloco => {
                    const blocoTop = parseInt(bloco.style.top);
                    if (blocoTop === linhaEmPixels) {
                        bloco.remove();
                    } else if (blocoTop < linhaEmPixels) {
                        bloco.style.top = (blocoTop + tamanhoQuadrado) + 'px';
                    }
                });
            } else {
                linha--;
            }
        } 
        
        if (linhasLimpasNestaRodada > 0) {
            calcularPontos(linhasLimpasNestaRodada);
        }
    }


    // --- 5. FUNÇÃO "SOLIDIFICAR" PEÇA ---
    
    function solidificarPeca(peca) {
        const tipo = peca.dataset.tipo;
        const rotacao = parseInt(peca.dataset.rotacao);
        const forma = PECAS_DATA[tipo].rotacoes[rotacao];
        const gridLinha = converterPixelsParaGrid(parseInt(peca.style.top));
        const gridColuna = converterPixelsParaGrid(parseInt(peca.style.left));

        forma.forEach(([col, lin]) => {
            const linFinal = gridLinha + lin;
            const colFinal = gridColuna + col;
            
            if (linFinal >= 0 && linFinal < ALTURA_TABULEIRO &&
                colFinal >= 0 && colFinal < LARGURA_TABULEIRO) {
                tabuleiroVirtual[linFinal][colFinal] = 1;
            }

            const blocoEstatico = document.createElement('div');
            blocoEstatico.classList.add('quadradinho-estatico', tipo);
            blocoEstatico.style.top = (linFinal * tamanhoQuadrado) + 'px';
            blocoEstatico.style.left = (colFinal * tamanhoQuadrado) + 'px';
            tabuleiro.appendChild(blocoEstatico);
        });

        peca.remove();
    }


    // --- 6. FUNÇÃO DE COLISÃO MESTRA ---
    
    function verificarColisao(tipo, rotacao, posTop, posLeft) {
        const forma = PECAS_DATA[tipo].rotacoes[rotacao];
        const gridLinha = converterPixelsParaGrid(posTop);
        const gridColuna = converterPixelsParaGrid(posLeft);
        
        for (const [col, lin] of forma) {
            const linAlvo = gridLinha + lin;
            const colAlvo = gridColuna + col;
            
            if (colAlvo < 0) return true;
            if (colAlvo >= LARGURA_TABULEIRO) return true;
            if (linAlvo >= ALTURA_TABULEIRO) return true;
            if (linAlvo >= 0 && tabuleiroVirtual[linAlvo][colAlvo] === 1) {
                return true;
            }
        }
        return false;
    }


    // --- 7. FUNÇÃO "DESENHAR" PEÇA ---
    
    function desenharPeca(peca, tipo, rotacao) {
        const dadosPeca = PECAS_DATA[tipo];
        const forma = dadosPeca.rotacoes[rotacao];
        const grelha = dadosPeca.grelha[rotacao];
        const quadradinhos = peca.querySelectorAll('.quadradinho');

        peca.style.gridTemplateColumns = `repeat(${grelha.col}, ${tamanhoQuadrado}px)`;
        peca.style.gridTemplateRows = `repeat(${grelha.lin}, ${tamanhoQuadrado}px)`;

        quadradinhos.forEach(q => q.style.display = 'none'); 
        
        forma.forEach((posicao, index) => {
            const q = quadradinhos[index];
            q.style.display = 'block';
            q.style.gridColumn = posicao[0] + 1;
            q.style.gridRow = posicao[1] + 1;
        });
    }


    // --- 8. FUNÇÕES DE GERAÇÃO DE PEÇA ---

    function escolherTipoAleatorio() {
        const indiceAleatorio = Math.floor(Math.random() * tiposDePecas.length);
        return tiposDePecas[indiceAleatorio];
    }

    function construirPeca(tipoEscolhido, rotacaoInicial) {
        const peca = document.createElement('div');
        peca.classList.add('peca', tipoEscolhido);
        peca.dataset.tipo = tipoEscolhido;
        peca.dataset.rotacao = rotacaoInicial;

        for (let i = 0; i < 4; i++) {
            const quadradinho = document.createElement('div');
            quadradinho.classList.add('quadradinho');
            peca.appendChild(quadradinho);
        }
        desenharPeca(peca, tipoEscolhido, rotacaoInicial);
        return peca;
    }

    function desenharProximaPeca() {
        proximaPecaContainer.innerHTML = '';
        const pecaDisplay = construirPeca(proximoTipo, 0);
        proximaPecaContainer.appendChild(pecaDisplay);
    }


    // --- 9. FUNÇÃO "MOTOR" DE QUEDA ---
    
    function iniciarQueda(peca) {
        const tipo = peca.dataset.tipo;
        
        loopAtual = setInterval(() => {
            if (isPaused) return;

            const posTop = parseInt(peca.style.top);
            const posLeft = parseInt(peca.style.left);
            const rotacao = parseInt(peca.dataset.rotacao);

            if (!verificarColisao(tipo, rotacao, posTop + tamanhoQuadrado, posLeft)) {
                peca.style.top = (posTop + tamanhoQuadrado) + 'px';
            } else {
                clearInterval(loopAtual);
                solidificarPeca(peca);
                verificarLinhasCompletas();
                proximaPeca();
            }
        }, velocidadeQueda);
    }
    

    // --- 10. FUNÇÃO DE CONTROLO DO JOGO (A "MAESTRA") ---
    
    function proximaPeca() {
        if (!isGameActive) return;

        const tipoAtual = proximoTipo;
        const novaPeca = construirPeca(tipoAtual, 0);
        novaPeca.id = 'peca-ativa';
        
        const posInicialLeft = 4 * tamanhoQuadrado;
        novaPeca.style.top = '0px';
        novaPeca.style.left = posInicialLeft + 'px';

        // VERIFICAÇÃO DE FIM DE JOGO
        if (verificarColisao(tipoAtual, 0, 0, posInicialLeft)) {
            // Para todos os loops
            if (loopAtual) clearInterval(loopAtual);
            if (cronometroLoop) clearInterval(cronometroLoop);
            musicaJogo.pause();
            
            // LÓGICA DE RECORDE
            if (pontuacaoAtaques > recordeAtual) {
                showRecordeModal(pontuacaoAtaques);
            } else {
                showGameOverModal(pontuacaoAtaques);
            }
            
            isGameActive = false;
            pauseButton.disabled = true;
            startButton.textContent = 'Iniciar Jogo';
            return;
        }

        tabuleiro.appendChild(novaPeca);
        proximoTipo = escolherTipoAleatorio();
        desenharProximaPeca();
        setTimeout(() => { iniciarQueda(novaPeca); }, 1);
    }
    

    // --- 11. CONTROLO DO JOGADOR (TECLADO) ---
    
    function controlarPeca(evento) {
        // Se um modal estiver aberto, ignora as teclas
        if (!isGameActive || isPaused || !modalOverlay.classList.contains('oculto')) {
            return;
        }

        const pecaAtiva = document.getElementById('peca-ativa');
        if (!pecaAtiva) return;

        const tipo = pecaAtiva.dataset.tipo;
        let rotacao = parseInt(pecaAtiva.dataset.rotacao);
        let posTop = parseInt(pecaAtiva.style.top);
        let posLeft = parseInt(pecaAtiva.style.left);
        
        switch (evento.key) {
            case 'ArrowLeft':
                if (!verificarColisao(tipo, rotacao, posTop, posLeft - tamanhoQuadrado)) {
                    pecaAtiva.style.left = (posLeft - tamanhoQuadrado) + 'px';
                }
                evento.preventDefault();
                break;
            case 'ArrowRight':
                if (!verificarColisao(tipo, rotacao, posTop, posLeft + tamanhoQuadrado)) {
                    pecaAtiva.style.left = (posLeft + tamanhoQuadrado) + 'px';
                }
                evento.preventDefault();
                break;
            case 'ArrowDown':
                if (!verificarColisao(tipo, rotacao, posTop + tamanhoQuadrado, posLeft)) {
                    pecaAtiva.style.top = (posTop + tamanhoQuadrado) + 'px';
                } else {
                    clearInterval(loopAtual);
                    solidificarPeca(pecaAtiva);
                    verificarLinhasCompletas();
                    proximaPeca();
                }
                evento.preventDefault();
                break;
            case 'ArrowUp':
                let proximaRotacao = (rotacao + 1) % 4;
                if (!verificarColisao(tipo, proximaRotacao, posTop, posLeft)) {
                     pecaAtiva.dataset.rotacao = proximaRotacao;
                     desenharPeca(pecaAtiva, tipo, proximaRotacao);
                } 
                else if (!verificarColisao(tipo, proximaRotacao, posTop, posLeft + tamanhoQuadrado)) {
                     pecaAtiva.style.left = (posLeft + tamanhoQuadrado) + 'px';
                     pecaAtiva.dataset.rotacao = proximaRotacao;
                     desenharPeca(pecaAtiva, tipo, proximaRotacao);
                }
                else if (!verificarColisao(tipo, proximaRotacao, posTop, posLeft - tamanhoQuadrado)) {
                     pecaAtiva.style.left = (posLeft - tamanhoQuadrado) + 'px';
                     pecaAtiva.dataset.rotacao = proximaRotacao;
                     desenharPeca(pecaAtiva, tipo, proximaRotacao);
                }
                evento.preventDefault();
                break;
        }
    }


    // --- 12. FUNÇÕES DOS BOTÕES ---

    function togglePause() {
        if (!isGameActive || !modalOverlay.classList.contains('oculto')) return;
        
        isPaused = !isPaused;
        if (isPaused) {
            pauseButton.textContent = 'Continuar';
            pauseButton.classList.add('pausado');
            musicaJogo.pause();
        } else {
            pauseButton.textContent = 'Pausar';
            pauseButton.classList.remove('pausado');
            musicaJogo.play();
        }
    }

    function reiniciarJogo() {
        hideModals();

        if (loopAtual) clearInterval(loopAtual);
        if (cronometroLoop) clearInterval(cronometroLoop);
        musicaJogo.pause();

        document.querySelectorAll('.peca, .quadradinho-estatico').forEach(b => b.remove());
        tabuleiroVirtual = criarTabuleiroVirtual();
        pontuacaoAtaques = 0;
        atualizarPlacar();
        
        isGameActive = true;
        isPaused = false;
        
        pauseButton.textContent = 'Pausar';
        pauseButton.classList.remove('pausado');
        pauseButton.disabled = false;
        startButton.textContent = 'Reiniciar Jogo';
        
        iniciarCronometro();
        musicaJogo.currentTime = 0;
        musicaJogo.play();

        proximoTipo = escolherTipoAleatorio();
        desenharProximaPeca();
        proximaPeca();
    }
    
    // --- 13. (ATUALIZADO) FUNÇÕES DOS MODAIS ---

    function showGameOverModal(pontuacao) {
        finalScoreGameover.textContent = pontuacao;
        modalOverlay.classList.remove('oculto');
        gameOverModal.classList.remove('oculto');
    }
    
    function showRecordeModal(pontuacao) {
        finalScoreRecorde.textContent = pontuacao;
        playerNameInput.value = '';
        modalOverlay.classList.remove('oculto');
        recordeModal.classList.remove('oculto');
        playerNameInput.focus();
    }

    // (NOVO) Função para o Easter Egg
    function showEasterEggModal() {
        // Pausa o jogo se ele estiver a decorrer
        if (isGameActive && !isPaused) {
            togglePause();
        }
        modalOverlay.classList.remove('oculto');
        easterEggModal.classList.remove('oculto');
    }

    // (ATUALIZADO) Esta função agora fecha TODOS os modais
    function hideModals() {
        modalOverlay.classList.add('oculto');
        gameOverModal.classList.add('oculto');
        recordeModal.classList.add('oculto');
        easterEggModal.classList.add('oculto'); // Adicionado
    }

    function salvarNovoRecorde() {
        const nome = playerNameInput.value || 'Jogador';

        recordeAtual = pontuacaoAtaques;
        nomeRecorde = nome.substring(0, 10); // Limita o nome
        localStorage.setItem('tetrisRecorde', recordeAtual.toString());
        localStorage.setItem('tetrisRecordeNome', nomeRecorde);
        
        atualizarPlacarRecorde();
        hideModals();
    }
    

    // --- 14. "LIGAR" O JOGO ---
    
    // "Ouve" os cliques nos botões
    startButton.addEventListener('click', reiniciarJogo);
    pauseButton.addEventListener('click', togglePause);
    
    // "Ouve" o slider de volume
    volumeSlider.addEventListener('input', (e) => {
        musicaJogo.volume = e.target.value;
    });
    
    // "Ouve" as teclas premidas
    document.addEventListener('keydown', controlarPeca);
    
    // "Ouve" os botões dos modais
    closeGameoverButton.addEventListener('click', hideModals);
    saveScoreButton.addEventListener('click', salvarNovoRecorde);
    modalOverlay.addEventListener('click', hideModals);
    playerNameInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            salvarNovoRecorde();
        }
    });

    // (NOVO) "Ouve" o clique do Easter Egg
    elementoRecordeNome.addEventListener('click', showEasterEggModal);
    closeEasterEggButton.addEventListener('click', hideModals);

    // Configuração inicial
    atualizarPlacar();
    atualizarPlacarRecorde();
    desenharProximaPeca();
    elementoCronometro.textContent = formatarTempo(0);
    musicaJogo.volume = volumeSlider.value;
    
    // O JOGO NÃO COMEÇA ATÉ O UTILIZADOR CLICAR EM "INICIAR JOGO"
});
