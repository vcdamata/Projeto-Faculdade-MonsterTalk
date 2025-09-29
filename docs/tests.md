# Testes

Neste projeto serão realizados dois tipos de testes:

 - O **Teste de Software**, que utiliza uma abordadem de caixa preta, e tem por objetivo verificar a conformidade do software com os requisitos funcionais e não funcionais do sistema.
 - O **Teste de Usabilidade**, que busca avaliar a qualidade do uso do sistema por um usuário do público alvo. 

# Teste de Software

## Plano de Testes de Software

**Padrão Professor**

**Caso de Teste** | **CT01 - Criar conta**
 :--------------: | ------------
**Procedimento**  | 1) Acesse o endereço (/src/cadastro/index.html) <br> 2) Clique em criar conta <br> 2) Preencha todos os campos do formulário <br> 3) Clique no botão "Cadastrar".
**Requisitos associados** | RF-001
**Resultado esperado** |Usuário cadastrado
**Dados de entrada** | Inserção de dados válidos no formulário de cadastro
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT02 - Login na conta**
:--------------: | ------------
**Procedimento** | 1) Preencha todos os campos do formulário <br> 2) Clique no botão "Entrar".
**Requisitos associados** | RF-001
**Resultado esperado** | Acesso a conta
**Dados de entrada** | Inserção de dados válidos no formulário de login
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT03 - Painel de Progresso do aluno para professores**
:--------------: | ------------
**Procedimento** | 1) Crair conta / login na conta <br> 2) Sidebar > Painel.
**Requisitos associados** | RF-002
**Resultado esperado** | Painel de acompanhamento do progresso dos alunos para professores.
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT04 - Gerenciar turmas adicionar ou excluir turmas**
:--------------: | ------------
**Procedimento** | 1) Criar conta / login na conta de professor <br> 2) Sidebar > Turmas <br> 3) Adicionar nova turma.
**Requisitos associados** | RF-003
**Resultado esperado** | Acesso a turmas
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT05 - Adicionar nova lição**
:--------------: | ------------
**Procedimento** | 1) Login na conta de professor <br> 2) Sidebar > Lições <br> 3) Adicionar nova lição.
**Requisitos associados** | RF-004
**Dados de entrada** | Inserção de dados válidos no formulário de adicionar nova lição
**Resultado esperado** | Acesso ao formulário de criação de nova lição
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT06 - Adicionar novo conteúdo**
:--------------: | ------------
**Procedimento** | 1) Login na conta de professor <br> 2) Sidebar > Lições <br> 3) Adicionar novo conteúdo.
**Requisitos associados** | RF-004
**Dados de entrada** | Inserção de dados válidos no formulário de adicionar novo conteúdo
**Resultado esperado** | Acesso ao formulário de criação de novo conteúdo
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT07 - Permitir que alunos visualizem e realizem as lições atribuídas**
:--------------: | ------------
**Procedimento** | 1) Login na conta de aluno <br> 2) Sidebar > Turmas <br> 3) Selecione a turma > Visualizar e realizar as lições.
**Requisitos associados** | RF-005
**Resultado esperado** | Acesso ao conteúdo das lições atribuídas e a possibilidade de realizações
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT08 - Alunos devem poder visualizar conteúdos de apoio e marcá-los como vistos**
:--------------: | ------------
**Procedimento** | 1) Login na conta de aluno <br> 2) Sidebar > Turmas <br> 3) Selecione a turma > Selecione a lição descrita como "Conteúdo do professor" > Clique na caixa de seleção "Marcar este conteúdo como visto".
**Requisitos associados** | RF-007  
**Resultado esperado** | Visualização e marcação de contéudos de apoio
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT09 - A plataforma registra o progresso do aluno (lições, palavras, etc.)**
:--------------: | ------------
**Procedimento** | 1) Login na conta de aluno <br> 2) Siderbar > Meu Progresso <br> > 3) Página com a visualização do progresso do aluno
**Requisitos associados** | RF-006 
**Resultado esperado** | Visualização individual do progresso do aluno
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT10 - Oferecer atividades complementares como "Leitor de Notícias"**
:--------------: | ------------
**Procedimento** | 1) Login na conta de aluno <br> 2) Sidebar > Monster Hub <br> 3) Selecione o card "Notícias".
**Requisitos associados** | RF-008 
**Resultado esperado** | Direcionamento a página de "Leitor de Notícias em Inglês"
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT11 - Utilizadores devem poder editar as suas informações de perfil**
:--------------: | ------------
**Procedimento** | 1) Login na conta de aluno <br> 2) Sidebar > Meu Perfil <br> 3) Formulário com as informações do aluno > Salvar alterações.
**Requisitos associados** | RF-009
**Dados de entrada** | Inserção de dados válidos no formulário de editar perfil
**Resultado esperado** | Alterações da parte do e-mail, senha atual e nova senha. 
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT12 - Disponibilizar atividades progressivas, divididas por níveís**
:--------------: | ------------
**Procedimento** | 1) Login na conta de Professor <br> 2) Sidebar > Lições <br> 3) Adicionar nova lição + 4) Preenchimento do formulário > Salvar lição.
**Requisitos associados** | RF-010
**Dados de entrada** | Inserção de dados válidos no formulário de criar nova lição
**Resultado esperado** | Disponibilidade de lição para o aluno de acordo com o nível respectivamente
**Resultado obtido** | Sucesso


