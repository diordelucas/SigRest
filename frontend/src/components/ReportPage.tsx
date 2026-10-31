import React, { useState } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import api, { fetchPdf, getErrorMessage } from '../services/api';
import { getPaymentMethodLabel } from '../utils/payment';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import moment from 'moment';
import { formatBRL } from '../utils/currency';
import { lossReasonLabel } from '../utils/lossReason';
import Button from './ui/Button';
import Field from './ui/Field';
import { Table, Th } from './ui/Table';
import { formatMoney, formatMonth, formatQuantity } from '../utils/format';

type ReportType =
  | ''
  | 'sales-by-period'
  | 'top-selling-products'
  | 'monthly-revenue'
  | 'stock-movement'
  | 'financial-flow'
  | 'purchase-history'
  | 'loss'
  | 'accounts-payable'
  | 'accounts-receivable'
  | 'stock-position'
  | 'technical-sheets'
  | 'activity-log';

interface ReportOption {
  label: string;
  group: string;
  /** Endpoint do PDF gerado no backend (templates Thymeleaf). */
  pdfPath: string;
  /** Também tem visualização em tela (gráfico/tabela), além do PDF. */
  hasScreen: boolean;
  /** Usa o filtro de período (data inicial/final). */
  usesPeriod: boolean;
}

const REPORTS: Record<Exclude<ReportType, ''>, ReportOption> = {
  'sales-by-period': { label: 'Vendas por Período', group: 'Vendas', pdfPath: '/reports/pdf/sales', hasScreen: true, usesPeriod: true },
  'top-selling-products': { label: 'Produtos Mais Vendidos', group: 'Vendas', pdfPath: '/reports/pdf/top-selling-products', hasScreen: true, usesPeriod: true },
  'monthly-revenue': { label: 'Faturamento Mensal', group: 'Vendas', pdfPath: '/reports/pdf/monthly-revenue', hasScreen: true, usesPeriod: true },
  'financial-flow': { label: 'Fluxo Financeiro', group: 'Financeiro', pdfPath: '/reports/pdf/financial-flow', hasScreen: true, usesPeriod: true },
  'accounts-payable': { label: 'Contas a Pagar', group: 'Financeiro', pdfPath: '/reports/pdf/accounts-payable', hasScreen: false, usesPeriod: true },
  'accounts-receivable': { label: 'Contas a Receber', group: 'Financeiro', pdfPath: '/reports/pdf/accounts-receivable', hasScreen: false, usesPeriod: true },
  'purchase-history': { label: 'Histórico de Compras', group: 'Compras e Estoque', pdfPath: '/reports/pdf/purchases', hasScreen: true, usesPeriod: true },
  'stock-position': { label: 'Posição de Estoque', group: 'Compras e Estoque', pdfPath: '/reports/pdf/stock-position', hasScreen: false, usesPeriod: false },
  'stock-movement': { label: 'Movimentação de Estoque', group: 'Compras e Estoque', pdfPath: '/reports/pdf/stock-movement', hasScreen: true, usesPeriod: true },
  loss: { label: 'Quebra (Produção e Estoque)', group: 'Compras e Estoque', pdfPath: '/reports/pdf/loss', hasScreen: true, usesPeriod: true },
  'technical-sheets': { label: 'Custo e Margem das Fichas Técnicas', group: 'Produção', pdfPath: '/reports/pdf/technical-sheets', hasScreen: false, usesPeriod: false },
  'activity-log': { label: 'Trilha de Auditoria', group: 'Administração', pdfPath: '/reports/pdf/activity-log', hasScreen: false, usesPeriod: true },
};

const REPORT_GROUPS = Array.from(new Set(Object.values(REPORTS).map((r) => r.group)));

