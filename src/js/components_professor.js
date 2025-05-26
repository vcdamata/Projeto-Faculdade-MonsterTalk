// Proteção de rota: redireciona se não estiver logado
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
  window.location.href = "/src/index.html";
}

function getScriptDir() {
  const script = document.currentScript || document.querySelector('script[src*="components_professor.js"]');
  const path = script.getAttribute('src');
  return path.substring(0, path.lastIndexOf('/') + 1);
}

function loadComponent(id, relativePath) {
  const basePath = getScriptDir();
  const fullPath = basePath + relativePath;

  return fetch(fullPath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(data => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = data;
        if (id === "header") atualizarSaudacao();
        if (id === "sidebar") configurarLogout();
      } else {
        console.warn(`Elemento com ID '${id}' não encontrado.`);
      }
    })
    .catch(err => console.error(`Erro ao carregar ${fullPath}:`, err));
}

function marcarLinkAtivo() {
  const currentPath = window.location.pathname.replace(/\/$/, ''); // Remove barra final
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href || link.classList.contains("logo-link")) return;

    const hrefPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '');

    // Verifica se a URL atual é exatamente igual ao link ou termina com /index.html
    if (
      currentPath === hrefPath ||
      currentPath === hrefPath + "/index.html" ||
      currentPath + "/index.html" === hrefPath
    ) {
      link.classList.add("active");
    }
  });
}

function atualizarSaudacao() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario?.nome) {
    const saudacaoEl = document.querySelector(".saldacao");
    if (saudacaoEl) {
      saudacaoEl.textContent = `Olá, ${usuario.nome.split(" ")[0]}`;
    }
  }
}

function configurarLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/src/index.html";
    });
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", "../components/header_professor.html");
  await loadComponent("sidebar", "../components/sidebar_professor.html");

  // Aguarde um pequeno tempo para garantir que os elementos foram carregados
  setTimeout(() => {
    marcarLinkAtivo();

    const hamburger = document.getElementById("hamburgerBtn");
    const sidebarWrapper = document.getElementById("sidebar");
    const sidebar = sidebarWrapper.querySelector(".sidebar");

    hamburger.addEventListener("click", function () {
      if (sidebar) {
        sidebar.classList.toggle("active_menu");

        // Alterna ícone ☰ ↔ X
        if (sidebar.classList.contains("active_menu")) {
          hamburger.innerHTML = "✕";
        } else {
          hamburger.innerHTML = "☰";
        }
      }
    });

    // (Opcional) Fecha menu ao clicar em qualquer link da sidebar no mobile
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("active_menu");
          hamburger.innerHTML = "☰";
        }
      });
    });

  }, 50);
});