## Registro dos Testes de Software

|*Caso de Teste*                                 |*CT01 - Criar conta parte 1*|
|---|---|
|Requisito Associado | RF-001 - Permitir o cadastro e login de utilizadores (alunos e professores)|
|Link do vídeo do teste realizado: |[Vídeo CT01](./videos/Plano_testes/CT%2001.mp4) | 



https://github.com/user-attachments/assets/ae0c45b8-9fdf-40d4-ae41-0ee17741bb61

---

|*Caso de Teste*                                 |*CT02 - Login*|
|---|---|
|Requisito Associado | RF-001 - Permitir o cadastro e login de utilizadores (alunos e professores)|
|Link do vídeo do teste realizado: |[Vídeo CT02](./videos/Plano_testes/CT%2002.mp4) | 



https://github.com/user-attachments/assets/3d02cf3e-4d23-4f10-90fa-027d01893a8f


---

|*Caso de Teste*                                 |*CT03 - Painel de progresso do aluno para professores*|
|---|---|
|Requisito Associado | RF-002 - Oferecer um painel de acompanhamento do progresso para professores|
|Link do vídeo do teste realizado: |[Vídeo CT03](./videos/Plano_testes/CT%2003.mp4) |


https://github.com/user-attachments/assets/be8ff168-2609-4155-88f1-bdcd2db38510

---

|*Caso de Teste*                                 |*CT04 - Gerenciar turmas adicionar ou excluir turmas*|
|---|---|
|Requisito Associado | RF-003 - Permitir que professores criem, visualizem, editem e excluam  turmas|
|Link do vídeo do teste realizado: |[Vídeo CT04](./videos/Plano_testes/CT%2004.mp4) |



https://github.com/user-attachments/assets/6908df6a-1fbf-4011-b090-223b4e39e227


---

|*Caso de Teste*                                 |*CT05 - Adicionar nova lição*|
|---|---|
|Requisito Associado | RF-004 - Permitir que professores criem e editem lições e conteúdos de apoio|
|Link do vídeo do teste realizado: |[Vídeo CT05](./videos/Plano_testes/CT%2005.mp4) |

https://github.com/user-attachments/assets/bfc9faa3-bb5a-47b7-b17d-09fc7d4ede5f

---

|*Caso de Teste*                                 |*CT06 - Adicionar novo conteúdo*|
|---|---|
|Requisito Associado | RF-004 - Permitir que professores criem e editem lições e conteúdos de apoio|
|Link do vídeo do teste realizado: |[Vídeo CT06](./videos/Plano_testes/CT%2006.mp4) |


https://github.com/user-attachments/assets/6cdcd150-42e5-46ff-98bf-b19de8a621ef


---

|*Caso de Teste*                                 |*CT07 - Permitir que alunos visualizem e realizem as lições atribuídas*|
|---|---|
|Requisito Associado | RF-005 - Permitir que alunos visualizem e realizem as lições atribuídas|
|Link do vídeo do teste realizado: |[Vídeo CT07](./videos/Plano_testes/CT%2007.mp4) |


https://github.com/user-attachments/assets/1e0a8a67-0cf0-4c26-afea-8be9aa904c0a


---

|*Caso de Teste*                                 |*CT08 - Alunos devem poder visualizar conteúdos de apoio e marcá-los como vistos*|
|---|---|
|Requisito Associado | RF-007 - Alunos devem poder visualizar conteúdos de apoio e marcá-los como vistos|
|Link do vídeo do teste realizado: |[Vídeo CT08](./videos/Plano_testes/CT%2008.mp4) |


https://github.com/user-attachments/assets/c7b90968-2505-4830-9eb9-abdccfd3fc0d


---

|*Caso de Teste*                                 |*CT09 - Oferecer atividades complementares como "leitor de notícias"*|
|---|---|
|Requisito Associado | RF-008 - Oferecer atividades complementares como "leitor de notícias|
|Link do vídeo do teste realizado: |[Vídeo CT09](./videos/Plano_testes/CT%2009.mp4) |


https://github.com/user-attachments/assets/effcec51-02ea-4221-b68d-60a42ea82372


---

