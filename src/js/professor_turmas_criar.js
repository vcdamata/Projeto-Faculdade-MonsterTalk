/**
 * @file criar_turma.js
 * @description Lógica para a página de criação de novas turmas pelo professor.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_TURMAS = "http://localhost:3000/turmas";
let professorLogado = null;

// --- ELEMENTOS DO DOM ---
const formCriarTurmaEl = document.getElementById('formCriarTurma');
const turmaNomeEl = document.getElementById('turmaNome');
const turmaDescricaoEl = document.getElementById('turmaDescricao');
const btnCancelarCriacaoTurmaEl = document.getElementById('btnCancelarCriacaoTurma');

// --- LÓGICA PRINCIPAL ---

/**
 * Lida com a submissão do formulário para criar uma nova turma.
 * @async
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleSalvarNovaTurma(event) {
  event.preventDefault();

  const nomeTurma = turmaNomeEl.value.trim();
  const descricaoTurma = turmaDescricaoEl.value.trim();

  if (!nomeTurma) {
    Swal.fire('Atenção!', 'O nome da turma é obrigatório.', 'warning');
    return;
  }

  if (!professorLogado?.id) {
    Swal.fire('Erro!', 'Não foi possível identificar o professor. Faça login novamente.', 'error');
    return;
  }

  const novaTurma = {
    // O json-server geralmente cria o ID automaticamente se não for fornecido.
    nome: nomeTurma,
    descricao: descricaoTurma,
    professorId: professorLogado.id,
    alunoIds: [],      // Começa sem alunos
    recursosIds: [],   // Começa sem recursos (lições/conteúdos)
    dataCriacao: new Date().toISOString()
  };

  try {
    const response = await fetch(API_URL_TURMAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTurma)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Erro ${response.status} ao criar a turma.`;
      throw new Error(errorMessage);
    }

    const turmaCriada = await response.json(); // O json-server retorna o objeto criado

    await Swal.fire({
      title: 'Sucesso!',
      text: `Turma "${turmaCriada.nome}" criada com sucesso! Você será redirecionado para a página de gerenciamento desta turma.`,
      icon: 'success',
      timer: 3000, // Fecha automaticamente após 3 segundos
      timerProgressBar: true,
      showConfirmButton: true, // Mostra o botão para fechar antes se quiser
      confirmButtonText: 'OK'
    });

    // Redireciona para a página de edição da turma recém-criada
    window.location.href = `/src/dashboard_professor/turmas/editar_turma.html?id=${turmaCriada.id}`;

  } catch (error) {
    console.error("Erro ao salvar nova turma:", error);
    Swal.fire('Erro!', `Não foi possível criar a turma: ${error.message}`, 'error');
  } finally {
    // showLoading(false);  // Garante que o loading seja escondido
  }
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Proteção de rota básica
  if (!professorLogado || professorLogado.tipo !== 'professor') {
    Swal.fire({
      icon: 'error',
      title: 'Acesso Negado',
      text: 'Você precisa estar logado como professor para acessar esta página.',
      confirmButtonColor: '#6A2C70'
    }).then(() => {
      window.location.href = "/src/login/index.html";
    });
    return; // Impede o resto do script de rodar
  }

  if (formCriarTurmaEl) {
    formCriarTurmaEl.addEventListener('submit', handleSalvarNovaTurma);
  } else {
    console.error("ERRO CRÍTICO: Formulário 'formCriarTurma' não encontrado.");
  }

  if (btnCancelarCriacaoTurmaEl) {
    btnCancelarCriacaoTurmaEl.addEventListener('click', () => {
      // Volta para a página de listagem de turmas ou dashboard do professor
      window.location.href = '/src/dashboard_professor/turmas/index.html';
    });
  }
});
