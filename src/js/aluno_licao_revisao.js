/**
 * @file aluno_licao_revisao.js
 * @description Lógica para a página de revisão de palavras aprendidas.
 * Exibe as palavras que o aluno marcou como aprendidas em formato de flip cards
 * com funcionalidade de pronúncia.
 */

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-revisao');
const errorMessageEl = document.getElementById('error-message-revisao');
const noWordsMessageEl = document.getElementById('no-words-message-revisao');
const cardsGridContainerEl = document.getElementById('cards-grid-container-revisao');
const revisaoCardTemplate = document.getElementById('revisao-card-template');
const btnExitRevisaoEl = document.getElementById('btn-exit-revisao');
const controlsGlobalEl = document.querySelector('.controls-revisao-global'); // Para esconder/mostrar o botão de sair

// --- CONFIGURAÇÕES E ESTADO ---
const RESPONSIVEVOICE_API_KEY = "SUA_API_KEY"; // Sua chave da API ResponsiveVoice 
let palavrasAprendidasDoUsuario = [];

// --- FUNÇÕES DE UI (Podem ser movidas para utils.js se forem mais genéricas) ---

/**
 * Controla a visibilidade dos elementos de mensagem e do grid de cards.
 * @param {boolean} isLoading - Se verdadeiro, mostra a mensagem de carregamento.
 * @param {boolean} hasError - Se verdadeiro, mostra a mensagem de erro.
 * @param {boolean} hasNoWords - Se verdadeiro, mostra a mensagem de "sem palavras".
 * @param {boolean} showGrid - Se verdadeiro, mostra o grid de cards.
 */
function atualizarVisibilidadeUI(isLoading = false, hasError = false, hasNoWords = false, showGrid = false) {
  if (loadingMessageEl) loadingMessageEl.classList.toggle('hidden', !isLoading);
  if (errorMessageEl) errorMessageEl.classList.toggle('hidden', !hasError);
  if (noWordsMessageEl) noWordsMessageEl.classList.toggle('hidden', !hasNoWords);
  if (cardsGridContainerEl) cardsGridContainerEl.classList.toggle('hidden', !showGrid);
  if (controlsGlobalEl) controlsGlobalEl.classList.toggle('hidden', !(showGrid || hasNoWords)); // Mostra se tiver grid ou msg de sem palavras
}

// --- LÓGICA DA API RESPONSIVEVOICE ---
/**
 * Carrega o script da API ResponsiveVoice dinamicamente, se ainda não estiver carregado.
 * @returns {Promise<void>}
 */
