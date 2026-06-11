import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TechnicalSheetList from "../components/TechnicalSheetList";
import TechnicalSheetForm from "../components/TechnicalSheetForm";

export default function TechnicalSheets() {
  const [editingTechnicalSheet, setEditingTechnicalSheet] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  if (editingTechnicalSheet) {
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
        setEditingTechnicalSheet(sheet); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }}
      onNewSheet={() => navigate("/technical-sheets/new")}
    />
  );
}
