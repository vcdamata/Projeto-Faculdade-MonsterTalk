/**
 * @file aluno_components.js
 * @description Script principal para as páginas do dashboard do aluno.
 * Inclui carregamento de componentes, proteção de rota, e atualização da UI.
 */

// Assumindo que utils.js exporta estas funções
import {
  loadComponent,
  marcarLinkAtivo,
  configurarBoasVindas, // Mantém esta para a saudação
  configurarLogout,
  configurarMenuHamburger
} from './utils.js'; // Ajuste o caminho se necessário

/**
 * Atualiza o avatar do usuário no header.
 * @param {object} usuario - O objeto do usuário logado, contendo avatarUrl.
 */
function atualizarAvatarHeader(usuario) {
  const avatarEl = document.getElementById("headerUserAvatar");
  if (avatarEl && usuario?.avatarUrl) {
    avatarEl.src = usuario.avatarUrl;
  } else if (avatarEl) {
    // Define um avatar padrão se o usuário não tiver um ou se o campo estiver ausente
    avatarEl.src = "/src/img/perfil_avatar/avatar_01.svg";
  }
}

/**
 * Atualiza a barra de progresso no header.
 * @async
 */
async function atualizarProgressoHeader() { // Removido o parâmetro 'usuario'
  const progressoBarraEl = document.querySelector(".barra-progresso .progresso");
  const labelProgressoSpan = document.querySelector(".barra-progresso .progresso");

  if (!progressoBarraEl || !labelProgressoSpan) {
    // Não loga erro se não for a página principal do dashboard para evitar poluição
    // em páginas internas que podem não ter esses elementos.
    if (window.location.pathname.includes('dashboard_aluno/index.html')) {
      console.warn("Elementos da barra de progresso no header não encontrados.");
    }
    return;
  }

  // Pega os dados MAIS RECENTES do localStorage AQUI DENTRO
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || usuario.tipo !== 'aluno') {
    progressoBarraEl.style.width = `0%`;
    labelProgressoSpan.textContent = `0%`;
    return;
  }

  const licoesConcluidasPeloAluno = usuario.progresso?.licoesConcluidas?.length || 0;

  try {
    const response = await fetch('http://localhost:3000/licoes?criadorId=null');
    if (!response.ok) {
      throw new Error('Falha ao buscar o total de lições da plataforma.');
    }
    const todasLicoesDaPlataforma = await response.json();
    const totalLicoesPlataforma = todasLicoesDaPlataforma.length;

    let percentualConclusao = 0;
    if (totalLicoesPlataforma > 0) {
      percentualConclusao = (licoesConcluidasPeloAluno / totalLicoesPlataforma) * 100;
    }
    percentualConclusao = Math.round(percentualConclusao);

    progressoBarraEl.style.width = `${percentualConclusao}%`;
    labelProgressoSpan.textContent = `${percentualConclusao}%`;

  } catch (error) {
    console.error("Erro ao atualizar o progresso no header:", error);
    progressoBarraEl.style.width = `0%`;
    labelProgressoSpan.textContent = `0%`;
  }
}

