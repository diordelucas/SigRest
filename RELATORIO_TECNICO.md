# SigRest — Sistema Integrado de Gestão para Restaurantes
## Relatório Técnico Completo

---

## 1. Visão Geral do Sistema

O **SigRest** (Sistema Integrado de Gestão para Restaurantes) é uma aplicação web desenvolvida para atender às necessidades de gestão operacional e financeira de estabelecimentos do ramo alimentício — como restaurantes, lanchonetes e confeitarias. O sistema centraliza em uma única plataforma os processos de cadastro de produtos e insumos, controle de estoque, ficha técnica com cálculo de custo e precificação, ordens de produção, registro de vendas e compras, controle de caixa e geração de relatórios gerenciais.

O problema central que motivou o desenvolvimento foi a fragmentação das informações nesses estabelecimentos: dados de estoque em planilhas, fichas técnicas em cadernos, vendas em sistemas distintos e controle financeiro manual. O SigRest unifica esses processos, reduz erros operacionais e oferece visibilidade em tempo real sobre a saúde financeira do negócio.

---

## 2. Arquitetura do Sistema

O sistema adota a arquitetura de **três camadas** (Three-Tier Architecture), separando responsabilidades em:

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO (Frontend)                      │
│  React 19.1.0 + Tailwind CSS 3.4.19                    │
│  Porta 3000                                             │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST (JSON)
┌───────────────────────▼─────────────────────────────────┐
│  CAMADA DE NEGÓCIO (Backend)                            │
│  Spring Boot 3.3.11 + Java 17                          │
│  Porta 8080                                             │
└───────────────────────┬─────────────────────────────────┘
                        │ JDBC / JPA
