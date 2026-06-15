# Dicionário de Dados — SigRest
## Sistema Integrado de Gestão para Restaurantes

> **Convenções:**
> - **PK** — Chave Primária (Primary Key)
> - **FK** — Chave Estrangeira (Foreign Key)
> - **NOT NULL** — campo obrigatório
> - **NULL** — campo opcional
> - Tipos PostgreSQL inferidos do mapeamento JPA/Hibernate com `ddl-auto=update`

---

## Visão Geral das Tabelas

| Nº | Tabela | Descrição |
|---|---|---|
| 01 | `uf` | Estados brasileiros |
| 02 | `city` | Municípios |
| 03 | `address` | Endereços de clientes e fornecedores |
| 04 | `app_user` | Usuários do sistema |
| 05 | `category` | Categorias de produtos |
| 06 | `product` | Produtos, insumos e produtos intermediários |
| 07 | `person` | Clientes (pessoas físicas) |
| 08 | `supplier` | Fornecedores (pessoas jurídicas) |
| 09 | `sale` | Cabeçalho das vendas |
| 10 | `sell_item` | Itens de cada venda |
| 11 | `purchase` | Cabeçalho das compras |
| 12 | `purchase_item` | Itens de cada compra |
| 13 | `stock_movement` | Histórico de movimentações de estoque |
| 14 | `technical_sheet` | Fichas técnicas (receitas) |
| 15 | `technical_sheet_item` | Ingredientes de cada ficha técnica |
| 16 | `production_order` | Ordens de produção |
| 17 | `cash_register` | Registros de abertura/fechamento de caixa |
| 18 | `cash_movement` | Movimentações manuais de caixa |
| 19 | `account_payable` | Contas a pagar |
| 20 | `account_receivable` | Contas a receber |

---

## 01 — Tabela `uf` (Estados)

**Entidade Java:** `State`
**Descrição:** Armazena os estados brasileiros para composição de endereços.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do estado |
| `name` | VARCHAR(255) | NULL | Nome completo do estado (ex: "São Paulo") |
| `uf` | VARCHAR(255) | NULL | Sigla do estado (ex: "SP") |

**Relacionamentos:**
- Referenciada por `city.state_id`

---

## 02 — Tabela `city` (Municípios)

**Entidade Java:** `City`
**Descrição:** Armazena os municípios vinculados a um estado.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do município |
| `name` | VARCHAR(255) | NULL | Nome do município (ex: "Campinas") |
| `state_id` | BIGINT | FK → `uf.id`, NULL | Estado ao qual o município pertence |

**Relacionamentos:**
- `state_id` → `uf.id` (N:1) — cada cidade pertence a um estado
- Referenciada por `address.city_id`

---

## 03 — Tabela `address` (Endereços)

**Entidade Java:** `Address`
**Descrição:** Endereços utilizados por clientes (`person`) e fornecedores (`supplier`). Criados em cascata junto com o cadastro do proprietário.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do endereço |
| `street` | VARCHAR(255) | NULL | Logradouro (rua, avenida, etc.) |
| `number` | VARCHAR(255) | NULL | Número do imóvel |
| `nbhd` | VARCHAR(255) | NULL | Bairro (neighborhood) |
| `city_id` | BIGINT | FK → `city.id`, NULL | Município do endereço |

**Relacionamentos:**
- `city_id` → `city.id` (N:1)
- Referenciada por `person.address_id` e `supplier.address_id`

---

## 04 — Tabela `app_user` (Usuários do Sistema)

**Entidade Java:** `User`
**Descrição:** Usuários que acessam o sistema. O nome da tabela é `app_user` pois `user` é palavra reservada no PostgreSQL.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do usuário |
| `name` | VARCHAR(255) | NULL | Nome completo do usuário |
| `email` | VARCHAR(255) | NULL | E-mail de login (deve ser único na aplicação) |
| `password` | VARCHAR(255) | NULL | Senha armazenada com hash BCrypt |
| `role` | VARCHAR(255) | NULL | Papel do usuário: `ADMIN` ou `OPERADOR` |

**Valores válidos para `role`:**
- `ADMIN` — acesso completo ao sistema
- `OPERADOR` — acesso às operações do dia a dia (sem exclusão de cadastros e sem módulo financeiro completo)

**Relacionamentos:**
- Referenciada por `cash_register.opened_by_user_id` e `cash_register.closed_by_user_id`
- Referenciada por `cash_movement.user_id`

