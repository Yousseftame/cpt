import { useState, type ChangeEvent, type FormEvent } from "react";
import { TextField, Button, Paper,  Divider, Box, InputAdornment, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeClosed, Save, UserPlus } from "lucide-react";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
import Grid from '@mui/material/Grid';

interface CustomerFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export default function CreateCustomer() {
  const navigate = useNavigate();
  const { createCustomer } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPassVisible , setIsPassVisible] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await createCustomer(formData);
      navigate("/customer");
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/customer")}
          sx={{
            textTransform: "none",
            mb: 2,
            borderRadius: 2,
          }}
        >
          Back to Customers
        </Button>

        <Box>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Customer</h1>
          <p className="text-gray-600">Create a new customer account</p>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 3,
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Customer Information Section */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <UserPlus className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Customer Information</h2>
            </Box>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  placeholder="John Doe"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  placeholder="john@example.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={ isPassVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password || "Minimum 6 characters"}
                  required
                  placeholder="••••••••"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                   InputProps={{
      endAdornment: (
        <InputAdornment position="start">
          <IconButton
            onClick={() => setIsPassVisible((prev) => !prev)}
            edge="start"
          >
            {isPassVisible ? <Eye size={20} /> : <EyeClosed size={20} />}
          </IconButton>
        </InputAdornment>
      ),
    }}

                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  placeholder="+1 (555) 000-0000"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12 , md: 12 }}>
                <TextField
                  fullWidth
                  
                  rows={3}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address || "Full address including city and postal code"}
                  required
                  placeholder="123 Main St, City, State, ZIP"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The customer will be created with "active" status and can
              immediately log in with the provided credentials.
            </p>
          </div>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/customer")}
              disabled={loading}
              sx={{
                textTransform: "none",
                px: 4,
                py: 1.5,
                borderRadius: 2,
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
                textTransform: "none",
                px: 4,
                py: 1.5,
                bgcolor: "#5E35B1",
                borderRadius: 2,
                "&:hover": { bgcolor: "#5E35B1" },
              }}
            >
              {loading ? "Creating..." : "Create Customer"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}