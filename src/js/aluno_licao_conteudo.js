/**
 * @file aluno_licao_conteudo.js
 * @description Controla a visualização de um conteúdo e permite ao aluno marcar como visto.
 */

// --- URL Base da API (JSON-Server) ---
const API_BASE_URL = 'http://localhost:3000';

// --- ELEMENTOS DO DOM ---
const tituloConteudoEl = document.getElementById('conteudo-titulo');
const corpoConteudoEl = document.getElementById('conteudo-corpo');
const mensagemStatusEl = document.getElementById('conteudo-status-mensagem');
const marcarVistoWrapperEl = document.getElementById('marcar-visto-wrapper'); // Container do checkbox
const marcarComoVistoCheckboxEl = document.getElementById('marcar-como-visto-checkbox');

/**
 * Exibe uma mensagem de status para o utilizador.
 * @param {string} mensagem - A mensagem a ser exibida.
 * @param {boolean} [isError=false] - Se a mensagem é de erro.
 */
function exibirMensagemStatus(mensagem, isError = false) {
  if (mensagemStatusEl) {
    mensagemStatusEl.textContent = mensagem;
    mensagemStatusEl.className = 'status-mensagem'; // Reset
    if (isError) {
      mensagemStatusEl.classList.add('erro');
    } else {
      mensagemStatusEl.classList.add('sucesso');
    }
    mensagemStatusEl.classList.remove('hidden');
  } else {
    console.log(`Status: ${mensagem}`);
  }
}

/**
 * Resolve o endpoint da API e o tipo normalizado para registro.
 * @param {string} conteudoId
 * @param {string} tipoConteudo
 * @returns {{endpoint: string, tipoParaRegistro: string}|null}
 */
function resolverEndpointETipo(conteudoId, tipoConteudo) {
  if (!conteudoId || !tipoConteudo) return null;
  let endpoint = '';
  let tipoParaRegistro = tipoConteudo;

  if (tipoConteudo === 'conteudoProfessor' || tipoConteudo === 'conteudo') {
    endpoint = `${API_BASE_URL}/conteudos_professor/${conteudoId}`;
    tipoParaRegistro = 'conteudoProfessor';
  } else if (tipoConteudo === 'licaoPlataforma') {
    endpoint = `${API_BASE_URL}/licoes/${conteudoId}`;
  } else if (tipoConteudo === 'licaoProfessor') {
    endpoint = `${API_BASE_URL}/licoes_professor/${conteudoId}`;
  } else {
    // Adicione mais tipos conforme necessário
    return null;
  }
  return { endpoint, tipoParaRegistro };
}

/**
 * Renderiza o conteúdo na página.
 * @param {object} conteudo
 * @param {string} tipoConteudo
 */
function renderizarConteudo(conteudo, tipoConteudo) {
  function setConteudoHtml(html) {
    const editorDiv = corpoConteudoEl.querySelector('.ql-editor');
    if (editorDiv) {
      editorDiv.innerHTML = html;
    } else {
      corpoConteudoEl.innerHTML = html;
    }
  }

  if (tituloConteudoEl && conteudo.titulo) {
    tituloConteudoEl.textContent = conteudo.titulo;
  }
  if (!corpoConteudoEl) return;

  if (conteudo.conteudoHtml) {
    setConteudoHtml(conteudo.conteudoHtml);
    return;
  }

  if (conteudo.descricao && (tipoConteudo === 'licaoPlataforma' || tipoConteudo === 'licaoProfessor')) {
    setConteudoHtml(`<p>${conteudo.descricao}</p>`);
    return;
  }

  setConteudoHtml('<p>Conteúdo não disponível para exibição ou formato não reconhecido.</p>');
}

/**
 * Lida com erro de carregamento de conteúdo.
 */
function lidarErroCarregamentoConteudo() {
  exibirMensagemStatus('Erro ao carregar o conteúdo. Tente novamente.', true);
  if (tituloConteudoEl) tituloConteudoEl.textContent = "Erro ao carregar";
  if (corpoConteudoEl) {
    const editorDiv = corpoConteudoEl.querySelector('.ql-editor');
    const msg = "<p>Não foi possível carregar o conteúdo solicitado.</p>";
    if (editorDiv) {
      editorDiv.innerHTML = msg;
    } else {
      corpoConteudoEl.innerHTML = msg;
    }
  }
}

/**
 * Carrega e exibe os detalhes de um conteúdo específico.
 * @param {string} conteudoId - O ID do conteúdo a ser carregado.
 * @param {string} tipoConteudo - O tipo do conteúdo (ex: 'conteudos_professor', 'materiais_plataforma').
 * @returns {Promise<object|null>} O objeto do conteúdo carregado com tipoParaRegistro, ou null em caso de erro.
 */
