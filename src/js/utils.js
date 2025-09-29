/**
 * @file utils.js
 * @description Biblioteca central de funções utilitárias reutilizáveis para a aplicação.
 * Este arquivo exporta funções para manipulação do DOM (loading, erros), validações de
 * formulário e interações com a API, promovendo a reutilização de código e a organização.
 */


// --- FUNÇÕES DE INTERFACE DO USUÁRIO (UI) ---

/**
 * Adiciona uma classe 'active' ao link da sidebar que corresponde à URL atual.
 * Melhora a experiência do usuário ao destacar a página visitada.
 */
export function marcarLinkAtivo() {
  // Pega o caminho da URL atual e remove a barra final para uma comparação mais consistente.
  const currentPath = window.location.pathname.replace(/\/$/, '');
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    // Ignora links sem href ou o link do logo, que não deve ser ativado.
    const href = link.getAttribute("href");
    if (!href || link.classList.contains("logo-link")) return;

    // Converte o href do link para um caminho absoluto para uma comparação segura.
    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '');

    // Verifica se o caminho atual corresponde ao caminho do link.
    // As verificações extras lidam com casos onde 'index.html' pode estar presente ou ausente na URL.
    if (
      currentPath === linkPath ||
      (currentPath + '/index.html') === linkPath ||
      currentPath === (linkPath + '/index.html')
    ) {
      link.classList.add("active");
    }
  });
}

/**
 * Atualiza o elemento de saudação no header com o primeiro nome do usuário.
 * Requer um elemento com a classe '.saldacao' no componente de header.
 * @param {object} usuario - O objeto do usuário logado, deve conter a propriedade 'nome'.
 */
export function configurarBoasVindas(usuario) {
  if (usuario?.nome) {
    const saudacaoEl = document.querySelector(".saldacao");
    if (saudacaoEl) {
      // Pega apenas o primeiro nome para uma saudação mais curta.
      saudacaoEl.textContent = `Olá, ${usuario.nome.split(" ")[0]}`;
    }
  }
}

/**
 * Adiciona o evento de clique ao botão de logout.
 * Requer um elemento com o ID '#logoutBtn' no HTML.
 */
export function configurarLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/src/index.html"; // Redireciona para a página inicial/login.
    });
  }
}

/**
 * Configura a funcionalidade do menu hamburger para abrir/fechar a sidebar em telas menores.
 * Requer um botão com ID '#hamburgerBtn' e um elemento de sidebar com a classe '.sidebar'.
 */
export function configurarMenuHamburger() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector("#sidebar .sidebar");

  if (!hamburgerBtn || !sidebar) {
    console.warn("Elementos do menu hamburger ou da sidebar não encontrados.");
    return;
  }

  // Evento para alternar a visibilidade do menu.
  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active_menu");
    // Altera o ícone do botão entre hamburger (☰) e fechar (✕).
    hamburgerBtn.innerHTML = sidebar.classList.contains("active_menu") ? "✕" : "☰";
  });

  // Evento para fechar o menu automaticamente ao clicar em um link em telas mobile.
  const sidebarLinks = sidebar.querySelectorAll("a");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768 && sidebar.classList.contains("active_menu")) {
        sidebar.classList.remove("active_menu");
        hamburgerBtn.innerHTML = "☰";
      }
    });
  });
}

/**
 * Exibe ou oculta um overlay de carregamento em tela cheia.
 * O elemento do loader é criado dinamicamente e adicionado ao corpo da página
 * na primeira vez que a função é chamada, sendo reutilizado nas chamadas seguintes.
 *
 * @param {boolean} show - Define se o loader deve ser exibido (`true`) ou ocultado (`false`).
 */
export function showLoading(show) {
  let loader = document.getElementById("loader");

  // Cria o elemento do loader apenas se ele ainda não existir no DOM.
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    // É uma boa prática mover esses estilos para um arquivo CSS para melhor organização.
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.background = "rgba(255,255,255,0.7) url('/src/img/loader.svg') no-repeat center center";
    loader.style.zIndex = "1000";
    document.body.appendChild(loader);
  }

  // Altera a visibilidade do loader com base no parâmetro 'show'.
  loader.style.display = show ? "block" : "none";
}

