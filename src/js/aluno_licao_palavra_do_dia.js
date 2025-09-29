/**
 * @file aluno_palavra_do_dia.js
 * @description Lógica para a lição "Palavra do Dia" usando dados locais do db.json.
 * Exibe uma palavra aleatória com seu exemplo e tradução em um flip card.
 * Permite ouvir a pronúncia da palavra principal (ResponsiveVoice).
 */

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-pdd');
const errorMessageEl = document.getElementById('error-message-pdd');
const cardContainerEl = document.querySelector('.card-container-pdd');
const flipCardEl = document.getElementById('flip-card-pdd');

const wordEnEl = document.getElementById('word-en');
const exampleEnSentenceEl = document.getElementById('example-en-sentence');

const wordPtEl = document.getElementById('word-pt');
const examplePtSentenceEl = document.getElementById('example-pt-sentence');

const controlsEl = document.querySelector('.controls-pdd');
const btnPronounceEl = document.getElementById('btn-pronounce-pdd');
const btnNextWordEl = document.getElementById('btn-next-word-pdd');

// --- CONFIGURAÇÕES E ESTADO ---
const RESPONSIVEVOICE_API_KEY = "SUA_API_KEY"; // Sua chave ResponsiveVoice
const LOCAL_WORDS_API_URL = "http://localhost:3000/licao_palavras_do_dia";

let allWordsData = []; // Armazena todas as palavras carregadas do db.json
let currentWordItem = null; // Armazena o objeto da palavra/exemplo atual
let isCardFlipped = false;

// --- FUNÇÕES DE UI ---
function showLoading(isLoading) {
  if (loadingMessageEl) loadingMessageEl.classList.toggle('hidden', !isLoading);
  if (cardContainerEl) cardContainerEl.classList.toggle('hidden', isLoading);
  if (controlsEl) controlsEl.classList.toggle('hidden', isLoading);
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
}

function showError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.remove('hidden');
  }
  if (cardContainerEl) cardContainerEl.classList.add('hidden');
  if (controlsEl) controlsEl.classList.add('hidden');
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (typeof Swal !== 'undefined') {
    Swal.fire({ icon: 'error', title: 'Oops...', text: message, confirmButtonColor: '#6A2C70' });
  } else {
    alert(message); // Fallback
  }
}

function showCard() {
  if (cardContainerEl) cardContainerEl.classList.remove('hidden');
  if (controlsEl) controlsEl.classList.remove('hidden');
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
}

// --- LÓGICA DA API RESPONSIVEVOICE ---
function loadResponsiveVoiceAPI() {
  return new Promise((resolve, reject) => {
    if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) { resolve(); return; }
    if (document.querySelector('script[src*="responsivevoice.js"]')) {
      let att = 0; const i = setInterval(() => { att++; if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) { clearInterval(i); resolve(); } else if (att > 50) { clearInterval(i); reject(new Error("Timeout ResponsiveVoice.")); } }, 100); return;
    }
    const s = document.createElement('script'); s.src = `https://code.responsivevoice.org/responsivevoice.js?key=${RESPONSIVEVOICE_API_KEY}`; s.async = true;
    s.onload = () => { let att = 0; const i = setInterval(() => { att++; if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) { clearInterval(i); resolve(); } else if (att > 50) { clearInterval(i); reject(new Error("Timeout pós-load ResponsiveVoice.")); } }, 100); };
    s.onerror = (e) => reject(new Error("Falha ao carregar script ResponsiveVoice.")); document.head.appendChild(s);
  });
}

// --- FUNÇÃO DE PRONÚNCIA ---
function speakWithResponsiveVoice(text) {
  let lang = 'US English Male'
  if (typeof responsiveVoice === 'undefined' || !responsiveVoice.voiceSupport()) { Swal.fire('Oops...', 'Serviço de pronúncia não disponível.', 'warning'); return; }
  if (!text || text.trim() === "") return;
  responsiveVoice.speak(text, lang, { rate: 0.8 });
}

