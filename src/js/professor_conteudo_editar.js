/**
 * @file professor_conteudo_editar.js
 * @description Lógica para a página de edição de conteúdo educacional pelo professor.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_CONTEUDOS_PROFESSOR = "http://localhost:3000/conteudos_professor";
let quillEditorConteudoEditar;
let conteudoASerEditadoId = null;

// --- ELEMENTOS DO DOM ---
const formEditarConteudoEl = document.getElementById('formEditarConteudo');
const conteudoIdInputEl = document.getElementById('conteudoId');
const conteudoTituloEl = document.getElementById('conteudoTitulo');
const conteudoNivelEl = document.getElementById('conteudoNivel');
const conteudoDescricaoEl = document.getElementById('conteudoDescricao');
const quillEditorDivEditar = document.getElementById('quill-editor-conteudo-editar');
const btnCancelarEdicaoConteudoEl = document.getElementById('btnCancelarEdicaoConteudo');

const loadingMessageEl = document.getElementById('loading-message-editar-conteudo');
const errorMessageEl = document.getElementById('error-message-editar-conteudo');

// --- FUNÇÕES DE UI ---
function mostrarLoadingConteudo(mostrar, mensagem = "Carregando...") {
  if (loadingMessageEl) {
    loadingMessageEl.textContent = mensagem;
    loadingMessageEl.classList.toggle('hidden', !mostrar);
  }
  if (formEditarConteudoEl) formEditarConteudoEl.classList.toggle('hidden', mostrar);
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
}

function mostrarErroConteudo(mensagem) {
  if (errorMessageEl) {
    errorMessageEl.textContent = mensagem;
    errorMessageEl.classList.remove('hidden');
  }
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (formEditarConteudoEl) formEditarConteudoEl.classList.add('hidden');
}

// --- FUNÇÕES DO EDITOR QUILL ---
function inicializarQuillConteudoEditar(conteudoInicial = '') {
  if (!quillEditorDivEditar) {
    console.error("Elemento para o editor Quill não encontrado."); return;
  }
  quillEditorConteudoEditar = new Quill(quillEditorDivEditar, {
    theme: 'snow', modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }], ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }], [{ 'align': [] }],
        ['link', 'image', 'video'], [{ 'color': [] }, { 'background': [] }], ['clean']
      ]
    },
    placeholder: 'Digite ou cole o conteúdo educacional aqui...'
  });
  if (conteudoInicial) {
    quillEditorConteudoEditar.root.innerHTML = conteudoInicial;
  }
}

// --- CARREGAR E POPULAR DADOS ---
async function carregarConteudoParaEdicao() {
  const urlParams = new URLSearchParams(window.location.search);
  conteudoASerEditadoId = urlParams.get('id');

  if (!conteudoASerEditadoId) {
    mostrarErroConteudo("ID do conteúdo não fornecido."); return;
  }
  mostrarLoadingConteudo(true, "Carregando conteúdo para edição...");

  try {
    const response = await fetch(`${API_URL_CONTEUDOS_PROFESSOR}/${conteudoASerEditadoId}`);
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados do conteúdo (ID: ${conteudoASerEditadoId}).`);
    }
    const conteudoData = await response.json();

    if (conteudoIdInputEl) conteudoIdInputEl.value = conteudoData.id;
    if (conteudoTituloEl) conteudoTituloEl.value = conteudoData.titulo;
    if (conteudoNivelEl) conteudoNivelEl.value = conteudoData.nivel;
    if (conteudoDescricaoEl) conteudoDescricaoEl.value = conteudoData.descricao;

    // Inicializa o Quill DEPOIS de garantir que o div existe e ANTES de tentar setar o conteúdo
    if (quillEditorDivEditar && !quillEditorConteudoEditar) { // Só inicializa se não foi inicializado ainda
      inicializarQuillConteudoEditar(conteudoData.conteudoHtml);
    } else if (quillEditorConteudoEditar) { // Se já inicializado, apenas seta o conteúdo
      quillEditorConteudoEditar.root.innerHTML = conteudoData.conteudoHtml;
    }

    mostrarLoadingConteudo(false);

  } catch (error) {
    console.error("Erro ao carregar conteúdo para edição:", error);
    mostrarErroConteudo(`Não foi possível carregar o conteúdo: ${error.message}`);
  }
}

// --- SALVAR ALTERAÇÕES ---
async function handleSalvarEdicaoConteudo(e) {
  e.preventDefault();

  const professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!professorLogado || professorLogado.tipo !== 'professor') {
    Swal.fire('Erro', 'Acesso negado.', 'error'); return;
  }

  let conteudoHtmlEditado = "";
  if (quillEditorConteudoEditar && (quillEditorConteudoEditar.getLength() > 1 || quillEditorConteudoEditar.getText().trim() !== "")) {
    conteudoHtmlEditado = quillEditorConteudoEditar.root.innerHTML;
  }

  if (!conteudoTituloEl.value.trim() || !conteudoDescricaoEl.value.trim() || !conteudoHtmlEditado || conteudoHtmlEditado === "<p><br></p>") {
    Swal.fire('Atenção', 'Título, Descrição e Conteúdo Principal são obrigatórios.', 'warning'); return;
  }

  const conteudoEditado = {
    id: conteudoASerEditadoId,
    professorId: professorLogado.id,
    titulo: conteudoTituloEl.value.trim(),
    nivel: conteudoNivelEl.value,
    descricao: conteudoDescricaoEl.value.trim(),
    conteudoHtml: conteudoHtmlEditado,
    dataModificacao: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_URL_CONTEUDOS_PROFESSOR}/${conteudoASerEditadoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conteudoEditado)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido." }));
      throw new Error(errorData.message || `Erro ${response.status}.`);
    }
    await Swal.fire('Sucesso!', 'Conteúdo atualizado com sucesso!', 'success');
    window.location.href = '/src/dashboard_professor/licoes/index.html';
  } catch (error) {
    console.error("Erro ao salvar alterações do conteúdo:", error);
    Swal.fire('Erro', `Não foi possível salvar: ${error.message}`, 'error');
  } finally {
    mostrarLoadingConteudo(false);
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Quill primeiro, pois carregarConteudoParaEdicao pode precisar dele
  if (quillEditorDivEditar) { // Garante que o div exista antes de tentar inicializar
    inicializarQuillConteudoEditar();
  } else {
    mostrarErroConteudo("Erro crítico: Contêiner do editor não encontrado.");
    return; // Interrompe se o editor não pode ser criado
  }

  carregarConteudoParaEdicao();

  if (formEditarConteudoEl) {
    formEditarConteudoEl.addEventListener('submit', handleSalvarEdicaoConteudo);
  }
  if (btnCancelarEdicaoConteudoEl) {
    btnCancelarEdicaoConteudoEl.addEventListener('click', () => {
      window.location.href = '/src/dashboard_professor/licoes/index.html';
    });
  }
});
