/**
 * @file professor_licoes.js
 * @description Lógica para a página "Minhas Lições" do dashboard do professor.
 * Lista as lições e conteúdos criados pelo professor, permitindo edição e exclusão.
 */


// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_LICOES_PROFESSOR = "http://localhost:3000/licoes_professor";
const API_URL_CONTEUDOS_PROFESSOR = "http://localhost:3000/conteudos_professor";
let professorLogado = null;

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-ml');
const errorMessageEl = document.getElementById('error-message-ml');
const noItemsMessageEl = document.getElementById('no-items-message-ml');
const tabelaMinhasCriacoesEl = document.getElementById('tabelaMinhasCriacoes');
const tbodyCriacoesEl = tabelaMinhasCriacoesEl ? tabelaMinhasCriacoesEl.querySelector('tbody') : null;

const btnNovaLicaoEl = document.getElementById('btnNovaLicao');
const btnNovoConteudoEl = document.getElementById('btnNovoConteudo');

// --- FUNÇÕES DE UI ---
function mostrarMensagem(tipo, mensagem) {
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
  if (noItemsMessageEl) noItemsMessageEl.classList.add('hidden');
  if (tabelaMinhasCriacoesEl) tabelaMinhasCriacoesEl.classList.add('hidden');

  switch (tipo) {
    case 'loading':
      if (loadingMessageEl) {
        loadingMessageEl.textContent = mensagem || "Carregando...";
        loadingMessageEl.classList.remove('hidden');
      }
      break;
    case 'error':
      if (errorMessageEl) {
        errorMessageEl.textContent = mensagem || "Ocorreu um erro.";
        errorMessageEl.classList.remove('hidden');
      }
      break;
    case 'no-items':
      if (noItemsMessageEl) {
        noItemsMessageEl.textContent = mensagem || "Nenhum item encontrado.";
        noItemsMessageEl.classList.remove('hidden');
      }
      break;
    case 'table':
      if (tabelaMinhasCriacoesEl) tabelaMinhasCriacoesEl.classList.remove('hidden');
      break;
  }
}

// --- LÓGICA PRINCIPAL ---

/**
 * Formata a data para exibição (dd/mm/aaaa).
 * @param {string} isoDateString - Data no formato ISO (ex: "2025-06-01T10:00:00Z").
 * @returns {string} Data formatada ou string vazia se a data for inválida.
 */
