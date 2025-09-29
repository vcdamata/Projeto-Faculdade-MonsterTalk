/**
 * @file professor_turmas_editar.js
 * @description Lógica para a página de edição e gerenciamento de turmas pelo professor.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_TURMAS = "http://localhost:3000/turmas";
const API_URL_USUARIOS = "http://localhost:3000/usuarios";
const API_URL_LICOES_PLATAFORMA = "http://localhost:3000/licoes"; // Filtrar por criadorId=null
const API_URL_LICOES_PROFESSOR = "http://localhost:3000/licoes_professor";
const API_URL_CONTEUDOS_PROFESSOR = "http://localhost:3000/conteudos_professor";

let professorLogado = null;
let turmaAtual = null; // Armazena os dados da turma sendo editada
let todosAlunosDaPlataforma = []; // Para popular o select de adicionar aluno
let todosRecursosDisponiveis = []; // Para popular o select de adicionar recurso

// --- ELEMENTOS DO DOM ---
const loadingMessageEl = document.getElementById('loading-message-et');
const errorMessageEl = document.getElementById('error-message-et');
const formEditarTurmaEl = document.getElementById('formEditarTurma');
const tituloPaginaEl = document.getElementById('tituloPaginaEditarTurma');

const turmaIdInputEl = document.getElementById('turmaId');
const turmaNomeEditarEl = document.getElementById('turmaNomeEditar');
const turmaDescricaoEditarEl = document.getElementById('turmaDescricaoEditar');

const listaAlunosTurmaEl = document.getElementById('listaAlunosTurma');
const selectAdicionarAlunoEl = document.getElementById('selectAdicionarAluno');
const btnAdicionarAlunoEl = document.getElementById('btnAdicionarAluno');
const contadorAlunosEl = document.getElementById('contadorAlunos');

const listaRecursosTurmaEl = document.getElementById('listaRecursosTurma');
const selectAdicionarRecursoEl = document.getElementById('selectAdicionarRecurso');
const btnAdicionarRecursoEl = document.getElementById('btnAdicionarRecurso');
const contadorRecursosEl = document.getElementById('contadorRecursos');

const btnCancelarEdicaoTurmaEl = document.getElementById('btnCancelarEdicaoTurma');

// --- FUNÇÕES DE UI ---
function mostrarLoadingET(mostrar, mensagem = "Carregando...") {
  if (loadingMessageEl) { loadingMessageEl.textContent = mensagem; loadingMessageEl.classList.toggle('hidden', !mostrar); }
  if (formEditarTurmaEl) formEditarTurmaEl.classList.toggle('hidden', mostrar);
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
}
function mostrarErroET(mensagem) {
  if (errorMessageEl) { errorMessageEl.textContent = mensagem; errorMessageEl.classList.remove('hidden'); }
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (formEditarTurmaEl) formEditarTurmaEl.classList.add('hidden');
}

// --- LÓGICA DE CARREGAMENTO DE DADOS ---

/**
 * Busca todos os alunos da plataforma para popular o select.
 * @async
 */
async function carregarTodosAlunos() {
  try {
    const response = await fetch(`${API_URL_USUARIOS}?tipo=aluno`);
    if (!response.ok) throw new Error("Falha ao buscar lista de alunos.");
    todosAlunosDaPlataforma = await response.json();
    popularSelectAlunos();
  } catch (error) {
    console.error("Erro ao carregar todos os alunos:", error);
    // Tratar erro, talvez desabilitar a adição de alunos
  }
}

/**
 * Busca todos os recursos disponíveis (lições da plataforma, lições do professor, conteúdos do professor).
 * @async
 */
async function carregarTodosRecursos() {
  try {
    const [resLicoesP, resLicoesProf, resConteudosProf] = await Promise.all([
      fetch(`${API_URL_LICOES_PLATAFORMA}?criadorId=null`),
      fetch(`${API_URL_LICOES_PROFESSOR}?professorId=${professorLogado.id}`),
      fetch(`${API_URL_CONTEUDOS_PROFESSOR}?professorId=${professorLogado.id}`)
    ]);

    if (!resLicoesP.ok || !resLicoesProf.ok || !resConteudosProf.ok) {
      throw new Error("Falha ao buscar um ou mais tipos de recursos.");
    }

    const licoesPlataforma = await resLicoesP.json();
    const licoesProfessor = await resLicoesProf.json();
    const conteudosProfessor = await resConteudosProf.json();

    todosRecursosDisponiveis = [
      ...licoesPlataforma.map(l => ({ id: l.id, titulo: l.titulo, tipoOriginal: 'licaoPlataforma', tipoDisplay: 'Lição (Plataforma)' })),
      ...licoesProfessor.map(l => ({ id: l.id, titulo: l.titulo, tipoOriginal: 'licaoProfessor', tipoDisplay: 'Lição (Sua)' })),
      ...conteudosProfessor.map(c => ({ id: c.id, titulo: c.titulo, tipoOriginal: 'conteudoProfessor', tipoDisplay: 'Conteúdo (Seu)' }))
    ];
    popularSelectRecursos();
  } catch (error) {
    console.error("Erro ao carregar todos os recursos:", error);
  }
}

