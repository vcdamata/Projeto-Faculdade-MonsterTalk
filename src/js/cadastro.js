/**
 * @file cadastro.js
 * @description Este arquivo é responsável por toda a lógica da página de cadastro de usuários.
 * Ele lida com a captura de dados do formulário, validação, comunicação com a API
 * para criar um novo usuário e feedback visual para o usuário.
 */

// --- Módulos e Dependências ---

// Importa funções utilitárias de um arquivo centralizado para evitar repetição de código.
import {
  showLoading,
  showError,
  validateEmail,
  validatePassword,
  getNextId
} from './utils.js';


// --- Lógica Principal ---

// Seleciona o formulário de cadastro no HTML.
const form = document.getElementById("cadastroForm");

// Garante que o código só tente adicionar o "ouvinte de evento" se o formulário realmente existir na página.
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. PREPARAÇÃO INICIAL
    // Pega o botão de submit para poder desabilitá-lo.
    const submitButton = form.querySelector('button[type="submit"]');

    // Desabilita o botão para impedir múltiplos envios.
    submitButton.disabled = true;
    showError("");
    showLoading(true);

    try {
      // 2. CAPTURA E VALIDAÇÃO DOS DADOS
      const email = document.getElementById("email").value.trim();
      const nome = document.getElementById("username").value.trim();
      const senha = document.getElementById("password").value.trim();
      const tipo = document.querySelector('input[name="tipo_usuario"]:checked');

      // ... suas validações (if !validateEmail, etc.) ...
      if (!validateEmail(email) || nome.length < 3 || !validatePassword(senha) || !tipo) {
        // Se houver erro de validação, a função para e o bloco 'finally' abaixo
        // irá reativar o botão para o usuário corrigir os dados.
        showError("Por favor, preencha todos os campos corretamente.");
        return;
      }

      // 3. PROCESSAMENTO E LÓGICA DE NEGÓCIO
      const responseCheck = await fetch(`http://localhost:3000/usuarios?email=${email}`);
      const usuariosExistentes = await responseCheck.json();

      if (usuariosExistentes.length > 0) {
        showError("Este e-mail já está cadastrado.");
        return;
      }

      const novoId = await getNextId("usuarios");
      const novoUsuario = {
        id: novoId.toString(),
        email,
        nome,
        senha,
        tipo: tipo.value
      };

      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
      });

      if (!response.ok) {
        throw new Error("A resposta da rede não foi 'ok'.");
      }

      // Sucesso! O botão não precisa ser reativado, pois haverá um redirecionamento.
      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Clique em OK para ir para a tela de login.',
        confirmButtonColor: '#6c40d4'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/src/login/index.html";
        }
      });

    } catch (err) {
      console.error("ERRO DURANTE O CADASTRO:", err);
      showError("Ocorreu um erro ao tentar realizar o cadastro.");

    } finally {
      // O bloco 'finally' sempre executa no final.
      // Reativa o botão APENAS se ele ainda estiver na página (ou seja, se não houve sucesso e redirecionamento).
      if (submitButton) {
        submitButton.disabled = false;
      }
      // Oculta o loader. showError já faz isso, mas aqui serve como uma garantia extra.
      showLoading(false);
    }
  });
}