async function carregarConteudo(conteudoId, tipoConteudo) {
  if (!conteudoId || !tipoConteudo) {
    exibirMensagemStatus('ID ou tipo do conteúdo não fornecido.', true);
    return null;
  }

  const resolved = resolverEndpointETipo(conteudoId, tipoConteudo);
  if (!resolved) {
    exibirMensagemStatus(`Tipo de conteúdo '${tipoConteudo}' não suportado.`, true);
    return null;
  }

  try {
    const response = await fetch(resolved.endpoint);
    if (!response.ok) {
      throw new Error(`Falha ao carregar conteúdo: ${response.status} ${response.statusText}`);
    }
    const conteudo = await response.json();
    renderizarConteudo(conteudo, tipoConteudo);
    return { ...conteudo, tipoParaRegistro: resolved.tipoParaRegistro };
  } catch (error) {
    console.error("Erro ao carregar conteúdo:", error);
    lidarErroCarregamentoConteudo();
    return null;
  }
}

/**
 * Marca um conteúdo como visualizado pelo aluno.
 * @param {string} usuarioId - O ID do aluno.
 * @param {string} conteudoId - O ID do conteúdo visualizado.
 * @param {string} tipoConteudoParaRegistro - O tipo normalizado do conteúdo para registo.
 * @returns {Promise<boolean>} Verdadeiro se a operação foi bem-sucedida ou se já estava visto, falso caso contrário.
 */
async function marcarConteudoComoVisto(usuarioId, conteudoId, tipoConteudoParaRegistro) {
  if (!usuarioId || !conteudoId || !tipoConteudoParaRegistro) {
    console.error('Dados insuficientes para marcar conteúdo como visto.');
    exibirMensagemStatus('Não foi possível marcar como visto. Dados incompletos.', true);
    return false;
  }

  try {
    // 1. Buscar dados atuais do utilizador
    const userResponse = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
    if (!userResponse.ok) {
      throw new Error(`Falha ao buscar utilizador: ${userResponse.status}`);
    }
    const usuario = await userResponse.json();

    // 2. Atualizar o progresso
    if (!usuario.progresso) {
      usuario.progresso = {};
    }
    if (!usuario.progresso.conteudosVisualizados) {
      usuario.progresso.conteudosVisualizados = [];
    }

    // Verifica se o conteúdo já foi marcado como visto para evitar duplicatas
    const jaVisto = usuario.progresso.conteudosVisualizados.find(
      item => item.id === conteudoId && item.tipo === tipoConteudoParaRegistro
    );

    if (!jaVisto) {
      usuario.progresso.conteudosVisualizados.push({
        id: conteudoId,
        tipo: tipoConteudoParaRegistro,
        dataVisualizacao: new Date().toISOString()
      });

      // 3. Enviar dados atualizados (PUT)
      const updateResponse = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      if (!updateResponse.ok) {
        throw new Error(`Falha ao atualizar progresso do utilizador: ${updateResponse.status}`);
      }
      console.log(`Conteúdo ${conteudoId} (${tipoConteudoParaRegistro}) marcado como visto para o utilizador ${usuarioId}.`);
      exibirMensagemStatus('Conteúdo marcado como visto!', false);

      // Atualizar o localStorage se o utilizador logado for o mesmo
      const usuarioLogadoStorage = JSON.parse(localStorage.getItem('usuarioLogado'));
      if (usuarioLogadoStorage && usuarioLogadoStorage.id === usuarioId) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      }
      return true; // Indica sucesso
    } else {
      console.log(`Conteúdo ${conteudoId} (${tipoConteudoParaRegistro}) já estava marcado como visto.`);
      // Não exibe mensagem aqui, pois configurarCheckboxVisto já informa o utilizador.
      return true; // Indica que já estava ok
    }

  } catch (error) {
    console.error('Erro ao marcar conteúdo como visto:', error);
    exibirMensagemStatus('Erro ao registar visualização. Tente novamente.', true);
    return false; // Indica falha
  }
}

/**
 * Verifica o estado de visualização do conteúdo e configura o checkbox.
 * @param {string} usuarioId - O ID do aluno.
 * @param {string} conteudoId - O ID do conteúdo.
 * @param {string} tipoConteudoParaRegistro - O tipo normalizado do conteúdo.
 */