/**
 * Popula o select de adicionar alunos com os alunos que NÃO estão na turma atual.
 */
function popularSelectAlunos() {
  if (!selectAdicionarAlunoEl) return;
  selectAdicionarAlunoEl.innerHTML = '<option value="">Selecione um aluno para adicionar...</option>';
  const idsAlunosNaTurma = turmaAtual.alunoIds || [];

  todosAlunosDaPlataforma
    .filter(aluno => !idsAlunosNaTurma.includes(aluno.id)) // Filtra os que já estão na turma
    .forEach(aluno => {
      const option = document.createElement('option');
      option.value = aluno.id;
      option.textContent = `${aluno.nome} (${aluno.email})`;
      selectAdicionarAlunoEl.appendChild(option);
    });
}

/**
 * Popula o select de adicionar recursos com os que NÃO estão na turma atual.
 */
function popularSelectRecursos() {
  if (!selectAdicionarRecursoEl) return;
  selectAdicionarRecursoEl.innerHTML = '<option value="">Selecione um recurso para adicionar...</option>';
  const idsRecursosNaTurma = turmaAtual.recursosIds ? turmaAtual.recursosIds.map(r => r.idRecurso) : [];

  todosRecursosDisponiveis
    .filter(recurso => !idsRecursosNaTurma.includes(recurso.id))
    .forEach(recurso => {
      const option = document.createElement('option');
      // Armazena o ID e o tipo no value, separados por um delimitador
      option.value = `${recurso.id}::${recurso.tipoOriginal}`;
      option.textContent = `${recurso.titulo} [${recurso.tipoDisplay}]`;
      selectAdicionarRecursoEl.appendChild(option);
    });
}


/**
 * Renderiza a lista de alunos atualmente na turma.
 */
async function renderizarAlunosDaTurma() {
  if (!listaAlunosTurmaEl || !turmaAtual?.alunoIds) return;
  listaAlunosTurmaEl.innerHTML = ''; // Limpa
  if (contadorAlunosEl) contadorAlunosEl.textContent = turmaAtual.alunoIds.length;

  if (turmaAtual.alunoIds.length === 0) {
    listaAlunosTurmaEl.innerHTML = '<p>Nenhum aluno nesta turma ainda.</p>';
    return;
  }

  for (const alunoId of turmaAtual.alunoIds) {
    try {
      // Busca o nome do aluno para exibição (idealmente, teríamos uma forma de buscar múltiplos usuários)
      const res = await fetch(`${API_URL_USUARIOS}/${alunoId}`);
      if (res.ok) {
        const aluno = await res.json();
        const itemEl = document.createElement('div');
        itemEl.classList.add('et-item-lista');
        itemEl.innerHTML = `
                    <span>${aluno.nome} (${aluno.email})</span>
                    <button type="button" class="et-btn-remover-item" data-aluno-id="${alunoId}" title="Remover Aluno">&times;</button>
                `;
        itemEl.querySelector('.et-btn-remover-item').addEventListener('click', () => removerAlunoDaTurmaLocal(alunoId));
        listaAlunosTurmaEl.appendChild(itemEl);
      }
    } catch (e) { console.error(`Erro ao buscar aluno ${alunoId}:`, e); }
  }
  popularSelectAlunos(); // Atualiza o select de adição
}

/**
 * Renderiza a lista de recursos atualmente na turma.
 */
