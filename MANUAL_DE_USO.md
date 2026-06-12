# Manual de Uso — SigRest

Sistema de Gestão para Restaurante/Cozinha Industrial  
Acesso: [http://localhost:3000](http://localhost:3000)

---

## 1. Login

1. Abra o navegador em `http://localhost:3000`.
2. Informe e-mail e senha do operador.
   - Administrador padrão: `admin@admin.com` / `admin123`
3. Clique em **Entrar**. Você será redirecionado ao **Dashboard**.

---

## 2. Dashboard

Visão geral do negócio em tempo real.

| Card | O que mostra |
|------|-------------|
| Faturamento do Dia | Total de vendas concluídas hoje |
| Vendas do Dia | Quantidade de vendas hoje |
| Faturamento do Mês | Total acumulado no mês corrente |
| Estoque Baixo | Produtos com estoque ≤ mínimo definido |
| A Receber | Soma de contas a receber em aberto |
| A Pagar | Soma de contas a pagar em aberto |
| Saldo Previsto | A Receber − A Pagar |

Os gráficos abaixo mostram faturamento mensal, produtos mais vendidos, vendas por período e movimentações de estoque.

---

## 3. Módulo Cadastros

### 3.1 Categorias
Caminho: **Configurações → Categorias**

Categorias classificam os produtos (Insumo, Marmita, Produto Pronto, Promoção).

1. Clique em **Nova Categoria**.
2. Informe o nome e salve.

> Categorias pré-cadastradas: Insumo, Marmita, Produto Pronto, Promoção.

### 3.2 Produtos
Caminho: **Cadastros → Produtos**

1. Preencha **Nome**, **Código** e selecione a **Categoria** (obrigatório).
2. Informe **Preço de Custo** e **Preço de Venda** em R$.
3. Informe **Estoque Atual** e **Estoque Mínimo** (alerta aparece quando estoque ≤ mínimo).
4. Clique em **Cadastrar**.

### 3.3 Clientes (Pessoas)
Caminho: **Cadastros → Clientes**

1. Preencha nome, CPF/CNPJ, e-mail, telefone.
2. Opcionalmente informe o CEP para preenchimento automático do endereço.
3. Salve.

### 3.4 Fornecedores
Caminho: **Cadastros → Fornecedores**

Mesmo fluxo dos clientes. CEP preenche endereço automaticamente.

---

## 4. Vendas

Caminho: **Operações → Vendas → Nova Venda**

1. Selecione o **Cliente** (opcional — pode deixar em branco).
2. Selecione a **Forma de Pagamento**.
3. Informe o **Desconto** em R$ (opcional).
4. Clique em **Adicionar Item**:
   - Selecione o produto no dropdown (mostra categoria, estoque e aviso ⚠ se baixo).
   - Informe a quantidade.
   - O Preço Unitário é preenchido automaticamente com o preço de venda; pode ser alterado.
5. Repita para cada item.
6. Confira o **Total** e clique em **Registrar Venda**.

> O estoque do produto é debitado automaticamente ao salvar a venda.

---

## 5. Compras

Caminho: **Operações → Compras → Nova Compra**

1. Selecione a **Data** e o **Fornecedor**.
2. Clique em **Adicionar Item**, selecione o produto e informe quantidade e preço unitário.
3. Clique em **Registrar Compra**.

> O estoque do produto é creditado automaticamente.

---

## 6. Caixa

Caminho: **Caixa**

### Abrir caixa
1. Informe o **Saldo Inicial** (troco disponível ao iniciar o dia).
2. Clique em **Abrir Caixa** e confirme.

### Registrar Movimentação (com caixa aberto)
1. Selecione o **Tipo**: Entrada ou Saída (Despesa).
2. Informe o **Valor** e uma **Descrição** (ex.: "Gás", "Energia").
3. Clique em **Registrar**. O Saldo Atual é atualizado na tela.

### Fechar caixa
1. Clique em **Fechar Caixa** e confirme.

---

## 7. Financeiro

### Contas a Receber
Caminho: **Financeiro → A Receber**

Registre valores a receber de clientes com vencimento e status (Pendente / Recebido / Vencido).

### Contas a Pagar
Caminho: **Financeiro → A Pagar**

Registre obrigações com fornecedores ou despesas fixas.

---

## 8. Estoque

### Fichas Técnicas
Caminho: **Estoque → Fichas Técnicas**

Defina a composição de cada produto (quais insumos e quantidades são consumidos na produção).

### Ordens de Produção
Caminho: **Estoque → Ordens de Produção**

Registre a produção em lote; o sistema debita automaticamente os insumos conforme a ficha técnica.

### Movimentações de Estoque
Caminho: **Estoque → Movimentações**

Histórico completo de todas as entradas e saídas de estoque.

---

## 9. Relatórios

Caminho: **Relatórios**

| Relatório | O que mostra |
|-----------|-------------|
| Vendas por Período | Receita e quantidade de vendas dia a dia |
| Produtos Mais Vendidos | Ranking por quantidade vendida |
| Faturamento Mensal | Receita acumulada por mês |
| Movimentação de Estoque | Entradas e saídas no período |
| Fluxo Financeiro | Entradas (vendas) vs Saídas (compras) por mês + saldo |
| Histórico de Compras | Lista de todas as compras com fornecedor e total |

Selecione o tipo, ajuste as datas e clique em **Gerar**.

---

## 10. Usuários e Controle de Acesso

Caminho: **Configurações → Usuários**

- **ADMIN**: acesso total ao sistema.
- **OPERADOR**: acesso às operações do dia a dia (vendas, caixa, compras). Não acessa relatórios gerenciais nem configurações.

---

## Dicas Rápidas

- Tags coloridas nos produtos identificam a categoria visualmente em listas, vendas e compras.
- Produtos com estoque baixo aparecem com badge vermelho e símbolo ⚠ nos dropdowns de venda.
- CEP preenche endereço automaticamente em clientes e fornecedores.
- Todos os valores monetários aceitam vírgula como separador decimal (ex.: `12,50`).
