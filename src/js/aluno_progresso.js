/**
 * @file aluno_progresso.js
 * @description Gerencia a exibição dos dados de progresso do aluno,
 * incluindo palavras aprendidas, lições concluídas, percentual do curso
 * e lições recentes.
 */

// --- ELEMENTOS DO DOM ---
const palavrasAprendidasValorEl = document.getElementById('palavras-aprendidas-valor');
const licoesConcluidasValorEl = document.getElementById('licoes-concluidas-valor');
const progressoCursoBarraEl = document.getElementById('progresso-curso-barra');
const progressoCursoPercentualEl = document.getElementById('progresso-curso-percentual');
const recentesContainerEl = document.getElementById('recentes-container');

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---

/**
 * Inicializa a página de progresso, buscando e exibindo todos os dados relevantes
 * DIRETAMENTE DA API para garantir que estejam atualizados.
 * @async
 */
async function initProgresso() {
  const usuarioLogadoInfo = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Proteção de rota básica
  if (!usuarioLogadoInfo?.id || usuarioLogadoInfo?.tipo !== 'aluno') {
    alert("Usuário não autenticado ou não é um aluno. Redirecionando...");
    window.location.href = "/src/login/index.html";
    return;
  }

  try {
    // 1. BUSCAR OS DADOS MAIS RECENTES DO USUÁRIO DA API
    const responseUser = await fetch(`http://localhost:3000/usuarios/${usuarioLogadoInfo.id}`);
    if (!responseUser.ok) {
      throw new Error('Falha ao buscar dados atualizados do usuário.');
    }
    const usuarioAtualizado = await responseUser.json();

    // ATUALIZA O LOCALSTORAGE COM OS DADOS FRESCOS (BOA PRÁTICA)
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

    // Garante que o objeto progresso exista
    const progressoUsuario = usuarioAtualizado.progresso || {
      licoesConcluidas: [],
      palavrasAprendidas: [],
      ultimaLicaoFeitaId: null
    };

    // 2. Atualizar métricas simples
    if (palavrasAprendidasValorEl) {
      palavrasAprendidasValorEl.textContent = progressoUsuario.palavrasAprendidas.length;
    }
    if (licoesConcluidasValorEl) {
      licoesConcluidasValorEl.textContent = progressoUsuario.licoesConcluidas.length;
    }

    // 3. Calcular e exibir a conclusão do curso
    // Passamos o número de lições concluídas diretamente do objeto recém-buscado
    await calcularEExibirConclusaoCurso(progressoUsuario.licoesConcluidas.length);

    // 4. Carregar e exibir lições recentes
    await carregarLicoesRecentes(progressoUsuario.licoesConcluidas);

  } catch (error) {
    console.error("Erro ao carregar dados de progresso:", error);
    if (recentesContainerEl) {
      recentesContainerEl.innerHTML = "<p>Erro ao carregar dados de progresso.</p>";
    }
    // Você pode querer limpar os campos do progresso aqui ou mostrar uma mensagem de erro mais proeminente.
    if (palavrasAprendidasValorEl) palavrasAprendidasValorEl.textContent = 'N/D';
    if (licoesConcluidasValorEl) licoesConcluidasValorEl.textContent = 'N/D';
    if (progressoCursoBarraEl) progressoCursoBarraEl.style.width = '0%';
    if (progressoCursoPercentualEl) progressoCursoPercentualEl.textContent = 'N/D';

  }
}

/**
 * Calcula o percentual de conclusão do curso e atualiza a barra de progresso.
 * @async
 * @param {number} numLicoesConcluidas - Número de lições que o aluno completou.
 */
