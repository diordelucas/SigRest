# Testes E2E (Selenium WebDriver)

Suíte de testes end-to-end que valida os fluxos críticos do SigRest pelo
**frontend real** (React + Tailwind), dirigindo um navegador Chrome.

## Arquitetura

```
e2e/
├── BaseE2ETest.java        # Setup/teardown do WebDriver (WebDriverManager + ChromeDriver)
├── SigRestE2ETests.java    # Suíte: Login, Cadastro de Produto, Registro de Venda
└── pages/                  # Page Object Model (POM)
    ├── LoginPage.java
    ├── ProductPage.java
    └── SalePage.java
```

- **Page Object Model**: cada tela é uma classe com seus seletores e ações,
  evitando scripts frágeis e duplicação.
- **Esperas explícitas** (`WebDriverWait`) antes de cada interação, pois o
  React renderiza de forma assíncrona.
- **Seletores estáveis**: os campos usam atributos `data-testid` no frontend,
  imunes a mudanças de classe/markup do Tailwind.

## Pré-requisitos para rodar

1. **Google Chrome instalado** na máquina que executa os testes
   (o `WebDriverManager` baixa o driver compatível automaticamente).
2. **Backend** em `http://localhost:8080` e **frontend** em `http://localhost:3000`.
3. Usuário admin `admin@admin.com / admin123` (criado pelo `DataInitializer`).
4. **Pelo menos uma Pessoa cadastrada** (o fluxo de venda exige um cliente).

## Como executar

```bash
# Apenas os testes E2E (a partir da pasta SigRestBack)
mvn test -Pe2e

# Sem janela visível (modo CI)
mvn test -Pe2e -De2e.headless=true

# Frontend em outra porta/URL
mvn test -Pe2e -De2e.baseUrl=http://localhost:3001
```

> Os testes E2E são marcados com `@Tag("e2e")` e **não** rodam no `mvn test`
> normal — apenas via profile `-Pe2e`. Assim o build de CI/unitário continua rápido.