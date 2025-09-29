/**
 * @file aluno_licao_teste.js
 * @description Controla toda a lógica de uma lição/quiz, desde o carregamento
 * das perguntas até a exibição do resultado final. Também salva o progresso.
 */

// --- ELEMENTOS DO DOM ---
const licaoTituloEl = document.getElementById('licao-titulo');
const progressoBarraEl = document.getElementById('progresso-barra');
const perguntaEnunciadoEl = document.getElementById('pergunta-enunciado');
const opcoesContainerEl = document.getElementById('opcoes-container');
const btnProsseguirEl = document.getElementById('btn-prosseguir');
const perguntaRecursoContainerEl = document.getElementById('pergunta-recurso-container');

const fimLicaoOverlayEl = document.getElementById('fim-licao-overlay');
const fimLicaoTituloEl = document.getElementById('fim-licao-titulo');
const fimLicaoResultadoEl = document.getElementById('fim-licao-resultado');
const fimLicaoBtnEl = document.getElementById('fim-licao-btn');

// --- ESTADO DO QUIZ ---
let licaoAtual = null;
let perguntaAtualIndex = 0;
let acertos = 0;
let respostaSelecionada = false;
let palavrasChaveAcertadasNestaLicao = [];


// --- INICIALIZAÇÃO ---
async function iniciarLicao() {
  const urlParams = new URLSearchParams(window.location.search);
  const licaoId = urlParams.get('id');
  const tipoLicao = urlParams.get('tipo'); // Pega o tipo da lição da URL

  if (!licaoId) {
    console.error('ID da lição não encontrado.');
    window.location.href = '/src/dashboard_aluno/index.html';
    return;
  }

  let apiUrl = '';
  // Constrói a URL da API baseada no tipo de lição
  if (tipoLicao === 'professor') {
    apiUrl = `http://localhost:3000/licoes_professor/${licaoId}`;
  } else if (tipoLicao === 'plataforma' || !tipoLicao) { // Se tipo não especificado, assume plataforma
    apiUrl = `http://localhost:3000/licoes/${licaoId}`;
  } else {
    // Usar um modal customizado em vez de alert
    console.error('Tipo de lição desconhecido.');
    window.location.href = '/src/dashboard_aluno/index.html';
    return;
  }

  console.log("Tentando carregar lição de:", apiUrl); // Log para depuração

  try {
    const response = await fetch(apiUrl); // Usa a URL construída
    if (!response.ok) {
      console.error(`Falha ao carregar ${apiUrl}. Status: ${response.status} ${response.statusText}`);
      let errorBody = await response.text();
      console.error("Corpo da resposta do erro:", errorBody);
      throw new Error('Não foi possível carregar os dados da lição da API.');
    }
    licaoAtual = await response.json();

    perguntaAtualIndex = 0;
    acertos = 0;
    palavrasChaveAcertadasNestaLicao = [];
    mostrarPergunta();

  } catch (error) {
    console.error("Erro ao iniciar lição:", error);
  }
}

// --- RENDERIZAÇÃO DA INTERFACE ---
function mostrarPergunta() {
  respostaSelecionada = false;
  if (!licaoAtual?.perguntas?.[perguntaAtualIndex]) {
    console.error("Dados da lição ou pergunta atual estão ausentes/inválidos.", licaoAtual, perguntaAtualIndex);
    return;
  }
  const pergunta = licaoAtual.perguntas[perguntaAtualIndex];

  licaoTituloEl.textContent = licaoAtual.titulo;
  const progressoPercentual = ((perguntaAtualIndex) / licaoAtual.perguntas.length) * 100;
  progressoBarraEl.style.width = `${progressoPercentual}%`;

  if (perguntaRecursoContainerEl) {
    perguntaRecursoContainerEl.innerHTML = '';
  }

  // Usar innerHTML para renderizar o conteúdo HTML do enunciado da pergunta
  // que vem do editor Quill.
  if (perguntaEnunciadoEl && pergunta.enunciado) {
    perguntaEnunciadoEl.innerHTML = pergunta.enunciado;
  } else if (perguntaEnunciadoEl) {
    perguntaEnunciadoEl.textContent = ''; // Limpa se não houver enunciado
  }

  // Verifica se o recurso da pergunta é uma URL válida e renderiza o elemento apropriado
  if (pergunta.recursoUrl && perguntaRecursoContainerEl) {
    const url = pergunta.recursoUrl.toLowerCase();
    let elementoRecurso;
    if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') || url.endsWith('.svg')) {
      elementoRecurso = document.createElement('img');
      elementoRecurso.src = pergunta.recursoUrl;
      elementoRecurso.alt = "Recurso visual da pergunta";
      elementoRecurso.classList.add('pergunta-recurso-imagem');
    } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      elementoRecurso = document.createElement('audio');
      elementoRecurso.src = pergunta.recursoUrl;
      elementoRecurso.controls = true;
      elementoRecurso.classList.add('pergunta-recurso-audio');
    }
    if (elementoRecurso) {
      perguntaRecursoContainerEl.appendChild(elementoRecurso);
    }
  }

  opcoesContainerEl.innerHTML = '';

  if (pergunta.opcoes && Array.isArray(pergunta.opcoes)) {
    pergunta.opcoes.forEach((opcao, index) => {
      const card = document.createElement('div');
      card.classList.add('opcao-card');
      card.dataset.index = index;

      if (pergunta.tipo === 'multipla-escolha-imagem' && opcao.imagemUrl) {
        // Sanitizar URLs se vierem de fontes não confiáveis ou usar um placeholder seguro
        card.innerHTML = `<img src="${encodeURI(opcao.imagemUrl)}" alt="${opcao.texto ? encodeURIComponent(opcao.texto) : 'Opção de imagem'}">`;
        if (opcao.texto) {
          const textoOpcao = document.createElement('p');
          textoOpcao.textContent = opcao.texto;
          textoOpcao.classList.add('opcao-card-texto-com-imagem');
          card.appendChild(textoOpcao);
        }
      } else {
        card.textContent = opcao.texto;
      }
      card.addEventListener('click', handleOpcaoClick);
      opcoesContainerEl.appendChild(card);
    });
  } else {
    console.warn("Pergunta não possui opções definidas:", pergunta);
  }
  btnProsseguirEl.classList.add('hidden');
}

