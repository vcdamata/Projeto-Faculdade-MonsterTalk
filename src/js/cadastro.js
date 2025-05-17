// Validações e feedback visual no cadastro

document.getElementById("cadastroForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const nome = document.getElementById("username").value.trim();
  const senha = document.getElementById("password").value.trim();
  const tipo = document.querySelector('input[name="tipo_usuario"]:checked');
  const erro = document.getElementById("erro");

  // Limpa mensagem anterior e exibe carregamento
  erro.textContent = "";
  showLoading(true);

  // Validações extras
  if (!validateEmail(email)) {
    showError("E-mail inválido.");
    return;
  }

  if (nome.length < 3) {
    showError("Nome de usuário deve ter ao menos 3 caracteres.");
    return;
  }

  if (!validatePassword(senha)) {
    showError("A senha deve conter ao menos 6 caracteres, uma letra maiúscula, uma minúscula e um número.");
    return;
  }

  if (!tipo) {
    showError("Por favor, selecione se é Aluno ou Professor.");
    return;
  }

  const novoUsuario = {
    email,
    nome,
    senha,
    tipo: tipo.value
  };

  try {
    const responseCheck = await fetch(`http://localhost:3000/usuarios?email=${email}`);
    const usuarios = await responseCheck.json();

    if (usuarios.length > 0) {
      showError("Este e-mail já está cadastrado.");
      return;
    }

    const response = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(novoUsuario)
    });

    if (!response.ok) {
      throw new Error("Erro ao cadastrar usuário.");
    }

    alert("Cadastro realizado com sucesso! Faça login.");
    window.location.href = "/src/login/index.html";

  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    showError("Erro ao cadastrar. Tente novamente.");
  } finally {
    showLoading(false);
  }
});

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
}

function showError(msg) {
  const erro = document.getElementById("erro");
  erro.textContent = msg;
  showLoading(false);
}

function showLoading(show) {
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.background = "rgba(255,255,255,0.7) url('/src/img/loader.svg') no-repeat center center";
    loader.style.zIndex = "1000";
    document.body.appendChild(loader);
  }
  loader.style.display = show ? "block" : "none";
}
