-- Venda por peso: o produto final passa a ser vendido por unidade ou por quilo, pesado na hora
-- (encomendas feitas na forma do próprio cliente). Os produtos existentes continuam por unidade.
ALTER TABLE product ADD COLUMN sale_unit varchar(2) NOT NULL DEFAULT 'UN';
ALTER TABLE product ADD CONSTRAINT product_sale_unit_check CHECK (sale_unit IN ('UN', 'KG'));

-- Quantidades com até o grama: 1,355 kg. Com duas casas, o banco arredondaria para 1,36 kg.
ALTER TABLE product ALTER COLUMN storage TYPE numeric(38,3);
ALTER TABLE product ALTER COLUMN min_storage TYPE numeric(38,3);
ALTER TABLE sell_item ALTER COLUMN quantity TYPE numeric(38,3);
ALTER TABLE sell_item ALTER COLUMN reversed_quantity TYPE numeric(38,3);
ALTER TABLE sale_reversal_item ALTER COLUMN quantity TYPE numeric(38,3);
ALTER TABLE stock_movement ALTER COLUMN quantity TYPE numeric(38,3);
ALTER TABLE technical_sheet_item ALTER COLUMN quantity TYPE numeric(38,3);

-- Produção e rendimento deixam de ser inteiros: uma receita pode render 6,5 kg.
ALTER TABLE production_order ALTER COLUMN quantity TYPE numeric(38,3);
ALTER TABLE production_order ALTER COLUMN actual_quantity TYPE numeric(38,3);
ALTER TABLE technical_sheet ALTER COLUMN rendimento TYPE numeric(38,3);
