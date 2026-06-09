import { createTheme } from '@mui/material/styles';

const majusTheme = createTheme({
  palette: {
    // Fundo geral do sistema (um off-white muito suave, quase gelo)
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    // Cor Primária: O Vermelho Bordô da marca.
    // Traz a identidade forte da marca para botões principais (Salvar, Nova Venda)
    primary: {
      main: '#B72025', // Inspirado no vermelho escuro da arte
      light: '#D34549',
      dark: '#8A1519',
      contrastText: '#FFFFFF',
    },
    // Cor Secundária: O Amarelo Mostarda.
    // Ótimo para destaques, badges de "Pendente", ou botões secundários.
    secondary: {
      main: '#EBA820', // Inspirado no fundo amarelo da arte
      light: '#F2C14E',
      dark: '#C98D15',
      contrastText: '#2D3748', // Texto escuro para dar leitura em cima do amarelo
    },
    // Textos limpos e modernos (Grafite escuro, não preto puro)
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
  },
  shape: {
    borderRadius: 12, // O "arredondado moderno" que conversamos
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.3px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          padding: '8px 16px', // Botões mais gordinhos e confortáveis
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(183, 32, 37, 0.2)', // Sombra vermelha suave no hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.03)', // Sombra levíssima
          border: '1px solid #E2E8F0', // Borda sutil de SaaS moderno
        },
      },
    },
    // Deixando os inputs (campos de texto) mais modernos
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FAFAFA',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B72025', // Fica vermelho ao passar o mouse
          },
        },
      },
    },
  },
});

export default majusTheme;