// --- LÓGICA DE INTERAÇÃO DO QUIZ ---
function handleOpcaoClick(event) {
  if (respostaSelecionada) return;
  respostaSelecionada = true;

  const cardSelecionado = event.currentTarget;
  const indexSelecionado = parseInt(cardSelecionado.dataset.index);
  const perguntaAtual = licaoAtual.perguntas[perguntaAtualIndex];
  const indexCorreto = perguntaAtual.respostaCorretaIndex;

  const todosOsCards = document.querySelectorAll('.opcao-card');
  todosOsCards.forEach(card => card.classList.add('disabled'));

  if (indexSelecionado === indexCorreto) {
    cardSelecionado.classList.add('correta');
    acertos++;
    const chavesDaPerguntaCorrente = perguntaAtual.palavrasChave || [];
    chavesDaPerguntaCorrente.forEach(chaveObj => {
      if (chaveObj?.word && !palavrasChaveAcertadasNestaLicao.find(p => p.word?.toLowerCase() === chaveObj.word.toLowerCase())) {
        palavrasChaveAcertadasNestaLicao.push(chaveObj);
      }
    });
  } else {
    cardSelecionado.classList.add('incorreta');
    const cardCorreto = document.querySelector(`.opcao-card[data-index='${indexCorreto}']`);
    if (cardCorreto) {
      cardCorreto.classList.add('correta');
    }
  }
  btnProsseguirEl.classList.remove('hidden');
}

function prosseguir() {
  perguntaAtualIndex++;
  if (perguntaAtualIndex < licaoAtual.perguntas.length) {
    mostrarPergunta();
    const progressoPercentual = ((perguntaAtualIndex) / licaoAtual.perguntas.length) * 100;
    progressoBarraEl.style.width = `${progressoPercentual}%`;
  } else {
    progressoBarraEl.style.width = '100%';
    mostrarResultadoFinal();
    btnProsseguirEl.classList.add('hidden');
  }
}

