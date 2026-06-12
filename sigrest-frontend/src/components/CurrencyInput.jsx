import React from 'react';
import { formatBRL, parseBRLDigits } from '../utils/currency';

/**
 * Reusable Brazilian currency input.
 *
 * Displays a live BRL mask ("1.234,56") while keeping the PARENT state clean
 * and numeric (1234.56) via `onChange`. Reuse anywhere a money field is needed
 * (cash register opening balance, product prices, discounts, etc.).
 *
 * Props:
 *  - value:    clean numeric value (number | '' ) controlled by the parent.
 *  - onChange: receives the clean numeric value (number | '') on every keystroke.
 *  - ...rest:  forwarded to the underlying <input> (className, placeholder, disabled...).
 */
const CurrencyInput = ({ value, onChange, placeholder = '0,00', ...rest }) => {
  const display = formatBRL(value);

  const handleChange = (e) => {
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