|*Caso de Teste*                                 |*CT10 - Utilizadores devem poder editar as suas informações de perfil*|
|---|---|
|Requisito Associado | RF-009 - Utilizadores devem poder editar as suas informações de perfil|
|Link do vídeo do teste realizado: |[Vídeo CT10](./videos/Plano_testes/CT%2010.mp4) |


https://github.com/user-attachments/assets/112de0c0-4d97-44fe-8089-0495c1c7f69f


---

|*Caso de Teste*                                 |*CT11 - Dizponibilizar atividades progressivas, divididas por níveis*|
|---|---|
|Requisito Associado | RF-010 - Dizponibilizar atividades progressivas, divididas por níveis|
|Link do vídeo do teste realizado: |[Vídeo CT11](./videos/Plano_testes/CT%2011.mp4) |


https://github.com/user-attachments/assets/970fa6e3-1b70-4a8e-8044-f6d96650eec2


---

## Avaliação dos Testes de Software

A execução do plano de testes de software, cobrindo os 12 casos de teste principais, permitiu uma análise abrangente da implementação dos requisitos funcionais do sistema MonsterTalk. Os resultados obtidos foram majoritariamente positivos, validando o trabalho desenvolvido, mas também revelaram oportunidades claras para aprimoramento em futuras iterações.

Os testes de software demonstraram que o MonsterTalk é uma aplicação funcional e que atende a todos os requisitos essenciais propostos. Os pontos fortes residem na implementação bem-sucedida dos fluxos de aluno e professor. Os pontos fracos identificados não são falhas nas funcionalidades existentes, mas sim oportunidades de evolução arquitetural e de processo que fornecem um roteiro claro e profissional para os próximos passos do projeto.


# Testes de Usabilidade

O objetivo do Plano de Testes de Usabilidade é obter informações quanto à expectativa dos usuários em relação à  funcionalidade da aplicação de forma geral.

Para tanto, elaboramos quatro cenários, cada um baseado na definição apresentada sobre as histórias dos usuários, definido na etapa das especificações do projeto.

Foram convidadas quatro pessoas que os perfis se encaixassem nas definições das histórias apresentadas na documentação, visando averiguar os seguintes indicadores:

Taxa de sucesso: responde se o usuário conseguiu ou não executar a tarefa proposta;

Satisfação subjetiva: responde como o usuário avalia o sistema com relação à execução da tarefa proposta, conforme a seguinte escala:

1. Péssimo; 
2. Ruim; 
3. Regular; 
4. Bom; 
5. Ótimo.

Tempo para conclusão da tarefa: em segundos, e em comparação com o tempo utilizado quando um especialista (um desenvolvedor) realiza a mesma tarefa.

Objetivando respeitar as diretrizes da Lei Geral de Proteção de Dados, as informações pessoais dos usuários que participaram do teste não foram coletadas, tendo em vista a ausência de Termo de Consentimento Livre e Esclarecido.
### Funcionalidades Avaliadas, Grupo de Usuários e Ferramentas
**Funcionalidades avaliadas:**
  * Cadastro e login de utilizadores (RF-001).
  * Acesso e realização de atividades progressivas por nível (RF-010, RF-005).
  * Acesso ao painel de acompanhamento de progresso do aluno (RF-002).
  * Criação de lições interativas (quizzes) por professores (RF-004).
  * Intuitividade e design geral da plataforma.

* **Grupo de usuários:** O grupo foi composto por 4 participantes, sendo 2 estudantes do ensino médio com características similares à persona **Amanda Ferreira** e 2 professoras de idiomas com perfil semelhante à persona **Camila Oliveira**.

**Ferramentas utilizadas:**
  * **VS Code:** Para executar a programação do site.
  * **Cronômetro online:** Para verificar o tempo de conclusão de cada cenário.
  * **Excel:** Para registro dos dados durante as avaliações.

## Cenários de Teste de Usabilidade

| Nº do Cenário | Descrição do cenário |
|---------------|----------------------|
| 1             | Você é um aluno. Cadastre-se na plataforma, faça login e encontre uma atividade de nível "iniciante" para começar a estudar. |
| 2             | Você é um aluno. Você quer reforçar seu vocabulário sobre clima. Encontre e inicie uma atividade de nível intermediário sobre "Clima e tempo". |
| 3             | Você é um professor. Após fazer login, acesse o painel de desempenho e encontre o progresso do aluno "João Pedro". |
| 4             | Você é um professor. Crie um novo quiz interativo com 3 perguntas sobre viagem para o nível intermediário. |

---

## Registro de Testes de Usabilidade

### Cenário 1: Você é um aluno. Cadastre-se na plataforma, faça login e encontre uma atividade de nível "iniciante" para começar a estudar.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1 (Aluno) | SIM             | 5                    | 49.12 segundos                  |
| 2 (Aluno) | SIM             | 5                    | 45.78 segundos                  |
| **Média** | **100%** | **5** | **47.45 segundos** |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 43.20 segundos |