const ReportPage = () => {
  const [reportType, setReportType] = useState<ReportType>('');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [onlyBelowMinimum, setOnlyBelowMinimum] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = reportType ? REPORTS[reportType] : null;

  const handleChangeReportType = (type: ReportType) => {
    // Os dados em tela têm formato diferente por relatório: limpa para não renderizar o anterior com o layout novo.
    setReportType(type);
    setReportData(null);
    setError(null);
  };

  const periodIsValid = () => {
    if (selected?.usesPeriod && startDate > endDate) {
      setReportData(null);
      setError('A data inicial não pode ser posterior à data final.');
      return false;
    }
    return true;
  };

  const handleExportPdf = async (mode: 'open' | 'download') => {
    if (!selected || !periodIsValid()) return;
    setPdfLoading(true);
    setError(null);

    const params: Record<string, string | boolean> = selected.usesPeriod ? { startDate, endDate } : {};
    if (reportType === 'stock-position') params.onlyBelowMinimum = onlyBelowMinimum;

    // A aba é aberta já no clique: se fosse aberta depois do await, o bloqueador de pop-up barraria.
    const pdfWindow = mode === 'open' ? window.open('', '_blank') : null;
    pdfWindow?.document.write('<p style="font-family: sans-serif; padding: 24px;">Gerando relatório...</p>');
    try {
      const { blob, fileName } = await fetchPdf(selected.pdfPath, params);
      const url = URL.createObjectURL(blob);
      if (pdfWindow) {
        pdfWindow.location.href = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      pdfWindow?.close();
      setError(getErrorMessage(err, 'Erro ao gerar o PDF do relatório.'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!periodIsValid()) return;
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      let response;
      switch (reportType) {
        case 'sales-by-period':
          response = await api.get('/reports/sales-by-period', { params: { startDate, endDate } });
          setReportData(response.data.map((item: any) => ({ ...item, date: moment(item.date).format('DD/MM/YYYY') })));
          break;
        case 'top-selling-products':
          response = await api.get('/reports/top-selling-products', { params: { limit: 10, startDate, endDate } });
          setReportData(response.data);
          break;
        case 'monthly-revenue':
          response = await api.get('/reports/monthly-revenue', {
            params: {
              startMonth: moment(startDate).startOf('month').format('YYYY-MM-DD'),
              endMonth: moment(endDate).endOf('month').format('YYYY-MM-DD'),
            },
          });
          setReportData(response.data.map((item: any) => ({ ...item, month: formatMonth(item.month) })));
          break;
        case 'stock-movement':
          response = await api.get('/reports/stock-movement', { params: { startDate, endDate } });
          setReportData(
            response.data.map((item: any) => ({ ...item, date: moment(item.date).format('DD/MM/YYYY HH:mm') }))
          );
          break;
        case 'financial-flow':
          response = await api.get('/reports/financial-flow', { params: { startDate, endDate } });
          setReportData(response.data.map((item: any) => ({ ...item, month: formatMonth(item.month) })));
          break;
        case 'purchase-history':
          response = await api.get('/reports/purchase-history', { params: { startDate, endDate } });
          setReportData(
            response.data.map((item: any) => ({
              ...item,
              date: moment(item.date).format('DD/MM/YYYY'),
              supplierName: item.supplierName || '—',
            }))
          );
          break;
        case 'loss':
          response = await api.get('/reports/loss', { params: { startDate, endDate } });
          setReportData(
            response.data.map((item: any) => ({ ...item, date: moment(item.date).format('DD/MM/YYYY HH:mm') }))
          );
          break;
        default:
          setError('Selecione um tipo de relatório.');
          break;
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao gerar relatório.'));
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'sales-by-period':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-line))" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Receita Total (R$)" strokeWidth={2} />
              <Line type="monotone" dataKey="totalSales" stroke="#82ca9d" name="Total de Vendas" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'top-selling-products':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-line))" />
              <XAxis
                dataKey="productName"
                interval={0}
                tickFormatter={(name: string) => (name.length > 16 ? `${name.slice(0, 15)}…` : name)}
                tick={{ fontSize: 11, fill: 'rgb(var(--color-ink-muted))' }}
              />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalQuantitySold" fill="#8884d8" name="Quantidade Vendida" />
              <Bar dataKey="totalRevenue" fill="#82ca9d" name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'monthly-revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-line))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalRevenue" stroke="#f97316" name="Faturamento (R$)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'stock-movement':
        return (
          <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>Data/Hora</Th>
                  <Th>Produto</Th>
                  <Th>Tipo</Th>
                  <Th className="text-right">Quantidade</Th>
                  <Th>Descrição</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reportData.map((movement, index) => (
                  <tr key={index} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-sm text-ink">{movement.date}</td>
                    <td className="px-4 py-3 text-sm text-ink">{movement.productName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {movement.type === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatQuantity(movement.quantity)} {movement.baseUnit}</td>
                    <td className="px-4 py-3 text-sm text-ink">{movement.description}</td>
                  </tr>
                ))}
              </tbody>
          </Table>
        );
      case 'financial-flow':
        return (
          <div>
            <p className="text-xs text-ink-muted mb-4">Entradas = faturamento de vendas · Saídas = total de compras</p>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-line))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--color-ink-muted))' }} />
                <Tooltip formatter={(v: number) => `R$ ${formatBRL(v)}`} />
                <Legend />
                <Bar dataKey="totalEntradas" fill="#10b981" name="Entradas (R$)" />
                <Bar dataKey="totalSaidas" fill="#f43f5e" name="Saídas (R$)" />
                <Line type="monotone" dataKey="saldo" stroke="#6366f1" name="Saldo (R$)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <Table>
                <thead className="bg-surface-2 border-b border-line">
                  <tr>
                    <Th>Mês</Th>
                    <Th className="text-right">Entradas</Th>
                    <Th className="text-right">Saídas</Th>
                    <Th className="text-right">Saldo</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {reportData.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-2">
                      <td className="px-4 py-3 text-sm text-ink">{row.month}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 text-right font-medium">
                        R$ {formatBRL(row.totalEntradas)}
                      </td>
                      <td className="px-4 py-3 text-sm text-rose-600 text-right font-medium">
                        R$ {formatBRL(row.totalSaidas)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-bold ${
                          row.saldo >= 0 ? 'text-ink' : 'text-orange-600'
                        }`}
                      >
                        {formatMoney(row.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        );
      case 'purchase-history':
        return (
          <div>
            <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>Data</Th>
                  <Th>Fornecedor</Th>
                  <Th>Pagamento</Th>
                  <Th className="text-right">Itens</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reportData.map((purchase) => (
                  <tr key={purchase.purchaseId} className="hover:bg-surface-2">
                    <td className="px-4 py-3 text-sm text-ink">{purchase.date}</td>
                    <td className="px-4 py-3 text-sm text-ink">{purchase.supplierName}</td>
                    <td className="px-4 py-3 text-sm text-ink">{getPaymentMethodLabel(purchase.paymentMethod)}</td>
                    <td className="px-4 py-3 text-sm text-ink text-right">{purchase.itemCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-ink text-right">
                      R$ {formatBRL(purchase.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {reportData.length === 0 && (
              <p className="text-sm text-ink-muted text-center py-8">Nenhuma compra registrada no período.</p>
            )}
          </div>
        );
      case 'loss': {
        // Conta ocorrências: as quantidades vêm em unidades diferentes (un, g, ml) e não podem ser somadas.
        const totalProducao = reportData.filter((r) => r.source === 'PRODUCAO').length;
        const totalEstoque = reportData.filter((r) => r.source === 'ESTOQUE').length;
        return (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card p-4">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Ocorrências</p>
                <p className="text-xl font-bold text-ink">{reportData.length}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Quebra de Produção</p>
                <p className="text-xl font-bold text-amber-600">{totalProducao}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Perda de Estoque</p>
                <p className="text-xl font-bold text-rose-600">{totalEstoque}</p>
              </div>
            </div>
            <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>Data/Hora</Th>
                  <Th>Origem</Th>
                  <Th>Produto</Th>
                  <Th>Motivo</Th>
                  <Th className="text-right">Quantidade</Th>
                  <Th>Descrição</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-sm text-ink">{row.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.source === 'PRODUCAO' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.source === 'PRODUCAO' ? 'PRODUÇÃO' : 'ESTOQUE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink">{row.productName}</td>
                    <td className="px-4 py-3 text-sm text-ink">{lossReasonLabel(row.reason)}</td>
                    <td className="px-4 py-3 text-sm text-ink text-right">{formatQuantity(row.quantity)}</td>
                    <td className="px-4 py-3 text-sm text-ink">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {reportData.length === 0 && (
              <p className="text-sm text-ink-muted text-center py-8">Nenhuma quebra registrada no período.</p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-ink mb-6">Relatórios Gerenciais</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="reportpage-tipo-de-relatorio" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Tipo de Relatório
            </label>
            <Field id="reportpage-tipo-de-relatorio"
              as="select"
              value={reportType}
              onChange={(e) => handleChangeReportType(e.target.value as ReportType)}
            >
              <option value="">Selecione...</option>
              {REPORT_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {(Object.keys(REPORTS) as Exclude<ReportType, ''>[])
                    .filter((type) => REPORTS[type].group === group)
                    .map((type) => (
                      <option key={type} value={type}>
                        {REPORTS[type].label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Field>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reportpage-data-inicial" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Data Inicial
            </label>
            <Field id="reportpage-data-inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={selected ? !selected.usesPeriod : false}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reportpage-data-final" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Data Final
            </label>
            <Field id="reportpage-data-final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={selected ? !selected.usesPeriod : false}
            />
          </div>
        </div>

        {reportType === 'stock-position' && (
          <label className="flex items-center gap-2 text-sm text-ink mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyBelowMinimum}
              onChange={(e) => setOnlyBelowMinimum(e.target.checked)}
            />
            Somente produtos abaixo do estoque mínimo
          </label>
        )}

        {selected && !selected.usesPeriod && (
          <p className="text-xs text-ink-muted mb-4">Este relatório mostra a posição atual e não usa o período.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {(!selected || selected.hasScreen) && (
            <Button
              variant="secondary"
              onClick={handleGenerateReport}
              disabled={loading || !reportType}
              loading={loading}
              loadingText="Gerando..."
            >
              <BarChart3 size={16} /> Ver na tela
            </Button>
          )}
          <Button
            onClick={() => handleExportPdf('open')}
            disabled={pdfLoading || !reportType}
            loading={pdfLoading}
            loadingText="Gerando PDF..."
          >
            <FileText size={16} /> Gerar PDF
          </Button>
          <Button variant="secondary" onClick={() => handleExportPdf('download')} disabled={pdfLoading || !reportType}>
            <Download size={16} /> Baixar PDF
          </Button>
        </div>

        {reportData && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-4">Resultado do Relatório</h3>
            {renderReportContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