async function renderizarRecursosDaTurma() {
  if (!listaRecursosTurmaEl || !turmaAtual?.recursosIds) return;
  listaRecursosTurmaEl.innerHTML = '';
  if (contadorRecursosEl) contadorRecursosEl.textContent = turmaAtual.recursosIds.length;

  if (turmaAtual.recursosIds.length === 0) {
    listaRecursosTurmaEl.innerHTML = '<p>Nenhum recurso nesta turma ainda.</p>';
    return;
  }

  for (const recursoInfo of turmaAtual.recursosIds) {
    let urlBuscaRecurso;
    let tipoDisplay = '';

    switch (recursoInfo.tipoRecurso) {
      case 'licaoPlataforma':
        urlBuscaRecurso = `${API_URL_LICOES_PLATAFORMA}/${recursoInfo.idRecurso}`;
        tipoDisplay = 'Lição (Plataforma)';
        break;
      case 'licaoProfessor':
        urlBuscaRecurso = `${API_URL_LICOES_PROFESSOR}/${recursoInfo.idRecurso}`;
        tipoDisplay = 'Lição (Sua)';
        break;
      case 'conteudoProfessor':
        urlBuscaRecurso = `${API_URL_CONTEUDOS_PROFESSOR}/${recursoInfo.idRecurso}`;
        tipoDisplay = 'Conteúdo (Seu)';
        break;
      default:
        continue; // Pula tipo desconhecido
    }

    try {
      const res = await fetch(urlBuscaRecurso);
      if (res.ok) {
        const recurso = await res.json();
        const itemEl = document.createElement('div');
        itemEl.classList.add('et-item-lista');
        itemEl.innerHTML = `
                    <span>${recurso.titulo} <i>[${tipoDisplay}]</i></span>
                    <button type="button" class="et-btn-remover-item" data-recurso-id="${recursoInfo.idRecurso}" data-recurso-tipo="${recursoInfo.tipoRecurso}" title="Remover Recurso">&times;</button>
                `;
        itemEl.querySelector('.et-btn-remover-item').addEventListener('click', () => removerRecursoDaTurmaLocal(recursoInfo.idRecurso, recursoInfo.tipoRecurso));
        listaRecursosTurmaEl.appendChild(itemEl);
      }
    } catch (e) { console.error(`Erro ao buscar recurso ${recursoInfo.idRecurso} (${recursoInfo.tipoRecurso}):`, e); }
  }
  popularSelectRecursos(); // Atualiza o select de adição
}


/**
 * Carrega os dados da turma pelo ID da URL e popula o formulário.
 * @async
 */
