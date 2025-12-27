import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { TextField, Button, Paper, Grid, Divider, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, UserCog } from "lucide-react";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
import PagesLoader from "../../../components/shared/PagesLoader";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, updateCustomer } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        const customer = await getCustomerById(id);
        if (customer) {
          setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          });
        } else {
          navigate("/customer");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCustomer();
  }, [id, getCustomerById, navigate]);

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
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) return;

    setLoading(true);

    try {
      await updateCustomer(id, formData);
      navigate(`/customer/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
            <PagesLoader text="Loading customer data..." />
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(`/customer/${id}`)}
          sx={{
            textTransform: "none",
            mb: 2,
            borderRadius: 2,
          }}
        >
          Back to Details
        </Button>

        <Box>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
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
              <UserCog className="text-indigo-600" size={24} />
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
                  disabled
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  rows={3}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Email address cannot be changed for security reasons. Contact support if email needs to be updated.
            </p>
          </div>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/customer/${id}`)}
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
              {loading ? "Updating..." : "Update Customer"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}