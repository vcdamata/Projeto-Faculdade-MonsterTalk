/**
 * @file login.js
 * @description Lida com a autenticação do usuário, validação de credenciais
 * com a API e redirecionamento com base no tipo de usuário, utilizando SweetAlert2
 * para feedback visual.
 */

// Importa as funções necessárias do nosso arquivo de utilidades.
import { showLoading, showError } from './utils.js';

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    showLoading(true);

    try {
      // Faz a requisição para a API buscando um usuário com o email E senha correspondentes.
      const response = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`);
      const data = await response.json();

      // Se o array retornado estiver vazio, as credenciais estão incorretas.
      // A função showError (já com SweetAlert) é chamada.
      if (data.length === 0) {
        showError("E-mail ou senha inválidos.");
        return;
      }

      const usuario = data[0];

      // Armazena os dados do usuário logado no localStorage.
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

      // Oculta o loader um pouco antes de mostrar o alerta de sucesso.
      showLoading(false);

      // Exibe um alerta de sucesso com um timer para uma experiência mais fluida.
      await Swal.fire({
        icon: 'success',
        title: 'Login efetuado!',
        text: 'Você será redirecionado para o seu painel.',
        timer: 2000, // O alerta fechará sozinho após 2 segundos.
        showConfirmButton: false // Oculta o botão "OK".
      });

      // Após o alerta fechar, o redirecionamento ocorre.
      if (usuario.tipo === "aluno") {
        window.location.href = "/src/dashboard_aluno/index.html";
      } else if (usuario.tipo === "professor") {
        window.location.href = "/src/dashboard_professor/index.html";
      } else {
        // Caso de segurança se o tipo de usuário for desconhecido.
        showError("Tipo de usuário desconhecido.");
      }

    } catch (err) {
      console.error("Erro na requisição de login:", err);
      showError("Erro ao conectar com o servidor.");

    }
  });
} else {
  console.error("ERRO CRÍTICO: O elemento do formulário com ID 'loginForm' não foi encontrado no DOM.");
}