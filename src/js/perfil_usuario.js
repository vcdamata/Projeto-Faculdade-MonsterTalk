/**
 * @file perfil_usuario.js
 * @description Gerencia funcionalidades da página de edição de perfil,
 * incluindo carregamento de dados, seleção de avatar, e salvamento de alterações, usando SweetAlert2.
 */

const API_URL = "http://localhost:3000/usuarios";
let usuarioAtual = null;
let avatarSelecionadoUrl = null;

const avatarAtualPreviewEl = document.getElementById("avatarAtualPreview");
const avatarGridEl = document.getElementById("avatarGrid");
const NUM_AVATARES = 28;

/**
 * Popula a grade de seleção com as opções de avatar.
 */
function popularGradeAvatares() {
  if (!avatarGridEl) return;
  avatarGridEl.innerHTML = '';

  for (let i = 1; i <= NUM_AVATARES; i++) {
    const avatarNumero = i.toString().padStart(2, '0');
    const url = `/src/img/perfil_avatar/avatar_${avatarNumero}.svg`;

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Avatar ${avatarNumero}`;
    img.classList.add('avatar-option');
    img.dataset.avatarUrl = url;

    img.addEventListener('click', () => {
      const avataresAtuais = avatarGridEl.querySelectorAll('.avatar-option');
      avataresAtuais.forEach(a => a.classList.remove('selected'));

      img.classList.add('selected');
      avatarSelecionadoUrl = url;

      if (avatarAtualPreviewEl) {
        avatarAtualPreviewEl.src = url;
      }
    });
    avatarGridEl.appendChild(img);
  }
}

/**
 * Carrega os dados do usuário atual e preenche o formulário.
 */
async function carregarDadosUsuario() {
  try {
    const usuarioLogadoStorage = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogadoStorage?.id) {
      await Swal.fire({
        icon: 'error',
        title: 'Não autenticado',
        text: 'Você precisa estar logado para acessar esta página. Redirecionando...',
        timer: 3000,
        timerProgressBar: true,
        willClose: () => {
          window.location.href = "/src/index.html";
        }
      });
      return;
    }

    const response = await fetch(`${API_URL}/${usuarioLogadoStorage.id}`);
    if (!response.ok) {
      throw new Error("Falha ao carregar dados do usuário da API.");
    }
    usuarioAtual = await response.json();

    document.getElementById("nome").value = usuarioAtual.nome || '';
    document.getElementById("email").value = usuarioAtual.email || '';

    avatarSelecionadoUrl = usuarioAtual.avatarUrl || '/src/img/perfil_avatar/avatar_01.svg';
    if (avatarAtualPreviewEl) {
      avatarAtualPreviewEl.src = avatarSelecionadoUrl;
    }

    const avataresNaGrade = avatarGridEl.querySelectorAll('.avatar-option');
    avataresNaGrade.forEach(img => {
      if (img.dataset.avatarUrl === avatarSelecionadoUrl) {
        img.classList.add('selected');
      } else {
        img.classList.remove('selected');
      }
    });

  } catch (err) {
    console.error("Erro ao carregar dados do usuário:", err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Ocorreu um erro ao carregar seus dados. Por favor, tente recarregar a página.',
    });
  }
}

/**
 * Salva as alterações feitas no formulário de perfil.
 */
async function salvarAlteracoes(e) {
  e.preventDefault();

  try {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senhaAtualInput = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;

    if (!usuarioAtual) {
      Swal.fire('Erro', 'Dados do usuário não carregados. Tente recarregar a página.', 'error');
      return;
    }

    if (senhaAtualInput !== usuarioAtual.senha) {
      Swal.fire('Atenção', 'Senha atual incorreta. As alterações não foram salvas.', 'warning');
      return;
    }

    const dadosAtualizados = {
      ...usuarioAtual,
      nome: nome,
      email: email,
      avatarUrl: avatarSelecionadoUrl
    };

    if (novaSenha.trim() !== "") {
      dadosAtualizados.senha = novaSenha;
    }

    const response = await fetch(`${API_URL}/${usuarioAtual.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao atualizar perfil na API.");
    }
    const usuarioSalvo = await response.json();

    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSalvo));
    usuarioAtual = usuarioSalvo;

    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Seu perfil foi atualizado.',
      timer: 1500,
      showConfirmButton: false
    });

  } catch (err) {
    console.error("Erro ao salvar alterações:", err);
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Salvar',
      text: `Ocorreu um erro: ${err.message}`,
    });
  } finally {
    document.getElementById("senhaAtual").value = '';
    document.getElementById("novaSenha").value = '';
  }
}

/**
 * Exclui a conta do usuário com confirmação.
 */
async function excluirConta() {
  if (!usuarioAtual) {
    Swal.fire('Erro', 'Não foi possível identificar o usuário para exclusão.', 'error');
    return;
  }

  const result = await Swal.fire({
    title: 'Você tem certeza?',
    text: "Esta ação não pode ser desfeita! Todos os seus dados serão perdidos.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, excluir minha conta!',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/${usuarioAtual.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Falha ao comunicar com o servidor para excluir a conta.");
      }
      localStorage.removeItem("usuarioLogado");

      await Swal.fire(
        'Excluída!',
        'Sua conta foi excluída com sucesso.',
        'success'
      );
      window.location.href = "/src/index.html";

    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      Swal.fire('Erro', 'Ocorreu um erro ao tentar excluir sua conta.', 'error');
    }
  }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  popularGradeAvatares();
  carregarDadosUsuario();

  const form = document.getElementById("formEditarPerfil");
  if (form) {
    form.addEventListener("submit", salvarAlteracoes);
  }

  const btnExcluir = document.getElementById("btnExcluirConta");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", excluirConta);
  }
});