/**
 * Exibe um alerta de erro estilizado usando SweetAlert2.
 * Também garante que o indicador de carregamento seja ocultado.
 *
 * @param {string} msg - A mensagem de erro a ser exibida no corpo do alerta.
 */
export function showError(msg) {
  // Oculta o loader antes de mostrar o alerta de erro.
  showLoading(false);

  // Se a mensagem for vazia, não faz nada. Usado para limpar erros.
  if (!msg) {
    return;
  }

  // Exibe o alerta de erro.
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: msg,
    confirmButtonColor: '#6c40d4' // Cor do seu tema para o botão
  });
}

// --- FUNÇÕES DE VALIDAÇÃO ---

/**
 * Valida se uma string possui o formato de um e-mail válido.
 *
 * @param {string} email - O endereço de e-mail a ser validado.
 * @returns {boolean} - Retorna `true` se o e-mail for válido, `false` caso contrário.
 */
export function validateEmail(email) {
  // Expressão regular (Regex) para uma validação de formato de e-mail padrão.
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida a força de uma senha com base em critérios de segurança.
 * Critérios: Mínimo de 6 caracteres, contendo pelo menos uma letra maiúscula,
 * uma letra minúscula e um número.
 *
 * @param {string} password - A senha a ser validada.
 * @returns {boolean} - Retorna `true` se a senha atender aos critérios, `false` caso contrário.
 */
export function validatePassword(password) {
  // Expressão regular (Regex) que verifica a presença de todos os critérios.
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
}


// --- FUNÇÕES DE API ---

/**
 * Calcula o próximo ID numérico sequencial para um recurso da API (json-server).
 * Esta função é assíncrona, pois precisa fazer uma requisição de rede.
 *
 * @async
 * @param {string} resource - O nome do recurso na API (ex: "usuarios", "tarefas").
 * @returns {Promise<number>} - Retorna uma Promessa que resolve para o próximo ID disponível.
 * @throws {Error} - Lança um erro se a comunicação com a API falhar.
 */
export async function getNextId(resource) {
  const API_URL = `http://localhost:3000/${resource}`;

  // O bloco try...catch é essencial para lidar com possíveis falhas de rede.
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro ao buscar o recurso: ${resource}`);
    }
    const items = await response.json();

    // Se não houver itens, o primeiro ID será 1.
    if (items.length === 0) {
      return 1;
    }

    // Usa o método .reduce() para encontrar o maior ID numérico na lista de itens.
    const maxId = items.reduce((max, item) => {
      const itemId = parseInt(item.id, 10);
      return itemId > max ? itemId : max;
    }, 0);

    // O próximo ID é o maior ID encontrado + 1.
    return maxId + 1;

  } catch (error) {
    console.error(`Falha ao obter o próximo ID para o recurso "${resource}":`, error);
    // Relança o erro para que a função que chamou esta saiba que algo deu errado.
    throw error;
  }
}

// --- FUNÇÕES DE CARREGAMENTO DE COMPONENTES ---

/**
 * Carrega um componente HTML de um arquivo e o injeta em um elemento da página.
 * Esta função é assíncrona e ideal para criar páginas modulares.
 *
 * @async
 * @param {string} elementId - O ID do elemento no qual o HTML será injetado (ex: "header", "sidebar").
 * @param {string} filePath - O caminho relativo para o arquivo .html do componente.
 * @returns {Promise<void>} - Retorna uma promessa que é resolvida quando o componente é carregado.
 * @throws {Error} - Lança um erro se o elemento ou o arquivo não forem encontrados.
 */
export async function loadComponent(elementId, filePath) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Elemento com ID '${elementId}' não encontrado para carregar o componente.`);
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Erro ao carregar o componente: ${filePath}. Status: ${response.status}`);
    }
    element.innerHTML = await response.text();
  } catch (err) {
    console.error(`Falha crítica ao carregar componente em #${elementId}:`, err);
    element.innerHTML = `<p style="color:red;">Erro ao carregar esta seção.</p>`;
  }
}

/**
 * Adiciona funcionalidade de "voltar" para qualquer botão com o ID 'btn-voltar'.
 */
function configurarBotaoVoltar() {
  const btnVoltar = document.getElementById('btn-voltar');

  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      window.history.back();
    });
  }
}

document.addEventListener('DOMContentLoaded', configurarBotaoVoltar);