async function calcularEExibirConclusaoCurso(numLicoesConcluidas) {
  try {
    const response = await fetch('http://localhost:3000/licoes?criadorId=null');
    if (!response.ok) {
      throw new Error('Falha ao buscar o total de lições da plataforma.');
    }
    const todasLicoesDaPlataforma = await response.json();
    const totalLicoesPlataforma = todasLicoesDaPlataforma.length;

    let percentualConclusao = 0;
    if (totalLicoesPlataforma > 0) {
      percentualConclusao = (numLicoesConcluidas / totalLicoesPlataforma) * 100;
    }
    percentualConclusao = Math.round(percentualConclusao);

    if (progressoCursoBarraEl) {
      progressoCursoBarraEl.style.width = `${percentualConclusao}%`;
    }
    if (progressoCursoPercentualEl) {
      progressoCursoPercentualEl.textContent = `${percentualConclusao}%`;
    }

  } catch (error) {
    console.error("Erro ao calcular conclusão do curso:", error);
    if (progressoCursoBarraEl) progressoCursoBarraEl.style.width = `0%`;
    if (progressoCursoPercentualEl) progressoCursoPercentualEl.textContent = `0%`;
  }
}

/**
 * Carrega os detalhes das lições concluídas mais recentes e as exibe.
 * @async
 * @param {Array<object>} licoesConcluidas - Array de objetos de lições concluídas do progresso do usuário.
 */
async function carregarLicoesRecentes(licoesConcluidas) {
  if (!recentesContainerEl) return;

  if (!licoesConcluidas || licoesConcluidas.length === 0) {
    recentesContainerEl.innerHTML = "<p>Nenhuma lição concluída recentemente.</p>";
    return;
  }

  // Ordena as lições pela data de conclusão, da mais recente para a mais antiga
  const licoesOrdenadas = [...licoesConcluidas].sort((a, b) =>
    new Date(b.dataConclusao) - new Date(a.dataConclusao)
  );

  // Pega as últimas 3 lições (ou menos, se não houver 3)
  const licoesParaExibir = licoesOrdenadas.slice(0, 3);
  console.log("Lições concluídas recentes:", licoesParaExibir);
  recentesContainerEl.innerHTML = ''; // Limpa o contêiner

  if (licoesParaExibir.length === 0) {
    recentesContainerEl.innerHTML = "<p>Nenhuma lição concluída recentemente.</p>";
    return;
  }

  // Busca os detalhes de cada uma dessas lições
  for (const licaoConcluida of licoesParaExibir) {
    console.log(`Carregando detalhes da lição concluída ID: ${licaoConcluida.licaoId}`);
    try {
      let response = await fetch(`http://localhost:3000/licoes/${licaoConcluida.licaoId}`);

      if (!response.ok) {
        response = await fetch(`http://localhost:3000/licoes_professor/${licaoConcluida.licaoId}`);
        if (!response.ok) {
          console.warn(`Não foi possível carregar detalhes da lição ID: ${licaoConcluida.licaoId}`);
          continue; // Pula para a próxima lição em caso de erro
        }
      }
      const detalheLicao = await response.json();

      // Cria o card para a lição recente
      const card = document.createElement('a');
      card.classList.add('card');

      // Adiciona a classe do nível para estilização (basico, intermediario, avancado)
      if (detalheLicao.nivel === "Básico") card.classList.add('basico');
      else if (detalheLicao.nivel === "Intermediário") card.classList.add('intermediario');
      else if (detalheLicao.nivel === "Avançado") card.classList.add('avancado');

      card.href = `/src/dashboard_aluno/licoes/licao_teste.html?id=${detalheLicao.id}`; // Link para refazer/revisar a lição

      const cardTitle = document.createElement('h4');
      cardTitle.textContent = detalheLicao.titulo;
      card.appendChild(cardTitle);

      recentesContainerEl.appendChild(card);

    } catch (error) {
      console.error(`Erro ao carregar detalhes da lição recente ID ${licaoConcluida.licaoId}:`, error);
    }
  }
}

// --- EVENT LISTENERS ---
// Quando o conteúdo HTML da página estiver completamente carregado, inicia a lógica da página de progresso.
document.addEventListener('DOMContentLoaded', initProgresso);
