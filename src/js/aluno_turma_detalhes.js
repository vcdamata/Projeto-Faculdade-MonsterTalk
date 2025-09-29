/**
 * @file aluno_turma_detalhes.js
 * @description Lógica para a página que exibe os recursos (lições/conteúdos)
 * de uma turma específica para o aluno.
 */

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-ct');
const errorMessageEl = document.getElementById('error-message-ct');
const noRecursosMessageEl = document.getElementById('no-recursos-message-ct');
const listaRecursosContainerEl = document.getElementById('lista-recursos-turma');
const tituloPaginaEl = document.getElementById('tituloPaginaConteudoTurma');
const btnVoltarParaTurmasEl = document.getElementById('btnVoltarParaTurmas');

let alunoLogado = null;
let turmaIdAtual = null;

// --- FUNÇÕES DE UI ---
function esconderMensagensCT() {
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
  if (noRecursosMessageEl) noRecursosMessageEl.classList.add('hidden');
}

function limparListaRecursos() {
  if (listaRecursosContainerEl) listaRecursosContainerEl.innerHTML = '';
}

function mostrarMensagemCT(tipo, mensagem) {
  esconderMensagensCT();
  // Não esconde listaRecursosContainerEl aqui, pois pode ter conteúdo parcial

  if (tipo === 'loading') {
    if (loadingMessageEl) {
      loadingMessageEl.textContent = mensagem || "Carregando...";
      loadingMessageEl.classList.remove('hidden');
    }
    return;
  }

  if (tipo === 'error') {
    if (errorMessageEl) {
      errorMessageEl.textContent = mensagem || "Ocorreu um erro.";
      errorMessageEl.classList.remove('hidden');
    }
    limparListaRecursos();
    return;
  }

  if (tipo === 'no-items') {
    if (noRecursosMessageEl) {
      noRecursosMessageEl.textContent = mensagem || "Nenhum recurso encontrado.";
      noRecursosMessageEl.classList.remove('hidden');
    }
    limparListaRecursos();
    return;
  }

  if (tipo === 'list') { // Para mostrar a lista/grid de cards
    if (listaRecursosContainerEl) listaRecursosContainerEl.classList.remove('hidden');
  }
}

// --- LÓGICA PRINCIPAL ---

/**
 * Cria e retorna um elemento de card para um recurso da turma.
 * @param {object} recurso - O objeto do recurso (lição ou conteúdo).
 * @param {string} tipoRecursoOriginal - O tipo original do recurso ('licaoPlataforma', 'licaoProfessor', 'conteudoProfessor').
 * @returns {HTMLElement|null} O elemento do card do recurso ou null se dados inválidos.
 */
function criarCardRecurso(recurso, tipoRecursoOriginal) {
  if (!recurso || !recurso.id || !recurso.titulo) return null;

  const card = document.createElement('a'); // O card inteiro será um link
  card.classList.add('ct-card-recurso');

  // Define o link para a página do recurso
  if (tipoRecursoOriginal === 'licaoPlataforma') {
    card.href = `/src/dashboard_aluno/licoes/licao_teste.html?id=${recurso.id}&tipo=plataforma`;

  } else if (tipoRecursoOriginal === 'licaoProfessor') {
    card.href = `/src/dashboard_aluno/licoes/licao_teste.html?id=${recurso.id}&tipo=professor`;

  } else if (tipoRecursoOriginal === 'conteudoProfessor') {
    card.href = `/src/dashboard_aluno/licoes/licao_conteudo.html?id=${recurso.id}&tipo=conteudo`;
  } else {
    card.href = '#'; // Fallback
  }

  const tituloEl = document.createElement('h3');
  tituloEl.classList.add('ct-card-recurso-titulo');
  tituloEl.textContent = recurso.titulo;

  const tipoEl = document.createElement('span');
  tipoEl.classList.add('ct-card-recurso-tipo');
  let tipoTexto = "Recurso";
  if (tipoRecursoOriginal === 'licaoPlataforma') {
    tipoTexto = "Lição da Plataforma";
    tipoEl.classList.add('ct-tipo-licaoPlataforma');
  } else if (tipoRecursoOriginal === 'licaoProfessor') {
    tipoTexto = "Lição do Professor";
    tipoEl.classList.add('ct-tipo-licaoProfessor');
  } else if (tipoRecursoOriginal === 'conteudoProfessor') {
    tipoTexto = "Conteúdo do Professor";
    tipoEl.classList.add('ct-tipo-conteudoProfessor');
  }
  tipoEl.textContent = tipoTexto;

  const descricaoEl = document.createElement('p');
  descricaoEl.classList.add('ct-card-recurso-descricao');
  descricaoEl.textContent = recurso.descricao || "Sem descrição.";

  const nivelEl = document.createElement('p');
  nivelEl.classList.add('ct-card-recurso-nivel');
  nivelEl.textContent = `Nível: ${recurso.nivel || 'N/A'}`;

  const btnAcessar = document.createElement('span'); // Usando span estilizado como botão
  btnAcessar.classList.add('ct-btn-acessar-recurso');
  btnAcessar.textContent = (tipoRecursoOriginal === 'licaoPlataforma' || tipoRecursoOriginal === 'licaoProfessor') ? "Iniciar Lição" : "Ver Conteúdo";

  card.appendChild(tituloEl);
  card.appendChild(tipoEl);
  card.appendChild(descricaoEl);
  card.appendChild(nivelEl);
  card.appendChild(btnAcessar);

  return card;
}