┌───────────────────────▼─────────────────────────────────┐
│  CAMADA DE DADOS (Banco de Dados)                       │
│  PostgreSQL 15 Alpine                                   │
│  Porta 5432                                             │
└─────────────────────────────────────────────────────────┘
```

Toda a stack é **containerizada com Docker**, garantindo portabilidade e consistência entre ambientes de desenvolvimento, teste e produção.

### 2.1 Padrão de Projeto — Backend

O backend segue o padrão **MVC em camadas**, organizado em quatro pacotes principais:

- **`entity`** — Classes JPA que mapeiam as tabelas do banco de dados
- **`dto`** — Data Transfer Objects (records Java) para entrada e saída de dados via API
- **`repository`** — Interfaces Spring Data JPA que geram as queries automaticamente
- **`service`** — Regras de negócio com controle transacional (`@Transactional`)
- **`controller`** — Endpoints REST que recebem requisições e delegam ao service
- **`config`** — Configurações de segurança, CORS e documentação

### 2.2 Padrão de Projeto — Frontend

O frontend é uma **Single Page Application (SPA)** organizada em:

- **`components`** — Componentes React reutilizáveis (formulários, listas, painéis)
- **`pages`** — Páginas compostas por componentes, cada uma mapeada a uma rota
- **`services/api.js`** — Instância centralizada do Axios para chamadas HTTP
- **`utils`** — Funções utilitárias (formatação de moeda, datas)

---

## 3. Tecnologias Utilizadas

### 3.1 Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 17 (LTS) | Linguagem principal do backend |
| Spring Boot | 3.3.11 | Framework para criação da API REST |
| Spring Data JPA | 3.3.11 | Abstração de acesso ao banco de dados |
| Spring Security | 6.3.9 | Autenticação, autorização e criptografia de senhas |
| Hibernate ORM | 6.5.3.Final | Mapeamento objeto-relacional (ORM) |
| PostgreSQL Driver | 42.x (gerenciado) | Driver JDBC para PostgreSQL |
| Lombok | 1.18.x (gerenciado) | Redução de boilerplate (getters, setters, construtores) |
| SpringDoc OpenAPI | 2.6.0 | Geração automática de documentação Swagger UI |
| Maven | 3.9.6 | Gerenciador de dependências e build |
| JUnit 5 | 5.x (gerenciado) | Framework de testes unitários e de integração |
| H2 Database | 2.x (gerenciado) | Banco em memória usado nos testes automatizados |
| Selenium WebDriver | 4.x (gerenciado) | Testes end-to-end (E2E) de interface |
| WebDriverManager | 5.9.2 | Gerenciamento automático de drivers de browser para testes E2E |

**Vantagens do Spring Boot 3.x com Java 17:**
- Java 17 é versão LTS (Long-Term Support), garantindo suporte até 2029
- Spring Boot 3 requer Java 17 mínimo e utiliza Jakarta EE 10 (nova nomenclatura das APIs JEE)
- Auto-configuração elimina XML de configuração
- Servidor Tomcat embutido — o JAR gerado já contém o servidor web
- `spring-boot-starter-actuator` disponibiliza endpoints de monitoramento (`/actuator/health`)

### 3.2 Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19.1.0 | Biblioteca para construção de interfaces reativas |
| React DOM | 19.1.0 | Renderização do React no navegador |
| React Router DOM | 6.25.1 | Roteamento client-side (SPA) |
| Tailwind CSS | 3.4.19 | Framework CSS utilitário (estilização inline) |
| Axios | 1.7.2 | Cliente HTTP para chamadas à API REST |
| Recharts | 2.12.7 | Biblioteca de gráficos (linha, barra) para dashboards |
| React Hot Toast | 2.6.0 | Notificações toast (feedback visual de ações) |
| Lucide React | 1.17.0 | Biblioteca de ícones SVG |
| Moment.js | 2.30.1 | Manipulação e formatação de datas |
| React IMask | 7.6.1 | Máscaras de input (CPF, CNPJ, CEP, telefone) |
| Material UI (MUI) | 5.16.4 | Componentes visuais complementares |
| react-scripts | 5.0.1 | Build toolchain (Webpack, Babel) |

**Vantagens do React 19:**
- Virtual DOM garante re-renderizações eficientes
- Ecossistema maduro com vasta documentação
- Hooks (`useState`, `useEffect`) simplificam o gerenciamento de estado
- Componentes reutilizáveis reduzem duplicação de código

### 3.3 Infraestrutura e Banco de Dados

| Tecnologia | Versão | Finalidade |
|---|---|---|
| PostgreSQL | 15 Alpine | Banco de dados relacional principal |
| Docker | 25.x+ | Containerização dos serviços |
| Docker Compose | 2.x | Orquestração dos containers |
| Node.js | 18 Alpine | Runtime para build e execução do frontend |
| Eclipse Temurin JRE | 17 Alpine | Runtime Java leve para o container do backend |

**Vantagens do PostgreSQL:**
- SGBD open-source robusto com suporte a tipos avançados
- ACID compliant (Atomicidade, Consistência, Isolamento, Durabilidade)
- Suporte a `DECIMAL`/`NUMERIC` com precisão arbitrária (essencial para valores monetários)
- Excelente performance em queries complexas com índices e joins

**Vantagens da containerização com Docker:**
- Ambiente idêntico em desenvolvimento, teste e produção
- `docker compose up --build` reconstrói e sobe toda a stack com um único comando
- Volumes Docker persistem os dados do PostgreSQL independentemente do container
- Healthcheck garante que o backend só sobe após o banco estar pronto

---

## 4. Módulos do Sistema

### 4.1 Módulo de Autenticação e Usuários

**Entidade:** `User` (`app_user`) — armazena email, senha (hash BCrypt) e papel (`role`).

**Papéis:**
- `ADMIN` — acesso completo, incluindo cadastros de usuários, exclusão de produtos e módulos financeiros
- `OPERADOR` — acesso operacional (vendas, compras, produção, fichas técnicas)

**Como funciona:**
- O `UserService` usa `BCryptPasswordEncoder` para armazenar a senha com hash no banco
- No login, a senha informada é comparada com o hash via `passwordEncoder.matches()`
- O frontend armazena o objeto do usuário em `localStorage` após login bem-sucedido
- `ProtectedRoute` e `AdminRoute` são componentes React que verificam a presença e o papel do usuário antes de renderizar uma página, redirecionando para `/login` se não autorizado

**Endpoints:**
- `POST /user` — criação de usuário
- `POST /user/login` — autenticação
- `GET /user` — listagem (ADMIN)
- `DELETE /user/{id}` — remoção (ADMIN)

---

### 4.2 Módulo de Produtos e Categorias

**Entidades:** `Product` e `Category`

**Campos de `Product`:**

| Campo | Tipo | Descrição |
|---|---|---|
| id | Long | Identificador único |
| name | String | Nome do produto |
| code | String | Código interno |
| price | BigDecimal | Preço de custo (embalagem) |
| sellPrice | BigDecimal | Preço de venda sugerido |
| storage | BigDecimal | Estoque atual em **unidade base** (g, ml ou un) |
| minStorage | BigDecimal | Estoque mínimo (abaixo → alerta de estoque baixo) |
| tipo | ProductType (enum) | INSUMO / PRODUTO_FINAL / PRODUTO_INTERMEDIARIO |
| purchaseUnit | UnitOfMeasure (enum) | Unidade de compra da embalagem (G, KG, ML, L, UN, DUZIA) |
| packageQuantity | BigDecimal | Quantidade em unidades base por embalagem comprada |
| category | Category | Categoria do produto (FK) |

**Classificação de Produtos (`ProductType`):**
- **INSUMO** — matéria-prima (farinha, carne, embalagem). Possui `purchaseUnit` e `packageQuantity` para controle de custo unitário por base
- **PRODUTO_FINAL** — produto vendido ao cliente final (hambúrguer, pizza). Tem estoque incrementado ao finalizar ordens de produção
- **PRODUTO_INTERMEDIARIO** — produto usado em outras receitas (massa de pizza, molho base)

**Sistema de Unidades de Medida (`UnitOfMeasure`):**

| Enum | Rótulo | Fator de Conversão | Unidade Base |
|---|---|---|---|
| G | Grama | 1 | g |
| KG | Quilograma | 1.000 | g |
| ML | Mililitro | 1 | ml |
| L | Litro | 1.000 | ml |
| UN | Unidade | 1 | un |
| DUZIA | Dúzia | 12 | un |

O estoque é sempre armazenado em **unidade base** (gramas, mililitros ou unidades), eliminando ambiguidades. Exemplo: 2 pacotes de 5 kg de farinha → `storage = 10.000` (gramas).

**Endpoints:**
- `GET /product` — lista todos com badge de estoque
- `POST /product` — cadastra produto com tipo e UDM
- `PUT /product/{id}` — atualiza incluindo purchaseUnit e packageQuantity
- `DELETE /product/{id}` — remove produto

---

### 4.3 Módulo de Clientes (Pessoas)

**Entidade:** `Person` vinculada a `Address` → `City` → `State`

Armazena dados cadastrais de clientes: nome, CPF, e-mail, telefone e endereço completo com busca automática de CEP via API ViaCEP.

**Endpoints:** `GET|POST|PUT|DELETE /person`

---

### 4.4 Módulo de Fornecedores

**Entidade:** `Supplier` vinculada a `Address` → `City` → `State`

Armazena CNPJ, razão social, e-mail, telefone e endereço do fornecedor. Vinculado às compras para rastreabilidade.

**Endpoints:** `GET|POST|PUT|DELETE /supplier`

---

### 4.5 Módulo de Compras

**Entidades:** `Purchase` e `PurchaseItem`

**Como funciona:**
1. O operador registra a nota de compra selecionando fornecedor, data e itens (produto, quantidade de embalagens, preço unitário)
2. O `PurchaseService.createPurchase()` percorre os itens e para cada um chama `toBaseUnits(product, qtdPacotes)`:
   - Se o produto tem `purchaseUnit` e `packageQuantity` definidos: `qtdPacotes × packageQuantity × purchaseUnit.conversionFactor`
   - Exemplo: 3 pacotes de 5 KG de farinha → 3 × 5 × 1000 = **15.000 gramas** creditadas no estoque
3. Uma `StockMovement` do tipo `ENTRY` é registrada automaticamente com a quantidade em unidade base

**Impacto no estoque:** o campo `product.storage` (BigDecimal) é incrementado com a quantidade em unidade base.

**Endpoints:** `GET|POST /purchase`, `GET /purchase/{id}`

---

### 4.6 Módulo de Vendas

**Entidades:** `Sale` e `SellItem`

**Como funciona:**
1. O operador seleciona o cliente (opcional), forma de pagamento, desconto e itens (produto + quantidade + preço)
2. Antes de registrar, o `SaleService` valida se `product.storage >= itemDTO.quantity` usando comparação BigDecimal (`compareTo`)
3. Após validação, registra a venda e chama `StockMovementService.createStockExit()` debitando o estoque de cada produto vendido
4. Total é calculado como `Σ(unitPrice × quantity) - discount`

**Endpoints:** `GET /sale`, `POST /sale`, `GET /sale/{id}`

---

### 4.7 Módulo de Estoque

**Entidade:** `StockMovement`

| Campo | Tipo | Descrição |
|---|---|---|
| id | Long | Identificador único |
| product | Product | Produto movimentado |
| type | MovementType | ENTRY (entrada) ou EXIT (saída) |
| quantity | BigDecimal | Quantidade em **unidade base** |
| date | LocalDateTime | Data/hora da movimentação |
| description | String | Descrição (ex: "Compra #12", "Venda #7") |

**Movimentações automáticas** são geradas pelos módulos de Compras, Vendas e Ordens de Produção. O operador também pode registrar movimentações manuais (ajuste de inventário, perdas, doações).

**Validações:**
- Saída: verifica `currentStock.compareTo(quantity) >= 0` antes de debitar
- Entrada: soma `current.add(quantity)` ao estoque atual
- Null-safe: `storage != null ? storage : BigDecimal.ZERO`

**Endpoints:** `GET /stock-movement`, `POST /stock-movement`

---

### 4.8 Módulo de Ficha Técnica

**Entidades:** `TechnicalSheet` e `TechnicalSheetItem`

A ficha técnica (ou receita) define quais insumos e em que quantidades são necessários para produzir uma unidade de um produto final.

**Campos de `TechnicalSheet`:**

| Campo | Tipo | Descrição |
|---|---|---|
| id | Long | Identificador |
| name | String | Nome da ficha ("Receita de Hambúrguer Artesanal") |
| finalProduct | Product | Produto final gerado pela receita |
| rendimento | Integer | Número de porções/unidades produzidas |
| labourCostPercent | BigDecimal | % de custo de mão de obra sobre o custo total |
| variableExpensesPercent | BigDecimal | % de despesas variáveis (energia, embalagem) |
| desiredMarginPercent | BigDecimal | % de margem de lucro desejada |
| items | List\<TechnicalSheetItem\> | Lista de ingredientes |

**Campos de `TechnicalSheetItem`:**

| Campo | Tipo | Descrição |
|---|---|---|
| rawMaterial | Product | Insumo utilizado |
| quantity | BigDecimal | Quantidade usada na receita |
| unit | UnitOfMeasure | UDM da quantidade na receita (pode diferir da UDM de compra) |

**Cálculo de Custo (`GET /technical-sheet/{id}/calculate-cost`):**

O algoritmo implementado no `TechnicalSheetService.calculateCost()` utiliza o método do **markup divisor** para sugestão de preço de venda:

```
Para cada item da ficha:
  purchaseTotalBase = packageQuantity × purchaseUnit.conversionFactor
  costPerBaseUnit   = price ÷ purchaseTotalBase       (escala 10, HALF_UP)
  itemBaseUnits     = quantity × unit.conversionFactor
  itemCost          = costPerBaseUnit × itemBaseUnits  (escala 4, HALF_UP)

