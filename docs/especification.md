# Especificações do Projeto

## Personas

### 1. Persona Alunos:

#### **Amanda Ferreira - Aluna**

<img src="./img/Personas/AlunaAmandaFerreira.png" alt="Persona da Amanda Ferreira – Aluna" height="100" />

- **Nome:** Amanda Ferreira
- **Sexo:** Feminino
- **Idade:** 16 anos
- **Estado Civil:** Solteira
- **Classe Social:** Classe média
- **Nacionalidade:** Brasileira
- **Localização:** São Paulo, SP
- **Escolaridade:** Cursando o 2° ano do Ensino Médio 
- **Profissão:** Estudante 
  
Amanda tem 16, uma adolescente curiosa e criativa, que adora estar conectada nas redes sociais e consumir conteúdos internacionais. Ela tem grande interesse por cultura pop, como séries e músicas e sonha em viajar para o exterior.
Ela já tem como objetivo se tornar uma profissional em TI, e trabalhar no exterior e com isso ela já vê uma importância em melhorar seu desempenho nas aulas de inglês para se preparar para o futuro, notando que as aulas tradicionais de inglês não são suficientes para desenvolver fluência.

#### **Características Comportamentais**

- **Gostos pessoais:** Gosta de socializar e interagir com pessoas, nos tempos livres assisti séries e filmes, principalmente produções internacionais, se interessa por viagens e culturas estrangeiras e sonha em fazer intercâmbio no futuro.;
- **Sensibilidade a preço:** Está disposta a pagar por algo se perceber que realmente vale a pena, mas como ainda depende financeiramente dos pais, prefere opções gratuitas ou com preço acessível.
- **Qualidade desejada em um produto:** O produto precisa ser divertido e interativo, pois ela se desmotiva facilmente com métodos tradicionais.

#### **Critérios Psicográficos**

- **Personalidade:** Extrovertida e comunicativa, gosta de interagir com amigos e compartilhar experiências nas redes sociais.
- **Estilo de Vida:** Gosta de estudar no seu próprio ritmo, combinando aprendizado com entretenimento. Passa boa parte do tempo online consumindo conteúdo e interagindo nas redes sociais.;
- **Valores morais:** Acredita no esforço pessoal e entende que aprender um novo idioma pode abrir portas para seu futuro.

### 2. Professores:
Camila Oliveira

<img src="./img/Personas/ProfessorCamilaOliveira.jpg" alt="Professora Camila Oliveira" height="100">

##### Informações Sociodemográficas
- **Nome:** Camila Oliveira
- **Sexo:** Feminino
- **Idade:** 34 anos
- **Estado civil:** Solteira
- **Filhos:** Não possui
- **Classe social:** Classe média
- **Nacionalidade:** Brasileira
- **Localização:** Rio de Janeiro, RJ
- **Escolaridade:** Ensino superior completo
- **Profissão:** Professora de Inglês e Francês

##### **Características Comportamentais**  
- **Gostos pessoais:** Apaixonada por idiomas, viagens e cultura. Gosta de assistir séries, ler livros sobre inovação no ensino e explorar novas metodologias educacionais.
- **Sensibilidade a preços:** Está disposta a investir em plataformas educacionais que ofereçam personalização e acompanhamento do progresso dos alunos. Prefere soluções que combinem tecnologia e ensino interativo.
- **Qualidade desejada em um produto:** Procura ferramentas intuitivas, organizadas e que tragam resultados tangíveis no aprendizado dos alunos.

##### **Critérios Psicográficos** 

- **Personalidade:** Criativa, empática e inovadora. Sempre em busca de novas estratégias para tornar o ensino de idiomas mais acessível e envolvente.
- **Estilo de vida:** Equilibra o trabalho com momentos de lazer e aprendizado pessoal. Valoriza plataformas que possam ser utilizadas de forma prática e que otimizem seu tempo de planejamento.

- **Valores morais:** Acredita que o ensino de idiomas deve ser interativo e progressivo. Defende metodologias ativas e o uso da tecnologia para potencializar o aprendizado.

