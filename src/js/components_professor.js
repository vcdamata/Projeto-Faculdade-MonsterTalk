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

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", "../components/header_professor.html");
  await loadComponent("sidebar", "../components/sidebar_professor.html");

  // Aguarde um pequeno tempo para garantir que os elementos da sidebar foram inseridos
  setTimeout(() => {
    marcarLinkAtivo();
  }, 50);
});



