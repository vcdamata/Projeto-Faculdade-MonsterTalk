document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  try {
    const response = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`);
    const data = await response.json();

    if (data.length === 0) {
      erro.textContent = "E-mail ou senha inválidos.";
      return;
    }

    const usuario = data[0];

    // Armazena os dados no localStorage (simula sessão)
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Redireciona com base no tipo de usuário
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
  }
});