// --- LÓGICA PRINCIPAL DA LIÇÃO ---

/**
 * Busca todas as palavras do dia do db.json.
 * @async
 */
async function loadAllWords() {
  showLoading(true);
  try {
    const response = await fetch(LOCAL_WORDS_API_URL);
    if (!response.ok) {
      throw new Error(`Erro ${response.status} ao buscar palavras do db.json`);
    }
    allWordsData = await response.json();
    if (!Array.isArray(allWordsData) || allWordsData.length === 0) {
      throw new Error("Nenhuma palavra encontrada no banco de dados local.");
    }
    displayNewWord(); // Exibe a primeira palavra
  } catch (error) {
    console.error("Erro em loadAllWords:", error);
    showError(`Não foi possível carregar as palavras. Detalhe: ${error.message}`);
  } finally {
    showLoading(false); // Garante que o loading suma mesmo em caso de erro inicial
  }
}

/**
 * Seleciona e exibe uma nova palavra aleatória da lista carregada.
 */
function displayNewWord() {
  if (!allWordsData || allWordsData.length === 0) {
    showError("Nenhuma palavra disponível para exibir.");
    return;
  }
  showLoading(true); // Mostra loading rapidamente enquanto o card atualiza

  if (flipCardEl && isCardFlipped) {
    flipCardEl.classList.remove('is-flipped');
    isCardFlipped = false;
  }

  // Seleciona uma palavra aleatória diferente da atual (se houver)
  let randomIndex;
  let newWordItem;
  if (allWordsData.length === 1) {
    newWordItem = allWordsData[0];
  } else {
    do {
      randomIndex = Math.floor(Math.random() * allWordsData.length);
      newWordItem = allWordsData[randomIndex];
    } while (newWordItem === currentWordItem && allWordsData.length > 1); // Evita repetir a mesma palavra em seguida
  }
  currentWordItem = newWordItem;

  // Popula a frente do card
  if (wordEnEl) wordEnEl.textContent = currentWordItem.word;
  if (exampleEnSentenceEl) exampleEnSentenceEl.textContent = currentWordItem.example_en;

  // Popula o verso do card
  if (wordPtEl) wordPtEl.textContent = currentWordItem.translation;
  if (examplePtSentenceEl) examplePtSentenceEl.textContent = currentWordItem.example_pt;

  showCard();
}

// --- EVENT LISTENERS ---
if (flipCardEl) {
  flipCardEl.addEventListener('click', () => {
    flipCardEl.classList.toggle('is-flipped');
    isCardFlipped = flipCardEl.classList.contains('is-flipped');
  });
}

if (btnPronounceEl) {
  btnPronounceEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentWordItem?.word) {
      speakWithResponsiveVoice(`${currentWordItem.word} - ${currentWordItem.example_en}`);

    } else {
      Swal.fire('Atenção', 'Nenhuma palavra carregada para pronunciar.', 'info');
    }
  });
}

if (btnNextWordEl) {
  btnNextWordEl.addEventListener('click', (e) => {
    e.stopPropagation();
    displayNewWord(); // Apenas exibe uma nova palavra da lista já carregada
  });
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
  const pddElementsReady = loadingMessageEl && errorMessageEl && cardContainerEl && flipCardEl &&
    wordEnEl && exampleEnSentenceEl &&
    wordPtEl && examplePtSentenceEl &&
    controlsEl && btnPronounceEl && btnNextWordEl;

  if (pddElementsReady) {
    try {
      await loadResponsiveVoiceAPI();
      await loadAllWords(); // Carrega todas as palavras do db.json uma vez
    } catch (error) {
      showError(`Falha ao iniciar 'Palavra do Dia'. Detalhe: ${error.message}`);
    }
  } else {
    const errorMsg = "ERRO CRÍTICO: Elementos da UI não encontrados. Verifique IDs no HTML.";
    console.error(errorMsg);
    if (errorMessageEl) showError(errorMsg); else alert(errorMsg);
  }
});