---

## 05 — Tabela `category` (Categorias de Produtos)

**Entidade Java:** `Category`
**Descrição:** Categorias para agrupamento e organização dos produtos (ex: "Carnes", "Laticínios", "Bebidas").

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da categoria |
| `name` | VARCHAR(255) | NOT NULL | Nome da categoria |
| `description` | VARCHAR(255) | NULL | Descrição adicional da categoria |

**Relacionamentos:**
- Referenciada por `product.category_id`

---

## 06 — Tabela `product` (Produtos)

**Entidade Java:** `Product`
**Descrição:** Tabela central do sistema. Armazena todos os tipos de produtos: insumos (matérias-primas), produtos finais e produtos intermediários. O estoque é mantido em **unidade base** (gramas, mililitros ou unidades) para permitir comparação e cálculo uniformes.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do produto |
| `name` | VARCHAR(255) | NULL | Nome do produto (ex: "Farinha de Trigo Especial") |
| `code` | VARCHAR(255) | NULL | Código interno de identificação |
| `price` | NUMERIC(38,2) | NULL | Preço de custo por embalagem comprada (R$) |
| `sell_price` | NUMERIC(38,2) | NULL | Preço de venda praticado (R$) |
| `storage` | NUMERIC(38,2) | NULL | Estoque atual em **unidade base** (g, ml ou un) |
| `min_storage` | NUMERIC(38,2) | NULL | Estoque mínimo; abaixo disso gera alerta de reposição |
| `category_id` | BIGINT | FK → `category.id`, NULL | Categoria à qual o produto pertence |
| `tipo` | VARCHAR(255) | NULL | Classificação do produto (ver valores válidos abaixo) |
| `purchase_unit` | VARCHAR(255) | NULL | Unidade de medida da embalagem comprada (ver enum UDM) |
| `package_quantity` | NUMERIC(38,2) | NULL | Quantidade em unidade base por embalagem (ex: 5000 para pacote de 5 kg) |

**Valores válidos para `tipo` (`ProductType`):**

| Valor | Significado |
|---|---|
| `INSUMO` | Matéria-prima ou insumo usado em receitas |
| `PRODUTO_FINAL` | Produto acabado vendido ao cliente |
| `PRODUTO_INTERMEDIARIO` | Produto usado como ingrediente em outras receitas |

**Valores válidos para `purchase_unit` (`UnitOfMeasure`):**

| Valor | Rótulo | Fator de Conversão | Unidade Base |
|---|---|---|---|
| `G` | Grama | 1 | g |
| `KG` | Quilograma | 1.000 | g |
| `ML` | Mililitro | 1 | ml |
| `L` | Litro | 1.000 | ml |
| `UN` | Unidade | 1 | un |
| `DUZIA` | Dúzia | 12 | un |

**Exemplo de registro:**
- Farinha de Trigo: `price=12.50`, `purchase_unit='KG'`, `package_quantity=5000` (5 kg = 5000 g), `storage=25000.00` (25 kg em estoque)

**Relacionamentos:**
- `category_id` → `category.id` (N:1)
- Referenciada por `sell_item.product_id`, `purchase_item.product_id`, `stock_movement.product_id`, `technical_sheet.final_product_id`, `technical_sheet_item.raw_material_id`, `production_order.final_product_id`

---

## 07 — Tabela `person` (Clientes)

**Entidade Java:** `Person`
**Descrição:** Cadastro de clientes (pessoas físicas). O endereço é criado/atualizado em cascata.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do cliente |
| `name` | VARCHAR(255) | NULL | Nome completo do cliente |
| `cpf` | VARCHAR(255) | NULL | CPF do cliente (formato: 000.000.000-00) |
| `phone` | VARCHAR(255) | NULL | Telefone de contato |
| `email` | VARCHAR(255) | NULL | Endereço de e-mail |
| `address_id` | BIGINT | FK → `address.id`, NULL, CASCADE | Endereço do cliente |

**Relacionamentos:**
- `address_id` → `address.id` (N:1, CASCADE ALL) — o endereço é criado/deletado junto com o cliente
- Referenciada por `sale.person_id` e `account_receivable.person_id`

---

## 08 — Tabela `supplier` (Fornecedores)

