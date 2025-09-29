/**
 * @file aluno_licoes_noticias.js
 * @description Lógica para a lição "Leitor de Notícias".
 * Busca notícias da GNews API, exibe em um carrossel de flip cards,
 * traduz o conteúdo com DeepL e permite ouvir o original com ResponsiveVoice.
 */

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-noticias');
const errorMessageEl = document.getElementById('error-message-noticias');
const carouselContainerEl = document.getElementById('carousel-noticias-container');
const carouselWrapperEl = document.querySelector('.carousel-wrapper');
const noticiaCardTemplate = document.getElementById('noticia-card-template');

const btnPrevNoticiaEl = document.getElementById('btn-prev-noticia');
const btnNextNoticiaEl = document.getElementById('btn-next-noticia');


const currentArticleNumberEl = document.getElementById('current-article-number');
const totalArticlesNumberEl = document.getElementById('total-articles-number');

// !!! ATENÇÃO: CHAVE EXPOSTA NO CLIENTE - INSEGURO PARA PRODUÇÃO/GITHUB PÚBLICO !!!
// --- CONFIGURAÇÕES E CHAVES DE API ---
// RESPONSIVEVOICE API - VOZ
const DEEPL_TARGET_LANG = "PT-BR";
const RESPONSIVEVOICE_API_KEY = "SUA_API_KEY"; // SUA CHAVE RESPONSIVEVOICE

// GNEWS API - NOTÍCIAS
const GNEWS_API_KEY = "SUA_API_KEY"; // SUA CHAVE GNEWS
const GNEWS_LANG = "en";
const GNEWS_MAX_ARTICLES = 10;
const GNEWS_API_URL = `https://gnews.io/api/v4/top-headlines?lang=${GNEWS_LANG}&max=${GNEWS_MAX_ARTICLES}&token=${GNEWS_API_KEY}`;

// DEEPL API - TRADUTOR
const DEEPL_API_KEY_CLIENT_SIDE = "SUA_API_KEY"; // SUA CHAVE DEEPL
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

let currentArticles = [];
let currentArticleIndex = 0;

// --- FUNÇÕES DE UI (showLoading, showError - podem vir do utils.js) ---
function showLoading(isLoading) {
  if (loadingMessageEl) loadingMessageEl.classList.toggle('hidden', !isLoading);
  if (carouselContainerEl) carouselContainerEl.classList.toggle('hidden', isLoading);
  if (document.querySelector('.article-indicator')) document.querySelector('.article-indicator').classList.toggle('hidden', isLoading);
  if (document.querySelector('.controls-noticias')) document.querySelector('.controls-noticias').classList.toggle('hidden', isLoading);
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
}

function showError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.remove('hidden');
  }
  if (carouselContainerEl) carouselContainerEl.classList.add('hidden');
  if (document.querySelector('.article-indicator')) document.querySelector('.article-indicator').classList.add('hidden');
  if (document.querySelector('.controls-noticias')) document.querySelector('.controls-noticias').classList.add('hidden');
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  Swal.fire({ icon: 'error', title: 'Oops...', text: message, confirmButtonColor: '#6A2C70' });
}

// --- LÓGICA DA API RESPONSIVEVOICE - API de Voz ---
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

function speakWithResponsiveVoice(text) {
  let lang = 'US English Male'
  if (typeof responsiveVoice === 'undefined' || !responsiveVoice.voiceSupport()) { Swal.fire('Oops...', 'Serviço de pronúncia não disponível.', 'warning'); return; }
  if (!text || text.trim() === "") return;
  responsiveVoice.speak(text, lang, { rate: 0.8 });
}

// --- LÓGICA PRINCIPAL DA LIÇÃO DE NOTÍCIAS ---

/**
 * Busca notícias da GNews API.
 * @async
 */
