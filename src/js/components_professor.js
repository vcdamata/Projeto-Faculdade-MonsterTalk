function loadComponent(id, path) {
  fetch(path)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(err => console.error(`Erro ao carregar ${path}:`, err));
}

// Carregar componentes
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "../components/header_professor.html");
  loadComponent("sidebar", "../components/sidebar_professor.html");
});