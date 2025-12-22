import { useState, type ChangeEvent, type FormEvent } from "react";
import { TextField, Button, Paper } from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../service/firebase";

interface Specifications {
  phase: string;
  voltage: string;
}

interface GeneratorModel {
  name: string;
  sku: string;
  price: number | string;
  category: string;
  powerRating: string;
  description: string;
  specifications: Specifications;
}

export default function AddGenerator() {
  const [formData, setFormData] = useState<GeneratorModel>({
    name: "",
    sku: "",
    price: "",
    category: "",
    powerRating: "",
    description: "",
    specifications: {
      phase: "",
      voltage: "",
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await addDoc(collection(db, "generatorModels"), {
      ...formData,
      price: Number(formData.price),
      galleryImages: [],
      troubleshootingPDFs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("Generator Model Added!");

    setFormData({
      name: "",
      sku: "",
      price: "",
      category: "",
      powerRating: "",
      description: "",
      specifications: {
        phase: "",
        voltage: "",
      },
    });
  };

  return (
    <Paper className="p-6 max-w-lg mx-auto mt-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Add Generator Model</h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} />

        <TextField fullWidth label="SKU" name="sku" value={formData.sku} onChange={handleChange} />

        <TextField fullWidth type="number" label="Price" name="price" value={formData.price} onChange={handleChange} />

        <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} />

        <TextField fullWidth label="Power Rating" name="powerRating" value={formData.powerRating} onChange={handleChange} />

        <TextField fullWidth multiline label="Description" name="description" value={formData.description} onChange={handleChange} />

        <h3 className="font-semibold mt-4">Specifications</h3>

        <TextField fullWidth label="Phase" name="phase" value={formData.specifications.phase} onChange={handleSpecChange} />
        <TextField fullWidth label="Voltage" name="voltage" value={formData.specifications.voltage} onChange={handleSpecChange} />

        <Button type="submit" variant="contained" fullWidth>
          Add Model
        </Button>
      </form>
    </Paper>
  );
}