// --- SALVAR PROGRESSO DO USUÁRIO ---
async function salvarProgressoDaLicao() {
  const usuarioLogadoJSON = localStorage.getItem("usuarioLogado");
  if (!usuarioLogadoJSON) {
    console.error("Não foi possível salvar o progresso: Dados do usuário não encontrados no localStorage.");
    return;
  }

  let usuarioLogado;
  try {
    usuarioLogado = JSON.parse(usuarioLogadoJSON);
  } catch (e) {
    console.error("Erro ao parsear dados do usuário do localStorage:", e);
    return;
  }

  if (!usuarioLogado?.id) {
    console.error("Não foi possível salvar o progresso: ID do usuário não encontrado nos dados parseados.");
    return;
  }

  try {
    const responseUser = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`);
    if (!responseUser.ok) throw new Error('Falha ao buscar dados do usuário para salvar progresso.');
    const usuarioCompleto = await responseUser.json();

    const progresso = usuarioCompleto.progresso || {
      licoesConcluidas: [],
      palavrasAprendidas: [],
      ultimaLicaoFeitaId: null
    };

    const pontuacao = Math.round((acertos / licaoAtual.perguntas.length) * 100);
    const novaLicaoConcluida = {
      licaoId: licaoAtual.id, // Certifique-se que licaoAtual.id existe e é o ID correto da lição
      tipoLicao: licaoAtual.tipo || (new URLSearchParams(window.location.search).get('tipo')), // Adiciona o tipo da lição
      pontuacao: pontuacao,
      dataConclusao: new Date().toISOString()
    };

    // Remove duplicatas antes de adicionar, considerando licaoId e tipoLicao
    progresso.licoesConcluidas = progresso.licoesConcluidas.filter(
      licao => !(licao.licaoId === novaLicaoConcluida.licaoId && licao.tipoLicao === novaLicaoConcluida.tipoLicao)
    );
    progresso.licoesConcluidas.push(novaLicaoConcluida);


    const mapaPalavrasAprendidas = new Map();
    if (Array.isArray(progresso.palavrasAprendidas)) {
      progresso.palavrasAprendidas.forEach(palavraObj => {
        if (palavraObj?.word) {
          mapaPalavrasAprendidas.set(palavraObj.word.toLowerCase(), palavraObj);
        }
      });
    }
    palavrasChaveAcertadasNestaLicao.forEach(novaPalavraObj => {
      if (novaPalavraObj?.word) {
        if (!mapaPalavrasAprendidas.has(novaPalavraObj.word.toLowerCase())) {
          mapaPalavrasAprendidas.set(novaPalavraObj.word.toLowerCase(), novaPalavraObj);
        }
      }
    });
    progresso.palavrasAprendidas = Array.from(mapaPalavrasAprendidas.values());
    progresso.ultimaLicaoFeitaId = licaoAtual.id; // ou talvez um objeto {id: licaoAtual.id, tipo: licaoAtual.tipo}

    const usuarioAtualizado = { ...usuarioCompleto, progresso: progresso };

    const responsePut = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });

    if (!responsePut.ok) {
      const errorData = await responsePut.text();
      throw new Error(`Falha ao enviar dados do progresso para a API. Status: ${responsePut.status}. Detalhes: ${errorData}`);
    }
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado)); // Atualiza o localStorage com os dados completos
    console.log("Progresso salvo com sucesso! Palavras aprendidas:", progresso.palavrasAprendidas);

  } catch (error) {
    console.error("Falha crítica ao salvar o progresso:", error);
  }
}

// --- TELA DE FIM DA LIÇÃO ---
async function mostrarResultadoFinal() {
  try {
    // Certifica-se de que licaoAtual e licaoAtual.perguntas existem
    if ((licaoAtual?.perguntas?.length <= 0)) {
      console.error("Não é possível calcular o resultado: dados da lição ou perguntas ausentes.");
      fimLicaoTituloEl.textContent = 'Erro';
      fimLicaoResultadoEl.textContent = 'Não foi possível calcular o resultado da lição.';
      fimLicaoBtnEl.textContent = 'Voltar ao Dashboard';
      fimLicaoOverlayEl.classList.remove('hidden');
      return;
    }

    const totalPerguntas = licaoAtual.perguntas.length;
    const pontuacao = Math.round((acertos / totalPerguntas) * 100);

    if (pontuacao >= 60) {
      fimLicaoTituloEl.textContent = 'Parabéns!';
      fimLicaoBtnEl.textContent = 'Ver Progresso';
    } else {
      fimLicaoTituloEl.textContent = 'Não foi dessa vez!';
      fimLicaoBtnEl.textContent = 'Tentar Novamente'; // Ou Voltar ao Dashboard
    }
    fimLicaoResultadoEl.textContent = `Você acertou ${acertos} de ${totalPerguntas} (${pontuacao}%).`;
    fimLicaoOverlayEl.classList.remove('hidden');

    // Salva o progresso APÓS exibir o resultado para o usuário não ter que esperar.
    await salvarProgressoDaLicao();

  } catch (error) {
    console.error("Erro ao mostrar resultado final e salvar progresso:", error);
    if (fimLicaoOverlayEl.classList.contains('hidden')) {
      fimLicaoTituloEl.textContent = 'Erro';
      fimLicaoResultadoEl.textContent = 'Ocorreu um erro ao finalizar a lição.';
      fimLicaoBtnEl.textContent = 'Voltar ao Dashboard';
      fimLicaoOverlayEl.classList.remove('hidden');
    }
  }
}

function handleFimLicaoClick() {
  // Adiciona uma verificação para o texto do botão para decidir a ação
  if (fimLicaoBtnEl.textContent === 'Tentar Novamente') {
    // Reinicia a lição atual
    perguntaAtualIndex = 0;
    acertos = 0;
    palavrasChaveAcertadasNestaLicao = [];
    fimLicaoOverlayEl.classList.add('hidden'); // Esconde o overlay
    mostrarPergunta(); // Mostra a primeira pergunta
  } else {
    // Vai para o dashboard (Ver Progresso ou Voltar ao Dashboard)
    window.location.href = '/src/dashboard_aluno/index.html';
  }
}

// --- EVENT LISTENERS GLOBAIS ---
document.addEventListener('DOMContentLoaded', iniciarLicao);
// Adicionar verificação se os elementos existem antes de adicionar listeners
if (btnProsseguirEl) {
  btnProsseguirEl.addEventListener('click', prosseguir);
}
if (fimLicaoBtnEl) {
  fimLicaoBtnEl.addEventListener('click', handleFimLicaoClick);
}


function showCustomModal(title, message) {
  console.log(`MODAL: ${title} - ${message}`);
}