async function configurarCheckboxVisto(usuarioId, conteudoId, tipoConteudoParaRegistro) {
  if (!marcarComoVistoCheckboxEl || !marcarVistoWrapperEl) return;

  try {
    const userResponse = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
    if (!userResponse.ok) {
      console.warn("Não foi possível buscar dados do utilizador para verificar status do checkbox.");
      marcarVistoWrapperEl.classList.remove('hidden'); // Mostra o checkbox para interação manual
      marcarComoVistoCheckboxEl.checked = false;
      marcarComoVistoCheckboxEl.disabled = false;
      return;
    }
    const usuario = await userResponse.json();

    const jaVisto = usuario.progresso?.conteudosVisualizados?.find(
      item => item.id === conteudoId && item.tipo === tipoConteudoParaRegistro
    );

    if (jaVisto) {
      marcarComoVistoCheckboxEl.checked = true;
      marcarComoVistoCheckboxEl.disabled = true; // Desabilita se já foi visto
      exibirMensagemStatus('Você já marcou este conteúdo como visto.', false);
    } else {
      marcarComoVistoCheckboxEl.checked = false;
      marcarComoVistoCheckboxEl.disabled = false; // Habilita se ainda não foi visto
    }
    marcarVistoWrapperEl.classList.remove('hidden'); // Mostra o checkbox

  } catch (error) {
    console.error("Erro ao configurar checkbox de 'visto':", error);
    // Em caso de erro, permite que o utilizador tente marcar manualmente
    marcarVistoWrapperEl.classList.remove('hidden');
    marcarComoVistoCheckboxEl.checked = false;
    marcarComoVistoCheckboxEl.disabled = false;
  }
}


/**
 * Exibe mensagem e esconde o checkbox se o usuário não estiver logado.
 */
function lidarUsuarioNaoLogado() {
  exibirMensagemStatus('Você precisa estar logado para ver este conteúdo.', true);
  if (marcarVistoWrapperEl) marcarVistoWrapperEl.classList.add('hidden');
}

/**
 * Exibe mensagem e atualiza UI se informações do conteúdo não estiverem na URL.
 */
function lidarConteudoInvalido() {
  exibirMensagemStatus('Informações do conteúdo não encontradas na URL.', true);
  if (tituloConteudoEl) tituloConteudoEl.textContent = "Conteúdo Inválido";
  if (corpoConteudoEl) {
    const editorDiv = corpoConteudoEl.querySelector('.ql-editor');
    const msg = "<p>Não foi possível identificar o conteúdo a ser exibido.</p>";
    if (editorDiv) editorDiv.innerHTML = msg;
    else corpoConteudoEl.innerHTML = msg;
  }
  if (marcarVistoWrapperEl) marcarVistoWrapperEl.classList.add('hidden');
}

/**
 * Adiciona o listener ao checkbox de marcar como visto.
 */
function adicionarListenerCheckbox(usuarioLogado, conteudoId, tipoParaRegistro) {
  if (marcarComoVistoCheckboxEl && !marcarComoVistoCheckboxEl.disabled) {
    marcarComoVistoCheckboxEl.addEventListener('change', async () => {
      if (marcarComoVistoCheckboxEl.checked) {
        exibirMensagemStatus('A registar visualização...', false);
        const sucesso = await marcarConteudoComoVisto(usuarioLogado.id, conteudoId, tipoParaRegistro);
        if (sucesso) {
          marcarComoVistoCheckboxEl.disabled = true;
        } else {
          marcarComoVistoCheckboxEl.checked = false;
        }
      }
    });
  }
}

/**
 * Lida com o caso de usuário não ser aluno.
 */
function lidarUsuarioNaoAluno() {
  console.log("Utilizador não é aluno, funcionalidade de 'marcar como visto' não aplicável.");
  if (marcarVistoWrapperEl) marcarVistoWrapperEl.classList.add('hidden');
}

/**
 * Esconde o checkbox em caso de falha no carregamento.
 */
function esconderCheckbox() {
  if (marcarVistoWrapperEl) marcarVistoWrapperEl.classList.add('hidden');
}

/**
 * Função de inicialização da página de visualização de conteúdo.
 */
async function initConteudoViewer() {
  const urlParams = new URLSearchParams(window.location.search);
  const conteudoId = urlParams.get('id');
  const tipoConteudoParam = urlParams.get('tipo');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado) {
    lidarUsuarioNaoLogado();
    return;
  }

  if (!conteudoId || !tipoConteudoParam) {
    lidarConteudoInvalido();
    return;
  }

  if (mensagemStatusEl) mensagemStatusEl.classList.add('hidden');

  const resultadoCarregamento = await carregarConteudo(conteudoId, tipoConteudoParam);

  if (!resultadoCarregamento) {
    esconderCheckbox();
    return;
  }

  if (usuarioLogado.tipo === 'aluno') {
    await configurarCheckboxVisto(usuarioLogado.id, conteudoId, resultadoCarregamento.tipoParaRegistro);
    adicionarListenerCheckbox(usuarioLogado, conteudoId, resultadoCarregamento.tipoParaRegistro);
  } else {
    lidarUsuarioNaoAluno();
  }
}

// --- INICIALIZAÇÃO ---
// Adiciona o listener quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initConteudoViewer);
