import { useState, useEffect } from "react";
import {
  Button,
  Paper,
  Box,
  Chip,
  Avatar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Activity,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../../store/MasterContext/AdminContext";
import { auditLogger } from "../../../service/auditLogger";
import Grid from "@mui/material/Grid";
import PagesLoader from "../../../components/shared/PagesLoader";
import type { AuditLog } from "../../../types/auditLog.types";

const colors = {
  primary: "#5E35B1",
  primaryLight: "#7E57C2",
  secondary: "#1E88E5",
  success: "#66BB6A",
  error: "#EF5350",
  textPrimary: "#263238",
  textSecondary: "#607D8B",
};

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdminById, updateAdminStatus, deleteAdmin } = useAdmin();
  const [admin, setAdmin] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const adminData = await getAdminById(id);
        if (adminData) {
          setAdmin(adminData);
          
          // Fetch recent activity logs
          const logs = await auditLogger.getAdminActivity(id, 10);
          setRecentLogs(logs);
        } else {
          navigate("/admins");
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getAdminById, navigate]);

  const handleStatusToggle = async () => {
    if (!admin) return;
    const newStatus = admin.status === "active" ? "inactive" : "active";
    try {
      await updateAdminStatus(admin.id, newStatus);
      setAdmin({ ...admin, status: newStatus });
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async () => {
    if (!admin) return;
    try {
      await deleteAdmin(admin.id);
      navigate("/admins");
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATED")) return colors.success;
    if (action.includes("DELETED")) return colors.error;
    if (action.includes("UPDATED") || action.includes("CHANGED")) return colors.secondary;
    return colors.textSecondary;
  };

  if (loading) {
    return <PagesLoader text="Loading admin details..." />;
  }

  if (!admin) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/admins")}
          sx={{ textTransform: "none", mb: 2, borderRadius: 2 }}
        >
          Back to Admins
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              sx={{
                bgcolor: admin.role === "superAdmin" ? colors.secondary : colors.primary,
                width: 80,
                height: 80,
                fontSize: "2rem",
              }}
            >
              {admin.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{admin.name}</h1>
              <p className="text-gray-600 mt-1">{admin.email}</p>
              <div className="flex gap-2 mt-2">
                <Chip
                  icon={admin.role === "superAdmin" ? <Shield size={14} /> : <User size={14} />}
                  label={admin.role === "superAdmin" ? "Super Admin" : "Admin"}
                  size="small"
                  sx={{
                    bgcolor: admin.role === "superAdmin" ? "#E3F2FD" : "#EDE7F6",
                    color: admin.role === "superAdmin" ? colors.secondary : colors.primary,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={admin.status === "active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  label={admin.status === "active" ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    bgcolor: admin.status === "active" ? "#E8F5E9" : "#FFEBEE",
                    color: admin.status === "active" ? colors.success : colors.error,
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<Edit size={20} />}
              onClick={() => navigate(`/admins/${id}/edit`)}
              sx={{
                textTransform: "none",
                px: 3,
                borderColor: colors.primary,
                color: colors.primary,
                "&:hover": { borderColor: colors.primaryLight },
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={20} />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: "none", px: 3 }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Box>

      <Grid container spacing={3}>
        {/* Admin Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Admin Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={20} style={{ color: colors.textSecondary }} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: colors.textSecondary }} />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(admin.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={20} style={{ color: colors.textSecondary }} />
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{formatDate(admin.lastLogin)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Activity size={20} style={{ color: colors.textSecondary }} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {admin.status === "active" ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={admin.status === "active"}
                      onChange={handleStatusToggle}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: colors.success,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: colors.success,
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </Grid>

        {/* Login History */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Login History
            </h2>

            {admin.loginHistory && admin.loginHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {admin.loginHistory.slice(-5).reverse().map((login: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{formatDate(login.timestamp)}</p>
                        {login.userAgent && (
                          <p className="text-xs text-gray-500 mt-1">
                            {login.userAgent.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No login history available</p>
            )}
          </Paper>
        </Grid>

        {/* Permissions Matrix */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Permissions
            </h2>

            <Grid container spacing={2}>
              {Object.entries(admin.permissions).map(([module, perms]: [string, any]) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module}>
                  <Paper sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                    <h3 className="font-semibold mb-2 text-gray-700 capitalize">
                      {module.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <div className="space-y-1">
                      {Object.entries(perms).map(([action, allowed]: [string, any]) => (
                        <div key={action} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{action}</span>
                          {allowed ? (
                            <CheckCircle size={16} style={{ color: colors.success }} />
                          ) : (
                            <XCircle size={16} style={{ color: colors.error }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Recent Activity
              </h2>
              <Button
                variant="text"
                size="small"
                sx={{ textTransform: "none", color: colors.primary }}
              >
                View All Logs
              </Button>
            </div>

            {recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Chip
                            label={log.action.replace(/_/g, " ")}
                            size="small"
                            sx={{
                              bgcolor: "white",
                              color: getActionColor(log.action),
                              border: `1px solid ${getActionColor(log.action)}`,
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                          <span className="text-sm text-gray-600 capitalize">
                            {log.entityType}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{log.entityName}</p>
                        {log.changes && log.changes.length > 0 && (
                          <div className="mt-1">
                            {log.changes.slice(0, 2).map((change, idx) => (
                              <p key={idx} className="text-xs text-gray-600">
                                • {change}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Admin Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{admin.name}</strong>? This action cannot be undone.
            All data associated with this admin will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}