async function fetchNews() {
  showLoading(true);
  if (!GNEWS_API_KEY) {
    showError("Chave da API GNews não configurada.");
    return;
  }

  try {
    const response = await fetch(GNEWS_API_URL);
    if (!response.ok) {
      let errorDetails = `Erro ${response.status}: ${response.statusText}`;
      try { const errData = await response.json(); errorDetails += ` - ${errData.errors ? errData.errors.join(', ') : JSON.stringify(errData)}`; }
      catch (e) { console.error("Erro ao processar resposta da GNews API:", e); }
      throw new Error(`Falha ao buscar notícias da GNews. ${errorDetails}`);
    }
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      throw new Error("Nenhum artigo encontrado pela GNews API.");
    }
    currentArticles = data.articles.filter(article => article.title && article.description && article.image); // Filtra artigos com dados essenciais

    if (currentArticles.length === 0) {
      throw new Error("Nenhum artigo com título, descrição e imagem foi encontrado.");
    }

    currentArticleIndex = 0;
    populateCarousel();
    displayArticle(currentArticleIndex);
    showLoading(false); // Esconde loading e mostra o carrossel
    if (carouselContainerEl) carouselContainerEl.classList.remove('hidden');
    if (document.querySelector('.article-indicator')) document.querySelector('.article-indicator').classList.remove('hidden');
    if (document.querySelector('.controls-noticias')) document.querySelector('.controls-noticias').classList.remove('hidden');


  } catch (error) {
    console.error("Erro em fetchNews:", error);
    showError(`Não foi possível carregar as notícias. Detalhe: ${error.message}`);
  }
}

/**
 * Popula o carrossel com os cards das notícias.
 */
function populateCarousel() {
  if (!carouselWrapperEl || !noticiaCardTemplate) return;
  carouselWrapperEl.innerHTML = ''; // Limpa o carrossel

  currentArticles.forEach((article, index) => {
    const cardClone = noticiaCardTemplate.content.cloneNode(true);
    const cardElement = cardClone.querySelector('.card-noticia');
    cardElement.dataset.index = index; // Para identificar o card

    // Configura o flip no clique do card
    cardElement.addEventListener('click', () => {
      cardElement.classList.toggle('is-flipped');
    });

    carouselWrapperEl.appendChild(cardClone);
  });
}

/**
 * Exibe um artigo específico no carrossel e busca sua tradução.
 * @param {number} index - O índice do artigo a ser exibido.
 */
async function displayArticle(index) {
  if (index < 0 || index >= currentArticles.length) return;
  currentArticleIndex = index;

  updateCarouselPosition(index);
  updateArticleIndicator(index);
  updateNavigationButtons(index);

  const activeCardElement = getActiveCardElement(index);
  if (!activeCardElement) return;

  const article = currentArticles[index];

  updateCardFront(activeCardElement, article);
  updateCardBackPlaceholders(activeCardElement, article);
  setupCardListeners(activeCardElement, article);

  await handleTranslation(activeCardElement, article);
}

function updateCarouselPosition(index) {
  if (carouselWrapperEl) {
    carouselWrapperEl.style.transform = `translateX(-${index * 100}%)`;
  }
}

function updateArticleIndicator(index) {
  if (currentArticleNumberEl) currentArticleNumberEl.textContent = index + 1;
  if (totalArticlesNumberEl) totalArticlesNumberEl.textContent = currentArticles.length;
}

function updateNavigationButtons(index) {
  if (btnPrevNoticiaEl) btnPrevNoticiaEl.disabled = index === 0;
  if (btnNextNoticiaEl) btnNextNoticiaEl.disabled = index === currentArticles.length - 1;
}

function getActiveCardElement(index) {
  return carouselWrapperEl ? carouselWrapperEl.children[index] : null;
}

function updateCardFront(cardElement, article) {
  const imgEl = cardElement.querySelector('.noticia-imagem');
  const titleEnEl = cardElement.querySelector('.noticia-titulo-en');
  const descEnEl = cardElement.querySelector('.noticia-descricao-en');

  if (imgEl) {
    imgEl.src = article.image || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem';
    imgEl.alt = article.title || '';
  }
  if (titleEnEl) titleEnEl.textContent = article.title;
  if (descEnEl) descEnEl.textContent = article.description;
}

function updateCardBackPlaceholders(cardElement, article) {
  const imgEl = cardElement.querySelector('.noticia-imagem-verso');
  const titlePtEl = cardElement.querySelector('.noticia-titulo-pt');
  const descPtEl = cardElement.querySelector('.noticia-descricao-pt');

  if (imgEl) {
    imgEl.src = article.image || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem';
    imgEl.alt = article.title || '';
  }
  if (titlePtEl) titlePtEl.textContent = 'Traduzindo título...';
  if (descPtEl) descPtEl.textContent = 'Traduzindo descrição...';
}