**Comentários dos usuários:**
* "O cadastro foi bem direto, sem muitas informações solicitadas. Depois do cadastro já dá de cara com as opções de atividades por nível o que assim já tem um caminho para seguir"
* "O cadastro foi simples, o design colorido deixa o site mais interessante e a divisão por nível ajuda muito."

### Cenário 2: Você é um aluno. Você quer reforçar seu vocabulário sobre clima. Encontre e inicie uma atividade de nível intermediário sobre "Clima e tempo".

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1 (Aluno) | SIM             | 5                    | 27.31 segundos                  |
| 2 (Aluno) | SIM             | 5                    | 30.66 segundos                  |
| **Média** | **100%** | **5** | **28.98 segundos** |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 22.80 segundos |

**Comentários dos usuários:**
* "Gostei dos temas das atividades, foi simples achar o que eu desejava."
* "Foi fácil de achar, você consegue ver seu progresso durante a atividade e o que é ótimo. Não tive problemas."

### Cenário 3: Você é um professor. Após fazer login, acesse o painel de desempenho e encontre o progresso do aluno "João Pedro".

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 3 (Prof.)| SIM             | 5                    | 30.45 segundos                  |
| 4 (Prof.)| SIM             | 4.75                 | 32.56 segundos                  |
| **Média** | **100%** | **4.87** | **31.50 segundos** |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 24.03 segundos |

**Comentários dos usuários:**
* "O painel é bem visual, gostei dos gráficos de progresso por aluno e da turma, ajuda muito para manter o acompanhamento."
* "No geral gostei bastente, consegui encontrar o João facilmente. Acredito que com o futuro crescimento do número de alunos, um campo de busca facilitaria o processo."

### Cenário 4: Você é um professor. Crie um novo quiz interativo com 3 perguntas sobre viagem para o nível intermediário.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 3 (Prof.)| SIM             | 5                    | 330.20 segundos (5m 30s)        |
| 4 (Prof.)| SIM             | 4.5                  | 316.10 segundos (5m 16s)        |
| **Média** | **100%** | **4.75** | **323.15 segundos (5m 23s)** |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 253.57 segundos (4m 13s) |

**Comentários dos usuários:**
* "A ferramenta de criar quiz é bem interessante e completa. Levei um tempinho para entender todas as opções, mas é só na primeira vez."
* "Adorei a ferramenta! Sentia falta de um espaço para criar meu próprio material que não fosse maçante para os alunos. O que a tornaria ainda mais interessante seria a possibilidade de adicionar um feedback personalizado. Gostaria de ter um campo opcional para justificar por que uma resposta está certa ou errada, dessa forma, os alunos poderiam aprender não só com os acertos, mas também entender o porquê de seus erros."

---

## Avaliação dos Testes de Usabilidade

Com base nos resultados obtidos, foi possível verificar que a aplicação web atinge seus objetivos principais com alta qualidade, validando os requisitos funcionais propostos. A **taxa de sucesso de 100%** em todos os cenários demonstra que as funcionalidades são robustas e que os usuários conseguem completar as tarefas essenciais.

A **satisfação subjetiva** manteve-se em níveis excelentes, com médias sempre superiores a 4.75, indicando que a experiência geral do usuário é intuitiva e agradável. Os comentários para os cenários dos alunos (1 e 2) foram unanimemente positivos, elogiando a simplicidade do cadastro e a facilidade em encontrar conteúdos, o que valida a eficácia da interface para este perfil.

A análise dos cenários dos professores (3 e 4) revela insights importantes para a evolução da plataforma:

1.  **Oportunidade de Escalabilidade (Cenário 3):** O feedback sobre a necessidade de um **campo de busca** no painel de desempenho é uma sugestão de melhoria crucial. Embora a navegação atual funcione para poucos alunos, a implementação de uma busca tornaria a ferramenta mais eficiente e escalável para turmas maiores no futuro.

2.  **Complexidade e Potencial Pedagógico (Cenário 4):** O tempo elevado para a conclusão da criação do quiz é notável, mas justificado pela complexidade da tarefa. Os comentários indicam que, apesar de uma curva de aprendizado inicial, a ferramenta é percebida como "interessante e completa". Mais importante, o feedback sobre a criação de **justificativas personalizadas para as respostas** revela um enorme potencial de valorização pedagógica da ferramenta. Esta não é uma falha, mas uma oportunidade de inovação alinhada às necessidades do professor.

Conclui-se que a aplicação tem sucesso em usabilidade, com uma base sólida e bem recebida pelos perfis de usuário. As recomendações para futuras versões são claras: focar em melhorias de escalabilidade, como a busca no painel do professor, e explorar funcionalidades de alto valor pedagógico, como o feedback personalizado em quizzes, para diferenciar ainda mais a plataforma.
