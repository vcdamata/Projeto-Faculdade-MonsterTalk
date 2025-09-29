/**
 * @file professor_licao_criar.js
 * @description Lógica para a página de criação de novas lições pelo professor.
 * Inclui inicialização do editor Quill, adição/remoção dinâmica de perguntas,
 * e submissão dos dados da lição para a API.
 */

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_URL_LICOES_PROFESSOR = "http://localhost:3000/licoes_professor";
let perguntaIdCounter = 0; // Para dar IDs únicos aos campos de radio dentro de cada bloco de pergunta

// Armazena as instâncias do Quill. Em vez de um array simples,
// usaremos um Map para associar o elemento DOM do editor à sua instância Quill.
// Isso facilita a recuperação da instância correta.
const quillEditorsMap = new Map();

// --- ELEMENTOS DO DOM ---
const formCriarLicaoEl = document.getElementById('formCriarLicao');
const licaoTituloEl = document.getElementById('licaoTitulo');
const licaoNivelEl = document.getElementById('licaoNivel');
const licaoDescricaoEl = document.getElementById('licaoDescricao');
const perguntasContainerEl = document.getElementById('perguntasContainer');
const btnAdicionarPerguntaEl = document.getElementById('btnAdicionarPergunta');
const templatePerguntaEl = document.getElementById('templatePergunta');

// --- FUNÇÕES DO EDITOR QUILL ---

/**
 * Inicializa um editor Quill em um elemento container fornecido.
 * @param {HTMLElement} editorElement - O div que se tornará o editor Quill.
 */
function inicializarQuill(editorElement) {
  const editor = new Quill(editorElement, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    placeholder: 'Digite o enunciado da pergunta aqui...'
  });
  // Associa o elemento DOM do editor à sua instância Quill no Map
  quillEditorsMap.set(editorElement, editor);
}

// --- MANIPULAÇÃO DINÂMICA DE PERGUNTAS ---

/**
 * Adiciona um novo bloco de pergunta ao formulário.
 */
function adicionarNovaPergunta() {
  if (!templatePerguntaEl || !perguntasContainerEl) {
    console.error("Template de pergunta ou container não encontrado.");
    return;
  }

  const clone = templatePerguntaEl.content.cloneNode(true);
  const novoBlocoPergunta = clone.querySelector('.pergunta-bloco');

  const numeroPergunta = perguntasContainerEl.querySelectorAll('.pergunta-bloco').length + 1;
  novoBlocoPergunta.querySelector('.pergunta-numero').textContent = numeroPergunta;

  perguntaIdCounter++;
  const radios = novoBlocoPergunta.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.name = `respostaCorreta_${perguntaIdCounter}`;
  });

  // O editor Quill é inicializado no div com a classe 'quill-editor-container' DENTRO do novo bloco.
  // O template deve ter um único div com esta classe para cada pergunta.
  const quillEditorDivParaNovaPergunta = novoBlocoPergunta.querySelector('.quill-editor-container');
  if (quillEditorDivParaNovaPergunta) {
    // Importante: O Quill substitui o conteúdo do div.
    // Se o template tem <div class="quill-editor-container"></div>, é nele que o Quill é montado.
    // Não precisamos dar um ID único para o Quill, ele se anexa ao elemento.
    inicializarQuill(quillEditorDivParaNovaPergunta);
  } else {
    console.error("Div para o editor Quill não encontrado no template da pergunta!");
  }

  const btnRemover = novoBlocoPergunta.querySelector('.btn-remover-pergunta');
  if (btnRemover) {
    btnRemover.addEventListener('click', () => {
      // Ao remover, também precisamos limpar a referência do Quill no Map
      if (quillEditorDivParaNovaPergunta) {
        quillEditorsMap.delete(quillEditorDivParaNovaPergunta);
      }
      novoBlocoPergunta.remove();
      atualizarNumerosPerguntas();
    });
  }

  perguntasContainerEl.appendChild(novoBlocoPergunta);
}

function atualizarNumerosPerguntas() {
  const blocosPergunta = perguntasContainerEl.querySelectorAll('.pergunta-bloco');
  blocosPergunta.forEach((bloco, index) => {
    const spanNumero = bloco.querySelector('.pergunta-numero');
    if (spanNumero) {
      spanNumero.textContent = index + 1;
    }
  });
}

