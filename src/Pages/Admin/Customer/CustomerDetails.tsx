import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Chip,
  Box,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  User,
  Ticket as TicketIcon,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import CustomerTicketsTab from "./CustomerTicketsTab";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
import CustomerUnitsTab from "./CustomerUnitsTab";
import PagesLoader from "../../../components/shared/PagesLoader";

// Purple & Blue Color Palette
const colors = {
  primary: "#5E35B1",
  primaryLight: "#7E57C2",
  secondary: "#1E88E5",
  secondaryLight: "#42A5F5",
  accent: "#FFB74D",
  success: "#66BB6A",
  error: "#EF5350",
  lightBg: "#F5F5F5",
  cardBg: "#FFFFFF",
  textPrimary: "#263238",
  textSecondary: "#607D8B",
  border: "#E0E0E0",
  lavender: "#EDE7F6",
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, updateCustomerStatus } = useCustomer();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);

  const refreshCustomerData = async () => {
    if (!id) return;
    
    try {
      const data = await getCustomerById(id);
      if (data) {
        setCustomer(data);
      }
    } catch (error) {
      console.error("Error refreshing customer:", error);
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        const data = await getCustomerById(id);
        if (data) {
          setCustomer(data);
        } else {
          navigate("/customer");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, getCustomerById, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'pending') => {
    if (!id) return;
    
    try {
      await updateCustomerStatus(id, newStatus);
      await refreshCustomerData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleStatusMenuClose();
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp.toDate()).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle2 size={16} />;
      case "inactive":
        return <XCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bgcolor: "#E8F5E9", color: colors.success };
      case "inactive":
        return { bgcolor: "#FFEBEE", color: colors.error };
      case "pending":
        return { bgcolor: "#FFF3E0", color: colors.accent };
      default:
        return { bgcolor: "#ECEFF1", color: colors.textSecondary };
    }
  };

  if (loading) {
    return <PagesLoader text="Loading customer details..." />;
  }

  if (!customer) {
    return null;
  }

  const statusStyle = getStatusColor(customer.status);

  return (
    <Box sx={{ maxWidth: 2100, mx: "auto", p: { xs: 2, md: 3 }, bgcolor: colors.lightBg, minHeight: "100vh" }}>
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
            borderColor: colors.border,
            color: colors.textPrimary,
            "&:hover": {
              borderColor: colors.primary,
              bgcolor: colors.lavender,
            },
          }}
        >
          Back to Customers
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: colors.primary,
                width: 64,
                height: 64,
                fontSize: "1.5rem",
              }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <h1 style={{ color: colors.textPrimary }} className="text-3xl font-bold">
                {customer.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <Chip
                    icon={getStatusIcon(customer.status)}
                    label={customer.status}
                    size="small"
                    sx={{
                      bgcolor: statusStyle.bgcolor,
                      color: statusStyle.color,
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={handleStatusMenuOpen}
                  />
                  <IconButton
                    size="small"
                    onClick={handleStatusMenuOpen}
                    sx={{ ml: 0.5, p: 0.5 }}
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                </Box>
                <Chip 
                  label={customer.role} 
                  size="small"
                  sx={{ bgcolor: colors.lavender, color: colors.primary }}
                />
              </div>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Edit size={20} />}
            onClick={() => navigate(`/customer/${id}/edit`)}
            sx={{
              textTransform: "none",
              px: 4,
              py: 1.5,
              bgcolor: colors.primary,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(94, 53, 177, 0.3)",
              "&:hover": { bgcolor: colors.primaryLight },
            }}
          >
            Edit Customer
          </Button>
        </Box>
      </Box>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem
          onClick={() => handleStatusChange('active')}
          disabled={customer.status === 'active'}
        >
          <CheckCircle2 size={16} className="mr-2" style={{ color: colors.success }} />
          Active
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('inactive')}
          disabled={customer.status === 'inactive'}
        >
          <XCircle size={16} className="mr-2" style={{ color: colors.error }} />
          Inactive
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('pending')}
          disabled={customer.status === 'pending'}
        >
          <Clock size={16} className="mr-2" style={{ color: colors.accent }} />
          Pending
        </MenuItem>
      </Menu>

      {/* Quick Stats */}
      <Box sx={{ mb: 4 }}>
        {/* First Row */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: "white",
              boxShadow: "0 4px 20px rgba(94, 53, 177, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Package size={32} />
              <Box>
                <p className="text-sm opacity-90">Purchased Units</p>
                <p className="text-3xl font-bold">{customer.purchasedUnits?.length || 0}</p>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
              color: "white",
              boxShadow: "0 4px 20px rgba(30, 136, 229, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TicketIcon size={32} />
              <Box>
                <p className="text-sm opacity-90">Total Tickets</p>
                <p className="text-3xl font-bold">{customer.ticketsCount || 0}</p>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Second Row */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: colors.lavender,
              color: colors.primary,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <User size={32} />
              <Box>
                <p className="text-sm opacity-90">Customer Since</p>
                <p className="text-lg font-bold">{formatDate(customer.createdAt)}</p>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#FFF3E0",
              color: colors.accent,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Calendar size={32} />
              <Box>
                <p className="text-sm opacity-90">Account Status</p>
                <p className="text-lg font-bold capitalize">{customer.status}</p>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" } }}>
        {/* Left Column - Contact Info */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: colors.cardBg,
            height: "fit-content",
          }}
        >
          <h2 style={{ color: colors.textPrimary }} className="text-xl font-semibold mb-4">
            Contact Information
          </h2>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Mail size={16} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>Email</span>
              </Box>
              <p style={{ color: colors.textPrimary }} className="font-medium">
                {customer.email}
              </p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Phone size={16} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>Phone</span>
              </Box>
              <p style={{ color: colors.textPrimary }} className="font-medium">
                {customer.phone}
              </p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <MapPin size={16} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>Address</span>
              </Box>
              <p style={{ color: colors.textPrimary }} className="font-medium">
                {customer.address}
              </p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Calendar size={16} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>Created At</span>
              </Box>
              <p style={{ color: colors.textPrimary }} className="font-medium">
                {formatDate(customer.createdAt)}
              </p>
            </Box>
          </Box>
        </Paper>

        {/* Right Column - Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: colors.cardBg,
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: colors.border }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                px: 2,
                "& .MuiTab-root": {
                  color: colors.textSecondary,
                },
                "& .Mui-selected": {
                  color: `${colors.primary} !important`,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: colors.primary,
                },
              }}
            >
              <Tab
                label={`Units (${customer.purchasedUnits?.length || 0})`}
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                label={`Tickets (${customer.ticketsCount || 0})`}
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          <Box sx={{ px: 4 }}>
            <TabPanel value={tabValue} index={0}>
              <CustomerUnitsTab 
                customerId={id!} 
                units={customer.purchasedUnits || []}
                onUnitsUpdate={refreshCustomerData}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <CustomerTicketsTab customerId={id!} />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}