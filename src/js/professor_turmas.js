/**
 * @file professor_turmas.js
 * @description Lógica para a página "Minhas Turmas" do dashboard do professor.
 * Lista as turmas criadas pelo professor, permitindo criar novas, ver detalhes e excluir.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_TURMAS = "http://localhost:3000/turmas";
let professorLogado = null;

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-tl');
const errorMessageEl = document.getElementById('error-message-tl');
const noTurmasMessageEl = document.getElementById('no-turmas-message-tl');
const tabelaMinhasTurmasEl = document.getElementById('tabelaMinhasTurmas');
const tbodyTurmasEl = tabelaMinhasTurmasEl ? tabelaMinhasTurmasEl.querySelector('tbody') : null;
const btnCriarNovaTurmaEl = document.getElementById('btnCriarNovaTurma');

// --- FUNÇÕES DE UI ---
function mostrarMensagemTL(tipo, mensagem) {
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
  if (noTurmasMessageEl) noTurmasMessageEl.classList.add('hidden');
  if (tabelaMinhasTurmasEl) tabelaMinhasTurmasEl.classList.add('hidden');

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
      if (noTurmasMessageEl) {
        noTurmasMessageEl.textContent = mensagem || "Nenhuma turma encontrada.";
        noTurmasMessageEl.classList.remove('hidden');
      }
      break;
    case 'table':
      if (tabelaMinhasTurmasEl) tabelaMinhasTurmasEl.classList.remove('hidden');
      break;
  }
}

// --- LÓGICA PRINCIPAL ---

/**
 * Formata a data para exibição (dd/mm/aaaa).
 * @param {string} isoDateString - Data no formato ISO.
 * @returns {string} Data formatada ou 'N/D'.
 */
function formatarData(isoDateString) {
  if (!isoDateString) return 'N/D';
  try {
    const data = new Date(isoDateString);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // Mês é base 0
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.warn("Erro ao formatar data:", isoDateString, e);
    return 'Data inválida';
  }
}

/**
 * Renderiza as turmas na tabela.
 * @param {Array<object>} turmas - Array de objetos de turma.
 */
function renderizarTurmasNaTabela(turmas) {
  if (!tbodyTurmasEl) {
    console.error("Elemento tbody da tabela de turmas não encontrado.");
    mostrarMensagemTL('error', "Erro ao tentar exibir os dados das turmas.");
    return;
  }
  tbodyTurmasEl.innerHTML = '';

  if (!turmas || turmas.length === 0) {
    mostrarMensagemTL('no-items', "Você ainda não criou nenhuma turma.");
    return;
  }

  turmas.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

  turmas.forEach(turma => {
    const tr = document.createElement('tr');
    tr.dataset.id = turma.id;

    const numAlunos = turma.alunoIds ? turma.alunoIds.length : 0;
    const numRecursos = turma.recursosIds ? turma.recursosIds.length : 0;

    // Adiciona os atributos data-label para a responsividade do CSS
    tr.innerHTML = `
            <td data-label="Nome da Turma">${turma.nome || 'Sem Título'}</td>
            <td data-label="Descrição">${turma.descricao || 'Sem descrição'}</td>
            <td data-label="Nº de Alunos">${numAlunos}</td>
            <td data-label="Nº de Recursos">${numRecursos}</td>
            <td data-label="Data de Criação">${formatarData(turma.dataCriacao)}</td>
            <td data-label="Ações" class="opcoes-btn">
                <button class="btn-tabela btn-detalhes" data-id="${turma.id}" title="Detalhes/Gerenciar Turma">Detalhes</button>
                <button class="btn-tabela btn-excluir" data-id="${turma.id}" title="Excluir Turma">Excluir</button>
            </td>
        `;
    tbodyTurmasEl.appendChild(tr);
  });

  adicionarListenersAcoesTurma();
  mostrarMensagemTL('table');
}

/**
 * Busca as turmas criadas pelo professor logado.
 * @async
 */
async function carregarMinhasTurmas() {
  if (!professorLogado?.id) {
    mostrarMensagemTL('error', "Professor não identificado. Faça login novamente.");
    return;
  }
  mostrarMensagemTL('loading', "Buscando suas turmas...");

  try {
    const response = await fetch(`${API_URL_TURMAS}?professorId=${professorLogado.id}`);
    if (!response.ok) {
      throw new Error(`Falha ao buscar turmas (status: ${response.status})`);
    }
    const turmas = await response.json();
    renderizarTurmasNaTabela(turmas);
  } catch (error) {
    console.error("Erro ao carregar turmas do professor:", error);
    mostrarMensagemTL('error', `Não foi possível carregar suas turmas: ${error.message}`);
  }
}

/**
 * Lida com a exclusão de uma turma.
 * @async
 * @param {string} turmaId - ID da turma a ser excluída.
 */
async function handleExcluirTurma(turmaId) {
  const confirmacao = await Swal.fire({
    title: 'Tem certeza?',
    text: `Você realmente deseja excluir esta turma? Todos os vínculos com alunos e recursos serão perdidos. Esta ação não pode ser desfeita.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, excluir turma!',
    cancelButtonText: 'Cancelar'
  });

  if (confirmacao.isConfirmed) {
    mostrarMensagemTL('loading', `Excluindo turma...`);
    try {
      const response = await fetch(`${API_URL_TURMAS}/${turmaId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Falha ao excluir turma. Status: ${response.status}`);
      }
      await Swal.fire('Excluída!', 'A turma foi excluída com sucesso.', 'success');
      carregarMinhasTurmas();
    } catch (error) {
      console.error(`Erro ao excluir turma:`, error);
      Swal.fire('Erro!', `Não foi possível excluir a turma: ${error.message}`, 'error');
      carregarMinhasTurmas();
    }
  }
}

/**
 * Lida com o clique no botão "Detalhes/Gerenciar" de uma turma.
 * @param {string} turmaId - ID da turma.
 */
function handleVerDetalhesTurma(turmaId) {
  // Redireciona para a página de edição/gerenciamento da turma.
  window.location.href = `/src/dashboard_professor/turmas/editar_turma.html?id=${turmaId}`;
}

/**
 * Adiciona event listeners aos botões de ação na tabela (detalhes e excluir).
 * Esta função é chamada após a tabela ser renderizada/atualizada.
 */
function adicionarListenersAcoesTurma() {
  if (!tbodyTurmasEl) return;

  const botoesDetalhes = tbodyTurmasEl.querySelectorAll('.btn-detalhes');
  botoesDetalhes.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleVerDetalhesTurma(id);
    });
  });

  const botoesExcluir = tbodyTurmasEl.querySelectorAll('.btn-excluir');
  botoesExcluir.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleExcluirTurma(id);
    });
  });
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!professorLogado || professorLogado.tipo !== 'professor') {
    mostrarMensagemTL('error', 'Acesso negado. Faça login como professor.');
    if (btnCriarNovaTurmaEl) btnCriarNovaTurmaEl.classList.add('hidden');
    return;
  }

  if (!tbodyTurmasEl || !btnCriarNovaTurmaEl) {
    console.error("ERRO CRÍTICO: Elementos da UI da página 'Minhas Turmas' não foram encontrados.");
    mostrarMensagemTL('error', "Erro ao carregar a estrutura da página. Tente recarregar.");
    return;
  }

  btnCriarNovaTurmaEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_professor/turmas/criar_turma.html';
  });

  carregarMinhasTurmas();
});
