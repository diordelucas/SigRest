import React, { useState, useEffect, FormEvent } from 'react';
import api, { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import CurrencyInput from './CurrencyInput';
import { Category, Product, ProductType, UnitOfMeasure } from '../types';
import Button from './ui/Button';
import Field from './ui/Field';

const TIPOS: { value: ProductType; label: string }[] = [
  { value: 'INSUMO', label: 'Insumo (Matéria-Prima)' },
  { value: 'PRODUTO_FINAL', label: 'Produto Final' },
  { value: 'PRODUTO_INTERMEDIARIO', label: 'Produto Intermediário' },
];

const UDM_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'G', label: 'G — Grama' },
  { value: 'KG', label: 'KG — Quilograma' },
  { value: 'ML', label: 'ML — Mililitro' },
  { value: 'L', label: 'L — Litro' },
  { value: 'UN', label: 'UN — Unidade' },
  { value: 'DUZIA', label: 'DUZIA — Dúzia' },
];

const stockUnit = (tipo: string, purchaseUnit: string): string => {
  if (tipo !== 'INSUMO' || !purchaseUnit) return 'un';
  if (['G', 'KG'].includes(purchaseUnit)) return 'g';
  if (['ML', 'L'].includes(purchaseUnit)) return 'ml';
  return 'un';
};

interface ProductFormProps {
  onUserAdded: () => void;
  editingPerson: Product | null;
  onEditComplete: () => void;
}

