import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Paper } from "@mui/material";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

export default function EditGenerator() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;

      const docRef = doc(db, "generatorModels", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as GeneratorModel;
        setFormData({
          ...data,
          price: data.price.toString(),
        });
      }
    };

    fetchModel();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSpecChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const docRef = doc(db, "generatorModels", id);

    await updateDoc(docRef, {
      ...formData,
      price: Number(formData.price),
      updatedAt: serverTimestamp(),
    });
    

    alert("Model Updated!");
    navigate("/models");
  };

  return (
    <Paper className="p-6 max-w-lg mx-auto mt-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Edit Generator Model</h2>

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
          Update Model
        </Button>

      </form>
    </Paper>
  );
}