function formatarData(isoDateString) {
  if (!isoDateString) return '';
  const data = new Date(isoDateString);
  if (isNaN(data.getTime())) {
    return 'Data inválida';
  }
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês é base 0
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Renderiza os itens (lições e conteúdos) na tabela.
 * @param {Array<object>} itens - Array combinado de lições e conteúdos.
 */
function renderizarItensNaTabela(itens) {
  if (!tbodyCriacoesEl) return;
  tbodyCriacoesEl.innerHTML = ''; // Limpa a tabela

  if (itens.length === 0) {
    mostrarMensagem('no-items', "Você ainda não criou nenhuma lição ou conteúdo.");
    return;
  }

  // Ordena por data de criação, mais recentes primeiro
  itens.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

  itens.forEach(item => {
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    tr.dataset.tipo = item.tipoItem; // 'licao' ou 'conteudo'

    const tipoDisplay = item.tipoItem === 'licao' ?
      '<span class="ml-tipo-item licao">Lição</span>' :
      '<span class="ml-tipo-item conteudo">Conteúdo</span>';

    tr.innerHTML = `
            <td data-label="Título">${item.titulo || 'N/A'}</td>
            <td data-label="Tipo">${tipoDisplay}</td>
            <td data-label="Nível">${item.nivel || 'N/A'}</td>
            <td data-label="Data de Criação">${formatarData(item.dataCriacao) || 'N/A'}</td>
            <td data-label="Opções" class="opcoes-btn">
                <button class="btn-tabela btn-detalhes" data-id="${item.id}" data-tipo="${item.tipoItem}">Detalhes</button>
                <button class="btn-tabela btn-excluir" data-id="${item.id}" data-tipo="${item.tipoItem}">Excluir</button>
            </td>
        `;
    tbodyCriacoesEl.appendChild(tr);
  });

  // Adiciona event listeners para os novos botões de excluir e editar
  adicionarListenersAcoes();
  mostrarMensagem('table');
}


/**
 * Busca lições e conteúdos criados pelo professor logado.
 * @async
 */
async function carregarMinhasCriacoes() {
  if (!professorLogado?.id) {
    mostrarMensagem('error', "Professor não identificado.");
    return;
  }
  mostrarMensagem('loading', "Buscando suas criações...");

  try {
    // Busca lições do professor
    const responseLicoes = await fetch(`${API_URL_LICOES_PROFESSOR}?professorId=${professorLogado.id}`);
    if (!responseLicoes.ok) throw new Error('Falha ao buscar lições do professor.');
    const licoes = await responseLicoes.json();
    licoes.forEach(l => l.tipoItem = 'licao'); // Adiciona um identificador de tipo

    // Busca conteúdos do professor
    const responseConteudos = await fetch(`${API_URL_CONTEUDOS_PROFESSOR}?professorId=${professorLogado.id}`);
    if (!responseConteudos.ok) throw new Error('Falha ao buscar conteúdos do professor.');
    const conteudos = await responseConteudos.json();
    conteudos.forEach(c => c.tipoItem = 'conteudo'); // Adiciona um identificador de tipo

    const todosOsItens = [...licoes, ...conteudos];
    renderizarItensNaTabela(todosOsItens);

  } catch (error) {
    console.error("Erro ao carregar criações do professor:", error);
    mostrarMensagem('error', `Não foi possível carregar suas criações: ${error.message}`);
  }
}

/**
 * Lida com a exclusão de um item (lição ou conteúdo).
 * @async
 * @param {string} itemId - ID do item a ser excluído.
 * @param {string} tipoItem - 'licao' ou 'conteudo'.
 */
async function handleExcluirItem(itemId, tipoItem) {
  const confirmacao = await Swal.fire({
    title: 'Tem certeza?',
    text: `Você realmente deseja excluir este ${tipoItem === 'licao' ? 'lição' : 'conteúdo'}? Esta ação não pode ser desfeita.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  });

  if (confirmacao.isConfirmed) {
    const url = tipoItem === 'licao' ? `${API_URL_LICOES_PROFESSOR}/${itemId}` : `${API_URL_CONTEUDOS_PROFESSOR}/${itemId}`;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Falha ao excluir ${tipoItem}. Status: ${response.status}`);
      }
      await Swal.fire('Excluído!', `O ${tipoItem === 'licao' ? 'lição' : 'conteúdo'} foi excluído com sucesso.`, 'success');
      carregarMinhasCriacoes(); // Recarrega a lista
    } catch (error) {
      console.error(`Erro ao excluir ${tipoItem}:`, error);
      Swal.fire('Erro!', `Não foi possível excluir: ${error.message}`, 'error');
    }
  }
}

/**
 * Lida com a edição de um item (placeholder por enquanto).
 * @param {string} itemId - ID do item a ser editado.
 * @param {string} tipoItem - 'licao' ou 'conteudo'.
 */
function handleEditarItem(itemId, tipoItem) {
  if (tipoItem === 'licao') {
    window.location.href = `/src/dashboard_professor/licoes/licao_editar.html?id=${itemId}`;
  } else if (tipoItem === 'conteudo') {
    window.location.href = `/src/dashboard_professor/licoes/conteudo_editar.html?id=${itemId}`;
  } else {
    Swal.fire('Erro', 'Tipo de item desconhecido para edição.', 'error');
  }
}



/**
 * Adiciona event listeners aos botões de ação na tabela.
 */
function adicionarListenersAcoes() {
  if (!tbodyCriacoesEl) return;

  tbodyCriacoesEl.querySelectorAll('.btn-detalhes').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const tipo = e.target.dataset.tipo;
      handleEditarItem(id, tipo);
    });
  });

  tbodyCriacoesEl.querySelectorAll('.btn-excluir').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const tipo = e.target.dataset.tipo;
      handleExcluirItem(id, tipo);
    });
  });
}


// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!professorLogado || professorLogado.tipo !== 'professor') {
    // A proteção de rota principal já está no components_professor.js
    mostrarMensagem('error', 'Acesso negado. Faça login como professor.');
    return;
  }

  // Verifica se os elementos essenciais da página existem
  if (!tbodyCriacoesEl || !btnNovaLicaoEl || !btnNovoConteudoEl) {
    console.error("ERRO CRÍTICO: Elementos da UI da página 'Minhas Lições' não foram encontrados.");
    mostrarMensagem('error', "Erro ao carregar a estrutura da página.");
    return;
  }

  // Configura os botões de "Adicionar"
  btnNovaLicaoEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_professor/licoes/licao_criar.html';
  });

  btnNovoConteudoEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_professor/licoes/conteudo_criar.html';
  });

  carregarMinhasCriacoes();
});
