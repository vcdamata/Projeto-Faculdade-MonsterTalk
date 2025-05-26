document.addEventListener("DOMContentLoaded", function () {
    const studentUpdates = JSON.parse(
        localStorage.getItem("studentUpdates")
    );

    if (studentUpdates) {
        const tableRows = document.querySelectorAll(
            "main.painel table tbody tr"
        );
        tableRows.forEach((row) => {
            const nomeTd = row.querySelector("td:nth-child(1)"); // Coluna Nome é a primeira
            const turmaTd = row.querySelector("td:nth-child(3)"); // Coluna Classe é a terceira

            if (nomeTd && turmaTd) {
                const nomeAlunoNaTabela = nomeTd.textContent.trim();
                if (studentUpdates[nomeAlunoNaTabela]) {
                    turmaTd.textContent = studentUpdates[nomeAlunoNaTabela];
                }
            }
        });
    }

    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", () => {
            const isActive = sidebar.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });
    }
});
function obterParametroUrl(nome) {
    nome = nome.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + nome + '=([^&#]*)');
    var resultados = regex.exec(location.search);
    return resultados === null ? '' : decodeURIComponent(resultados[1].replace(/\+/g, ' '));
}

document.addEventListener('DOMContentLoaded', function () {
    const nomeAlunoOriginal = obterParametroUrl('nome');
    const turmaAlunoOriginal = obterParametroUrl('turma');

    const nomeAlunoDisplayElement = document.getElementById('nomeAlunoDisplay');
    const selectTurmaElement = document.getElementById('select-turma');
    const btnSimSalvar = document.getElementById('btnSimSalvar');
    const btnNaoSalvar = document.getElementById('btnNaoSalvar');

    if (nomeAlunoOriginal && nomeAlunoDisplayElement) {
        nomeAlunoDisplayElement.textContent = nomeAlunoOriginal;
    } else if (nomeAlunoDisplayElement) {
        nomeAlunoDisplayElement.textContent = 'Nome não encontrado';
    }

    if (turmaAlunoOriginal && selectTurmaElement) {
        let optionEncontrada = false;
        for (let i = 0; i < selectTurmaElement.options.length; i++) {
            if (selectTurmaElement.options[i].value === turmaAlunoOriginal) {
                selectTurmaElement.value = turmaAlunoOriginal;
                optionEncontrada = true;
                break;
            }
        }
        if (!optionEncontrada) {
            for (let i = 0; i < selectTurmaElement.options.length; i++) {
                if (selectTurmaElement.options[i].text.toLowerCase() === turmaAlunoOriginal.toLowerCase().replace(/_/g, ' ')) {
                    selectTurmaElement.value = selectTurmaElement.options[i].value;
                    break;
                }
            }
        }
    }

    if (btnSimSalvar) {
        btnSimSalvar.addEventListener('click', function () {
            const novaTurmaSelecionada = selectTurmaElement.options[selectTurmaElement.selectedIndex].text;

            if (nomeAlunoOriginal && novaTurmaSelecionada) {
                let studentUpdates = JSON.parse(localStorage.getItem('studentUpdates')) || {};
                studentUpdates[nomeAlunoOriginal] = novaTurmaSelecionada;
                localStorage.setItem('studentUpdates', JSON.stringify(studentUpdates));
            }
            window.location.href = '/src/dashboard_professor/alunos/index.html';
        });
    }

    if (btnNaoSalvar) {
        btnNaoSalvar.addEventListener('click', function () {
            window.location.href = '/src/dashboard_professor/alunos/index.html';
        });
    }
});

const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");

if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
        const isActive = sidebar.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isActive);
    });
}

// --- Início: Novo Código para FUNCIONALIDADE DE EXCLUIR ---
const botoesExcluir = document.querySelectorAll('.btn-excluir');

botoesExcluir.forEach(botao => {
    botao.addEventListener('click', function () {
        const linhaDoAluno = this.closest('tr'); // Pega a linha <tr> pai do botão
        const nomeAlunoTd = linhaDoAluno.querySelector('td:nth-child(1)'); // Pega a primeira célula <td> (Nome)

        if (nomeAlunoTd) {
            const nomeAluno = nomeAlunoTd.textContent.trim();
            const mensagemConfirmacao = `Tem certeza de que gostaria de excluir o aluno ${nomeAluno}?`;

            if (window.confirm(mensagemConfirmacao)) {
                // 1. Remover a linha da tabela visualmente
                linhaDoAluno.remove();

                // 2. Remover o aluno do localStorage (do objeto studentUpdates)
                let currentStudentUpdates = JSON.parse(localStorage.getItem('studentUpdates')) || {};
                if (currentStudentUpdates[nomeAluno]) {
                    delete currentStudentUpdates[nomeAluno];
                    localStorage.setItem('studentUpdates', JSON.stringify(currentStudentUpdates));
                }

                // console.log(`Aluno ${nomeAluno} excluído.`); // Opcional: para debug
            }
        }
    });
});