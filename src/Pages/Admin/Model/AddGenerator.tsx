import { useState, type ChangeEvent, type FormEvent } from "react";
import { TextField, Button, Paper, Grid, MenuItem, Divider } from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Zap } from "lucide-react";

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

export default function AddGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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

    setLoading(true);

    try {
      await addDoc(collection(db, "generatorModels"), {
        ...formData,
        price: Number(formData.price),
        galleryImages: [],
        troubleshootingPDFs: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Generator model added successfully!");
      navigate("/models");
    } catch (error) {
      toast.error("Failed to add generator model");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/models")}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Add Generator Model</h1>
          <p className="text-gray-600 mt-1">Create a new generator model entry</p>
        </div>
      </div>

      <Paper className="p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </div>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  placeholder="e.g., PowerMax 5000"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={!!errors.sku}
                  helperText={errors.sku}
                  required
                  placeholder="e.g., GEN-PM-5000"
                />
              </Grid>

              <Grid item xs={12} md={6}>
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
                />
              </Grid>

              <Grid item xs={12} md={6}>
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
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Power Rating"
                  name="powerRating"
                  value={formData.powerRating}
                  onChange={handleChange}
                  error={!!errors.powerRating}
                  helperText={errors.powerRating}
                  required
                  placeholder="e.g., 5000W"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description || "Provide a detailed description of the generator model"}
                  required
                />
              </Grid>
            </Grid>
          </div>

          {/* Specifications Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Specifications</h2>
            </div>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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
                >
                  <MenuItem value="">Select Phase</MenuItem>
                  {phases.map((phase) => (
                    <MenuItem key={phase} value={phase}>
                      {phase}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
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
                >
                  <MenuItem value="">Select Voltage</MenuItem>
                  {voltages.map((voltage) => (
                    <MenuItem key={voltage} value={voltage}>
                      {voltage}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </div>

          {/* Info Box */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Gallery images and troubleshooting PDFs can be added after creating the model.
            </p>
          </div> */}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outlined"
              onClick={() => navigate("/models")}
              disabled={loading}
              sx={{ textTransform: 'none', px: 4 }}
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
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' }
              }}
            >
              {loading ? "Saving..." : "Save Model"}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
}