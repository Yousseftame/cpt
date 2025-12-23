import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Paper, Grid, MenuItem, Divider, CircularProgress } from "@mui/material";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../service/firebase";
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

      await updateDoc(docRef, {
        ...formData,
        price: Number(formData.price),
        updatedAt: serverTimestamp(),
      });

      toast.success("Generator model updated successfully!");
      navigate("/models");
    } catch (error) {
      toast.error("Failed to update generator model");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <CircularProgress />
          <p className="mt-4 text-gray-600">Loading model data...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800">Edit Generator Model</h1>
          <p className="text-gray-600 mt-1">Update generator model information</p>
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
                  helperText={errors.description}
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Gallery images and troubleshooting PDFs management will be available in future updates.
            </p>
          </div>

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
              {loading ? "Updating..." : "Update Model"}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
}