import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Paper,  Divider,  Box } from "@mui/material";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../service/firebase";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Zap } from "lucide-react";
import Grid from '@mui/material/Grid';
import PagesLoader from "../../../components/shared/PagesLoader";



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

const categories = [
  "Portable",
  "Standby",
  "Industrial",
  "Commercial",
  "Residential",
  "Inverter"
];

const phases = ["Single Phase", "Three Phase"];
const voltages = ["110V", "220V", "230V", "240V", "380V", "400V", "480V"];

export default function EditGenerator() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "generatorModels", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as GeneratorModel;
          setFormData({
            ...data,
            price: data.price.toString(),
          });
        } else {
          toast.error("Model not found");
          navigate("/models");
        }
      } catch (error) {
        toast.error("Failed to fetch model");
        console.error(error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchModel();
  }, [id, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Model name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (Number(formData.price) <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.powerRating.trim()) newErrors.powerRating = "Power rating is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.specifications.phase) newErrors.phase = "Phase is required";
    if (!formData.specifications.voltage) newErrors.voltage = "Voltage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!id) return;

    setLoading(true);

    try {
      const docRef = doc(db, "generatorModels", id);

      const updateData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: Number(formData.price),
        category: formData.category,
        powerRating: formData.powerRating.trim(),
        description: formData.description.trim(),
        specifications: {
          phase: formData.specifications.phase,
          voltage: formData.specifications.voltage,
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      toast.success("Generator model updated successfully!");
      navigate("/models");
    } catch (error: any) {
      console.error("Error updating document: ", error);
      toast.error(error.message || "Failed to update generator model");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
       <PagesLoader text="Loading generator model data..." />
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/models")}
          sx={{ 
            textTransform: 'none',
            mb: 2,
            borderRadius: 2
          }}
        >
          Back to Models
        </Button>
        <Box>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Generator Model</h1>
          <p className="text-gray-600">Update generator model information</p>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          
          {/* Basic Information Section */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Zap className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </Box>
            <Divider sx={{ mb: 4 }} />
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Model Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={!!errors.sku}
                  helperText={errors.sku}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price (USD)"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                  InputProps={{
                    startAdornment: <span className="mr-2 text-gray-500">$</span>
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={!!errors.category}
                  helperText={errors.category}
                  required
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Power Rating"
                  name="powerRating"
                  value={formData.powerRating}
                  onChange={handleChange}
                  error={!!errors.powerRating}
                  helperText={errors.powerRating}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Specifications Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Zap className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Specifications</h2>
            </Box>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Phase"
                  name="phase"
                  value={formData.specifications.phase}
                  onChange={handleSpecChange}
                  error={!!errors.phase}
                  helperText={errors.phase}
                  required
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {phases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Voltage"
                  name="voltage"
                  value={formData.specifications.voltage}
                  onChange={handleSpecChange}
                  error={!!errors.voltage}
                  helperText={errors.voltage}
                  required
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {voltages.map((voltage) => (
                    <option key={voltage} value={voltage}>
                      {voltage}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/models")}
              disabled={loading}
              sx={{ 
                textTransform: 'none', 
                px: 4, 
                py: 1.5,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? null : <Save size={20} />}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
                bgcolor: '#5E35B1',
                borderRadius: 2,
                '&:hover': { bgcolor: '#5E35B1' }
              }}
            >
              {loading ? "Updating..." : "Update Model"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}