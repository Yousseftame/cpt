import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Chip,
  CircularProgress,
  Box,
  Divider,
  Avatar,
  Tab,
  Tabs,
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
} from "lucide-react";
import CustomerTicketsTab from "./CustomerTicketsTab";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
import CustomerUnitsTab from "./CustomerUnitsTab";

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
  const { getCustomerById } = useCustomer();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);


  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <CircularProgress />
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
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
                bgcolor: "#4F46E5",
                width: 64,
                height: 64,
                fontSize: "1.5rem",
              }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  label={customer.status}
                  size="small"
                  sx={{
                    bgcolor:
                      customer.status === "active"
                        ? "#F6FFED"
                        : customer.status === "inactive"
                        ? "#FFF1F0"
                        : "#FEF3C7",
                    color:
                      customer.status === "active"
                        ? "#6CC464"
                        : customer.status === "inactive"
                        ? "#FF5F5E"
                        : "#F59E0B",
                    fontWeight: 600,
                  }}
                />
                <Chip label={customer.role} size="small" />
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
              bgcolor: "#4F46E5",
              borderRadius: 2,
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Edit Customer
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
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
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
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

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
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
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
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

      {/* Main Content Grid */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" } }}>
        {/* Left Column - Contact Info */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            height: "fit-content",
          }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Email</span>
              </Box>
              <p className="text-gray-900 font-medium">{customer.email}</p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Phone</span>
              </Box>
              <p className="text-gray-900 font-medium">{customer.phone}</p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Address</span>
              </Box>
              <p className="text-gray-900 font-medium">{customer.address}</p>
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Created At</span>
              </Box>
              <p className="text-gray-900 font-medium">{formatDate(customer.createdAt)}</p>
            </Box>
          </Box>
        </Paper>

        {/* Right Column - Tabs */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
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
              <CustomerUnitsTab customerId={id!} units={customer.purchasedUnits || []} />
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