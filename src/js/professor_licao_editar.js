/**
 * @file professor_licao_editar.js
 * @description Lógica para a página de edição de lições existentes pelo professor.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_LICOES_PROFESSOR = "http://localhost:3000/licoes_professor";
let perguntaIdCounter = 0;
const quillEditorsMap = new Map();
let licaoASerEditadaId = null; // Guarda o ID da lição carregada

// --- ELEMENTOS DO DOM ---
const formEditarLicaoEl = document.getElementById('formEditarLicao');
const licaoIdInputEl = document.getElementById('licaoId'); // Input hidden
const licaoTituloEl = document.getElementById('licaoTitulo');
const licaoNivelEl = document.getElementById('licaoNivel');
const licaoDescricaoEl = document.getElementById('licaoDescricao');
const perguntasContainerEl = document.getElementById('perguntasContainerEditar'); // Container específico
const btnAdicionarPerguntaEl = document.getElementById('btnAdicionarPerguntaEditar');
const templatePerguntaEl = document.getElementById('templatePergunta');
const btnCancelarEdicaoEl = document.getElementById('btnCancelarEdicaoLicao');

const loadingMessageEl = document.getElementById('loading-message-editar-licao');
const errorMessageEl = document.getElementById('error-message-editar-licao');

// --- FUNÇÕES DE UI ---
function mostrarLoading(mostrar, mensagem = "Carregando...") {
  if (loadingMessageEl) {
    loadingMessageEl.textContent = mensagem;
    loadingMessageEl.classList.toggle('hidden', !mostrar);
  }
  if (formEditarLicaoEl) formEditarLicaoEl.classList.toggle('hidden', mostrar); // Esconde form durante loading
  if (errorMessageEl) errorMessageEl.classList.add('hidden');
}

function mostrarErro(mensagem) {
  if (errorMessageEl) {
    errorMessageEl.textContent = mensagem;
    errorMessageEl.classList.remove('hidden');
  }
  if (loadingMessageEl) loadingMessageEl.classList.add('hidden');
  if (formEditarLicaoEl) formEditarLicaoEl.classList.add('hidden');
}


// --- FUNÇÕES DO EDITOR QUILL (Reutilizadas de criar_licao.js, mas adaptadas se necessário) ---
function inicializarQuill(editorElement, conteudoInicial = '') {
  const editor = new Quill(editorElement, {
    theme: 'snow', modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }], [{ 'align': [] }],
        ['link', 'image', 'video'], ['clean']
      ]
    },
    placeholder: 'Digite o enunciado da pergunta aqui...'
  });
  if (conteudoInicial) {
    editor.root.innerHTML = conteudoInicial; // Define o conteúdo inicial
  }
  quillEditorsMap.set(editorElement, editor);
}

// --- MANIPULAÇÃO DINÂMICA DE PERGUNTAS ---
/**
 * Adiciona um bloco de pergunta ao formulário, opcionalmente preenchendo com dados existentes.
 * @param {object|null} perguntaData - Dados da pergunta para preencher (se editando).
 */
function adicionarBlocoPergunta(perguntaData = null) {
  if (!templatePerguntaEl || !perguntasContainerEl) return;

  const clone = templatePerguntaEl.content.cloneNode(true);
  const novoBlocoPergunta = clone.querySelector('.pergunta-bloco');
  const numeroPergunta = perguntasContainerEl.querySelectorAll('.pergunta-bloco').length + 1;
  novoBlocoPergunta.querySelector('.pergunta-numero').textContent = numeroPergunta;

  perguntaIdCounter++;
  const radioGroupName = `respostaCorreta_edit_${perguntaIdCounter}`;
  novoBlocoPergunta.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.name = radioGroupName;
  });

  const quillEditorDiv = novoBlocoPergunta.querySelector('.quill-editor-container');
  inicializarQuill(quillEditorDiv, perguntaData ? perguntaData.enunciado : '');

  // Preenche os campos se perguntaData for fornecido
  if (perguntaData) {
    novoBlocoPergunta.querySelector('.pergunta-tipo').value = perguntaData.tipo || 'multipla-escolha';
    novoBlocoPergunta.querySelector('.pergunta-recurso-url').value = perguntaData.recursoUrl || '';

    const palavrasChaveStr = (perguntaData.palavrasChave || []).map(pc => `${pc.word}:${pc.traducao}`).join(', ');
    novoBlocoPergunta.querySelector('.pergunta-palavras-chave').value = palavrasChaveStr;

    const inputsOpcaoTexto = novoBlocoPergunta.querySelectorAll('.opcao-texto');
    const inputsOpcaoImagemUrl = novoBlocoPergunta.querySelectorAll('.opcao-imagem-url');
    (perguntaData.opcoes || []).forEach((opcao, i) => {
      if (inputsOpcaoTexto[i]) inputsOpcaoTexto[i].value = opcao.texto || '';
      if (inputsOpcaoImagemUrl[i]) inputsOpcaoImagemUrl[i].value = opcao.imagemUrl || '';
    });

    if (perguntaData.respostaCorretaIndex !== undefined && perguntaData.respostaCorretaIndex !== null) {
      const radioCorreto = novoBlocoPergunta.querySelector(`input[type="radio"][name="${radioGroupName}"][value="${perguntaData.respostaCorretaIndex}"]`);
      if (radioCorreto) radioCorreto.checked = true;
    }
  }

  novoBlocoPergunta.querySelector('.btn-remover-pergunta').addEventListener('click', () => {
    if (quillEditorDiv) quillEditorsMap.delete(quillEditorDiv);
    novoBlocoPergunta.remove();
    atualizarNumerosPerguntasEditar();
  });

  perguntasContainerEl.appendChild(novoBlocoPergunta);
}

