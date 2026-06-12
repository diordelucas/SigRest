# Plano de Pendências — Conformidade com o Plano de Estágio (SigRest)

> Roteiro para fechar as lacunas entre o **Plano de Estágio (UNIPAR, 02/03/2026)** e o
> estado atual do sistema. Cada item tem o que fazer, arquivos envolvidos e como validar.
> Marque `[x]` ao concluir. Ordem = prioridade (impacto/esforço).

## Convenções de execução (para cada item)
1. Implementar backend e/ou frontend.
2. Compilar backend: `docker run --rm -v "${PWD}\SigRestBack:/app" -v sigrest_m2:/root/.m2 -w /app maven:3.9-eclipse-temurin-21 mvn -B test-compile`
3. Subir: `docker-compose up --build -d backend frontend`
4. Validar via API (PowerShell / WebClient UTF-8) e/ou na UI.
5. Commit pequeno e descritivo por item.

---

## FASE 1 — Ganhos rápidos / baixo risco

### [ ] 1. Cliente OPCIONAL na venda (hoje está obrigatório)
**Plano:** "seleção de cliente (opcional)". **Atual:** obrigatório no back e no front.
- Backend `SaleService.createSale`: tornar a busca de pessoa condicional —
  `if (saleRequestDTO.personId() != null) { ...findById... } else sale.setPerson(null);`
  (a coluna `Sale.person` já é `@ManyToOne` anulável).
- Frontend `SaleForm.js`: remover `required` do `<select data-testid="sale-person">`,
  trocar label para "Cliente (opcional)" e manter opção "Selecione..." enviando `personId: null`
  quando vazio (ajustar o payload para não mandar string vazia).
- `SaleResponseDTO` já trata pessoa nula — sem mudança.
- **Validar:** registrar uma venda sem cliente → HTTP 201; lista de vendas mostra "—" no cliente.

### [ ] 2. Resumo financeiro no Dashboard (contas a pagar/receber)
**Plano (Dashboard):** "resumo financeiro". **Atual:** ausente.
- Backend: estender `DashboardSummaryDTO` com `totalReceivable`, `totalPayable`, `balanceForecast`.
  - Adicionar queries agregadas em `AccountReceivableRepository` e `AccountPayableRepository`
    (`@Query SUM(amount) WHERE status em aberto`) — verificar nome do campo de status/valor nas entidades.
  - `DashboardService.getSummary()`: preencher os novos campos (null-safe → ZERO).
- Frontend `Dashboard.js`: adicionar cards "A Receber", "A Pagar" e "Saldo Previsto"
  (usar `formatBRL`, fallback `R$ 0,00`). Reaproveitar `KpiCard`.
- **Validar:** `GET /dashboard/summary` retorna os 3 novos campos; cards renderizam.

---

## FASE 2 — Funcionalidades de módulo (médio esforço)

### [ ] 3. Tela de Despesas Operacionais no Caixa
**Plano (Caixa):** "registro de despesas operacionais". **Atual:** backend existe
(`CashMovementController`/`CashMovementService.createCashMovement`), sem UI.
- Conferir `CashMovementRequestDTO` (campos: `cashRegisterId`, `userId`, `type` INCOME/EXPENSE, `amount`, `description`).
- Frontend `CashRegisterForm.js`: quando o caixa estiver aberto, adicionar um bloco
  "Registrar Movimentação" com: tipo (Entrada/Saída), valor (`CurrencyInput`), descrição,
  botão que faz `POST /cash-movements` com `cashRegisterId = currentCashRegister.id` e
  `userId = currentUser.id`. Após sucesso, refazer `GET /cash-registers/current-open`
  para atualizar o **Saldo Atual** (já calculado no back).
- Opcional: listar as movimentações do caixa atual (`GET /cash-movements?cashRegisterId=`).
- **Validar:** lançar uma saída de R$ 50 → saldo atual cai R$ 50; toast de sucesso.

### [ ] 4. Fluxo Financeiro (relatório + endpoint)
**Plano (Relatórios/Financeiro):** "acompanhamento do fluxo financeiro". **Atual:** `// TODO` em `ReportService`.
- Definir modelo: entradas = contas a receber + vendas; saídas = contas a pagar + compras,
  agrupado por mês (ou por período recebido). Começar simples: agregação mensal de
  recebíveis vs pagáveis.
- Backend: criar `FinancialFlowDTO` (mes, totalEntradas, totalSaidas, saldo);
  implementar `ReportService.getFinancialFlow(start, end)`; descomentar/implementar
  `GET /reports/financial-flow` em `ReportController`.
- Frontend `ReportPage.js`: adicionar seção/gráfico de fluxo financeiro (Recharts, barras
  entradas vs saídas por mês).
- **Validar:** endpoint responde 200 com a série; gráfico renderiza (estado vazio elegante).

### [ ] 5. Histórico de Compras como Relatório
**Plano (Relatórios):** "histórico de compras". **Atual:** existe `PurchaseList`, mas não no módulo de relatórios.
- Frontend `ReportPage.js`: adicionar aba/seção "Histórico de Compras" consumindo `GET /purchases`
  (data, fornecedor, total, nº de itens). Reutilizar padrão de tabela.
- Opcional backend: endpoint `/reports/purchase-history` com filtro por período.
- **Validar:** seção lista as compras com fornecedor e total.

---

## FASE 3 — Polimento e entregáveis acadêmicos

### [ ] 6. Manual simplificado de uso
- Criar `MANUAL_DE_USO.md`: login, cada módulo (cadastros, venda, compra, caixa, financeiro,
  relatórios, dashboard) com passo a passo e prints/descrições.

### [ ] 7. Rotina de backup do banco
- Criar script `backup_db.ps1` / `backup_db.sh` com `pg_dump` via container
  (`docker exec sigrest_db pg_dump -U <user> <db> > backup_AAAAMMDD.sql`) e documentar no README.

### [ ] 8. Auditoria de responsividade (mobile/tablet)
- Revisar forms/listas com `grid-cols-N` fixo → tornar responsivos (`grid-cols-1 sm:grid-cols-2 ...`).
- Conferir `SaleForm`, `ProductForm`, `PurchaseForm`, `Dashboard`, tabelas com `overflow-x-auto`.

### [ ] 9. Reconciliar a divergência de STACK no documento (NÃO é código)
- O plano declara **Node.js + Express + Prisma/Sequelize**; o sistema usa **Java + Spring Boot + JPA/Hibernate** (PostgreSQL, que está previsto).
- Ação do acadêmico: atualizar o plano OU justificar a troca no relatório (robustez, tipagem,
  ecossistema Spring, experiência com Java). **Decisão do George — não implementar em código.**

---

## Observação de escopo extra (já implementado, fora do plano)
- **Fichas Técnicas** e **Ordens de Produção** existem no sistema mas não constam no plano.
  Registrar como extensão no relatório (faz sentido para cozinha de assados/congelados).

## Definition of Done
Fases 1 e 2 concluídas, compiladas, validadas via API/UI e commitadas; manual e script de
backup criados; divergência de stack registrada para decisão do George.