___________________________

## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

#### Alunos:

| EU COMO... `Aluna – Amanda Ferreira` | QUERO/PRECISO ... `FUNCIONALIDADE` | PARA ... `MOTIVO/VALOR` |
|----------------------|----------------------------------|------------------------|
|Aluna	| Acessar atividades progressivas organizadas por nível de dificuldade | Aprender de forma estruturada e natural, garantindo uma evolução contínua |
|Aluna	| Receber recomendações de exercícios e conteúdos com base nas minhas dificuldades | Focar nos aspectos que preciso melhorar e otimizar meu tempo de estudo |
|Aluna	| Criar um plano de estudos personalizado com flashcards, quizzes e desafios diarios	| Aprender inglês de forma divertida e consistente |

---

### **Professores**  

| EU COMO... `Professora - Camila Oliveira` | QUERO/PRECISO ... `FUNCIONALIDADE` | PARA ... `MOTIVO/VALOR` |
|--------------------|------------------------------------|----------------------------------------|
| Professora | Acompanhar o progresso dos alunos através de um painel de desempenho | Identificar dificuldades e adaptar minhas estratégias de ensino |  
| Professora | Criar atividades interativas para os alunos | Engajar os estudantes e tornar o aprendizado mais dinâmico |  
| Professora | Participar de um fórum para tirar dúvidas dos alunos | Melhorar minha prática pedagógica com troca de conhecimento |  

---

### **Requisitos Funcionais**  

| ID     | Descrição do Requisito | Prioridade |
|--------|---------------------------------------------------------------|-----------|
| RF-001 | A plataforma deve permitir o cadastro e login de utilizadores com dois perfis: "aluno" e "professor". | ALTA |
| RF-002 | A aplicação deve oferecer um painel de acompanhamento do progresso dos alunos para professores. | ALTA |
| RF-003 | O sistema deve permitir que professores criem, visualizem, editem e excluam turmas. | ALTA |
| RF-004 | O sistema deve permitir que professores criem e editem lições interativas (quizzes) e conteúdos de apoio. | ALTA |
| RF-005 | O sistema deve permitir que alunos visualizem e realizem as lições atribuídas, recebendo a sua pontuação no final. | ALTA |
| RF-006 | O sistema deve registar o progresso do aluno, incluindo lições concluídas, pontuação e palavras aprendidas. | ALTA |
| RF-007 | Alunos devem poder visualizar conteúdos de apoio e marcá-los como vistos. | MÉDIA |
| RF-008 | A plataforma deve oferecer atividades complementares como conteudos externos como "Leitor de Notícias". | MÉDIA |
| RF-009 | Utilizadores devem poder editar as suas informações de perfil, incluindo o avatar. | MÉDIA |
| RF-010 | O sistema deve disponibilizar atividades progressivas, divididas por nível de dificuldade. | MÉDIA |
| RF-011 | A plataforma deve fornecer sugestões de atividades personalizadas | BAIXA |
| RF-012 | O sistema deve disponibilizar fóruns entre professores e alunos com o intuito de discutir assuntos e sanar dúvidas pertinente ao conteúdo. | BAIXA  |


---

### **Requisitos Não Funcionais**  

| ID      | Descrição do Requisito | Prioridade |
|---------|---------------------------------------------------------------|-----------|
| RNF-001 | A aplicação deve ser responsiva e funcionar em dispositivos móveis e desktops. | ALTA |
| RNF-002 | O sistema deve garantir segurança e proteção de dados dos usuários. | ALTA |
| RNF-003 | A plataforma deve ter um design intuitivo e acessível para diferentes faixas etárias. | ALTA |
| RNF-004 | O tempo de resposta da plataforma deve ser inferior a 2 segundos para ações principais. | MÉDIA |


## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |
|03| Aplicação deve ser desenvolvida em HTML, CSS e JavaScript |
|04| Projeto não inclui manutenção |
|05| Sistema não será escalável |
