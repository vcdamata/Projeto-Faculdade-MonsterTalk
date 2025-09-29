/**
 * @file aluno_turma_listagem.js
 * @description Lógica para a página "Minhas Turmas" do dashboard do aluno.
 * Lista as turmas em que o aluno está inscrito.
 */

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-at');
const errorMessageEl = document.getElementById('error-message-at');
const noTurmasMessageEl = document.getElementById('no-turmas-message-at');
const listaTurmasContainerEl = document.getElementById('lista-turmas-aluno');

let alunoLogado = null;

// --- FUNÇÕES DE UI ---
function mostrarMensagemAT(tipo, mensagem) {
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
  if (noTurmasMessageEl) noTurmasMessageEl.classList.add('hidden');
  if (listaTurmasContainerEl) listaTurmasContainerEl.classList.add('hidden'); // Esconde a lista ao mostrar mensagem

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
    case 'list': // Para mostrar a lista/grid de cards
      if (listaTurmasContainerEl) listaTurmasContainerEl.classList.remove('hidden');
      break;
  }
}

// --- LÓGICA PRINCIPAL ---

/**
 * Cria e retorna um elemento de card para uma turma.
 * @param {object} turma - O objeto da turma.
 * @returns {HTMLElement} O elemento do card da turma.
 */
function criarCardTurma(turma) {
  const card = document.createElement('a'); // O card inteiro será um link
  card.classList.add('at-card-turma');
  card.href = `/src/dashboard_aluno/turmas/turma_conteudo.html?turmaId=${turma.id}`;

  const nomeEl = document.createElement('h3');
  nomeEl.classList.add('at-card-turma-nome');
  nomeEl.textContent = turma.nome || "Turma Sem Nome";

  const descricaoEl = document.createElement('p');
  descricaoEl.classList.add('at-card-turma-descricao');
  descricaoEl.textContent = turma.descricao || "Sem descrição disponível.";

  const infoEl = document.createElement('div');
  infoEl.classList.add('at-card-turma-info');
  const numAlunos = turma.alunoIds ? turma.alunoIds.length : 0;
  const numRecursos = turma.recursosIds ? turma.recursosIds.length : 0;

  // Inicialmente mostra placeholders
  infoEl.innerHTML = `<span>Professor: <strong>Carregando...</strong></span> <span><strong>${numAlunos}</strong> Aluno(s)</span> <span><strong>${numRecursos}</strong> Recurso(s)</span>`;

  // Busca o nome do professor e atualiza o elemento
  fetch(`http://localhost:3000/usuarios/${turma.professorId}`)
    .then(response => response.json())
    .then(professor => {
      const nomeProfessor = professor.nome || "Desconhecido";
      infoEl.innerHTML = `<span>Professor(a): <strong> ${nomeProfessor}</strong></span> 
      <span>Aluno(s): <strong> ${numAlunos}</strong></span> 
      <span>Recurso(s): <strong> ${numRecursos}</strong></span>`;
    })
    .catch(() => {
      infoEl.innerHTML = `<span>Professor(a): <strong>  Erro ao carregar</strong></span> 
      <span>Aluno(s): <strong> ${numAlunos}</strong></span> 
      <span>Recurso(s): <strong> ${numRecursos}</strong></span>`;
    });

  const btnVerConteudo = document.createElement('button'); // Ou manter o <a> e estilizar
  btnVerConteudo.classList.add('at-btn-ver-conteudo');
  btnVerConteudo.textContent = "Acessar Conteúdo da Turma";

  card.appendChild(nomeEl);
  card.appendChild(descricaoEl);
  card.appendChild(infoEl);

  return card;
}

/**
 * Busca todas as turmas e filtra aquelas em que o aluno está inscrito.
 * @async
 */
async function carregarTurmasDoAluno() {
  if (!alunoLogado?.id) {
    mostrarMensagemAT('error', "Aluno não identificado. Faça login novamente.");
    return;
  }
  mostrarMensagemAT('loading', "Buscando suas turmas...");

  try {
    const response = await fetch('http://localhost:3000/turmas');
    if (!response.ok) {
      throw new Error(`Falha ao buscar turmas (status: ${response.status})`);
    }
    const todasAsTurmas = await response.json();

    const minhasTurmas = todasAsTurmas.filter(turma =>
      Array.isArray(turma.alunoIds) && turma.alunoIds.includes(alunoLogado.id)
    );

    if (!listaTurmasContainerEl) {
      console.error("Elemento container da lista de turmas não encontrado.");
      mostrarMensagemAT('error', "Erro ao exibir as turmas.");
      return;
    }
    listaTurmasContainerEl.innerHTML = ''; // Limpa antes de adicionar

    if (minhasTurmas.length === 0) {
      mostrarMensagemAT('no-items', "Você ainda não está inscrito em nenhuma turma.");
    } else {
      minhasTurmas.forEach(turma => {
        const cardTurma = criarCardTurma(turma);
        listaTurmasContainerEl.appendChild(cardTurma);
      });
      mostrarMensagemAT('list'); // Mostra o container da lista
    }

  } catch (error) {
    console.error("Erro ao carregar turmas do aluno:", error);
    mostrarMensagemAT('error', `Não foi possível carregar suas turmas: ${error.message}`);
  }
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  alunoLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Proteção de rota básica e verificação de tipo de usuário
  if (!alunoLogado || alunoLogado.tipo !== 'aluno') {
    // O components_alunos.js já deve ter redirecionado, mas como fallback:
    mostrarMensagemAT('error', 'Acesso negado. Faça login como aluno.');
    // Opcional: redirecionar para login
    // setTimeout(() => { window.location.href = "/src/login/index.html"; }, 2000);
    return;
  }

  // Verifica se os elementos essenciais da página existem
  if (!listaTurmasContainerEl || !loadingMessageEl || !errorMessageEl || !noTurmasMessageEl) {
    console.error("ERRO CRÍTICO: Elementos da UI da página 'Minhas Turmas (Aluno)' não foram encontrados.");
    // Pode mostrar um alerta geral se o errorMessageEl não estiver disponível
    alert("Erro crítico ao carregar a estrutura da página. Tente recarregar.");
    return;
  }

  carregarTurmasDoAluno();
});
