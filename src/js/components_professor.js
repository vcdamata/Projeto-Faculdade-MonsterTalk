function getScriptDir() {
  // Caminho base do script atual (carregado no HTML)
  const script = document.currentScript || document.querySelector('script[src*="components_professor.js"]');
  const path = script.getAttribute('src');
  return path.substring(0, path.lastIndexOf('/') + 1);
}

function loadComponent(id, relativePath) {
  const basePath = getScriptDir();
  const fullPath = basePath + relativePath;

  fetch(fullPath)
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

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "../components/header_professor.html");
  loadComponent("sidebar", "../components/sidebar_professor.html");
});
