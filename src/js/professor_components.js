/**
 * @file professor_components.js
 * @description Script principal para as páginas do dashboard do professor, com métricas e JSON-Server.
 */

import {
  loadComponent,
  marcarLinkAtivo,
  configurarBoasVindas,
  configurarLogout,
  configurarMenuHamburger
} from './utils.js';

// --- URL Base da API (JSON-Server) ---
const API_BASE_URL = 'http://localhost:3000';

// --- ELEMENTOS DO DOM DO DASHBOARD ---
let turmaSelectEl;
let contadorAlunosEl;
let contadorClassesEl;
let dashboardMensagemEl;

// Elementos para novas métricas
let tbodyDesempenhoAlunosEl;
let tbodyVocabularioAlunosEl;
let mediaPalavrasTurmaEl;
let progressoCurricularValorEl;
let progressoCurricularBarraEl;
let graficoDistribuicaoCanvasEl;
let tbodyProgressoIndividualEl; // Adicionado para a nova tabela
let chartInstance = null;

// --- Cache Simples ---
let cache = {
  usuariosAlunos: null,
  licoesPlataforma: null,
  licoesProfessor: null,
};

/**
 * Atualiza o avatar do usuário no header.
 */
async function atualizarAvatarHeader(usuario) {
  const avatarEl = document.getElementById("headerUserAvatar");
  if (!avatarEl) return;
  let avatarUrlToUse = usuario?.avatarUrl;
  if (!avatarUrlToUse && usuario?.id) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}`);
      if (response.ok) avatarUrlToUse = (await response.json()).avatarUrl;
    } catch (error) { console.warn("Não foi possível buscar avatar:", error); }
  }
  avatarEl.src = avatarUrlToUse || "/src/img/perfil_avatar/avatar_01.svg";
}

function limparTabela(tbodyElement) {
  if (tbodyElement) tbodyElement.innerHTML = '';
}

function mostrarMensagemDashboard(mensagem, isError = false) {
  if (dashboardMensagemEl) {
    dashboardMensagemEl.textContent = mensagem;
    dashboardMensagemEl.className = 'ml-mensagem';
    if (isError) dashboardMensagemEl.classList.add('error-message');
    dashboardMensagemEl.classList.remove('hidden');
  }
}

/**
 * Busca detalhes dos alunos de uma turma, incluindo seu progresso.
 */
async function fetchAlunosComProgresso(alunoIds) {
  if (!alunoIds || alunoIds.length === 0) return [];
  try {
    const alunosNoCacheIds = cache.usuariosAlunos ? cache.usuariosAlunos.map(a => a.id) : [];
    const alunosParaBuscarIds = alunoIds.filter(id => !alunosNoCacheIds.includes(id));

    if (alunosParaBuscarIds.length > 0) {
      const queryParams = alunosParaBuscarIds.map(id => `id=${id}`).join('&');
      const response = await fetch(`${API_BASE_URL}/usuarios?${queryParams}`);
      if (!response.ok) {
        console.error(`Erro ao buscar alunos: ${response.status}`);
        return cache.usuariosAlunos ? cache.usuariosAlunos.filter(aluno => alunoIds.includes(aluno.id)) : [];
      }
      const novosAlunos = await response.json();
      if (!cache.usuariosAlunos) cache.usuariosAlunos = [];
      novosAlunos.forEach(novoAluno => {
        if (!cache.usuariosAlunos.find(a => a.id === novoAluno.id)) {
          cache.usuariosAlunos.push(novoAluno);
        }
      });
    }
    return cache.usuariosAlunos.filter(aluno => alunoIds.includes(aluno.id));
  } catch (error) {
    console.error("Falha ao buscar detalhes dos alunos:", error);
    return cache.usuariosAlunos ? cache.usuariosAlunos.filter(aluno => alunoIds.includes(aluno.id)) : [];
  }
}

/**
 * Renderiza a tabela de progresso individual de cada aluno.
 */
function renderizarProgressoIndividualAlunos(alunosDaTurma, recursosDaTurma) {
  limparTabela(tbodyProgressoIndividualEl);
  if (!alunosDaTurma || alunosDaTurma.length === 0 || !Array.isArray(recursosDaTurma) || recursosDaTurma.length === 0) {
    return; // Sai se não houver dados para exibir
  }

  alunosDaTurma.forEach(aluno => {
    const licoesConcluidasPeloAluno = aluno.progresso?.licoesConcluidas || [];
    const conteudosVisualizadosPeloAluno = aluno.progresso?.conteudosVisualizados || [];
    let countRecursosConcluidosDaTurma = 0;

    recursosDaTurma.forEach(recurso => {
      let recursoFoiConcluidoOuVisto = false;
      if (recurso.tipoRecurso === 'licaoPlataforma' || recurso.tipoRecurso === 'licaoProfessor') {
        if (licoesConcluidasPeloAluno.some(lc => lc.licaoId === recurso.idRecurso)) {
          recursoFoiConcluidoOuVisto = true;
        }
      } else if (recurso.tipoRecurso === 'conteudoProfessor') {
        if (conteudosVisualizadosPeloAluno.some(cv => cv.id === recurso.idRecurso && cv.tipo === recurso.tipoRecurso)) {
          recursoFoiConcluidoOuVisto = true;
        }
      }
      if (recursoFoiConcluidoOuVisto) {
        countRecursosConcluidosDaTurma++;
      }
    });

    const percentualAluno = recursosDaTurma.length > 0 ? (countRecursosConcluidosDaTurma / recursosDaTurma.length) * 100 : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${aluno.nome || 'Aluno sem nome'}</td>
            <td>
                <div class="progresso-individual-container">
                    <div class="progresso-individual-barra" style="width: ${percentualAluno.toFixed(0)}%;">
                        <span class="progresso-individual-texto">${percentualAluno.toFixed(0)}%</span>
                    </div>
                </div>
            </td>
        `;
    tbodyProgressoIndividualEl.appendChild(tr);
  });
}