**Entidade Java:** `Supplier`
**Descrição:** Cadastro de fornecedores (pessoas jurídicas). O endereço é criado/atualizado em cascata.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do fornecedor |
| `name` | VARCHAR(255) | NULL | Razão social ou nome fantasia |
| `cnpj` | VARCHAR(255) | NULL | CNPJ do fornecedor (formato: 00.000.000/0000-00) |
| `registration` | VARCHAR(255) | NULL | Número de registro/inscrição estadual |
| `phone` | VARCHAR(255) | NULL | Telefone de contato |
| `email` | VARCHAR(255) | NULL | Endereço de e-mail |
| `address_id` | BIGINT | FK → `address.id`, NULL, CASCADE | Endereço do fornecedor |

**Relacionamentos:**
- `address_id` → `address.id` (N:1, CASCADE ALL)
- Referenciada por `purchase.supplier_id` e `account_payable.supplier_id`

---

## 09 — Tabela `sale` (Vendas — Cabeçalho)

**Entidade Java:** `Sale`
**Descrição:** Registra o cabeçalho de cada venda realizada. Os itens vendidos ficam na tabela `sell_item`. Ao criar uma venda, o estoque dos produtos é debitado automaticamente.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da venda |
| `date` | TIMESTAMP | NULL | Data e hora da venda |
| `total` | NUMERIC(38,2) | NULL | Valor total da venda após desconto (R$) |
| `discount` | INTEGER | NULL | Valor do desconto concedido em reais (R$) |
| `payment_method` | VARCHAR(255) | NULL | Forma de pagamento (ex: "Dinheiro", "Pix", "Cartão") |
| `person_id` | BIGINT | FK → `person.id`, NULL | Cliente da venda (opcional — venda avulsa permitida) |

**Relacionamentos:**
- `person_id` → `person.id` (N:1, opcional)
- Referenciada por `sell_item.sale_id` (1:N com cascade)

---

## 10 — Tabela `sell_item` (Itens de Venda)

**Entidade Java:** `SellItem`
**Descrição:** Detalhe dos produtos vendidos em cada venda. Cada registro representa uma linha do cupom fiscal.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do item |
| `unit_price` | NUMERIC(38,2) | NULL | Preço unitário cobrado no momento da venda (R$) |
| `quantity` | NUMERIC(38,2) | NULL | Quantidade vendida (em unidades do produto) |
| `sale_id` | BIGINT | FK → `sale.id`, NOT NULL | Venda à qual este item pertence |
| `product_id` | BIGINT | FK → `product.id`, NULL | Produto vendido |

**Relacionamentos:**
- `sale_id` → `sale.id` (N:1, CASCADE ALL + orphanRemoval)
- `product_id` → `product.id` (N:1)

---

## 11 — Tabela `purchase` (Compras — Cabeçalho)

**Entidade Java:** `Purchase`
**Descrição:** Registra o cabeçalho de cada nota de compra. Ao criar uma compra, o estoque dos insumos é creditado automaticamente, convertendo a quantidade de embalagens para a unidade base.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da compra |
| `date` | DATE | NULL | Data da nota fiscal de compra |
| `total` | NUMERIC(38,2) | NULL | Valor total da compra (R$) |
| `supplier_id` | BIGINT | FK → `supplier.id`, NULL | Fornecedor da compra |

**Relacionamentos:**
- `supplier_id` → `supplier.id` (N:1)
- Referenciada por `purchase_item.purchase_id` (1:N com cascade)

---

## 12 — Tabela `purchase_item` (Itens de Compra)

**Entidade Java:** `PurchaseItem`
**Descrição:** Detalha os produtos adquiridos em cada compra. A quantidade registrada é o número de **embalagens** compradas; a conversão para unidade base ocorre no momento do crédito no estoque.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do item de compra |
| `quantity` | INTEGER | NULL | Número de embalagens compradas |
| `unit_price` | NUMERIC(38,2) | NULL | Preço pago por embalagem (R$) |
| `product_id` | BIGINT | FK → `product.id`, NULL | Produto/insumo comprado |
| `purchase_id` | BIGINT | FK → `purchase.id`, NULL | Compra à qual este item pertence |

**Relacionamentos:**
- `product_id` → `product.id` (N:1)
- `purchase_id` → `purchase.id` (N:1, CASCADE ALL + orphanRemoval)

**Observação:** a quantidade em `purchase_item.quantity` representa embalagens. A quantidade em unidade base creditada no estoque é calculada pela fórmula: `quantity × product.package_quantity × product.purchase_unit.conversionFactor`.

