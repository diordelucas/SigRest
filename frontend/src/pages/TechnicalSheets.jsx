import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TechnicalSheetList from "../components/TechnicalSheetList";
import TechnicalSheetForm from "../components/TechnicalSheetForm";
import { useAuth } from "../contexts/AuthContext";

export default function TechnicalSheets() {
  const [editingTechnicalSheet, setEditingTechnicalSheet] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  if (editingTechnicalSheet && isAdmin) {
    return (
      <TechnicalSheetForm 
        sheetToEdit={editingTechnicalSheet}
        onSaveSuccess={() => { 
          setEditingTechnicalSheet(null); 
          setRefreshTrigger(prev => prev + 1); 
        }}
        onCancel={() => setEditingTechnicalSheet(null)}
      />
    );
  }

  return (
    <TechnicalSheetList 
      refreshTrigger={refreshTrigger}
      onEditSheet={(sheet) => { 
        if (isAdmin) {
          setEditingTechnicalSheet(sheet); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
      }}
      onNewSheet={() => {
        if (isAdmin) {
          navigate("/technical-sheets/new");
        }
      }}
      isReadOnly={!isAdmin}
    />
  );
}