/**
 * Renderiza a tabela de Desempenho dos Alunos (Lições Concluídas e Pontuação Média).
 */
function renderizarDesempenhoAlunos(alunosDaTurma) {
  limparTabela(tbodyDesempenhoAlunosEl);
  if (!alunosDaTurma || alunosDaTurma.length === 0) return;

  alunosDaTurma.forEach(aluno => {
    const licoesConcluidas = aluno.progresso?.licoesConcluidas || [];
    let totalPontos = 0;
    licoesConcluidas.forEach(lc => { totalPontos += (lc.pontuacao || 0); });

    const pontuacaoMedia = licoesConcluidas.length > 0 ? (totalPontos / licoesConcluidas.length) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${aluno.nome || 'Aluno sem nome'}</td>
        <td>${licoesConcluidas.length}</td>
        <td>${pontuacaoMedia.toFixed(0)}%</td>
    `;
    tbodyDesempenhoAlunosEl.appendChild(tr);
  });
}

/**
 * Renderiza a tabela de Aquisição de Vocabulário.
 */
function renderizarVocabularioAlunos(alunosDaTurma) {
  limparTabela(tbodyVocabularioAlunosEl);
  if (!alunosDaTurma || alunosDaTurma.length === 0) {
    if (mediaPalavrasTurmaEl) mediaPalavrasTurmaEl.textContent = 'N/D';
    return;
  }
  let totalPalavrasTurma = 0;
  alunosDaTurma.forEach(aluno => {
    const palavrasAprendidasCount = aluno.progresso?.palavrasAprendidas?.length || 0;
    totalPalavrasTurma += palavrasAprendidasCount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${aluno.nome || 'Aluno sem nome'}</td>
        <td>${palavrasAprendidasCount}</td>
    `;
    tbodyVocabularioAlunosEl.appendChild(tr);
  });
  const mediaPalavras = alunosDaTurma.length > 0 ? (totalPalavrasTurma / alunosDaTurma.length) : 0;
  if (mediaPalavrasTurmaEl) mediaPalavrasTurmaEl.textContent = mediaPalavras.toFixed(1);
}

/**
 * Calcula e exibe o Progresso Médio no Currículo da Turma.
 */
