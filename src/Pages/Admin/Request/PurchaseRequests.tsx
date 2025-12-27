import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../service/firebase";
import {
  Button,
  Chip,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Avatar,
} from "@mui/material";
import {
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Package,
  Phone,
  Calendar,
  User,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PagesLoader from "../../../components/shared/PagesLoader";

interface PurchaseRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  modelId: string;
  requestedUnits: number;
  status: "new" | "in_review" | "contacted" | "approved" | "rejected" | "completed";
  createdAt: any;
  assignedUnits?: any[];
  internalNotes?: any[];
}

export default function PurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "purchaseRequests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PurchaseRequest[];
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch purchase requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.customerPhone.includes(searchTerm) ||
          req.modelId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const docRef = doc(db, "purchaseRequests", requestId);
      await updateDoc(docRef, {
        status: newStatus,
        [`${newStatus}At`]: new Date().toISOString(),
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle size={16} />;
      case "in_review":
        return <Clock size={16} />;
      case "contacted":
        return <Phone size={16} />;
      case "approved":
        return <CheckCircle2 size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      case "completed":
        return <Package size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return { bgcolor: "#EEF2FF", color: "#4F46E5" };
      case "in_review":
        return { bgcolor: "#FEF3C7", color: "#F59E0B" };
      case "contacted":
        return { bgcolor: "#F0F9FF", color: "#3B82F6" };
      case "approved":
        return { bgcolor: "#F6FFED", color: "#6CC464" };
      case "rejected":
        return { bgcolor: "#FFF1F0", color: "#FF5F5E" };
      case "completed":
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getStats = () => {
    return {
      total: requests.length,
      new: requests.filter((r) => r.status === "new").length,
      in_review: requests.filter((r) => r.status === "in_review").length,
      contacted: requests.filter((r) => r.status === "contacted").length,
      approved: requests.filter((r) => r.status === "approved").length,
      completed: requests.filter((r) => r.status === "completed").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  };

  const stats = getStats();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return <PagesLoader text="Loading purchase requests..." />;
  }

  return (
    <Box sx={{ maxWidth: 2100, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#4F46E5]">Purchase Requests</h1>
            <p className="text-gray-600 mt-1">Manage customer purchase requests and orders</p>
          </div>
        </div>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(6, 1fr)" },
          mb: 4,
        }}
      >
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">New Requests</p>
              <p className="text-3xl font-bold mt-1">{stats.new}</p>
            </div>
            <AlertCircle size={40} className="opacity-75" />
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">In Review</p>
              <p className="text-3xl font-bold mt-1">{stats.in_review}</p>
            </div>
            <Clock size={40} className="opacity-75" />
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Contacted</p>
              <p className="text-3xl font-bold mt-1">{stats.contacted}</p>
            </div>
            <Phone size={40} className="opacity-75" />
          </div>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Approved</p>
              <p className="text-3xl font-bold mt-1">{stats.approved}</p>
            </div>
            <CheckCircle2 size={40} className="opacity-75" />
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completed}</p>
            </div>
            <Package size={40} className="opacity-75" />
          </div>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
            color: "white",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Rejected</p>
              <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
            </div>
            <XCircle size={40} className="opacity-75" />
          </div>
        </Paper>
      </Box>

      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 3,
        }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <TextField
            placeholder="Search by customer name, phone, or model..."
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
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="contacted">Contacted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold">{filteredRequests.length}</span>
          <span>requests found</span>
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
      </Paper>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
          }}
        >
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No purchase requests have been submitted yet"}
          </p>
        </Paper>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const statusStyle = getStatusColor(request.status);

            return (
              <Paper
                key={request.id}
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    borderColor: "#4F46E5",
                  },
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        bgcolor: "#4F46E5",
                        width: 48,
                        height: 48,
                        fontSize: "1.2rem",
                      }}
                    >
                      {request.customerName.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <User size={18} className="text-gray-500" />
                            {request.customerName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {request.customerPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center mt-3">
                        <Chip
                          icon={<Package size={14} />}
                          label={`${request.requestedUnits} Unit${request.requestedUnits > 1 ? "s" : ""}`}
                          size="small"
                          sx={{ bgcolor: "#F0F9FF", color: "#3B82F6", fontWeight: 600 }}
                        />
                        <Chip
                          label={`Model: ${request.modelId}`}
                          size="small"
                          sx={{ bgcolor: "#FEF3C7", color: "#F59E0B", fontWeight: 600 }}
                        />
                        {request.assignedUnits && request.assignedUnits.length > 0 && (
                          <Chip
                            icon={<CheckCircle2 size={14} />}
                            label={`${request.assignedUnits.length} Assigned`}
                            size="small"
                            sx={{ bgcolor: "#F6FFED", color: "#6CC464", fontWeight: 600 }}
                          />
                        )}
                        {request.internalNotes && request.internalNotes.length > 0 && (
                          <Chip
                            icon={<MessageSquare size={14} />}
                            label={`${request.internalNotes.length} Note${request.internalNotes.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{ bgcolor: "#FFF1F0", color: "#FF5F5E", fontWeight: 600 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 items-start ml-4">
                    {/* Status Dropdown */}
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        sx={{
                          bgcolor: statusStyle.bgcolor,
                          color: statusStyle.color,
                          fontWeight: 600,
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          borderRadius: 2,
                        }}
                        IconComponent={ChevronDown}
                      >
                        <MenuItem value="new">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} />
                            New
                          </div>
                        </MenuItem>
                        <MenuItem value="in_review">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            In Review
                          </div>
                        </MenuItem>
                        <MenuItem value="contacted">
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            Contacted
                          </div>
                        </MenuItem>
                        <MenuItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Approved
                          </div>
                        </MenuItem>
                        <MenuItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle size={16} />
                            Rejected
                          </div>
                        </MenuItem>
                        <MenuItem value="completed">
                          <div className="flex items-center gap-2">
                            <Package size={16} />
                            Completed
                          </div>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* View Details Button */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/requests/${request.id}`)}
                      sx={{
                        textTransform: "none",
                        bgcolor: "#4F46E5",
                        "&:hover": { bgcolor: "#4338CA" },
                        px: 3,
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Paper>
            );
          })}
        </div>
      )}
    </Box>
  );
}