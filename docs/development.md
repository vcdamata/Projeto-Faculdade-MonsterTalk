# Programação de Funcionalidades

Implementação do sistema descritas por meio dos requisitos funcionais e/ou não funcionais. 

## Requisitos Atendidos

As tabelas que se seguem apresentam os requisitos funcionais e não-funcionais que relacionam o escopo do projeto com os artefatos criados:

### Requisitos Funcionais

|ID | Descrição do Requisito | Responsável | Artefacto Criado (Exemplos) |
|:---|:---|:---|:---|
|RF-001| Permitir o cadastro e login de utilizadores (alunos e professores). | André Bacelar | `/src/cadastro/index.html`, `/src/login/index.html`, `/src/js/cadastro.js`, `/src/js/login.js` |
|RF-002| Oferecer um painel de acompanhamento do progresso para professores. | André Bacelar | `/src/dashboard_professor/index.html`, `/src/js/professor_components.js` |
|RF-003| Permitir que professores criem, visualizem, editem e excluam turmas. | André Bacelar | `/src/dashboard_professor/turmas/`, `/src/js/professor_turmas.js` |
|RF-004| Permitir que professores criem e editem lições e conteúdos de apoio. | André Bacelar | `/src/dashboard_professor/licoes/`, `/src/js/professor_licao_criar.js`, `/src/js/professor_conteudo_criar.js` |
|RF-005| Permitir que alunos visualizem e realizem as lições atribuídas. | André Bacelar | `/src/dashboard_aluno/licoes/licao_teste.html`, `/src/js/aluno_licao_teste.js` |
|RF-006| A plataforma registra o progresso do aluno (lições, palavras, etc.). | André Bacelar | `/src/js/aluno_licao_teste.js` (Salva progresso de lição), `/src/js/conteudo_viewer.js` (Salva conteúdo visto) |
|RF-007| Alunos devem poder visualizar conteúdos de apoio e marcá-los como vistos. | André Bacelar | `/src/dashboard_aluno/licoes/licao_conteudo.html`, `/src/js/conteudo_viewer.js` |
|RF-008| Oferecer atividades complementares como "Leitor de Notícias". | André Bacelar | `/src/dashboard_aluno/licoes/licao_noticias.html`, `/src/js/aluno_licao_noticias.js` |
|RF-009| Utilizadores devem poder editar as suas informações de perfil. | André Bacelar | `/src/dashboard_aluno/perfil/index.html`, `/src/js/perfil_usuario.js` |
|RF-010| Disponibilizar atividades progressivas, divididas por nível. | André Bacelar | `/src/dashboard_aluno/index.html`, `/src/js/aluno_components.js` (Lógica de exibição) |
|RF-011| Fornecer sugestões de atividades personalizadas. | BAIXA PRIORIDADE | (Não implementado nesta fase) |
|RF-012| Disponibilizar fóruns. | BAIXA PRIORIDADE | (Não implementado nesta fase) |

---

## Descrição das estruturas:

A seguir estão detalhadas as estruturas de dados utilizadas no `db.json` para persistir as informações da aplicação.

### `usuarios`
Armazena os dados de todos os utilizadores, tanto alunos quanto professores.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---:|:---:|:---|:---|
| id | String | Identificador único do utilizador. | `"2"` |
| nome | String | Nome completo do utilizador. | `"João Pedro"` |
| email | String | Email utilizado para login. | `"joao@aluno.com"` |
| senha | String | Senha de acesso do utilizador. | `"123"` |
| tipo | String | Define o perfil do utilizador: "aluno" ou "professor". | `"aluno"` |
| avatarUrl| String | Caminho para a imagem de avatar do utilizador. | `"/src/img/perfil_avatar/avatar_02.svg"` |
| progresso | Objeto | **(Apenas para alunos)** Contém os dados de progresso. | Ver estrutura abaixo |

#### Objeto `progresso` (dentro de `usuarios`)
| **Nome** | **Tipo** | **Descrição** |
|:---|:---|:---|
| licoesConcluidas | Array de Objetos | Lista de lições que o aluno completou, com a sua pontuação e data. |
| palavrasAprendidas | Array de Objetos | Lista de palavras-chave que o aluno acertou, com a sua tradução. |
| conteudosVisualizados| Array de Objetos | Lista de conteúdos de apoio que o aluno marcou como vistos. |
| ultimaLicaoFeitaId | String | ID da última lição que o aluno interagiu, para o card "Continuar...". |