function atualizarNumerosPerguntasEditar() {
  perguntasContainerEl.querySelectorAll('.pergunta-bloco').forEach((bloco, index) => {
    bloco.querySelector('.pergunta-numero').textContent = index + 1;
  });
}

// --- CARREGAR E POPULAR DADOS DA LIÇÃO ---
/**
 * Busca os dados da lição pelo ID e popula o formulário.
 * @async
 */
async function carregarLicaoParaEdicao() {
  const urlParams = new URLSearchParams(window.location.search);
  licaoASerEditadaId = urlParams.get('id');

  if (!licaoASerEditadaId) {
    mostrarErro("ID da lição não fornecido na URL.");
    return;
  }
  mostrarLoading(true, "Carregando lição para edição...");

  try {
    const response = await fetch(`${API_URL_LICOES_PROFESSOR}/${licaoASerEditadaId}`);
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados da lição (ID: ${licaoASerEditadaId}). Status: ${response.status}`);
    }
    const licaoData = await response.json();

    if (licaoIdInputEl) licaoIdInputEl.value = licaoData.id; // Guarda o ID
    if (licaoTituloEl) licaoTituloEl.value = licaoData.titulo;
    if (licaoNivelEl) licaoNivelEl.value = licaoData.nivel;
    if (licaoDescricaoEl) licaoDescricaoEl.value = licaoData.descricao;

    // Limpa perguntas existentes (se houver) e o mapa de Quills antes de popular
    perguntasContainerEl.innerHTML = '';
    quillEditorsMap.clear();
    perguntaIdCounter = 0; // Reseta o contador para os nomes dos radios

    if (licaoData.perguntas && licaoData.perguntas.length > 0) {
      licaoData.perguntas.forEach(pergunta => {
        adicionarBlocoPergunta(pergunta);
      });
    } else {
      adicionarBlocoPergunta(); // Adiciona um bloco vazio se não houver perguntas
    }

    mostrarLoading(false); // Esconde loading, mostra formulário

  } catch (error) {
    console.error("Erro ao carregar lição para edição:", error);
    mostrarErro(`Não foi possível carregar a lição: ${error.message}`);
  }
}

// --- SALVAR ALTERAÇÕES ---
/**
 * Coleta os dados do formulário e envia uma requisição PUT para atualizar a lição.
 * @async
 * @param {Event} e - O evento de submit.
 */
async function handleSalvarEdicaoLicao(e) {
  e.preventDefault();
  // Idealmente: showLoading(true, "Salvando alterações...");

  const professorLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!professorLogado || professorLogado.tipo !== 'professor') {
    Swal.fire('Erro', 'Acesso negado.', 'error'); return;
  }

  const licaoEditada = {
    id: licaoASerEditadaId, // Usa o ID da lição que está sendo editada
    professorId: professorLogado.id, // Confirma o professorId
    titulo: licaoTituloEl.value.trim(),
    nivel: licaoNivelEl.value,
    descricao: licaoDescricaoEl.value.trim(),
    perguntas: [],
    // dataCriacao não é atualizada, mas dataModificacao poderia ser adicionada
    dataModificacao: new Date().toISOString()
  };

  if (!licaoEditada.titulo || !licaoEditada.descricao) {
    Swal.fire('Atenção', 'Título e Descrição são obrigatórios.', 'warning'); return;
  }

  const blocosPergunta = perguntasContainerEl.querySelectorAll('.pergunta-bloco');
  if (blocosPergunta.length === 0) {
    Swal.fire('Atenção', 'A lição deve ter pelo menos uma pergunta.', 'warning'); return;
  }

  let formularioValido = true;
  // Lógica de coleta de perguntas (similar à de criar_licao.js)
  for (let index = 0; index < blocosPergunta.length; index++) {
    const bloco = blocosPergunta[index];
    const quillEditorDiv = bloco.querySelector('.quill-editor-container');
    const quillInstance = quillEditorsMap.get(quillEditorDiv);
    let enunciadoHtml = "";

    if (quillInstance && (quillInstance.getLength() > 1 || quillInstance.getText().trim() !== "")) {
      enunciadoHtml = quillInstance.root.innerHTML;
    } else {
      Swal.fire('Atenção', `O enunciado da pergunta ${index + 1} não pode estar vazio.`, 'warning');
      formularioValido = false; break;
    }
    // ... (resto da coleta e validação de tipo, recurso, opções, resposta, palavrasChave) ...
    // Esta parte é idêntica à da função handleSalvarLicao em criar_licao.js
    // Exemplo simplificado:
    const tipoPergunta = bloco.querySelector('.pergunta-tipo').value;
    const opcoesTexto = Array.from(bloco.querySelectorAll('.opcao-texto')).map(input => input.value.trim());
    let respostaCorretaIndex = -1;
    const radios = bloco.querySelectorAll('input[type="radio"][name^="respostaCorreta_edit_"]');
    radios.forEach(radio => { if (radio.checked) respostaCorretaIndex = parseInt(radio.value); });

    if (respostaCorretaIndex === -1) { /* ... validação ... */ formularioValido = false; break; }
    // Adicione validações para as opções aqui...

    licaoEditada.perguntas.push({
      id: index + 1, // Reatribui IDs sequenciais
      tipo: tipoPergunta,
      enunciado: enunciadoHtml,
      recursoUrl: bloco.querySelector('.pergunta-recurso-url').value.trim() || null,
      palavrasChave: (bloco.querySelector('.pergunta-palavras-chave').value.trim().split(',')
        .map(par => { const [word, traducao] = par.split(':').map(s => s.trim()); return (word && traducao) ? { word, traducao } : null; })
        .filter(obj => obj !== null)),
      opcoes: opcoesTexto.map((txt, i) => ({
        texto: txt,
        imagemUrl: bloco.querySelectorAll('.opcao-imagem-url')[i].value.trim() || null
      })),
      respostaCorretaIndex: respostaCorretaIndex
    });
  }


  if (!formularioValido) { /* ... showLoading(false); ... */ return; }

  console.log("Enviando alterações da lição para API:", licaoEditada);

  try {
    const response = await fetch(`${API_URL_LICOES_PROFESSOR}/${licaoASerEditadaId}`, {
      method: 'PUT', // USA PUT para atualizar
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(licaoEditada)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao salvar alterações." }));
      throw new Error(errorData.message || `Erro ${response.status} ao salvar alterações.`);
    }
    await Swal.fire('Sucesso!', 'Lição atualizada com sucesso!', 'success');
    // Opcional: redirecionar para a lista de "Minhas Lições"
    window.location.href = '/src/dashboard_professor/licoes/index.html';

  } catch (error) {
    console.error("Erro ao salvar alterações da lição:", error);
    Swal.fire('Erro', `Não foi possível salvar as alterações: ${error.message}`, 'error');
  } finally {
    // showLoading(false); // Garante que o loading seja escondido
  }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  if (!templatePerguntaEl) {
    mostrarErro("FATAL: Template de pergunta não encontrado.");
    return;
  }

  carregarLicaoParaEdicao(); // Carrega os dados da lição ao iniciar

  if (btnAdicionarPerguntaEl) {
    btnAdicionarPerguntaEl.addEventListener('click', () => adicionarBlocoPergunta(null)); // Adiciona bloco vazio
  }

  if (formEditarLicaoEl) {
    formEditarLicaoEl.addEventListener('submit', handleSalvarEdicaoLicao);
  }

  if (btnCancelarEdicaoEl) {
    btnCancelarEdicaoEl.addEventListener('click', () => {
      // Volta para a página de "Minhas Criações" ou outra página apropriada
      window.location.href = '/src/dashboard_professor/licoes/index.html';
    });
  }
});
