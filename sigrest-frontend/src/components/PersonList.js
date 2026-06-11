import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Alert,
  Box,
  CircularProgress,
  Button
} from "@mui/material";
import axios from "axios";

const PersonList = ({ refreshTrigger, onEditPerson, isReadOnly }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/person");
      setPersons(response.data);
    } catch (error) {
      setError("Erro ao carregar a lista de pessoas. Verifique o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta pessoa?")) {
      try {
        await axios.delete(`http://localhost:8080/person/${id}`);
        setPersons(persons.filter(person => person.id !== id));
      } catch (error) {
        setError("Erro ao excluir pessoa. Verifique o servidor.");
        console.error(error);
      }
    }
  };

  const handleEdit = (person) => {
    onEditPerson(person);
  };

  useEffect(() => {
    fetchPersons();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lista de Pessoas
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {persons.length === 0 ? (
        <Typography color="textSecondary">
          Nenhuma pessoa cadastrada.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>CPF</strong></TableCell>
                <TableCell><strong>Telefone</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Endereço</strong></TableCell>
                <TableCell><strong>Cidade</strong></TableCell>
                <TableCell><strong>UF</strong></TableCell>
                {!isReadOnly && <TableCell><strong>Ações</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>{person.id}</TableCell>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.cpf}</TableCell>
                  <TableCell>{person.phone}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>
                    {person.street && person.number && person.nbhd
                      ? `${person.street}, ${person.number} - ${person.nbhd}`
                      : "Não informado"
                    }
                  </TableCell>
                  <TableCell>{person.city || "Não informado"}</TableCell>
                  <TableCell>{person.uf || "Não informado"}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(person)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(person.id)}
                        >
                          Excluir
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Box mt={2}>
        <Button 
          variant="outlined" 
          onClick={fetchPersons}
          disabled={loading}
        >
          Atualizar Lista
        </Button>
      </Box>
    </Paper>
  );
};

export default PersonList;