function setupCardListeners(cardElement, article) {
  const btnOuvirFrontEl = cardElement.querySelector('.card-front-noticia .btn-ouvir-noticia');
  const btnOuvirBackEl = cardElement.querySelector('.card-back-noticia .btn-ouvir-noticia');

  if (btnOuvirFrontEl) {
    btnOuvirFrontEl.onclick = (e) => {
      e.stopPropagation();
      speakWithResponsiveVoice(`${article.title}. ${article.description}`);
    };
  }
  if (btnOuvirBackEl) {
    btnOuvirBackEl.onclick = (e) => {
      e.stopPropagation();
      speakWithResponsiveVoice(`${article.title}. ${article.description}`);
    };
  }
}

async function handleTranslation(cardElement, article) {
  const titlePtEl = cardElement.querySelector('.noticia-titulo-pt');
  const descPtEl = cardElement.querySelector('.noticia-descricao-pt');
  try {
    const textsToTranslate = [article.title, article.description];
    const translations = await translateTextsForNews(textsToTranslate);
    if (translations) {
      if (titlePtEl) titlePtEl.textContent = translations[0] || article.title;
      if (descPtEl) descPtEl.textContent = translations[1] || article.description;
    }
  } catch (error) {
    console.error("Erro ao traduzir conteúdo da notícia:", error);
    if (titlePtEl) titlePtEl.textContent = article.title + " (Tradução falhou)";
    if (descPtEl) descPtEl.textContent = article.description + " (Tradução falhou)";
  }
}

/**
 * Traduz os textos (título e descrição da notícia) usando a API DeepL.
 * @async
 * @param {string[]} texts - Array com [título, descrição] para traduzir.
 * @returns {Promise<string[]|null>} Array com [título traduzido, descrição traduzida] ou null.
 */
async function translateTextsForNews(texts) {
  if (!DEEPL_API_KEY_CLIENT_SIDE || DEEPL_API_KEY_CLIENT_SIDE.length < 10) {
    console.warn("[TRAD_DEEPL_NEWS] Chave DeepL não configurada.");
    return null;
  }
  if (!texts || texts.length < 2) return null;

  try {
    const bodyData = { text: texts, target_lang: DEEPL_TARGET_LANG };
    const fetchOptions = {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY_CLIENT_SIDE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    };
    const response = await fetch(DEEPL_API_URL, fetchOptions);
    if (!response.ok) {
      let eTxt;
      try {
        const eD = await response.json();
        eTxt = eD.message || JSON.stringify(eD);
      } catch (e) {
        console.error("Erro ao processar JSON de erro da DeepL API:", e);
        try {
          eTxt = await response.text();
        } catch (textErr) {
          console.error("Erro ao obter texto da resposta de erro:", textErr);
          eTxt = "Erro desconhecido ao processar resposta de erro.";
        }
      }
      throw new Error(`Erro API DeepL: ${eTxt}`);
    }
    const translationData = await response.json();
    if (translationData.translations && translationData.translations.length >= texts.length) {
      return translationData.translations.map(t => t.text);
    }
    throw new Error("Formato de tradução DeepL inválido para notícias.");
  } catch (error) {
    console.error("[TRAD_DEEPL_NEWS] Erro:", error);
    return null; // Retorna null para indicar falha na tradução
  }
}

// --- EVENT LISTENERS ---
if (btnPrevNoticiaEl) {
  btnPrevNoticiaEl.addEventListener('click', () => {
    displayArticle(currentArticleIndex - 1);
  });
}
if (btnNextNoticiaEl) {
  btnNextNoticiaEl.addEventListener('click', () => {
    displayArticle(currentArticleIndex + 1);
  });
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
  const newsElementsReady = loadingMessageEl && errorMessageEl && carouselContainerEl && carouselWrapperEl &&
    noticiaCardTemplate && btnPrevNoticiaEl && btnNextNoticiaEl && currentArticleNumberEl && totalArticlesNumberEl;

  if (newsElementsReady) {
    try {
      await loadResponsiveVoiceAPI();
      await fetchNews();
    } catch (error) {
      showError(`Falha ao iniciar o Leitor de Notícias. Detalhe: ${error.message}`);
    }
  } else {
    const errorMsg = "ERRO CRÍTICO: Elementos da UI do Leitor de Notícias não encontrados. Verifique IDs no HTML.";
    console.error(errorMsg);
    if (errorMessageEl) showError(errorMsg); else alert(errorMsg);
  }
});