function renderizarProgressoCurricular(alunosDaTurma, recursosDaTurma) {
  if (!progressoCurricularValorEl || !progressoCurricularBarraEl) return;
  if (!alunosDaTurma || alunosDaTurma.length === 0 || !Array.isArray(recursosDaTurma) || recursosDaTurma.length === 0) {
    progressoCurricularValorEl.textContent = 'N/D';
    progressoCurricularBarraEl.style.width = '0%';
    return;
  }
  let totalPercentualConclusaoAlunos = 0;
  alunosDaTurma.forEach(aluno => {
    const licoesConcluidasPeloAluno = aluno.progresso?.licoesConcluidas || [];
    const conteudosVisualizadosPeloAluno = aluno.progresso?.conteudosVisualizados || [];
    let countRecursosConcluidosDaTurma = 0;
    recursosDaTurma.forEach(recurso => {
      let recursoFoiConcluidoOuVisto = false;
      if (recurso.tipoRecurso === 'licaoPlataforma' || recurso.tipoRecurso === 'licaoProfessor') {
        if (licoesConcluidasPeloAluno.some(lc => lc.licaoId === recurso.idRecurso)) {
          recursoFoiConcluidoOuVisto = true;
        }
      }
      else if (recurso.tipoRecurso === 'conteudoProfessor') {
        if (conteudosVisualizadosPeloAluno.some(cv => cv.id === recurso.idRecurso && cv.tipo === recurso.tipoRecurso)) {
          recursoFoiConcluidoOuVisto = true;
        }
      }
      if (recursoFoiConcluidoOuVisto) {
        countRecursosConcluidosDaTurma++;
      }
    });
    const percentualAluno = recursosDaTurma.length > 0 ? (countRecursosConcluidosDaTurma / recursosDaTurma.length) * 100 : 0;
    totalPercentualConclusaoAlunos += percentualAluno;
  });
  const progressoMedioTurma = alunosDaTurma.length > 0 ? (totalPercentualConclusaoAlunos / alunosDaTurma.length) : 0;
  progressoCurricularValorEl.textContent = `${progressoMedioTurma.toFixed(0)}%`;
  progressoCurricularBarraEl.style.width = `${progressoMedioTurma.toFixed(0)}%`;
}

/**
 * Renderiza o gráfico de Distribuição de Desempenho.
 */
function renderizarGraficoDesempenho(alunosDaTurma) {
  if (!graficoDistribuicaoCanvasEl) return;
  const ctx = graficoDistribuicaoCanvasEl.getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (!alunosDaTurma || alunosDaTurma.length === 0) {
    ctx.clearRect(0, 0, graficoDistribuicaoCanvasEl.width, graficoDistribuicaoCanvasEl.height);
    return;
  }
  const faixas = {
    'Abaixo de 50%': 0, '50-69%': 0, '70-89%': 0, '90-100%': 0,
  };
  alunosDaTurma.forEach(aluno => {
    const licoesConcluidas = aluno.progresso?.licoesConcluidas || [];
    let totalPontos = 0;
    licoesConcluidas.forEach(lc => { totalPontos += (lc.pontuacao || 0); });
    const pontuacaoMedia = licoesConcluidas.length > 0 ? (totalPontos / licoesConcluidas.length) : 0;
    if (pontuacaoMedia < 50) faixas['Abaixo de 50%']++;
    else if (pontuacaoMedia < 70) faixas['50-69%']++;
    else if (pontuacaoMedia < 90) faixas['70-89%']++;
    else faixas['90-100%']++;
  });
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(faixas),
      datasets: [{
        label: 'Distribuição de Desempenho',
        data: Object.values(faixas),
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(54, 162, 235, 0.7)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              if (label) { label += ': '; }
              if (context.parsed !== null) { label += context.parsed + ' aluno(s)'; }
              return label;
            }
          }
        }
      }
    }
  });
}


/**
 * Atualiza o dashboard com base na turma selecionada.
 */
async function atualizarDashboardComTurma(idTurmaSelecionada, turmasDoProfessor) {
  if (dashboardMensagemEl) dashboardMensagemEl.classList.add('hidden');
  limparTabela(tbodyDesempenhoAlunosEl); // Adicionado para limpar a tabela de desempenho
  limparTabela(tbodyVocabularioAlunosEl);
  limparTabela(tbodyProgressoIndividualEl);
  if (mediaPalavrasTurmaEl) mediaPalavrasTurmaEl.textContent = 'N/D';
  if (progressoCurricularValorEl) progressoCurricularValorEl.textContent = 'N/D';
  if (progressoCurricularBarraEl) progressoCurricularBarraEl.style.width = '0%';
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  if (graficoDistribuicaoCanvasEl) { const ctx = graficoDistribuicaoCanvasEl.getContext('2d'); ctx.clearRect(0, 0, graficoDistribuicaoCanvasEl.width, graficoDistribuicaoCanvasEl.height); }

  if (!idTurmaSelecionada) {
    if (contadorAlunosEl) contadorAlunosEl.textContent = '0';
    mostrarMensagemDashboard('Selecione uma turma para ver os detalhes.');
    return;
  }
  const turmaSelecionada = turmasDoProfessor.find(t => t.id === idTurmaSelecionada);
  if (!turmaSelecionada) {
    console.error("Turma selecionada não encontrada.");
    mostrarMensagemDashboard('Erro ao carregar dados da turma.', true);
    return;
  }
  mostrarMensagemDashboard('Carregando dados da turma...');
  const alunosDaTurma = await fetchAlunosComProgresso(turmaSelecionada.alunoIds || []);
  const recursosDaTurmaParaCalculoProgresso = turmaSelecionada.recursosIds || [];
  if (contadorAlunosEl) contadorAlunosEl.textContent = String(alunosDaTurma.length).padStart(2, '0');
  if (alunosDaTurma.length === 0) {
    mostrarMensagemDashboard(`A turma "${turmaSelecionada.nome || 'Nome da Turma Indisponível'}" não possui alunos cadastrados.`);
  }
  if (dashboardMensagemEl) dashboardMensagemEl.classList.add('hidden');

  // Chama todas as funções de renderização
  renderizarDesempenhoAlunos(alunosDaTurma);
  renderizarVocabularioAlunos(alunosDaTurma);
  renderizarProgressoCurricular(alunosDaTurma, recursosDaTurmaParaCalculoProgresso);
  renderizarGraficoDesempenho(alunosDaTurma);
  renderizarProgressoIndividualAlunos(alunosDaTurma, recursosDaTurmaParaCalculoProgresso);
}