ingredientsCost    = Σ itemCost
totalCostWithLabour = ingredientsCost × (1 + labourCostPercent / 100)
markupIndex        = (100 - variableExpensesPercent - desiredMarginPercent) / 100
suggestedSellPrice = totalCostWithLabour ÷ markupIndex  (escala 2, HALF_UP)
perServingCost     = ingredientsCost ÷ rendimento       (se rendimento > 0)
```

**Exemplo prático:**
- Farinha de trigo: R$ 12,50 / pacote de 5 kg → custo por grama = R$ 0,0025/g
- Receita usa 250 g → custo do item = R$ 0,625
- Custo total dos ingredientes = R$ 3,20
- Mão de obra 30% → custo com MO = R$ 4,16
- Despesas variáveis 15% + margem 30% → índice = 0,55
- **Preço sugerido = R$ 7,56**

**Endpoints:**
- `GET /technical-sheet` — lista todas as fichas
- `POST /technical-sheet` — cria nova ficha com itens
- `PUT /technical-sheet/{id}` — atualiza ficha
- `GET /technical-sheet/{id}/calculate-cost` — retorna `CostCalculationResponseDTO` completo
- `DELETE /technical-sheet/{id}` — remove ficha

---

### 4.9 Módulo de Ordens de Produção

**Entidade:** `ProductionOrder`

| Campo | Tipo | Descrição |
|---|---|---|
| finalProduct | Product | Produto a ser produzido |
| quantity | Integer | Quantidade de unidades a produzir |
| date | LocalDateTime | Data de abertura |
| status | Status (enum) | OPEN / FINISHED / CANCELLED |
| notes | String | Observações |

**Fluxo de finalização (`PUT /production-order/{id}/finish`):**

1. **Busca a Ficha Técnica** vinculada ao produto final da ordem
2. **Fase de validação** — percorre todos os itens da ficha e verifica se há estoque suficiente de cada insumo em unidade base:
   - `totalNeeded = item.quantity × item.unit.conversionFactor × order.quantity`
   - Se algum insumo estiver insuficiente, lança exceção com mensagem detalhada (nome do insumo, necessário e disponível em unidade base)
3. **Fase de baixa** — somente após validar todos os insumos, debita o estoque de cada um via `StockMovementService.createStockExit()`
4. **Entrada do produto final** — credita `order.quantity` unidades no estoque do produto final
5. **Status** atualizado para `FINISHED`

A validação completa antes da baixa garante atomicidade: nenhum insumo é debitado se a produção não pode ser concluída integralmente.

---

### 4.10 Módulo de Caixa

**Entidades:** `CashRegister` e `CashMovement`

**Fluxo do caixa:**
1. Operador abre o caixa informando o saldo inicial em espécie (`openingBalance`)
2. Durante o turno, vendas e compras são registradas normalmente
3. Movimentações manuais (sangria, suprimento) são registradas via `CashMovement` com tipo `INCOME` ou `EXPENSE`
4. Ao fechar o caixa, o sistema calcula o `closingBalance` = `openingBalance + Σ vendas - Σ compras + movimentações manuais`
5. Histórico de todos os turnos fica registrado com usuário responsável pela abertura e fechamento

**Endpoints:**
- `POST /cash-register/open` — abre o caixa com saldo inicial
- `PUT /cash-register/{id}/close` — fecha o caixa calculando saldo final
- `GET /cash-register/current` — retorna caixa aberto atualmente
- `GET /cash-register` — histórico de caixas
- `POST /cash-movement` — movimentação manual
- `GET /cash-movement/by-register/{id}` — movimentações de um caixa

---

### 4.11 Módulo Financeiro (Contas a Pagar e a Receber)

**Entidades:** `AccountPayable` e `AccountReceivable`

Controle de obrigações financeiras pendentes:
- **Contas a Pagar** — vinculadas a fornecedores, com descrição, valor, vencimento e status (PENDING / PAID / OVERDUE)
- **Contas a Receber** — vinculadas a clientes, mesma estrutura

Permite ao gestor acompanhar o fluxo de caixa projetado e identificar inadimplências.

---

### 4.12 Dashboard e Relatórios

**Dashboard (`GET /dashboard/summary`):** retorna KPIs calculados em tempo real:
- Faturamento do dia
- Número de vendas do dia
- Faturamento do mês
- Contagem de produtos com estoque abaixo do mínimo
- Total de contas a receber
- Total de contas a pagar
- Saldo projetado (receber − pagar)

**Gráficos exibidos:**
- Faturamento mensal nos últimos 6 meses (gráfico de linha)
- Top 5 produtos mais vendidos (gráfico de barras)
- Vendas por período com filtro de data (gráfico de área)
- Movimentações de estoque recentes

**Relatórios sob demanda (`/reports`):**

| Endpoint | Descrição |
|---|---|
| `GET /reports/monthly-revenue` | Faturamento agrupado por mês no período |
| `GET /reports/top-selling-products` | Produtos mais vendidos por quantidade |
| `GET /reports/sales-by-period` | Total de vendas agrupado por dia no período |
| `GET /reports/stock-movement` | Histórico de movimentações de estoque |
| `GET /reports/purchase-history` | Histórico de compras por fornecedor |
| `GET /reports/financial-flow` | Fluxo financeiro: entradas, saídas e saldo |

---

### 4.13 Módulo de Localização

**Entidades:** `State`, `City`, `Address`

Hierarquia geográfica para endereçamento de clientes e fornecedores. O frontend integra a **API pública ViaCEP** para preenchimento automático de logradouro, bairro e cidade a partir do CEP digitado.

---

## 5. API REST — Documentação

O backend disponibiliza documentação interativa automática via **SpringDoc OpenAPI 2.6.0** (implementação OpenAPI 3.0), acessível em:

```
http://localhost:8080/swagger-ui/index.html
```

A interface Swagger UI permite:
- Visualizar todos os endpoints organizados por controller
- Inspecionar os schemas de request e response
- Executar requisições diretamente no navegador (modo "Try it out")

---

## 6. Segurança

### 6.1 Criptografia de Senhas

Senhas de usuários são armazenadas com hash **BCrypt** (fator de custo 10 por padrão), tornando ataques de força bruta computacionalmente inviáveis. O `BCryptPasswordEncoder` do Spring Security adiciona salt aleatório a cada hash, impedindo ataques de dicionário com rainbow tables.

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### 6.2 Configuração de CORS

A política de CORS (Cross-Origin Resource Sharing) permite que o frontend (porta 3000) realize requisições ao backend (porta 8080), configurando os cabeçalhos adequados para todos os métodos HTTP relevantes (GET, POST, PUT, DELETE, PATCH, OPTIONS).

### 6.3 Proteção no Frontend

- **`ProtectedRoute`** — componente que intercepta rotas e redireciona para `/login` se não houver usuário autenticado no `localStorage`
- **`AdminRoute`** — estende o `ProtectedRoute` verificando adicionalmente se `role === "ADMIN"`, exibindo tela de "Acesso Negado" para operadores que tentam acessar áreas restritas

### 6.4 Observações e Melhorias Futuras

A versão atual utiliza autenticação básica com verificação no frontend e senha hasheada no banco. Para ambientes de produção de alto risco, recomenda-se:
- Implementar autenticação stateless com **JWT (JSON Web Tokens)** no backend, removendo a dependência do `localStorage`
- Configurar HTTPS com certificado TLS
- Restringir o CORS para origens específicas
- Implementar rate limiting para prevenir ataques de força bruta no endpoint de login

---

## 7. Infraestrutura e Deploy

### 7.1 Estrutura dos Containers

O arquivo `docker-compose.yml` define quatro serviços principais:

```yaml
db:
  image: postgres:15-alpine
  volumes: [postgres_data:/var/lib/postgresql/data]
  healthcheck: pg_isready

