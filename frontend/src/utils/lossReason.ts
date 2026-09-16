import { LossReason } from '../types';

export const LOSS_REASON_LABELS: Record<LossReason, string> = {
  VENCIMENTO: 'Vencimento',
  ERRO_PREPARO: 'Erro de preparo',
  DESCARTE_QUALIDADE: 'Descarte de qualidade',
  OUTRO: 'Outro',
};

export const lossReasonLabel = (reason: LossReason | string | null | undefined): string =>
  reason ? LOSS_REASON_LABELS[reason as LossReason] ?? reason : '-';