async function carregarLicoesEGerarCards() {
  const containerBasico = document.getElementById('licoes-basico');
  const containerIntermediario = document.getElementById('licoes-intermediario');
  const containerAvancado = document.getElementById('licoes-avancado');

  // Verifica se os contêineres existem (só devem existir na página principal do dashboard)
  if (!containerBasico && !containerIntermediario && !containerAvancado) {
    return; // Não faz nada se não for a página do dashboard com os contêineres
  }
  if (!containerBasico || !containerIntermediario || !containerAvancado) {
    console.warn("Um ou mais contêineres de lições não foram encontrados no DOM, mas esperado.");
    // Prossegue se alguns existirem, ou pode retornar se todos forem essenciais.
  }


  try {
    const response = await fetch('http://localhost:3000/licoes?criadorId=null');
    if (!response.ok) throw new Error('Falha ao buscar lições.');
    const licoes = await response.json();

    if (containerBasico) containerBasico.innerHTML = '';
    if (containerIntermediario) containerIntermediario.innerHTML = '';
    if (containerAvancado) containerAvancado.innerHTML = '';

    licoes.forEach(licao => {
      const card = document.createElement('a');
      card.classList.add('card');
      card.href = `/src/dashboard_aluno/licoes/licao_teste.html?id=${licao.id}`;
      const cardTitle = document.createElement('h4');
      cardTitle.textContent = licao.titulo;
      card.appendChild(cardTitle);

      switch (licao.nivel) {
        case 'Básico':
          if (containerBasico) { card.classList.add('basico'); containerBasico.appendChild(card); }
          break;
        case 'Intermediário':
          if (containerIntermediario) { card.classList.add('intermediario'); containerIntermediario.appendChild(card); }
          break;
        case 'Avançado':
          if (containerAvancado) { card.classList.add('avancado'); containerAvancado.appendChild(card); }
          break;
      }
    });
  } catch (error) {
    console.error("Erro ao carregar as lições:", error);
    if (containerBasico) containerBasico.innerHTML = "<p>Não foi possível carregar as lições.</p>";
  }
}

/**
 * Função principal e auto-executável que monta e configura a página do aluno.
 */
(async function initDashboardAluno() {
  // 1. ROTA PROTEGIDA
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.tipo !== 'aluno') {
    // Se não for uma página que EXIGE login de aluno (ex: index.html principal do site),
    // não redirecionar, apenas não carregar dados do aluno.
    // Mas para páginas de dashboard, o redirecionamento é correto.
    // A verificação do tipo de página pode ser feita pelo pathname.
    const path = window.location.pathname;
    if (path.includes('dashboard_aluno') || path.includes('licoes') || path.includes('progresso') || path.includes('perfil')) {
      window.location.href = "/src/index.html"; // Ou para a página de login
      return;
    }
    // Se for uma página pública, apenas não executa o restante
    return;
  }

  // 2. CARREGAMENTO DOS COMPONENTES E CONTEÚDO DINÂMICO PRIMÁRIO
  await loadComponent("header", "/src/components/header_aluno.html");
  await loadComponent("sidebar", "/src/components/sidebar_aluno.html");

  // Só carrega cards de lições se estivermos na página principal do dashboard
  if (window.location.pathname.includes('dashboard_aluno/index.html') || window.location.pathname.endsWith('dashboard_aluno/')) {
    await carregarLicoesEGerarCards();
  }

  // 3. CONFIGURAÇÃO DA INTERFACE
  // As funções de configuração agora pegam o usuário do localStorage se necessário,
  // ou são chamadas com o objeto usuarioLogado mais recente.
  configurarBoasVindas(usuarioLogado); // utils.js
  atualizarAvatarHeader(usuarioLogado);
  await atualizarProgressoHeader();    // Esta já pega do localStorage

  configurarLogout(); // utils.js
  configurarMenuHamburger(); // utils.js
  marcarLinkAtivo(); // utils.js

  // Listener para atualizar o progresso e avatar quando a aba/janela do dashboard se torna visível
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      // Atualiza apenas se estivermos em uma página que mostra o header do aluno
      // e que precise desses dados dinâmicos.
      const currentPath = window.location.pathname;
      if (currentPath.includes('dashboard_aluno') || currentPath.includes('licoes') || currentPath.includes('progresso') || currentPath.includes('perfil')) {
        console.log("Página do aluno tornou-se visível, atualizando header.");
        const usuarioAtualizadoDoStorage = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (usuarioAtualizadoDoStorage) {
          configurarBoasVindas(usuarioAtualizadoDoStorage);
          atualizarAvatarHeader(usuarioAtualizadoDoStorage);
          await atualizarProgressoHeader(); // Não precisa de argumento
        }
      }
    }
  });
})();