/**
 * Popula o select de turmas e configura o comportamento inicial.
 */
async function popularSelecaoTurmasEConfigurarDashboard(usuarioLogado) {
  if (!usuarioLogado?.id) {
    mostrarMensagemDashboard("ID do professor não encontrado.", true);
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/turmas?professorId=${usuarioLogado.id}`);
    if (!response.ok) throw new Error(`Falha ao buscar turmas: ${response.status}`);
    const turmasDoProfessor = await response.json();
    if (contadorClassesEl) contadorClassesEl.textContent = String(turmasDoProfessor.length).padStart(2, '0');
    if (turmaSelectEl) {
      turmaSelectEl.innerHTML = '<option value="">Selecione uma turma</option>';
      turmasDoProfessor.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = turma.nome;
        turmaSelectEl.appendChild(option);
      });
      turmaSelectEl.addEventListener('change', (event) => {
        atualizarDashboardComTurma(event.target.value, turmasDoProfessor);
      });
      if (turmasDoProfessor.length === 0) {
        if (contadorAlunosEl) contadorAlunosEl.textContent = '0';
        mostrarMensagemDashboard('Você ainda não possui turmas cadastradas.');
      } else {
        atualizarDashboardComTurma(null, turmasDoProfessor);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
    mostrarMensagemDashboard("Erro ao carregar as turmas.", true);
  }
}

/**
 * Função de inicialização principal.
 */
(async function initDashboardProfessor() {
  const usuarioLogadoJSON = localStorage.getItem("usuarioLogado");
  if (!usuarioLogadoJSON) { window.location.href = "/src/index.html"; return; }
  let usuarioLogado;
  try { usuarioLogado = JSON.parse(usuarioLogadoJSON); }
  catch (error) { console.error("Erro parse user:", error); window.location.href = "/src/index.html"; return; }
  if (!usuarioLogado || usuarioLogado.tipo !== 'professor') { window.location.href = "/src/index.html"; return; }
  await loadComponent("header", "/src/components/header_professor.html");
  await loadComponent("sidebar", "/src/components/sidebar_professor.html");
  setTimeout(async () => { await atualizarAvatarHeader(usuarioLogado); }, 100);
  configurarBoasVindas(usuarioLogado);
  configurarLogout();
  configurarMenuHamburger();
  marcarLinkAtivo();
  turmaSelectEl = document.getElementById('turma-select');
  if (turmaSelectEl) {
    contadorAlunosEl = document.getElementById('contador-alunos');
    contadorClassesEl = document.getElementById('contador-classes');
    dashboardMensagemEl = document.getElementById('dashboard-mensagem');

    // Adicionado de volta a referência ao tbody de desempenho
    tbodyDesempenhoAlunosEl = document.getElementById('tbody-desempenho-alunos');
    tbodyVocabularioAlunosEl = document.getElementById('tbody-vocabulario-alunos');
    mediaPalavrasTurmaEl = document.getElementById('media-palavras-turma');
    progressoCurricularValorEl = document.getElementById('progresso-curricular-valor');
    progressoCurricularBarraEl = document.getElementById('progresso-curricular-barra');
    graficoDistribuicaoCanvasEl = document.getElementById('grafico-distribuicao-desempenho');
    tbodyProgressoIndividualEl = document.getElementById('tbody-progresso-individual');
    if (!cache.usuariosAlunos) { cache.usuariosAlunos = []; }
    await popularSelecaoTurmasEConfigurarDashboard(usuarioLogado);
  }
})();
