# Instruções de Utilização e Histórico de Versões

Este documento fornece as instruções necessárias para configurar e executar o projeto MonsterTalk localmente, bem como um registo das versões e alterações implementadas.

---

## 1. Instruções de Utilização

O projeto MonsterTalk foi desenvolvido como uma aplicação **frontend**, utilizando HTML, CSS e JavaScript puros. Para simular a existência de um banco de dados e uma API, utilizamos o `json-server`. Para executar o projeto, é necessário iniciar tanto a API simulada quanto o servidor para os ficheiros estáticos.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [Git](https://git-scm.com/)
-   Um editor de código, como o [VS Code](https://code.visualstudio.com/), com a extensão **Live Server**.

### 1.1. Instalação e Configuração

**Passo 1: Clonar o Repositório**
Abra o seu terminal e clone o repositório do projeto para o seu computador:
```bash
git clone [https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-1-pe1-t1-MonsterTalk.git](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-1-pe1-t1-MonsterTalk.git)
cd mosntertalk-javascript-puc
```

**Passo 2: Instalar o `json-server`**
O `json-server` irá criar uma API REST completa a partir do nosso ficheiro `db.json`. Se você ainda não o tem instalado, execute o seguinte comando no seu terminal para instalá-lo globalmente:
```bash
npm install -g json-server
```

### 1.2. Executar a Aplicação

É necessário ter **dois terminais abertos** para executar o projeto: um para a API simulada e outro para o site.

**Passo 1: Iniciar a API Simulada (`json-server`)**

1.  No seu primeiro terminal, dentro da pasta do projeto, execute o comando:
    ```bash
    json-server --watch src/db/db.json --port 3000
    ```
2.  Este comando inicia um servidor na porta 3000 que responde a pedidos HTTP e serve os dados do ficheiro `db.json`. Mantenha este terminal aberto enquanto utiliza a aplicação.

**Passo 2: Iniciar o Frontend (o Site)**

1.  Abra a pasta completa do projeto no VS Code.
2.  Navegue até ao ficheiro `/src/index.html`.
3.  Clique com o botão direito no ficheiro e selecione **"Open with Live Server"**.
4.  O seu navegador abrirá automaticamente com a página de login do MonsterTalk. A aplicação irá comunicar com o `json-server` que está a correr na porta 3000.

---

## 2. Histórico de Versões

### [1.0.0] - 22/06/2025

#### Adicionado
-   **Versão Final do Projeto para Apresentação.**
-   **Funcionalidades Completas de Aluno e Professor:** Implementados ambos os painéis, com lógicas de acesso distintas.
-   **Gestão Completa de Turmas:** Professores agora podem criar, editar e gerir turmas, associando alunos e recursos pedagógicos.
-   **Criação de Conteúdo e Lições:** Ferramentas implementadas para que professores criem os seus próprios materiais de apoio (com editor de texto rico) e lições interativas.
-   **Atividades Interativas:** Implementadas as atividades "Leitor de Notícias", "Palavra do Dia" e "Revisão de Palavras", com integração direta às APIs externas a partir do frontend.
-   **Registo de Progresso:** Sistema completo para o aluno acompanhar as lições concluídas, palavras aprendidas e conteúdos vistos.
-   **Melhorias de UI/UX:**
    -   Refinamento do design dos painéis de aluno e professor para uma experiência mais moderna.
    -   Substituição de todos os `alert()` por notificações com `SweetAlert2`.

### [0.1.0] - 15/05/2025

#### Adicionado
-   **Estrutura Inicial do Projeto:** Criação da estrutura de pastas e ficheiros base.
-   **Sistema de Login e Cadastro:** Implementação da funcionalidade de autenticação para perfis de "aluno" e "professor" utilizando `localStorage`.
-   **Dashboards Iniciais:** Criação das páginas de painel básicas para ambos os perfis de utilizador.
-   **Simulação de API com `json-server`:** Configuração inicial do `db.json` para servir dados estáticos da aplicação.
