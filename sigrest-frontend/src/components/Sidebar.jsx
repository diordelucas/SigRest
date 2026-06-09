import React from "react";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Box,
} from "@mui/material";

const drawerWidth = 240;

export default function Sidebar({ onSelect }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem>
            <Typography variant="subtitle1">MENU</Typography>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("pessoa")}>
              <ListItemText primary="Cadastro de Pessoa" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("produto")}>
              <ListItemText primary="Cadastro de Produto" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("categoria")}>
              <ListItemText primary="Cadastro de Categoria" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("fornecedor")}>
              <ListItemText primary="Cadastro de Fornecedor" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("usuario")}>
              <ListItemText primary="Cadastro de Usuário" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("sales")}>
              <ListItemText primary="Lista de Vendas" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("sales/new")}>
              <ListItemText primary="Registrar Venda" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("purchases")}>
              <ListItemText primary="Compras" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("stock-movements")}>
              <ListItemText primary="Movimentações de Estoque" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle1">Produção</Typography>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("technical-sheets")}>
              <ListItemText primary="Fichas Técnicas" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("production-orders")}>
              <ListItemText primary="Ordens de Produção" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle1">Financeiro</Typography>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("cash-registers")}>
              <ListItemText primary="Controle de Caixa" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("cash-registers/history")}>
              <ListItemText primary="Histórico de Caixas" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("accounts-payable")}>
              <ListItemText primary="Contas a Pagar" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("accounts-payable/new")}>
              <ListItemText primary="Registrar Conta a Pagar" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("accounts-receivable")}>
              <ListItemText primary="Contas a Receber" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("accounts-receivable/new")}>
              <ListItemText primary="Registrar Conta a Receber" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle1">Relatórios e Dashboard</Typography>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("dashboard")}>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onSelect("reports")}>
              <ListItemText primary="Relatórios" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
