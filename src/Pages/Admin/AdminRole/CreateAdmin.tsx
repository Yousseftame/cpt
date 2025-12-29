import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  TextField,
  Button,
  Paper,
  Divider,
  Box,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, Shield, Eye, EyeClosed } from "lucide-react";
import { useAdmin, type AdminPermissions } from "../../../store/MasterContext/AdminContext";
import Grid from "@mui/material/Grid";


const colors = {
  primary: "#5E35B1",
  primaryLight: "#7E57C2",
  secondary: "#1E88E5",
};

export default function CreateAdmin() {
  const navigate = useNavigate();
  const { createAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin" as "admin" | "superAdmin",
    status: "active" as "active" | "inactive",
  });

  const [permissions, setPermissions] = useState<AdminPermissions>({
    customers: { create: true, read: true, update: true, delete: false },
    tickets: { create: true, view: true, assign: true, update: true, delete: false },
    generators: { create: true, read: true, update: true, delete: false },
    purchaseRequests: { read: true, update: true, create: false, delete: false },
    admins: { create: false, read: false, update: false, delete: false },
    reports: { read: true, export: false },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPassVisible, setIsPassVisible] = useState(false); // eye flash old password
  

  

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

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newRole = e.target.value as "admin" | "superAdmin";
    setFormData((prev) => ({ ...prev, role: newRole }));

    // Auto-set permissions based on role
    if (newRole === "superAdmin") {
      setPermissions({
        customers: { create: true, read: true, update: true, delete: true },
        tickets: { create: true, view: true, assign: true, update: true, delete: true },
        generators: { create: true, read: true, update: true, delete: true },
        purchaseRequests: { read: true, update: true, create: true, delete: true },
        admins: { create: true, read: true, update: true, delete: true },
        reports: { read: true, export: true },
      });
    } else {
      setPermissions({
        customers: { create: true, read: true, update: true, delete: false },
        tickets: { create: true, view: true, assign: true, update: true, delete: false },
        generators: { create: true, read: true, update: true, delete: false },
        purchaseRequests: { read: true, update: true, create: false, delete: false },
        admins: { create: false, read: false, update: false, delete: false },
        reports: { read: true, export: false },
      });
    }
  };

  const handlePermissionChange = (
    module: keyof AdminPermissions,
    action: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked,
      },
    }));
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
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        permissions,
      });
      navigate("/admins");
    } catch (error) {
      console.error("Error creating admin:", error);
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
          onClick={() => navigate("/admins")}
          sx={{
            textTransform: "none",
            mb: 2,
            borderRadius: 2,
          }}
        >
          Back to Admins
        </Button>

        <Box>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Admin</h1>
          <p className="text-gray-600">Create a new admin account with custom permissions</p>
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
          {/* Basic Information Section */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <UserPlus className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
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
                  placeholder="admin@example.com"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                
                  fullWidth
                  label="Password"
                  name="password"
                  type={isPassVisible ? "text" : "password"}
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
                  label="Confirm Password"
                  name="confirmPassword"
                  type= { isPassVisible ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
            </Grid>
          </Box>

          {/* Role & Status Section */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Shield className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Role & Status</h2>
            </Box>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 1, color: colors.primary, fontWeight: 600 }}>
                    Admin Role
                  </FormLabel>
                  <RadioGroup
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                  >
                    <FormControlLabel
                      value="admin"
                      control={<Radio sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }} />}
                      label="Admin - Standard permissions"
                    />
                    <FormControlLabel
                      value="superAdmin"
                      control={<Radio sx={{ color: colors.secondary, "&.Mui-checked": { color: colors.secondary } }} />}
                      label="Super Admin - Full access to everything"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 1, color: colors.primary, fontWeight: 600 }}>
                    Account Status
                  </FormLabel>
                  <RadioGroup
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                  >
                    <FormControlLabel
                      value="active"
                      control={<Radio sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }} />}
                      label="Active - Can login immediately"
                    />
                    <FormControlLabel
                      value="inactive"
                      control={<Radio />}
                      label="Inactive - Account disabled"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Permissions Section */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Shield className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Permissions</h2>
            </Box>
            <Divider sx={{ mb: 4 }} />

            {formData.role === "superAdmin" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Super Admins have full access to all features by default.
                </p>
              </div>
            )}

            <Grid container spacing={3}>
              {/* Customers */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Customers</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.customers).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("customers", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>

              {/* Tickets */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Tickets</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.tickets).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("tickets", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>

              {/* Generators */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Generators</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.generators).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("generators", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>

              {/* Purchase Requests */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Purchase Requests</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.purchaseRequests).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("purchaseRequests", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>

              {/* Admins */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Admin Management</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.admins).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("admins", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>

              {/* Reports */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                  <h3 className="font-semibold mb-2 text-gray-700">Reports</h3>
                  <div className="space-y-1">
                    {Object.entries(permissions.reports).map(([action, checked]) => (
                      <FormControlLabel
                        key={action}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={(e) =>
                              handlePermissionChange("reports", action, e.target.checked)
                            }
                            disabled={formData.role === "superAdmin"}
                            sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                          />
                        }
                        label={action.charAt(0).toUpperCase() + action.slice(1)}
                      />
                    ))}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The admin will receive their login credentials and can immediately access the system if the account is set to active.
            </p>
          </div>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/admins")}
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
              {loading ? "Creating..." : "Create Admin"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}