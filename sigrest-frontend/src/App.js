import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import Sidebar from "./components/Sidebar"; // ajuste o caminho se necessário
import PersonForm from "./components/PersonForm";
import PersonList from "./components/PersonList";

import ProductForm from "./components/ProductForm"; // Renamed from ProdutoForm
import ProductList from "./components/ProductList"; // Renamed from ProdutoList

import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import LoginForm from "./components/LoginForm";

import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import SupplierForm from "./components/SupplierForm";
import SupplierList from "./components/SupplierList";

import PurchaseForm from "./components/PurchaseForm";
import PurchaseList from "./components/PurchaseList";
import StockMovementList from "./components/StockMovementList";

import SaleForm from "./components/SaleForm"; // Renamed from VendaForm
import SaleList from "./components/SaleList"; // Renamed from VendaList

import CashRegisterForm from "./components/CashRegisterForm";
import CashRegisterList from "./components/CashRegisterList";
import AccountPayableForm from "./components/AccountPayableForm";
import AccountPayableList from "./components/AccountPayableList";
import AccountReceivableForm from "./components/AccountReceivableForm";
import AccountReceivableList from "./components/AccountReceivableList";

import Dashboard from "./components/Dashboard"; // Import Dashboard
import ReportPage from "./components/ReportPage"; // Import ReportPage

import TechnicalSheetList from "./components/TechnicalSheetList";
import TechnicalSheetForm from "./components/TechnicalSheetForm";
import ProductionOrderList from "./components/ProductionOrderList";
import ProductionOrderForm from "./components/ProductionOrderForm";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState("pessoa");
  const [updateList, setUpdateList] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path) {
      setSelectedPage(path);
    }
  }, [location]);

  const handleSelectPage = (page) => {
    navigate("/" + page);
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingPerson, setEditingPerson] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingTechnicalSheet, setEditingTechnicalSheet] = useState(null);

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingPerson(null);
    setEditingUser(null);
    setEditingCategory(null);
    setEditingSupplier(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={setCurrentUser} />;
  }

  const renderContent = () => {
    switch (selectedPage) {
      case "pessoa":
        return (
          <>
            <PersonForm onUserAdded={() => setUpdateList(!updateList)}
               editingPerson={editingPerson}
               onEditComplete={handleEditComplete}/>
            <PersonList key={updateList} refreshTrigger={refreshTrigger}
        onEditPerson={handleEditPerson}/>
          </>
        );
      case "produto": // This case should be renamed to "product"
        return (
          <>
            <ProductForm onUserAdded={() => setUpdateList(!updateList)} // Renamed from ProdutoForm
               editingPerson={editingPerson}
               onEditComplete={handleEditComplete}/>
            <ProductList key={updateList} refreshTrigger={refreshTrigger} // Renamed from ProdutoList
        onEditPerson={handleEditPerson}/>
          </>
        );
      case "categoria":
        return (
          <>
            <CategoryForm onCategoryAdded={() => setUpdateList(!updateList)}
               editingCategory={editingCategory}
               onEditComplete={handleEditComplete}/>
            <CategoryList key={updateList} refreshTrigger={refreshTrigger}
               onEditCategory={handleEditCategory}/>
          </>
        );
      case "fornecedor":
        return (
          <>
            <SupplierForm onSupplierAdded={() => setUpdateList(!updateList)}
               editingSupplier={editingSupplier}
               onEditComplete={handleEditComplete}/>
            <SupplierList key={updateList} refreshTrigger={refreshTrigger}
               onEditSupplier={handleEditSupplier}/>
          </>
        );
      case "usuario":
        return (
          <>
            <UserForm onUserAdded={() => setUpdateList(!updateList)}
               editingUser={editingUser}
               onEditComplete={handleEditComplete}/>
            <UserList key={updateList} refreshTrigger={refreshTrigger}
               onEditUser={handleEditUser}/>
          </>
        );
      case "sales": // New case for sales list
        return <SaleList />; // Renamed from VendaList
      case "sales/new": // New case for sales form
        return <SaleForm />; // Renamed from VendaForm
      case "purchases":
        return <PurchaseList />;
      case "purchases/new":
        return <PurchaseForm />;
      case "stock-movements":
        return <StockMovementList />;
      case "cash-registers":
        return <CashRegisterForm />;
      case "cash-registers/history":
        return <CashRegisterList />;
      case "accounts-payable":
        return <AccountPayableList />;
      case "accounts-payable/new":
        return <AccountPayableForm />;
      case "accounts-receivable":
        return <AccountReceivableList />;
      case "accounts-receivable/new":
        return <AccountReceivableForm />;
      case "dashboard":
        return <Dashboard />;
      case "reports":
        return <ReportPage />;
      case "technical-sheets":
        return (
          <>
            {editingTechnicalSheet ? (
               <TechnicalSheetForm 
                  sheetToEdit={editingTechnicalSheet}
                  onSaveSuccess={() => { setEditingTechnicalSheet(null); setRefreshTrigger(prev => prev + 1); }}
                  onCancel={() => setEditingTechnicalSheet(null)}
               />
            ) : (
               <TechnicalSheetList 
                  refreshTrigger={refreshTrigger}
                  onEditSheet={(sheet) => { setEditingTechnicalSheet(sheet); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
               />
            )}
          </>
        );
      case "technical-sheets/new":
        return <TechnicalSheetForm onSaveSuccess={() => { setSelectedPage("technical-sheets"); setRefreshTrigger(prev => prev + 1); }} onCancel={() => setSelectedPage("technical-sheets")} />;
      case "production-orders":
        return <ProductionOrderList refreshTrigger={refreshTrigger} onNewOrder={() => setSelectedPage("production-orders/new")} />;
      case "production-orders/new":
        return <ProductionOrderForm onSaveSuccess={() => { setSelectedPage("production-orders"); setRefreshTrigger(prev => prev + 1); }} onCancel={() => setSelectedPage("production-orders")} />;
      default:
        return <div>Bem-vindo, {currentUser.name}</div>;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SIGREST - Maju's Assados e Congelados
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Olá, {currentUser.name}
          </Typography>
          <Button color="inherit" onClick={() => setCurrentUser(null)}>Sair</Button>
        </Toolbar>
      </AppBar>

      <Sidebar onSelect={handleSelectPage} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}
