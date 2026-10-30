-- Correcoes encontradas na validacao completa do sistema.

-- 1. Perda de estoque: a V3 passou a gravar o tipo LOSS, mas a constraint so aceitava ENTRY e EXIT.
ALTER TABLE stock_movement DROP CONSTRAINT stock_movement_type_check;
ALTER TABLE stock_movement ADD CONSTRAINT stock_movement_type_check
    CHECK (type IN ('ENTRY', 'EXIT', 'LOSS'));

-- 2. Desconto com centavos (a coluna inteira cortava R$ 7,80 para R$ 7,00).
ALTER TABLE sale ALTER COLUMN discount TYPE numeric(38,2);

-- 3. Estorno de venda.
ALTER TABLE sale ADD COLUMN status character varying(20) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE sale ADD COLUMN reversal_date timestamp(6) without time zone;
ALTER TABLE sale ADD COLUMN reversal_reason character varying(255);
ALTER TABLE sale ADD COLUMN reversed_by_user_id bigint REFERENCES app_user(id);
ALTER TABLE sale ADD CONSTRAINT sale_status_check CHECK (status IN ('COMPLETED', 'REVERSED'));

-- 4. Venda e compra passam a pertencer ao caixa aberto no momento do registro. Antes o saldo somava
-- por data, e uma compra entrava em todos os caixas abertos no mesmo dia.
ALTER TABLE sale ADD COLUMN cash_register_id bigint REFERENCES cash_register(id);
ALTER TABLE purchase ADD COLUMN cash_register_id bigint REFERENCES cash_register(id);

UPDATE sale s SET cash_register_id = (
    SELECT c.id FROM cash_register c
    WHERE s.date >= c.opening_time AND (c.closing_time IS NULL OR s.date <= c.closing_time)
    ORDER BY c.opening_time LIMIT 1);

UPDATE purchase p SET cash_register_id = (
    SELECT c.id FROM cash_register c
    WHERE p.date >= CAST(c.opening_time AS date)
      AND (c.closing_time IS NULL OR p.date <= CAST(c.closing_time AS date))
    ORDER BY c.opening_time LIMIT 1);

-- 5. Conferencia no fechamento do caixa: valor contado pelo operador.
ALTER TABLE cash_register ADD COLUMN counted_balance numeric(38,2);

-- 6. Compra aceita quantidade fracionada (2,5 kg).
ALTER TABLE purchase_item ALTER COLUMN quantity TYPE numeric(38,2);

-- 7. E-mail de usuario unico. Contas duplicadas ja nao conseguiam entrar (login devolvia erro 500):
-- a mais antiga fica com o e-mail, as demais recebem um sufixo para o indice poder ser criado.
UPDATE app_user u SET email = u.email || '.duplicado.' || u.id
WHERE EXISTS (SELECT 1 FROM app_user o WHERE lower(o.email) = lower(u.email) AND o.id < u.id);

CREATE UNIQUE INDEX uk_app_user_email ON app_user (lower(email));
