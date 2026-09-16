-- Rastreio de quebra: perda pos-producao (baixa de estoque) e quebra de producao
-- (rendimento real abaixo do planejado na Ordem de Producao).

ALTER TABLE stock_movement ADD COLUMN reason character varying(30);

ALTER TABLE production_order ADD COLUMN actual_quantity integer;
ALTER TABLE production_order ADD COLUMN loss_reason character varying(30);
