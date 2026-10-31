import axios from 'axios';
import { ApiErrorResponse } from '../types';

/** Disparado depois de qualquer gravação bem-sucedida: o sino de alertas se atualiza ao ouvir. */
export const DATA_CHANGED_EVENT = 'sigrest:data-changed';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
});

/**
 * Extrai a mensagem de erro a ser mostrada ao usuário. O backend já devolve
 * um ErrorResponse {codigo, message, status, timestamp} com texto pronto para
 * exibição (ver GlobalExceptionHandler) — aqui só tratamos os casos em que
 * essa resposta não existe (erro de rede) ou não veio no formato esperado.
 */
export function getErrorMessage(err: unknown, fallback = 'Ocorreu um erro inesperado. Tente novamente.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (!err.response) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  return fallback;
}

/**
 * Baixa um relatório em PDF (endpoints /reports/pdf/*). A resposta vem como Blob — inclusive a
 * de erro, então o ErrorResponse JSON é convertido de volta para objeto antes de relançar, para
 * o getErrorMessage continuar funcionando.
 */
export async function fetchPdf(
  url: string,
  params?: Record<string, string | number | boolean>
): Promise<{ blob: Blob; fileName: string }> {
  try {
    const response = await api.get<Blob>(url, { params, responseType: 'blob' });
    const disposition: string = response.headers['content-disposition'] ?? '';
    const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'relatorio-sigrest.pdf';
    return { blob: response.data, fileName };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      try {
        err.response.data = JSON.parse(await err.response.data.text());
      } catch {
        // corpo não era JSON: getErrorMessage cai no fallback
      }
    }
    throw err;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@sigrest:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && method !== 'get' && !response.config.url?.includes('/user/login')) {
      window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@sigrest:token');
      localStorage.removeItem('@sigrest:user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