const ProductForm = ({ onUserAdded, editingPerson, onEditComplete }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [storage, setStorage] = useState('');
  const [minStorage, setMinStorage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tipo, setTipo] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [packageQuantity, setPackageQuantity] = useState('');

  useEffect(() => {
    api
      .get<Category[]>('/category')
      .then((res) => setCategories(res.data))
      .catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar categorias.')));
  }, []);

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || '');
      setCode(editingPerson.code || '');
      setPrice(editingPerson.price ?? '');
      setSellPrice(editingPerson.sellPrice ?? '');
      setStorage(String(editingPerson.storage ?? ''));
      setMinStorage(String(editingPerson.minStorage ?? ''));
      setCategoryId(String(editingPerson.categoryId ?? ''));
      setTipo(editingPerson.tipo || '');
      setPurchaseUnit(editingPerson.purchaseUnit || '');
      setPackageQuantity(String(editingPerson.packageQuantity ?? ''));
    }
  }, [editingPerson]);

  const clearForm = () => {
    setName('');
    setCode('');
    setPrice('');
    setSellPrice('');
    setStorage('');
    setMinStorage('');
    setCategoryId('');
    setTipo('');
    setPurchaseUnit('');
    setPackageQuantity('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Nome e código são obrigatórios.');
      return;
    }
    if (!categoryId) {
      toast.error('Selecione a categoria do produto.');
      return;
    }
    if (!tipo) {
      toast.error('Selecione o tipo do produto.');
      return;
    }
    if (tipo === 'INSUMO' && (!purchaseUnit || !packageQuantity || Number(packageQuantity) <= 0)) {
      toast.error('Informe a unidade de compra e a quantidade por embalagem do insumo.');
      return;
    }
    if (tipo === 'PRODUTO_FINAL' && (sellPrice === '' || Number(sellPrice) <= 0)) {
      toast.error('Informe o preço de venda do produto final.');
      return;
    }
    const productData = {
      name,
      code,
      price,
      sellPrice: tipo === 'PRODUTO_FINAL' ? sellPrice : 0,
      storage,
      minStorage,
      categoryId: Number(categoryId),
      tipo: tipo || null,
      purchaseUnit: purchaseUnit || null,
      packageQuantity: packageQuantity !== '' ? Number(packageQuantity) : null,
    };
    try {
      if (editingPerson) {
        await api.put(`/product/${editingPerson.id}`, productData);
        toast.success('Produto atualizado com sucesso!');
        clearForm();
        onEditComplete();
      } else {
        await api.post('/product', productData);
        toast.success('Produto cadastrado com sucesso!');
        clearForm();
        onUserAdded();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, editingPerson ? 'Erro ao atualizar produto.' : 'Erro ao cadastrar produto.'));
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  const unit = stockUnit(tipo, purchaseUnit);

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-ink mb-4">
        {editingPerson ? 'Editar Produto' : 'Cadastro de Produto'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-nome-do-produto" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Nome do Produto
            </label>
            <Field id="productform-nome-do-produto"
              data-testid="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
              placeholder="Nome do produto"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-codigo" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Código
            </label>
            <Field id="productform-codigo"
              data-testid="product-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={60}
              placeholder="Código"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-categoria" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Categoria
            </label>
            <Field id="productform-categoria"
              as="select"
              data-testid="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione a categoria...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Field>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-tipo-de-produto" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Tipo de Produto
            </label>
            <Field id="productform-tipo-de-produto"
              as="select"
              data-testid="product-type"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="">Selecione o tipo...</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Field>
          </div>
        </div>

        <div className="border-t border-line my-4 flex items-center gap-3">
          <span className="text-xs text-ink-muted font-medium">PREÇOS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              {tipo === 'INSUMO' ? 'Preço da Embalagem' : 'Preço de Custo'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-medium">R$</span>
              <CurrencyInput id="productform-"
                data-testid="product-price"
                className="input-field pl-8"
                value={price}
                onChange={setPrice}
              />
            </div>
          </div>
          {(tipo === 'PRODUTO_FINAL' || tipo === '') && (
            <div className="flex flex-col gap-1">
              <label htmlFor="productform-preco-de-venda" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Preço de Venda
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-medium">R$</span>
                <CurrencyInput id="productform-preco-de-venda"
                  data-testid="product-sellprice"
                  className="input-field pl-8"
                  value={sellPrice}
                  onChange={setSellPrice}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line my-4 flex items-center gap-3">
          <span className="text-xs text-ink-muted font-medium">ESTOQUE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-estoque-atual" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Estoque Atual{unit !== 'un' ? ` (${unit})` : ''}
            </label>
            <div className="relative">
              <Field id="productform-estoque-atual"
                data-testid="product-storage"
                type="number"
                min="0"
                step="any"
                className="pr-12"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">{unit}</span>
            </div>
            {editingPerson && (
              <p className="text-xs text-ink-muted mt-1">Alterar aqui registra um ajuste nas movimentações de estoque.</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="productform-estoque-minimo" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Estoque Mínimo{unit !== 'un' ? ` (${unit})` : ''}
            </label>
            <div className="relative">
              <Field id="productform-estoque-minimo"
                data-testid="product-minstorage"
                type="number"
                min="0"
                step="any"
                className="pr-12"
                value={minStorage}
                onChange={(e) => setMinStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">{unit}</span>
            </div>
            <p className="text-xs text-ink-muted mt-1">Com o estoque neste valor ou abaixo, o produto aparece nos alertas.</p>
          </div>
        </div>

        {tipo === 'INSUMO' && (
          <>
            <div className="border-t border-line my-4 flex items-center gap-3">
              <span className="text-xs text-ink-muted font-medium">UNIDADE DE COMPRA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="productform-unidade-de-compra-udm" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Unidade de Compra (UDM)
                </label>
                <Field id="productform-unidade-de-compra-udm"
                  as="select"
                  data-testid="product-purchase-unit"
                  value={purchaseUnit}
                  onChange={(e) => setPurchaseUnit(e.target.value)}
                  required
                >
                  <option value="">Selecione a UDM...</option>
                  {UDM_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="productform-qtde-por-embalagem" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Qtde por Embalagem
                </label>
                <Field id="productform-qtde-por-embalagem"
                  type="number"
                  step="any"
                  min="0.01"
                  data-testid="product-package-quantity"
                  value={packageQuantity}
                  onChange={(e) => setPackageQuantity(e.target.value)}
                  required
                  placeholder={purchaseUnit ? `Ex: 5 (5 ${purchaseUnit} por embalagem)` : 'Ex: 5'}
                />
                <p className="text-xs text-ink-muted mt-1">
                  Quantas {purchaseUnit || 'unidades'} contém a embalagem comprada.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button type="submit" data-testid="product-submit">
            {editingPerson ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {editingPerson && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