<br>

### `licoes` (Lições da Plataforma)
Estrutura para as lições padrão da plataforma MonsterTalk.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---|:---:|:---|:---|
| id | String | Identificador único da lição. | `"4"` |
| titulo | String | Nome da lição exibido para os utilizadores. | `"Animais"` |
| nivel | String | Nível de dificuldade: "Básico", "Intermediário", "Avançado". | `"Básico"` |
| descricao | String | Breve explicação sobre o conteúdo abordado. | `"Conheça os nomes de animais..."` |
| criadorId | Nulo | `null` para indicar que é uma lição padrão da plataforma. | `null` |
| perguntas | Array de Objetos | Lista contendo todas as perguntas da lição. | Ver estrutura abaixo |

#### Estrutura de `perguntas` (dentro de `licoes` e `licoes_professor`)
| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---|:---:|:---|:---|
| id | Número | Identificador sequencial da pergunta. | `1` |
| tipo | String | Formato da questão. | `"multipla-escolha-imagem"` |
| enunciado | String | Texto da pergunta (pode conter HTML). | `"Qual animal faz 'Miau'?"` |
| recursoUrl | String/Nulo| URL para uma imagem principal da pergunta. | `null` |
| palavrasChave | Array de Objetos | Palavras-chave abordadas na questão. | `[{ "word": "cat", "traducao": "gato" }]` |
| opcoes | Array de Objetos | Lista com as opções de resposta. | `[{ "texto": "Dog", "imagemUrl": "..." }]` |
| respostaCorretaIndex| Número | Índice (0 a 3) da resposta correta no array `opcoes`. | `1` |


<br>

### `licoes_professor`
Estrutura para as lições criadas pelos professores. É idêntica a `licoes`, com a adição do `professorId`.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---|:---:|:---|:---|
| id | String | Identificador único da lição. | `"prof_lic_17..._59thr"` |
| professorId | String | ID do professor que criou a lição. | `"1"` |
| `...` | `...` | (Os outros campos são idênticos à estrutura de `licoes`) | `...` |

<br>

### `conteudos_professor`
Estrutura para os materiais de apoio (textos, vídeos) criados pelos professores.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---|:---:|:---|:---|
| id | String | Identificador único do conteúdo. | `"cont_prof_17..._oho9c"` |
| professorId| String | ID do professor que criou o conteúdo. | `"1"` |
| titulo | String | Título do conteúdo. | `"conteúdo educacional"` |
| nivel | String | Nível de dificuldade sugerido. | `"Básico"` |
| descricao | String | Breve descrição do conteúdo para listagens. | `"Educacional"` |
| conteudoHtml| String | O conteúdo principal em formato HTML, criado com o editor de texto rico. | `"<p>conteúdo educacional...</p>"` |
| dataCriacao| String | Data e hora da criação do conteúdo (formato ISO). | `"2025-06-09T21:07:22.879Z"` |

<br>

### `licao_palavras_do_dia`
Estrutura para a atividade "Palavra do Dia", contendo vocabulário com exemplos de uso.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---:|:---:|:---|:---|
| id | String | Identificador único do registo. | `"8d8a"` |
| word | String | A palavra ou termo em inglês. | `"school"` |
| translation| String | A tradução da palavra para o português. | `"escola"` |
| example_en | String | Uma frase de exemplo em inglês usando a palavra. | `"The school is closed today."`|
| example_pt | String | A tradução da frase de exemplo. | `"A escola está fechada hoje."`|

<br>

### `turmas`
Estrutura para as turmas criadas pelos professores para organizar os seus alunos.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:---:|:---:|:---|:---|
| id | String | Identificador único da turma. | `"b1b7"` |
| nome | String | Nome da turma. | `"Turma do barulho"` |
| descricao | String | Descrição dos objetivos ou do perfil da turma. | `"Aulas introdutórias..."` |
| professorId| String | ID do professor responsável pela turma. | `"1"` |
| alunoIds | Array de Strings | Lista de IDs dos alunos que pertencem a esta turma. | `[ "3" ]` |
| recursosIds| Array de Objetos| Lista de IDs de lições e conteúdos atribuídos a esta turma. | `[{ "idRecurso": "7", "tipoRecurso": "licaoPlataforma" }]` |
| dataCriacao| String | Data e hora da criação da turma. | `"2025-06-03T17:25:37.179Z"` |