backend:
  build: ./SigRestBack          # Dockerfile multi-stage: Maven + JRE Alpine
  depends_on: [db: healthy]     # Aguarda o banco estar pronto

frontend:
  build: ./sigrest-frontend     # Node 18 Alpine + npm install + npm start
  depends_on: [backend]
```

### 7.2 Build Multi-Stage do Backend

O `Dockerfile` do backend usa **build em dois estágios** para minimizar o tamanho da imagem final:

```dockerfile
# Estágio 1: Compilação (imagem com Maven + JDK, ~700 MB)
FROM maven:3.9.6-eclipse-temurin-17 AS build
RUN mvn clean package -DskipTests

# Estágio 2: Execução (apenas JRE Alpine, ~180 MB)
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /app/target/SigRestBack-1.0-SNAPSHOT.jar app.jar
```

A imagem final contém apenas o JRE e o JAR, reduzindo a superfície de ataque e o tamanho do container de ~700 MB para ~180 MB.

### 7.3 Persistência de Dados

O volume Docker `postgres_data` garante que os dados do PostgreSQL persistem mesmo que o container seja recriado. Isso é fundamental para manter o histórico de vendas, estoque e fichas técnicas entre deploys.

### 7.4 Auto-Migration do Schema

O Hibernate está configurado com `ddl-auto=update`: ao iniciar, compara o schema do banco com as entidades JPA e emite comandos `ALTER TABLE` para adicionar colunas novas ou modificar tipos. Isso permite evoluir o modelo de dados sem SQL manual em ambiente de desenvolvimento.

---

## 8. Plano de Backup

### 8.1 Backup Manual (pg_dump)

O PostgreSQL disponibiliza a ferramenta `pg_dump` para exportar o banco completo em SQL:

```bash
# Exportar banco de dados para arquivo SQL
docker exec sigrest_db pg_dump -U postgres sigrest_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar a partir de backup
cat backup_20260612_200000.sql | docker exec -i sigrest_db psql -U postgres sigrest_db
```

### 8.2 Backup Automatizado (Cron)

Para produção, recomenda-se um cron job diário:

```bash
# Crontab: backup às 02h00 todo dia, mantendo os últimos 30 arquivos
0 2 * * * docker exec sigrest_db pg_dump -U postgres sigrest_db \
  > /backups/sigrest_$(date +\%Y\%m\%d).sql && \
  find /backups -name "sigrest_*.sql" -mtime +30 -delete