---

## 13 — Tabela `stock_movement` (Movimentações de Estoque)

**Entidade Java:** `StockMovement`
**Descrição:** Histórico auditável de todas as entradas e saídas de estoque. Cada movimentação é registrada automaticamente pelos módulos de Compras, Vendas e Ordens de Produção, ou manualmente pelo operador. Todas as quantidades estão em **unidade base**.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da movimentação |
| `product_id` | BIGINT | FK → `product.id`, NULL | Produto movimentado |
| `type` | VARCHAR(255) | NULL | Tipo da movimentação (ver valores válidos) |
| `quantity` | NUMERIC(38,2) | NULL | Quantidade movimentada em **unidade base** (g, ml ou un) |
| `date` | TIMESTAMP | NULL | Data e hora da movimentação |
| `description` | VARCHAR(255) | NULL | Descrição da origem (ex: "Compra #5", "Venda #12", "Consumo OP #3") |

**Valores válidos para `type` (`MovementType`):**

| Valor | Significado |
|---|---|
| `ENTRY` | Entrada de estoque (compra, produção finalizada, ajuste positivo) |
| `EXIT` | Saída de estoque (venda, consumo em produção, ajuste negativo) |

**Relacionamentos:**
- `product_id` → `product.id` (N:1)

---

## 14 — Tabela `technical_sheet` (Fichas Técnicas)

**Entidade Java:** `TechnicalSheet`
**Descrição:** Fichas técnicas (receitas) que definem os ingredientes necessários para produzir um produto final. Inclui parâmetros de precificação para cálculo do preço de venda sugerido pelo método do markup divisor.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da ficha técnica |
| `name` | VARCHAR(255) | NULL | Nome da ficha técnica (ex: "Hambúrguer Artesanal 180g") |
| `final_product_id` | BIGINT | FK → `product.id`, NULL | Produto final gerado por esta receita |
| `rendimento` | INTEGER | NULL | Número de porções ou unidades produzidas pela receita |
| `labour_cost_percent` | NUMERIC(38,2) | NULL | Percentual de mão de obra sobre o custo de ingredientes (%) |
| `variable_expenses_percent` | NUMERIC(38,2) | NULL | Percentual de despesas variáveis (embalagem, energia, gás) (%) |
| `desired_margin_percent` | NUMERIC(38,2) | NULL | Percentual de margem de lucro desejada (%) |

**Relacionamentos:**
- `final_product_id` → `product.id` (N:1)
- Referenciada por `technical_sheet_item.technical_sheet_id` (1:N com cascade + orphanRemoval)

**Fórmula do Preço Sugerido (markup divisor):**
```
markupIndex = (100 - variable_expenses_percent - desired_margin_percent) / 100
precoSugerido = (custosIngredientes × (1 + labour_cost_percent/100)) / markupIndex
```

---

## 15 — Tabela `technical_sheet_item` (Ingredientes da Ficha Técnica)

**Entidade Java:** `TechnicalSheetItem`
**Descrição:** Cada linha da receita, representando um insumo e a quantidade necessária. A UDM do item da receita pode ser diferente da UDM de compra do produto (ex: produto comprado em KG, mas a receita usa em G).

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do item |
| `technical_sheet_id` | BIGINT | FK → `technical_sheet.id`, NOT NULL | Ficha técnica à qual este item pertence |
| `raw_material_id` | BIGINT | FK → `product.id`, NULL | Insumo utilizado nesta etapa da receita |
| `quantity` | NUMERIC(38,2) | NULL | Quantidade do insumo na receita |
| `unit` | VARCHAR(255) | NULL | Unidade de medida da quantidade na receita (enum UDM) |

**Valores válidos para `unit`:** mesmos do campo `purchase_unit` da tabela `product` (G, KG, ML, L, UN, DUZIA).

**Relacionamentos:**
- `technical_sheet_id` → `technical_sheet.id` (N:1, CASCADE ALL + orphanRemoval)
- `raw_material_id` → `product.id` (N:1)

**Exemplo:** item da receita com `quantity=250`, `unit='G'` significa "250 gramas deste insumo". Na finalização da produção, converte-se para 250 × 1 = **250 g** debitadas do estoque.

---

## 16 — Tabela `production_order` (Ordens de Produção)

