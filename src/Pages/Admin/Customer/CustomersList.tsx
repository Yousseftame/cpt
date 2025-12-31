import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Menu,
  MenuItem,
  InputAdornment,
  Avatar,
  Paper,
  Box,
  
} from "@mui/material";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  X,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Package,
  Ticket as TicketIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
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

export default function CustomersList() {
  const { customers, loading, fetchCustomers, deleteCustomer, updateCustomerStatus } = useCustomer();
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [customerForStatusChange, setCustomerForStatusChange] = useState<any>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredCustomers(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, customers]);

  const handleDelete = async () => {
    if (!customerToDelete) return;
     setLoadingDelete(true);

    try {
      await deleteCustomer(customerToDelete.id);
      setDeleteDialog(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
    finally {
      setLoadingDelete(false);
    }
  };

  const openDeleteDialog = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, customer: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>, customer: any) => {
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget);
    setCustomerForStatusChange(customer);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
    setCustomerForStatusChange(null);
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'pending') => {
    if (!customerForStatusChange) return;

    try {
      await updateCustomerStatus(customerForStatusChange.id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleStatusMenuClose();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statuses = ["active", "inactive", "pending"];

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle2 size={14} />;
      case "inactive":
        return <XCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
      default:
        return <Clock size={14} />;
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

  if (loading && customers.length === 0) {
    return <PagesLoader text="Loading customers..." />;
  }

  return (
    <Box sx={{ maxWidth: 1900, mx: "auto", p: { xs: 2, md: 3 }, bgcolor: colors.lightBg, minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 style={{ color: colors.primary }} className="text-3xl font-bold flex items-center gap-2">
              <Users size={32} />
              Customers
            </h1>
            <p style={{ color: colors.textSecondary }} className="mt-1">Manage your customer database</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate("/customers")}
            sx={{
              bgcolor: colors.primary,
              "&:hover": { bgcolor: colors.primaryLight },
              textTransform: "none",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(94, 53, 177, 0.3)",
            }}
          >
            Add New Customer
          </Button>
        </div>
      </Box>

      {/* Stats Cards */}
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Customers</p>
                <p className="text-3xl font-bold mt-1">{customers.length}</p>
              </div>
              <Users size={40} className="opacity-75" />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active</p>
                <p className="text-3xl font-bold mt-1">
                  {customers.filter((c) => c.status === "active").length}
                </p>
              </div>
              <CheckCircle2 size={40} className="opacity-75" />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Units</p>
                <p className="text-3xl font-bold mt-1">
                  {customers.reduce((sum, c) => sum + (c.purchasedUnits?.length || 0), 0)}
                </p>
              </div>
              <Package size={40} className="opacity-75" />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Tickets</p>
                <p className="text-3xl font-bold mt-1">
                  {customers.reduce((sum, c) => sum + (c.ticketsCount || 0), 0)}
                </p>
              </div>
              <TicketIcon size={40} className="opacity-75" />
            </div>
          </Paper>
        </Box>
      </Box>

      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: colors.cardBg,
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: colors.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: colors.border,
                },
                "&:hover fieldset": {
                  borderColor: colors.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary,
                },
              },
            }}
          />

          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: colors.textSecondary }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <span className="font-bold">{filteredCustomers.length}</span>
          <span>results found</span>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              sx={{ textTransform: "none", ml: 1, color: colors.primary }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Paper>

      {/* Table Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: colors.cardBg,
          overflow: "hidden",
        }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.lavender }}>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Units</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Tickets</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.primary, textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div style={{ color: colors.textSecondary }}>
                      <Search size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-lg">No customers found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const statusStyle = getStatusColor(customer.status);
                  
                  return (
                    <TableRow
                      key={customer.id}
                      sx={{
                        "&:hover": { bgcolor: colors.lavender },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            sx={{
                              bgcolor: colors.primary,
                              width: 40,
                              height: 40,
                              fontSize: "1rem",
                            }}
                          >
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="font-medium" style={{ color: colors.textPrimary }}>
                              {customer.name}
                            </p>
                            <p className="text-sm flex items-center gap-1" style={{ color: colors.textSecondary }}>
                              <Mail size={14} />
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" style={{ color: colors.textPrimary }}>
                          <Phone size={16} style={{ color: colors.textSecondary }} />
                          <span>{customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" style={{ color: colors.textPrimary }}>
                          <MapPin size={16} style={{ color: colors.textSecondary }} />
                          <span className="max-w-[200px] truncate">{customer.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Package size={14} />}
                          label={customer.purchasedUnits?.length || 0}
                          size="small"
                          sx={{ bgcolor: colors.lavender, color: colors.primary }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<TicketIcon size={14} />}
                          label={customer.ticketsCount || 0}
                          size="small"
                          sx={{ bgcolor: "#E3F2FD", color: colors.secondary }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Chip
                            icon={getStatusIcon(customer.status)}
                            label={customer.status}
                            size="small"
                            onClick={(e) => handleStatusMenuClick(e, customer)}
                            sx={{
                              bgcolor: statusStyle.bgcolor,
                              color: statusStyle.color,
                              fontWeight: 600,
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuClick(e, customer)} size="small">
                          <MoreVertical size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          component="div"
          count={filteredCustomers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedCustomer) navigate(`/customer/${selectedCustomer.id}`);
            handleMenuClose();
          }}
        >
          <Eye size={16} className="mr-2" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCustomer) navigate(`/customer/${selectedCustomer.id}/edit`);
            handleMenuClose();
          }}
        >
          <Edit size={16} className="mr-2" />
          Edit Customer
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCustomer) navigate(`/customer/${selectedCustomer.id}/tickets`);
            handleMenuClose();
          }}
        >
          <TicketIcon size={16} className="mr-2" />
          View Tickets
        </MenuItem>
        <MenuItem
          onClick={() => selectedCustomer && openDeleteDialog(selectedCustomer)}
          sx={{ color: colors.error }}
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </MenuItem>
      </Menu>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem
          onClick={() => handleStatusChange('active')}
          disabled={customerForStatusChange?.status === 'active'}
        >
          <CheckCircle2 size={16} className="mr-2" style={{ color: colors.success }} />
          Active
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('inactive')}
          disabled={customerForStatusChange?.status === 'inactive'}
        >
          <XCircle size={16} className="mr-2" style={{ color: colors.error }} />
          Inactive
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('pending')}
          disabled={customerForStatusChange?.status === 'pending'}
        >
          <Clock size={16} className="mr-2" style={{ color: colors.accent }} />
          Pending
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center gap-3" style={{ color: colors.error }}>
          <AlertTriangle size={24} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <p style={{ color: colors.textPrimary }} className="mb-4">
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
          </p>
          <div style={{ 
            backgroundColor: "#FFEBEE", 
            borderColor: colors.error,
            borderWidth: 1,
            borderStyle: "solid"
          }} className="rounded-lg p-4">
            <p className="text-sm" style={{ color: colors.error }}>
              <strong>Warning:</strong> This action cannot be undone. All customer data including
              purchased units will be permanently deleted.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog(false)} 
            variant="outlined" 
            sx={{ 
              textTransform: "none",
              borderColor: colors.border,
              color: colors.textPrimary,
              
            }}
            disabled ={loadingDelete}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            startIcon={<Trash2 size={16} />}
            sx={{ 
              textTransform: "none",
              bgcolor: colors.error,
              "&:hover": { bgcolor: "#D32F2F" },
              
            }}
            disabled={loadingDelete}
          >
            {loadingDelete ? <Check /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}