```

### 8.3 Backup do Volume Docker

Alternativamente, o volume inteiro pode ser exportado como arquivo `.tar.gz`:

```bash
# Exportar volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data

# Restaurar volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_data_20260612.tar.gz -C /
```

### 8.4 Recomendações para Produção

| Prática | Descrição |
|---|---|
| Frequência | Backup completo diário + backup incremental a cada hora (WAL archiving) |
| Armazenamento | Manter backups em local externo ao servidor (S3, Google Drive, NAS externo) |
| Retenção | 30 dias de backups diários, 12 semanas de backups semanais |
| Teste de restauração | Testar o processo de restore mensalmente em ambiente isolado |
| Criptografia | Criptografar arquivos de backup com GPG antes de enviar para armazenamento externo |

---

## 9. Testes

### 9.1 Testes Unitários e de Integração

O projeto inclui testes com **JUnit 5**, usando o **H2 Database** (banco em memória) para testes de integração do repositório sem depender do PostgreSQL:

```bash
mvn test                    # Executa apenas testes unitários/integração
```

### 9.2 Testes End-to-End (E2E)

Testes de interface automatizados com **Selenium WebDriver** e **WebDriverManager** (gerenciamento automático de ChromeDriver):

```bash
mvn test -Pe2e              # Executa testes E2E (requer frontend + backend rodando)
mvn test -Pe2e -De2e.headless=true  # Modo headless (sem janela do browser)
```

Os testes E2E estão anotados com `@Tag("e2e")` e excluídos do build padrão para não travar o CI sem a stack completa.

---

## 10. Fluxo de Desenvolvimento e Versionamento

O código-fonte é versionado no **GitHub** (repositório `diordelucas/SigRest`), com histórico completo de commits semânticos seguindo o padrão **Conventional Commits**:

```
feat:  nova funcionalidade
fix:   correção de bug
docs:  documentação
refactor: refatoração sem mudança de comportamento
```

**Fluxo de deploy:**

```
Desenvolvimento local → git commit → git push → 
docker compose build --no-cache → docker compose up -d
```

---

## 11. Estrutura de Diretórios

```
Sistemacompleto/
├── docker-compose.yml              # Orquestração dos containers
├── .env                            # Variáveis de ambiente (DB_URL, credenciais)
├── SigRestBack/                    # Backend Spring Boot
│   ├── Dockerfile                  # Build multi-stage Maven → JRE Alpine
│   ├── pom.xml                     # Dependências Maven
│   └── src/main/java/.../
│       ├── config/                 # SecurityConfig, SwaggerConfig
│       ├── controller/             # 18 controllers REST
│       ├── dto/                    # ~30 DTOs (records Java)
│       ├── entity/                 # 20 entidades JPA
│       ├── exception/              # GlobalExceptionHandler, BusinessException
│       ├── repository/             # 19 interfaces Spring Data JPA
│       └── service/                # Regras de negócio
├── sigrest-frontend/               # Frontend React
│   ├── Dockerfile                  # Node 18 Alpine
│   ├── package.json                # Dependências npm
│   └── src/
│       ├── components/             # 33 componentes React
│       ├── pages/                  # Páginas (compostas por componentes)
│       ├── services/api.js         # Instância Axios centralizada
│       └── utils/currency.js       # Formatação monetária (BRL)
└── *.puml                          # Diagramas UML (PlantUML)
```

---

## 12. Diferenciais Técnicos

### 12.1 Gestão de Custos com UDM (Unidade de Medida)

O principal diferencial técnico do SigRest é o sistema de unidades de medida aplicado ao controle de custo de insumos. A maioria dos sistemas de gestão para restaurantes trata produtos de forma simples (unidades inteiras). O SigRest permite:

- Comprar em quilograma e usar em gramas na receita, com conversão automática
- Calcular o custo por grama/mililitro de cada insumo automaticamente
- Sugerir preço de venda baseado na fórmula do markup divisor, considerando mão de obra, despesas variáveis e margem desejada

### 12.2 Precisão Financeira com BigDecimal

Todos os valores monetários e quantidades são representados como `BigDecimal` (Java) e `DECIMAL/NUMERIC` (PostgreSQL), jamais `float` ou `double`. Isso evita erros de arredondamento binário (ex: `0.1 + 0.2 = 0.30000000000000004` em ponto flutuante). Todas as divisões utilizam `RoundingMode.HALF_UP` com escala explícita.

### 12.3 Atomicidade na Finalização de Produção

A validação de estoque de todos os insumos é feita **antes** de qualquer débito. Isso garante que, se faltar um único insumo, nenhum outro é debitado — evitando estados inconsistentes no estoque.

### 12.4 Rastreabilidade Total de Estoque

Toda movimentação de estoque (entrada ou saída) gera um registro em `stock_movement` com data, tipo, quantidade em unidade base e descrição. Isso permite auditoria completa do histórico do estoque.

---

## 13. Resumo das Tecnologias

| Categoria | Tecnologia | Versão |
|---|---|---|
| Linguagem Backend | Java | 17 LTS |
| Framework Backend | Spring Boot | 3.3.11 |
| ORM | Hibernate / Spring Data JPA | 6.5.3 |
| Segurança | Spring Security | 6.3.9 |
| Banco de Dados | PostgreSQL | 15 Alpine |
| Linguagem Frontend | JavaScript (ES2022+) | — |
| Framework Frontend | React | 19.1.0 |
| Estilização | Tailwind CSS | 3.4.19 |
| HTTP Client | Axios | 1.7.2 |
| Gráficos | Recharts | 2.12.7 |
| Containerização | Docker + Docker Compose | 25.x / 2.x |
| Documentação API | SpringDoc OpenAPI (Swagger) | 2.6.0 |
| Testes Backend | JUnit 5 + H2 | 5.x |
| Testes E2E | Selenium + WebDriverManager | 4.x / 5.9.2 |
| Gerenciador Build | Maven | 3.9.6 |
| Versionamento | Git + GitHub | — |

---

*Relatório gerado em 14/06/2026 — SigRest v1.0-SNAPSHOT*