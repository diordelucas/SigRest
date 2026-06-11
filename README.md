# SigRest - Sistema de Gestão de Restaurante

O **SigRest** é um sistema web de gestão para pequenos restaurantes e negócios familiares especializado em refeições congeladas, marmitas e encomendas. Desenvolvido como Projeto Integrador de Sistemas de Informação, o objetivo do sistema é centralizar o cadastro de clientes, controle de estoque e insumos, ordens de produção, compras, vendas, movimentação de caixa e relatórios gerenciais de forma simples e eficiente.

---

## 🏛️ Arquitetura do Sistema

O projeto adota uma arquitetura moderna dividida em 3 camadas independentes:

1.  **Banco de Dados (PostgreSQL 15):** Gerenciado localmente de forma isolada dentro de um container Docker, com volume persistente para manter a integridade dos dados durante reinicializações.
2.  **Backend (Java 17 + Spring Boot):** Uma API REST robusta que concentra as regras de negócio, persistência via Hibernate/Spring Data JPA, segurança via Spring Security e mapeamento de dados utilizando DTOs.
3.  **Frontend (React 19 + Tailwind):** Uma interface rica (SPA) que consome a API REST, oferecendo uma experiência dinâmica, responsiva e alinhada à identidade visual da marca (Maju's Assados e Congelados).

---

## 📋 Pré-requisitos

Para rodar este projeto em sua máquina local, certifique-se de ter instalado:

*   **Java Development Kit (JDK) 17** ou superior.
*   **Apache Maven** instalado e configurado no PATH do sistema.
*   **Node.js 18+** e gerenciador de pacotes **npm** (para o frontend).
*   **Docker** e **Docker Compose** (para orquestrar o banco de dados e containers).
*   Um cliente Git para versionamento.

---

## 📁 Estrutura de Pastas

Abaixo está um resumo da estrutura do repositório:

```text
Sistemacompleto/
├── SigRestBack/                # Backend (Spring Boot + Java)
│   ├── src/                    # Código-fonte Java (controllers, services, entities, etc.)
│   ├── pom.xml                 # Dependências e configurações do Maven
│   └── Dockerfile              # Configurações do container Docker do backend
├── sigrest-frontend/           # Frontend (React 19)
│   ├── src/                    # Componentes, telas e estilos do React
│   ├── package.json            # Dependências e scripts do Node.js
│   └── Dockerfile              # Configurações do container Docker do frontend
├── docker-compose.yml          # Configuração dos containers (DB, Back, Front)
├── .env.example                # Modelo de variáveis de ambiente para o banco de dados
└── README.md                   # Documentação do projeto (este arquivo)
```

---

## 🚀 Como Executar o Projeto

Você pode rodar todo o ecossistema localmente utilizando **Docker Compose** (recomendado para desenvolvimento integrado) ou iniciar cada serviço manualmente.

### Opção 1: Execução Completa via Docker Compose (Recomendado)

Esta abordagem levanta o banco de dados, o backend e o frontend simultaneamente.

1.  Crie um arquivo `.env` na raiz do projeto copiando as configurações de `.env.example`:
    ```bash
    cp .env.example .env
    ```
2.  Inicie os containers:
    ```bash
    docker-compose up -d --build
    ```
3.  O sistema estará disponível nos seguintes endereços:
    *   **Frontend:** `http://localhost:3000`
    *   **Backend:** `http://localhost:8080`
    *   **Banco de Dados:** `localhost:5432`

---

### Opção 2: Execução Manual dos Componentes

#### Passo 1: Iniciar o Banco de Dados (Docker)
Inicie apenas o serviço de banco de dados definido no compose:
```bash
docker-compose up -d db
```

#### Passo 2: Executar o Backend (Spring Boot)
1.  Navegue até a pasta do backend:
    ```bash
    cd SigRestBack
    ```
2.  Execute o comando para iniciar a aplicação:
    ```bash
    mvn spring-boot:run
    ```
O backend estará de pé na porta `8080`.

#### Passo 3: Executar o Frontend (React)
1.  Navegue até a pasta do frontend:
    ```bash
    cd sigrest-frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm start
    ```
O frontend abrirá automaticamente no navegador em `http://localhost:3000`.

---

## 🔒 Acesso e Credenciais de Teste

Ao subir o banco de dados pela primeira vez, o populador de dados automático (`DataInitializer`) criará o seguinte usuário Master/Administrador:

*   **E-mail:** `admin@admin.com`
*   **Senha:** `admin123`
