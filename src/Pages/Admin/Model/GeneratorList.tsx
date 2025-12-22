import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import { db } from "../../../service/firebase";

interface GeneratorModel {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
}

export default function GeneratorList() {
  const [models, setModels] = useState<GeneratorModel[]>([]);

  const fetchModels = async () => {
    const snapshot = await getDocs(collection(db, "generatorModels"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<GeneratorModel, "id">),
    }));

    setModels(data);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "generatorModels", id));
    fetchModels();
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <Paper className="p-6 max-w-5xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Generator Models</h2>

      <Link to="/models/add">
        <Button variant="contained" className="mb-4">Add New Model</Button>
      </Link>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {models.map(model => (
            <TableRow key={model.id}>
              <TableCell>{model.name}</TableCell>
              <TableCell>{model.sku}</TableCell>
              <TableCell>${model.price}</TableCell>
              <TableCell>{model.category}</TableCell>

              <TableCell>
                <Link to={`/models/edit/${model.id}`}>
                  <Button variant="outlined" size="small">Edit</Button>
                </Link>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  className="ml-2"
                  onClick={() => handleDelete(model.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
