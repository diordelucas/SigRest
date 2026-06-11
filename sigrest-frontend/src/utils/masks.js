import React from 'react';
import { IMaskInput } from 'react-imask';

export const MaskedInput = React.forwardRef(function MaskedInput({ onChange, ...other }, ref) {
  return (
    <IMaskInput
      {...other}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: other.name, value } })}
    />
  );
});

export const CPF_MASK = '000.000.000-00';
export const CNPJ_MASK = '00.000.000/0000-00';
export const PHONE_MASK = [
  { mask: '(00) 0000-0000' },
  { mask: '(00) 00000-0000' },
];
export const CEP_MASK = '00000-000';