function loadResponsiveVoiceAPI() {
  return new Promise((resolve, reject) => {
    if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) {
      resolve();
      return;
    }
    // Verifica se o script já foi injetado para evitar duplicidade
    if (document.querySelector('script[src*="responsivevoice.js?key="]')) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) {
          clearInterval(interval); resolve();
        } else if (attempts > 50) { // Tenta por ~5 segundos
          clearInterval(interval); reject(new Error("Timeout: ResponsiveVoice não inicializou após script já presente."));
        }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${RESPONSIVEVOICE_API_KEY}`;
    script.async = true;
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) {
          clearInterval(interval); resolve();
        } else if (attempts > 50) {
          clearInterval(interval); reject(new Error("Timeout pós-load: ResponsiveVoice não inicializou."));
        }
      }, 100);
    };
    script.onerror = (err) => reject(new Error("Falha ao carregar o script do ResponsiveVoice."));
    document.head.appendChild(script);
  });
}

/**
 * Usa a API ResponsiveVoice para pronunciar o texto fornecido.
 * @param {string} text - O texto a ser pronunciado.
 */
function speakWithResponsiveVoice(text) {
  let lang = 'US English Male';
  if (typeof responsiveVoice === 'undefined' || !responsiveVoice.voiceSupport()) {
    if (typeof Swal !== 'undefined') {
      Swal.fire('Oops...', 'Serviço de pronúncia não disponível ou voz não suportada.', 'warning');
    } else {
      alert('Serviço de pronúncia não disponível.');
    }
    return;
  }
  if (!text || text.trim() === "") return;
  responsiveVoice.speak(text, lang, { rate: 0.8 });
}

// --- LÓGICA DA PÁGINA DE REVISÃO ---

/**
 * Cria um elemento de flip card para uma palavra aprendida.
 * @param {object} palavraObj - O objeto da palavra, contendo { word: "...", traducao: "..." }.
 * @returns {HTMLElement} O elemento do card criado.
 */
function criarCardRevisao(palavraObj) {
  if (!revisaoCardTemplate) {
    console.error("Template do card de revisão não encontrado!");
    return null;
  }

  const cardClone = revisaoCardTemplate.content.cloneNode(true);
  const cardElement = cardClone.querySelector('.card-revisao');
  const wordEnElCard = cardClone.querySelector('.word-revisao-en');
  const wordPtElCard = cardClone.querySelector('.word-revisao-pt');
  const btnPronounceCard = cardClone.querySelector('.btn-pronounce-card-revisao');

  if (wordEnElCard) wordEnElCard.textContent = palavraObj.word;
  if (wordPtElCard) wordPtElCard.textContent = palavraObj.traducao;

  // Evento para virar o card
  cardElement.addEventListener('click', () => {
    cardElement.classList.toggle('is-flipped');
  });

  // Evento para o botão de pronúncia dentro do card
  if (btnPronounceCard) {
    btnPronounceCard.addEventListener('click', (e) => {
      e.stopPropagation(); // Impede que o clique no botão também vire o card
      speakWithResponsiveVoice(palavraObj.word);
    });
  }
  return cardElement;
}

/**
 * Renderiza todos os cards de palavras aprendidas no grid.
 */
function renderizarCardsRevisao() {
  if (!cardsGridContainerEl) return;
  cardsGridContainerEl.innerHTML = ''; // Limpa o grid

  if (palavrasAprendidasDoUsuario.length === 0) {
    atualizarVisibilidadeUI(false, false, true, false); // Mostra mensagem "sem palavras"
    return;
  }

  palavrasAprendidasDoUsuario.forEach(palavraObj => {
    const card = criarCardRevisao(palavraObj);
    if (card) {
      cardsGridContainerEl.appendChild(card);
    }
  });
  atualizarVisibilidadeUI(false, false, false, true); // Mostra o grid
}

/**
 * Função principal de inicialização da página de revisão.
 * Carrega os dados do usuário e popula a página.
 * @async
 */
async function initRevisaoPalavras() {
  atualizarVisibilidadeUI(true); // Mostra loading

  try {
    await loadResponsiveVoiceAPI(); // Garante que a API de voz esteja pronta

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || usuarioLogado.tipo !== 'aluno') {
      showError("Acesso negado. Faça login como aluno para ver seu progresso.");
      // window.location.href = "/src/login/index.html"
      return;
    }

    // Pega as palavras aprendidas do objeto de progresso do usuário
    // A estrutura esperada é usuarioLogado.progresso.palavrasAprendidas = [{word: "", traducao: ""}, ...]
    palavrasAprendidasDoUsuario = usuarioLogado.progresso?.palavrasAprendidas || [];

    renderizarCardsRevisao();

  } catch (error) {
    console.error("Erro ao inicializar a página de revisão:", error);
    showError(`Ocorreu um erro ao carregar suas palavras: ${error.message}`);
  }
}

// --- EVENT LISTENERS GLOBAIS ---
if (btnExitRevisaoEl) {
  btnExitRevisaoEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_aluno/index.html'; // Ou para a página de progresso
  });
}

// Quando o conteúdo HTML da página estiver completamente carregado, inicia a lógica.
document.addEventListener('DOMContentLoaded', initRevisaoPalavras);