**Entidade Java:** `ProductionOrder`
**Descrição:** Ordens de produção vinculadas a um produto final com ficha técnica cadastrada. Ao finalizar uma ordem, os insumos são debitados do estoque (em unidade base) e o produto final é creditado.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da ordem de produção |
| `final_product_id` | BIGINT | FK → `product.id`, NULL | Produto a ser produzido |
| `quantity` | INTEGER | NULL | Quantidade de unidades a produzir |
| `date` | TIMESTAMP | NULL | Data e hora de abertura da ordem |
| `status` | VARCHAR(255) | NULL | Status atual da ordem (ver valores válidos) |
| `notes` | VARCHAR(255) | NULL | Observações adicionais sobre a produção |

**Valores válidos para `status` (`ProductionOrder.Status`):**

| Valor | Significado |
|---|---|
| `OPEN` | Ordem aberta, aguardando produção |
| `FINISHED` | Produção concluída; estoques já foram movimentados |
| `CANCELLED` | Ordem cancelada; nenhuma movimentação realizada |

**Relacionamentos:**
- `final_product_id` → `product.id` (N:1)

---

## 17 — Tabela `cash_register` (Registros de Caixa)

**Entidade Java:** `CashRegister`
**Descrição:** Cada registro representa um turno de caixa — da abertura ao fechamento. Controla quem abriu/fechou e os saldos inicial e final.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único do registro de caixa |
| `opening_time` | TIMESTAMP | NULL | Data e hora de abertura do caixa |
| `closing_time` | TIMESTAMP | NULL | Data e hora de fechamento do caixa (NULL se ainda aberto) |
| `opening_balance` | NUMERIC(38,2) | NULL | Saldo inicial em espécie informado na abertura (R$) |
| `closing_balance` | NUMERIC(38,2) | NULL | Saldo final calculado no fechamento (R$) |
| `is_open` | BOOLEAN | NULL | `true` se o caixa está aberto no momento |
| `opened_by_user_id` | BIGINT | FK → `app_user.id`, NULL | Usuário que abriu o caixa |
| `closed_by_user_id` | BIGINT | FK → `app_user.id`, NULL | Usuário que fechou o caixa |

**Relacionamentos:**
- `opened_by_user_id` → `app_user.id` (N:1)
- `closed_by_user_id` → `app_user.id` (N:1, nullable — NULL enquanto o caixa está aberto)
- Referenciada por `cash_movement.cash_register_id`

---

## 18 — Tabela `cash_movement` (Movimentações Manuais de Caixa)

**Entidade Java:** `CashMovement`
**Descrição:** Movimentações manuais registradas durante um turno de caixa: sangrias, suprimentos, gorjetas, etc. Complementam as entradas automáticas geradas pelas vendas e compras no cálculo do saldo de fechamento.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da movimentação |
| `cash_register_id` | BIGINT | FK → `cash_register.id`, NULL | Caixa ao qual a movimentação pertence |
| `date` | TIMESTAMP | NULL | Data e hora da movimentação |
| `type` | VARCHAR(255) | NULL | Tipo de movimentação (ver valores válidos) |
| `amount` | NUMERIC(38,2) | NULL | Valor da movimentação (R$) |
| `description` | VARCHAR(255) | NULL | Descrição da movimentação (ex: "Sangria para cofre") |
| `user_id` | BIGINT | FK → `app_user.id`, NULL | Usuário responsável pela movimentação |

**Valores válidos para `type` (`CashMovement.MovementType`):**

| Valor | Significado |
|---|---|
| `INCOME` | Entrada de dinheiro no caixa (suprimento) |
| `EXPENSE` | Saída de dinheiro do caixa (sangria, pagamento) |

**Relacionamentos:**
- `cash_register_id` → `cash_register.id` (N:1)
- `user_id` → `app_user.id` (N:1)

---

## 19 — Tabela `account_payable` (Contas a Pagar)

**Entidade Java:** `AccountPayable`
**Descrição:** Obrigações financeiras do estabelecimento com fornecedores ou terceiros. Permite controle do fluxo de caixa projetado.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da conta |
| `description` | VARCHAR(255) | NULL | Descrição da despesa (ex: "Aluguel Junho/2026") |
| `amount` | NUMERIC(38,2) | NULL | Valor da conta (R$) |
| `due_date` | DATE | NULL | Data de vencimento |
| `payment_date` | DATE | NULL | Data de pagamento efetivo (NULL se ainda não pago) |
| `status` | VARCHAR(255) | NULL | Situação atual da conta (ver valores válidos) |
| `supplier_id` | BIGINT | FK → `supplier.id`, NULL | Fornecedor/credor (opcional) |

