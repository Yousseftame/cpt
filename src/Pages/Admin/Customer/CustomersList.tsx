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
  Avatar
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../../store/MasterContext/CustomerContext";
import PagesLoader from "../../../components/shared/PagesLoader";

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

    try {
      await deleteCustomer(customerToDelete.id);
      setDeleteDialog(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
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
        return <Clock size={14} />; // Default icon instead of null
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bgcolor: "#F6FFED", color: "#6CC464" };
      case "inactive":
        return { bgcolor: "#FFF1F0", color: "#FF5F5E" };
      case "pending":
        return { bgcolor: "#FEF3C7", color: "#F59E0B" };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
    }
  };

  if (loading && customers.length === 0) {
    return (
      <PagesLoader text="Loading customers..." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4F46E5]">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate("/customers")}
          sx={{
            bgcolor: "#4F46E5",
            "&:hover": { bgcolor: "#4338CA" },
            textTransform: "none",
            px: 3,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Add New Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-90">Total Customers</p>
          <p className="text-3xl font-bold mt-2">{customers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-2">
            {customers.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-90">Total Units</p>
          <p className="text-3xl font-bold mt-2">
            {customers.reduce((sum, c) => sum + (c.purchasedUnits?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-90">Total Tickets</p>
          <p className="text-3xl font-bold mt-2">
            {customers.reduce((sum, c) => sum + (c.ticketsCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} className="text-gray-400" />
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
          />

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold">{filteredCustomers.length}</span>
          <span>results found</span>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              sx={{ textTransform: "none", ml: 1 }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Units</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Tickets</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="text-gray-400">
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
                        "&:hover": { bgcolor: "#F9FAFB" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            sx={{
                              bgcolor: "#4F46E5",
                              width: 40,
                              height: 40,
                              fontSize: "1rem",
                            }}
                          >
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-800">{customer.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={14} />
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Phone size={16} className="text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="max-w-[200px] truncate">{customer.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Package size={14} />}
                          label={customer.purchasedUnits?.length || 0}
                          size="small"
                          sx={{ bgcolor: "#EEF2FF", color: "#4F46E5" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<TicketIcon size={14} />}
                          label={customer.ticketsCount || 0}
                          size="small"
                          sx={{ bgcolor: "#FFF1F0", color: "#FF5F5E" }}
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
      </div>

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
          sx={{ color: "#DC2626" }}
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
          <CheckCircle2 size={16} className="mr-2 text-green-600" />
          Active
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('inactive')}
          disabled={customerForStatusChange?.status === 'inactive'}
        >
          <XCircle size={16} className="mr-2 text-red-600" />
          Inactive
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('pending')}
          disabled={customerForStatusChange?.status === 'pending'}
        >
          <Clock size={16} className="mr-2 text-yellow-600" />
          Pending
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All customer data including
              purchased units will be permanently deleted.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)} variant="outlined" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Trash2 size={16} />}
            sx={{ textTransform: "none" }}
          >
            Delete Customer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}