async function carregarTurmaParaEdicao() {
  const urlParams = new URLSearchParams(window.location.search);
  const turmaId = urlParams.get('id');

  if (!turmaId) {
    mostrarErroET("ID da turma não fornecido na URL. Voltando para listagem...");
    setTimeout(() => window.location.href = '/src/dashboard_professor/turmas/index.html', 2000);
    return;
  }
  mostrarLoadingET(true, "Carregando dados da turma...");

  try {
    const response = await fetch(`${API_URL_TURMAS}/${turmaId}`);
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados da turma (ID: ${turmaId}). Status: ${response.status}`);
    }
    turmaAtual = await response.json();

    if (tituloPaginaEl) tituloPaginaEl.textContent = `Gerenciar Turma: ${turmaAtual.nome}`;
    if (turmaIdInputEl) turmaIdInputEl.value = turmaAtual.id;
    if (turmaNomeEditarEl) turmaNomeEditarEl.value = turmaAtual.nome;
    if (turmaDescricaoEditarEl) turmaDescricaoEditarEl.value = turmaAtual.descricao;

    await Promise.all([ // Carrega alunos e recursos em paralelo
      carregarTodosAlunos(),
      carregarTodosRecursos()
    ]);

    // Renderiza após carregar todos os alunos/recursos da plataforma
    await renderizarAlunosDaTurma();
    await renderizarRecursosDaTurma();

    mostrarLoadingET(false); // Esconde loading, mostra formulário

  } catch (error) {
    console.error("Erro ao carregar turma para edição:", error);
    mostrarErroET(`Não foi possível carregar a turma: ${error.message}`);
  }
}

// --- LÓGICA DE MANIPULAÇÃO DA TURMA ---

function adicionarAlunoNaTurmaLocal(alunoId) {
  if (!turmaAtual.alunoIds.includes(alunoId)) {
    turmaAtual.alunoIds.push(alunoId);
    renderizarAlunosDaTurma(); // Re-renderiza a lista e atualiza o select
  }
}
function removerAlunoDaTurmaLocal(alunoId) {
  console.log(`Antes de remover: ${turmaAtual.alunoIds}`);
  turmaAtual.alunoIds = turmaAtual.alunoIds.filter(id => id !== alunoId);
  console.log(`Depois de remover: ${turmaAtual.alunoIds}`);
  renderizarAlunosDaTurma();
}
function adicionarRecursoNaTurmaLocal(idRecurso, tipoRecurso) {
  if (!turmaAtual.recursosIds.find(r => r.idRecurso === idRecurso && r.tipoRecurso === tipoRecurso)) {
    turmaAtual.recursosIds.push({ idRecurso, tipoRecurso });
    renderizarRecursosDaTurma();
  }
}
function removerRecursoDaTurmaLocal(idRecurso, tipoRecurso) {
  turmaAtual.recursosIds = turmaAtual.recursosIds.filter(r => !(r.idRecurso === idRecurso && r.tipoRecurso === tipoRecurso));
  renderizarRecursosDaTurma();
}


// --- SALVAR ALTERAÇÕES ---
/**
 * Coleta os dados do formulário e envia uma requisição PUT para atualizar a turma.
 * @async
 * @param {Event} e - O evento de submit.
 */
async function handleSalvarEdicaoTurma(e) {
  e.preventDefault();

  const nomeAtualizado = turmaNomeEditarEl.value.trim();
  const descricaoAtualizada = turmaDescricaoEditarEl.value.trim();

  if (!nomeAtualizado) {
    Swal.fire('Atenção!', 'O nome da turma é obrigatório.', 'warning');
    return;
  }

  const turmaParaSalvar = {
    ...turmaAtual, // Mantém IDs de professor, alunos, recursos, dataCriação
    nome: nomeAtualizado,
    descricao: descricaoAtualizada,
    dataModificacao: new Date().toISOString() // Adiciona-atualiza data de modificação
  };

  try {
    const response = await fetch(`${API_URL_TURMAS}/${turmaAtual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turmaParaSalvar)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido." }));
      throw new Error(errorData.message || `Erro ${response.status} ao salvar alterações.`);
    }
    await Swal.fire('Sucesso!', 'Alterações na turma salvas com sucesso!', 'success');
    window.location.href = '/src/dashboard_professor/turmas/index.html';

  } catch (error) {
    console.error("Erro ao salvar alterações da turma:", error);
    Swal.fire('Erro', `Não foi possível salvar as alterações: ${error.message}`, 'error');
  } finally {
    // mostrarLoadingET(false); // esconder loading se necessário
  }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!professorLogado || professorLogado.tipo !== 'professor') {
    mostrarErroET("Acesso negado. Faça login como professor.");
    setTimeout(() => window.location.href = "/src/login/index.html", 2000);
    return;
  }

  // Verifica se todos os elementos principais existem
  const elementosEssenciais = [formEditarTurmaEl, turmaNomeEditarEl, turmaDescricaoEditarEl,
    listaAlunosTurmaEl, selectAdicionarAlunoEl, btnAdicionarAlunoEl,
    listaRecursosTurmaEl, selectAdicionarRecursoEl, btnAdicionarRecursoEl,
    btnCancelarEdicaoTurmaEl, loadingMessageEl, errorMessageEl, tituloPaginaEl,
    contadorAlunosEl, contadorRecursosEl];

  if (elementosEssenciais.some(el => !el)) {
    console.error("ERRO CRÍTICO: Um ou mais elementos da UI da página 'Editar Turma' não foram encontrados.");
    mostrarErroET("Erro ao carregar a estrutura da página. Tente recarregar.");
    return;
  }

  carregarTurmaParaEdicao(); // Carrega os dados da turma ao iniciar

  formEditarTurmaEl.addEventListener('submit', handleSalvarEdicaoTurma);

  btnAdicionarAlunoEl.addEventListener('click', () => {
    const alunoIdSelecionado = selectAdicionarAlunoEl.value;
    if (alunoIdSelecionado) {
      adicionarAlunoNaTurmaLocal(alunoIdSelecionado);
      selectAdicionarAlunoEl.value = ""; // Reseta o select
    } else {
      Swal.fire('Atenção', 'Selecione um aluno para adicionar.', 'info');
    }
  });

  btnAdicionarRecursoEl.addEventListener('click', () => {
    const valorRecursoSelecionado = selectAdicionarRecursoEl.value;
    if (valorRecursoSelecionado) {
      const [idRecurso, tipoRecurso] = valorRecursoSelecionado.split('::');
      adicionarRecursoNaTurmaLocal(idRecurso, tipoRecurso);
      selectAdicionarRecursoEl.value = ""; // Reseta o select
    } else {
      Swal.fire('Atenção', 'Selecione um recurso para adicionar.', 'info');
    }
  });

  btnCancelarEdicaoTurmaEl.addEventListener('click', () => {
    window.location.href = '/src/dashboard_professor/turmas/index.html';
  });
});
