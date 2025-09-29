/**
 * @file professor_criar_conteudo.js
 * @description Lógica para a página de criação de conteúdo educacional pelo professor.
 * Inclui inicialização do editor Quill e submissão dos dados para a API.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_CONTEUDOS_PROFESSOR = "http://localhost:3000/conteudos_professor";
let quillEditorConteudo; // Referência para a instância única do Quill

// --- ELEMENTOS DO DOM ---
const formCriarConteudoEl = document.getElementById('formCriarConteudo');
const conteudoTituloEl = document.getElementById('conteudoTitulo');
const conteudoNivelEl = document.getElementById('conteudoNivel');
const conteudoDescricaoEl = document.getElementById('conteudoDescricao');
const quillEditorDiv = document.getElementById('quill-editor-conteudo');

// --- FUNÇÕES DO EDITOR QUILL ---

/**
 * Inicializa o editor Quill principal para o conteúdo.
 */
function inicializarQuillConteudo() {
  if (!quillEditorDiv) {
    console.error("Elemento para o editor Quill principal não encontrado.");
    Swal.fire('Erro Crítico', 'Não foi possível carregar o editor de conteúdo.', 'error');
    return;
  }

  quillEditorConteudo = new Quill(quillEditorDiv, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ]
    },
    placeholder: 'Digite ou cole o conteúdo educacional aqui...'
  });
  console.log("Editor Quill para conteúdo principal inicializado.");
}

// --- SUBMISSÃO DO FORMULÁRIO ---

/**
 * Coleta os dados do formulário de conteúdo e os envia para a API.
 * @async
 * @param {Event} e - O evento de submit do formulário.
 */
async function handleSalvarConteudo(e) {
  e.preventDefault();


  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.tipo !== 'professor') {
    Swal.fire('Erro', 'Apenas professores logados podem criar conteúdo.', 'error');

    return;
  }

  const titulo = conteudoTituloEl.value.trim();
  const nivel = conteudoNivelEl.value;
  const descricao = conteudoDescricaoEl.value.trim();
  let conteudoHtml = "";

  if (quillEditorConteudo) {
    if (quillEditorConteudo.getLength() > 1 || quillEditorConteudo.getText().trim() !== "") {
      conteudoHtml = quillEditorConteudo.root.innerHTML;
    }
  }

  if (!titulo || !descricao || !conteudoHtml || conteudoHtml === "<p><br></p>") {
    Swal.fire('Atenção', 'Todos os campos (Título, Descrição e Conteúdo Principal) são obrigatórios.', 'warning');

    return;
  }

  const novoConteudo = {
    id: `cont_prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    professorId: usuarioLogado.id,
    titulo: titulo,
    nivel: nivel,
    descricao: descricao,
    conteudoHtml: conteudoHtml,
    dataCriacao: new Date().toISOString()
  };

  console.log("Enviando conteúdo para API:", novoConteudo);

  try {
    const response = await fetch(API_URL_CONTEUDOS_PROFESSOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoConteudo)
    });

    console.log("Resposta do servidor (status):", response.status, response.statusText);

    if (!response.ok) {
      // Sempre tenta ler como texto para evitar exceções não tratadas
      const textError = await response.text();
      console.error("Resposta de erro da API (Texto):", textError);
      const errorDetails = textError.substring(0, 200); // Limita o tamanho para não poluir o SweetAlert
      throw new Error(errorDetails);
    }

    // Se response.ok for true, esperamos um JSON com o objeto criado
    const dataSalva = await response.json();
    console.log("Conteúdo salvo com sucesso (resposta da API):", dataSalva);

    await Swal.fire('Sucesso!', 'Conteúdo salvo com sucesso!', 'success');
    formCriarConteudoEl.reset();
    if (quillEditorConteudo) {
      quillEditorConteudo.setText('');
    }

  } catch (error) {
    console.error("Erro ao salvar conteúdo (bloco catch principal):", error);
    Swal.fire('Erro', `Não foi possível salvar o conteúdo: ${error.message}`, 'error');
  } finally {
    console.log("Processo de salvamento concluído.");
  }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  console.log("[Criar Conteúdo] DOMContentLoaded - Configurando página.");

  inicializarQuillConteudo();

  if (formCriarConteudoEl) {
    formCriarConteudoEl.addEventListener('submit', handleSalvarConteudo);
  } else {
    console.error("Elemento do formulário 'formCriarConteudo' não encontrado.");
  }
});