**Valores válidos para `status` (`AccountPayable.Status`):**

| Valor | Significado |
|---|---|
| `PENDING` | Aguardando pagamento (dentro do prazo) |
| `PAID` | Paga — `payment_date` preenchida |
| `OVERDUE` | Vencida e ainda não paga |

**Relacionamentos:**
- `supplier_id` → `supplier.id` (N:1, opcional)

---

## 20 — Tabela `account_receivable` (Contas a Receber)

**Entidade Java:** `AccountReceivable`
**Descrição:** Valores a receber de clientes ou outros credores. Permite controle de inadimplência e fluxo de caixa.

| Coluna | Tipo PostgreSQL | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, NOT NULL, AUTO INCREMENT | Identificador único da conta |
| `description` | VARCHAR(255) | NULL | Descrição do crédito (ex: "Pagamento parcelado - Mesa 5") |
| `amount` | NUMERIC(38,2) | NULL | Valor a receber (R$) |
| `due_date` | DATE | NULL | Data de vencimento do recebimento |
| `receipt_date` | DATE | NULL | Data do recebimento efetivo (NULL se ainda não recebido) |
| `status` | VARCHAR(255) | NULL | Situação atual (ver valores válidos) |
| `person_id` | BIGINT | FK → `person.id`, NULL | Cliente devedor (opcional) |

**Valores válidos para `status` (`AccountReceivable.Status`):**

| Valor | Significado |
|---|---|
| `PENDING` | Aguardando recebimento (dentro do prazo) |
| `RECEIVED` | Recebido — `receipt_date` preenchida |
| `OVERDUE` | Vencida e ainda não recebida |

**Relacionamentos:**
- `person_id` → `person.id` (N:1, opcional)

---

## Diagrama de Relacionamentos (Textual)

```
uf (1) ──────────────< city (N)
city (1) ────────────< address (N)
address (1) ─────────< person (N)
address (1) ─────────< supplier (N)

category (1) ────────< product (N)

product (1) ─────────< sell_item (N)
product (1) ─────────< purchase_item (N)
product (1) ─────────< stock_movement (N)
product (1) ─────────< technical_sheet (N)  [como finalProduct]
product (1) ─────────< technical_sheet_item (N)  [como rawMaterial]
product (1) ─────────< production_order (N)

person (1) ──────────< sale (N)
person (1) ──────────< account_receivable (N)

supplier (1) ────────< purchase (N)
supplier (1) ────────< account_payable (N)

sale (1) ────────────< sell_item (N)  [cascade + orphanRemoval]
purchase (1) ────────< purchase_item (N)  [cascade + orphanRemoval]

technical_sheet (1) ─< technical_sheet_item (N)  [cascade + orphanRemoval]

app_user (1) ────────< cash_register (N)  [openedBy]
app_user (1) ────────< cash_register (N)  [closedBy]
app_user (1) ────────< cash_movement (N)

cash_register (1) ───< cash_movement (N)
```

---

## Resumo dos Tipos de Dados

| Tipo Java | Tipo PostgreSQL | Uso no Sistema |
|---|---|---|
| `Long` | `BIGINT` | Todos os IDs (PKs e FKs) |
| `String` | `VARCHAR(255)` | Nomes, códigos, descrições, e-mails, enums armazenados como texto |
| `BigDecimal` | `NUMERIC(38,2)` | Valores monetários (R$) e quantidades de estoque |
| `Integer` | `INTEGER` | Quantidade de embalagens em compras, rendimento em fichas, desconto em vendas, quantidade em ordens de produção |
| `Boolean` | `BOOLEAN` | `is_open` em `cash_register` |
| `Date` | `TIMESTAMP` | Data e hora de vendas (`java.util.Date`) |
| `LocalDateTime` | `TIMESTAMP` | Data e hora de movimentações de estoque, caixa e ordens de produção |
| `LocalDate` | `DATE` | Data de compras, vencimentos e pagamentos |

---

*Dicionário de Dados gerado em 14/06/2026 — SigRest v1.0-SNAPSHOT*
*20 tabelas | PostgreSQL 15 | Hibernate 6.5.3 com ddl-auto=update*