// --- SUBMISSÃO DO FORMULÁRIO ---
async function handleSalvarLicao(e) {
  e.preventDefault();

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.tipo !== 'professor') {
    Swal.fire('Erro', 'Apenas professores logados podem criar lições.', 'error');
    return;
  }

  const licao = {
    id: `prof_lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    professorId: usuarioLogado.id,
    titulo: licaoTituloEl.value.trim(),
    nivel: licaoNivelEl.value,
    descricao: licaoDescricaoEl.value.trim(),
    perguntas: [],
    dataCriacao: new Date().toISOString()
  };

  if (!licao.titulo || !licao.descricao) {
    Swal.fire('Atenção', 'Título e Descrição da Lição são obrigatórios.', 'warning');
    return;
  }

  const blocosPergunta = perguntasContainerEl.querySelectorAll('.pergunta-bloco');
  if (blocosPergunta.length === 0) {
    Swal.fire('Atenção', 'Adicione pelo menos uma pergunta à lição.', 'warning');
    return;
  }

  const perguntas = [];
  for (let index = 0; index < blocosPergunta.length; index++) {
    const bloco = blocosPergunta[index];
    const result = validarEConstruirPergunta(bloco, index);
    if (!result.valido) {
      return;
    }
    perguntas.push(result.pergunta);
  }

  licao.perguntas = perguntas;

  console.log("Enviando lição para API:", licao);

  try {
    const response = await fetch(API_URL_LICOES_PROFESSOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(licao)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao salvar lição." }));
      throw new Error(errorData.message || `Erro ${response.status} ao salvar a lição.`);
    }

    await Swal.fire('Sucesso!', 'Lição salva com sucesso!', 'success');
    formCriarLicaoEl.reset();
    perguntasContainerEl.innerHTML = '';
    quillEditorsMap.clear(); // Limpa o Map de instâncias do Quill
    adicionarNovaPergunta(); // Adiciona um bloco de pergunta vazio

  } catch (error) {
    console.error("Erro ao salvar lição:", error);
    Swal.fire('Erro', `Não foi possível salvar a lição: ${error.message}`, 'error');
  }
}

/**
 * Valida e constrói uma pergunta a partir do bloco DOM.
 * @param {HTMLElement} bloco
 * @param {number} index
 * @returns {{valido: boolean, pergunta?: object}}
 */
function validarEConstruirPergunta(bloco, index) {
  const quillEditorDiv = bloco.querySelector('.quill-editor-container');
  const quillInstance = quillEditorsMap.get(quillEditorDiv);

  let enunciadoHtml = "";
  if (quillInstance) {
    if (quillInstance.getLength() > 1 || quillInstance.getText().trim() !== "") {
      enunciadoHtml = quillInstance.root.innerHTML;
    }
  } else {
    console.error(`Instância Quill não encontrada para pergunta ${index + 1}`);
    Swal.fire('Erro', `Erro ao processar enunciado da pergunta ${index + 1}.`, 'error');
    return { valido: false };
  }

  if (enunciadoHtml.trim() === "" || enunciadoHtml === "<p><br></p>") {
    Swal.fire('Atenção', `O enunciado da pergunta ${index + 1} não pode estar vazio.`, 'warning');
    return { valido: false };
  }

  const tipoPergunta = bloco.querySelector('.pergunta-tipo').value;
  const recursoUrl = bloco.querySelector('.pergunta-recurso-url').value.trim() || null;

  const palavrasChaveInput = bloco.querySelector('.pergunta-palavras-chave').value.trim();
  const palavrasChaveArray = palavrasChaveInput.split(',')
    .map(par => {
      const [word, traducao] = par.split(':').map(s => s.trim());
      return (word && traducao) ? { word, traducao } : null;
    })
    .filter(obj => obj !== null);

  const opcoes = [];
  const inputsOpcaoTexto = bloco.querySelectorAll('.opcao-texto');
  const inputsOpcaoImagemUrl = bloco.querySelectorAll('.opcao-imagem-url');
  let respostaCorretaIndex = -1;
  const radiosResposta = bloco.querySelectorAll(`input[type="radio"][name^="respostaCorreta_"]`);

  radiosResposta.forEach(radio => {
    if (radio.checked) {
      respostaCorretaIndex = parseInt(radio.value);
    }
  });

  if (respostaCorretaIndex === -1) {
    Swal.fire('Atenção', `Selecione uma resposta correta para a pergunta ${index + 1}.`, 'warning');
    return { valido: false };
  }

  for (let i = 0; i < 4; i++) {
    const texto = inputsOpcaoTexto[i].value.trim();
    const imagemUrl = inputsOpcaoImagemUrl[i].value.trim() || null;
    if (!texto && tipoPergunta === 'multipla-escolha') {
      Swal.fire('Atenção', `O texto da opção ${i + 1} na pergunta ${index + 1} não pode estar vazio.`, 'warning');
      return { valido: false };
    }
    if (tipoPergunta === 'multipla-escolha-imagem' && !imagemUrl && !texto) {
      Swal.fire('Atenção', `A opção ${i + 1} na pergunta ${index + 1} precisa de um texto ou URL de imagem.`, 'warning');
      return { valido: false };
    }
    opcoes.push({ texto: texto || null, imagemUrl });
  }

  return {
    valido: true,
    pergunta: {
      id: index + 1,
      tipo: tipoPergunta,
      enunciado: enunciadoHtml,
      recursoUrl: recursoUrl,
      palavrasChave: palavrasChaveArray,
      opcoes: opcoes,
      respostaCorretaIndex: respostaCorretaIndex
    }
  };
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  if (!templatePerguntaEl) {
    console.error("FATAL: Template de pergunta não encontrado.");
    Swal.fire('Erro Crítico', 'O template para adicionar perguntas não foi encontrado.', 'error');
    return;
  }

  adicionarNovaPergunta(); // Adiciona a primeira pergunta ao carregar

  if (btnAdicionarPerguntaEl) {
    btnAdicionarPerguntaEl.addEventListener('click', adicionarNovaPergunta);
  }

  if (formCriarLicaoEl) {
    formCriarLicaoEl.addEventListener('submit', handleSalvarLicao);
  }
});