/**
 * Busca os detalhes de um recurso específico (lição ou conteúdo).
 * @async
 * @param {string} idRecurso - O ID do recurso.
 * @param {string} tipoRecurso - O tipo do recurso ('licaoPlataforma', 'licaoProfessor', 'conteudoProfessor').
 * @returns {Promise<object|null>} O objeto do recurso ou null em caso de erro.
 */
async function fetchDetalhesRecurso(idRecurso, tipoRecurso) {
  let urlApi = '';
  switch (tipoRecurso) {
    case 'licaoPlataforma':
      urlApi = `http://localhost:3000/licoes/${idRecurso}`;
      break;
    case 'licaoProfessor':
      urlApi = `http://localhost:3000/licoes_professor/${idRecurso}`;
      break;
    case 'conteudoProfessor':
      urlApi = `http://localhost:3000/conteudos_professor/${idRecurso}`;
      break;
    default:
      console.warn("Tipo de recurso desconhecido:", tipoRecurso);
      return null;
  }

  try {
    const response = await fetch(urlApi);
    if (!response.ok) {
      console.error(`Falha ao buscar recurso ${tipoRecurso} com ID ${idRecurso}. Status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição do recurso ${tipoRecurso} ID ${idRecurso}:`, error);
    return null;
  }
}


/**
 * Carrega e renderiza os recursos associados à turma.
 * @async
 * @param {Array<object>} recursosIds - Array de objetos {idRecurso, tipoRecurso}.
 */
async function renderizarRecursosDaTurma(recursosIds) {
  if (!listaRecursosContainerEl) return;
  listaRecursosContainerEl.innerHTML = ''; // Limpa

  if (!recursosIds || recursosIds.length === 0) {
    mostrarMensagemCT('no-items', "Nenhum material de estudo foi adicionado a esta turma ainda.");
    return;
  }

  mostrarMensagemCT('loading', "Carregando recursos...");
  let recursosRenderizados = 0;

  // Usamos Promise.all para buscar todos os detalhes dos recursos em paralelo
  const promessasDeRecursos = recursosIds.map(async (recursoInfo) => {
    const detalheRecurso = await fetchDetalhesRecurso(recursoInfo.idRecurso, recursoInfo.tipoRecurso);
    if (detalheRecurso) {
      const cardRecurso = criarCardRecurso(detalheRecurso, recursoInfo.tipoRecurso);
      if (cardRecurso) {
        listaRecursosContainerEl.appendChild(cardRecurso);
        recursosRenderizados++;
      }
    }
  });

  await Promise.all(promessasDeRecursos);

  if (recursosRenderizados > 0) {
    mostrarMensagemCT('list'); // Mostra o container da lista
  } else {
    // Se nenhum recurso foi renderizado (talvez todos falharam ao buscar)
    mostrarMensagemCT('no-items', "Não foi possível carregar os materiais desta turma.");
  }
}


/**
 * Função principal de inicialização da página de conteúdo da turma.
 * @async
 */
async function initConteudoTurma() {
  alunoLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const urlParams = new URLSearchParams(window.location.search);
  turmaIdAtual = urlParams.get('turmaId');

  if (!alunoLogado || alunoLogado.tipo !== 'aluno') {
    mostrarMensagemCT('error', 'Acesso negado. Faça login como aluno.');
    return;
  }
  if (!turmaIdAtual) {
    mostrarMensagemCT('error', 'ID da turma não fornecido. Voltando...');
    setTimeout(() => { window.location.href = '/src/dashboard_aluno/turmas/index.html'; }, 2000);
    return;
  }

  mostrarMensagemCT('loading', "Carregando dados da turma...");

  try {
    const responseTurma = await fetch(`http://localhost:3000/turmas/${turmaIdAtual}`);
    if (!responseTurma.ok) {
      throw new Error(`Falha ao buscar dados da turma (status: ${responseTurma.status})`);
    }
    const turma = await responseTurma.json();

    if (tituloPaginaEl) {
      tituloPaginaEl.textContent = `Conteúdo da Turma: ${turma.nome || 'Desconhecida'}`;
    }

    // Verifica se o aluno logado realmente pertence a esta turma (segurança adicional)
    if (!Array.isArray(turma.alunoIds) || !turma.alunoIds.includes(alunoLogado.id)) {
      mostrarMensagemCT('error', 'Você não tem permissão para ver o conteúdo desta turma.');
      return;
    }

    await renderizarRecursosDaTurma(turma.recursosIds || []);

  } catch (error) {
    console.error("Erro ao inicializar página de conteúdo da turma:", error);
    mostrarMensagemCT('error', `Não foi possível carregar o conteúdo da turma: ${error.message}`);
  }
}

// --- EVENT LISTENERS ---
if (btnVoltarParaTurmasEl) {
  btnVoltarParaTurmasEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_aluno/turmas/index.html';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega a API de voz primeiro, se for usada nesta página (ex: para ler títulos de recursos)
  try {
    await loadResponsiveVoiceAPI();
  } catch (error) {
    console.warn("Não foi possível carregar a API de voz:", error);
  }
  initConteudoTurma();
});
