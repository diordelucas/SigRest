import React, { InputHTMLAttributes } from 'react';
import { formatBRL, parseBRLDigits } from '../utils/currency';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Valor numérico limpo (number | '') controlado pelo componente pai. */
  value: number | '';
  /** Recebe o valor numérico limpo (number | '') a cada tecla digitada. */
  onChange: (value: number | '') => void;
}

/**
 * Input de moeda brasileira reutilizável. Mostra a máscara BRL ("1.234,56")
 * mantendo o estado do componente pai limpo e numérico (1234.56).
 */
const CurrencyInput = ({ value, onChange, placeholder = '0,00', ...rest }: CurrencyInputProps) => {
  const display = formatBRL(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseBRLDigits(e.target.value));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default CurrencyInput;
