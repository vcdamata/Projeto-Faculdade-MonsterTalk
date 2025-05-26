document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  showLoading(true);

  try {
    const response = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`);
    const data = await response.json();

    if (data.length === 0) {
      erro.textContent = "E-mail ou senha inválidos.";
      showLoading(false);
      return;
    }

    const usuario = data[0];
    console.log("Usuário autenticado:", usuario);

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Verifique se foi salvo corretamente
    console.log("Dados no localStorage:", localStorage.getItem("usuarioLogado"));

    showLoading(false);

    // Redirecionamento
    if (usuario.tipo === "aluno") {
      window.location.href = "/src/dashboard_aluno/index.html";
    } else if (usuario.tipo === "professor") {
      window.location.href = "/src/dashboard_professor/index.html";
    } else {
      erro.textContent = "Tipo de usuário desconhecido.";
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
    erro.textContent = "Erro ao conectar com o servidor.";
    showLoading(false);
  }
});
