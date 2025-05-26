const API_URL = "http://localhost:3000/usuarios";
let usuarioAtual = null;

// Função para carregar os dados do usuário atual
function carregarDadosUsuario() {
  // CORREÇÃO: Pega o objeto 'usuarioLogado' e extrai o ID dele
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado?.id) {
    alert("Usuário não autenticado. Redirecionando para a página inicial.");
    window.location.href = "/src/index.html"; // Redireciona se não houver usuário
    return;
  }

  const usuarioId = usuarioLogado.id;

  fetch(`${API_URL}/${usuarioId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Falha ao carregar dados do usuário.");
      }
      return res.json();
    })
    .then((usuario) => {
      usuarioAtual = usuario;
      // Preenche o formulário com os dados atuais do usuário
      document.getElementById("nome").value = usuario.nome;
      document.getElementById("email").value = usuario.email;
    })
    .catch((err) => {
      console.error("Erro ao carregar dados do usuário:", err);
      alert("Erro ao carregar dados do usuário.");
    });
}

// Função para salvar alterações no perfil
function salvarAlteracoes(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senhaAtual = document.getElementById("senhaAtual").value;
  const novaSenha = document.getElementById("novaSenha").value;

  // Validação: verifica se o objeto do usuário foi carregado
  if (!usuarioAtual) {
    alert("Erro: Dados do usuário não carregados. Tente recarregar a página.");
    return;
  }

  // Validação: compara a senha digitada com a senha armazenada
  if (senhaAtual !== usuarioAtual.senha) {
    alert("Senha atual incorreta.");
    return;
  }

  // Prepara os dados para a atualização
  const dadosAtualizados = {
    ...usuarioAtual, // Mantém dados existentes como 'id' e 'tipo'
    nome: nome,
    email: email,
  };

  // MELHORIA: Só atualiza a senha se uma nova senha for fornecida
  if (novaSenha.trim() !== "") {
    dadosAtualizados.senha = novaSenha;
  } else {
    dadosAtualizados.senha = usuarioAtual.senha; // Mantém a senha antiga
  }


  fetch(`${API_URL}/${usuarioAtual.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosAtualizados),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      return res.json();
    })
    .then((usuarioAtualizado) => {
      // Atualiza o localStorage com os novos dados do usuário
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
      alert("Perfil atualizado com sucesso!");
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao atualizar o perfil.");
    });
}

// Função para excluir conta
function excluirConta() {
  if (!usuarioAtual) {
    alert("Não foi possível identificar o usuário para exclusão.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) return;

  fetch(`${API_URL}/${usuarioAtual.id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Falha ao excluir a conta.");
      localStorage.removeItem("usuarioLogado");
      alert("Conta excluída com sucesso.");
      window.location.href = "/src/index.html"; // Redireciona para a home
    })
    .catch((err) => {
      console.error("Erro ao excluir conta:", err);
      alert("Erro ao excluir conta.");
    });
}

// Eventos
window.addEventListener("DOMContentLoaded", carregarDadosUsuario);
document.getElementById("formEditarPerfil").addEventListener("submit", salvarAlteracoes);
document.getElementById("btnExcluirConta").addEventListener("click", excluirConta);