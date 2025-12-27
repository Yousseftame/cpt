import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  FormControl,
  Avatar,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Filter,
  X,
  Eye,
  User,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTicket } from "../../../store/MasterContext/TicketContext";
import { useAuth } from "../../../store/AuthContext/AuthContext";
import PagesLoader from "../../../components/shared/PagesLoader";

export default function TicketList() {
  const { tickets, loading, fetchTickets, updateTicketStatus } = useTicket();
  const { user } = useAuth();
  const [filteredTickets, setFilteredTickets] = useState(tickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [userRole, setUserRole] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from localStorage or context
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    let filtered = tickets;

    // If user is admin (not superAdmin), show only assigned tickets
    if (userRole === "admin" && user?.uid) {
      filtered = filtered.filter((ticket) => ticket.assignedAdminId === user.uid);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }

    if (assignmentFilter === "assigned") {
      filtered = filtered.filter((ticket) => ticket.assignedAdminId);
    } else if (assignmentFilter === "unassigned") {
      filtered = filtered.filter((ticket) => !ticket.assignedAdminId);
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, priorityFilter, assignmentFilter, tickets, userRole, user?.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle size={16} />;
      case "in_progress":
        return <TrendingUp size={16} />;
      case "resolved":
        return <CheckCircle2 size={16} />;
      case "closed":
        return <CheckCircle2 size={16} />;
      case "reopened":
        return <RefreshCw size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return { bgcolor: "#EEF2FF", color: "#4F46E5" };
      case "in_progress":
        return { bgcolor: "#FEF3C7", color: "#F59E0B" };
      case "resolved":
        return { bgcolor: "#F6FFED", color: "#6CC464" };
      case "closed":
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
      case "reopened":
        return { bgcolor: "#FFF1F0", color: "#FF5F5E" };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { bgcolor: "#FFF1F0", color: "#DC2626", icon: <AlertTriangle size={14} /> };
      case "medium":
        return { bgcolor: "#FEF3C7", color: "#F59E0B", icon: <AlertCircle size={14} /> };
      case "low":
        return { bgcolor: "#F0F9FF", color: "#3B82F6", icon: <Clock size={14} /> };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280", icon: <AlertCircle size={14} /> };
    }
  };

  const getStats = () => {
    let statsTickets = tickets;
    
    // If admin, only count their assigned tickets
    if (userRole === "admin" && user?.uid) {
      statsTickets = tickets.filter((t) => t.assignedAdminId === user.uid);
    }

    return {
      total: statsTickets.length,
      open: statsTickets.filter((t) => t.status === "open").length,
      in_progress: statsTickets.filter((t) => t.status === "in_progress").length,
      resolved: statsTickets.filter((t) => t.status === "resolved").length,
      closed: statsTickets.filter((t) => t.status === "closed").length,
      reopened: statsTickets.filter((t) => t.status === "reopened").length,
      unassigned: tickets.filter((t) => !t.assignedAdminId).length, // Always show total unassigned
    };
  };

  const stats = getStats();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus as any);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading && tickets.length === 0) {
    return <PagesLoader text="Loading tickets..." />;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#4F46E5] flex items-center gap-2">
              <MessageSquare size={32} />
              Support Tickets
            </h1>
            <p className="text-gray-600 mt-1">
              {userRole === "admin" 
                ? "Manage your assigned support tickets" 
                : "Manage customer support requests and issues"}
            </p>
          </div>
        </div>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        {/* First Row - Total and Unassigned */}
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
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Tickets</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageSquare size={40} className="opacity-75" />
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
                <p className="text-sm opacity-90">Unassigned</p>
                <p className="text-3xl font-bold mt-1">{stats.unassigned}</p>
              </div>
              <User size={40} className="opacity-75" />
            </div>
          </Paper>
        </Box>

        {/* Second Row - Status Cards */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { 
              xs: "1fr", 
              sm: "repeat(2, 1fr)", 
              md: "repeat(3, 1fr)", 
              lg: "repeat(5, 1fr)" 
            },
          }}
        >
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
                <p className="text-sm opacity-90">Open</p>
                <p className="text-3xl font-bold mt-1">{stats.open}</p>
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
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">In Progress</p>
                <p className="text-3xl font-bold mt-1">{stats.in_progress}</p>
              </div>
              <TrendingUp size={40} className="opacity-75" />
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
                <p className="text-sm opacity-90">Resolved</p>
                <p className="text-3xl font-bold mt-1">{stats.resolved}</p>
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
                <p className="text-sm opacity-90">Closed</p>
                <p className="text-3xl font-bold mt-1">{stats.closed}</p>
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
              background: "linear-gradient(135deg, #FF8C00 0%, #FF6347 100%)",
              color: "white",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Reopened</p>
                <p className="text-3xl font-bold mt-1">{stats.reopened}</p>
              </div>
              <RefreshCw size={40} className="opacity-75" />
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
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 3,
        }}
      >
        <div className="flex flex-col gap-3">
          <TextField
            placeholder="Search by ticket ID, subject, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
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

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {userRole === "superAdmin" && (
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Tickets</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold">{filteredTickets.length}</span>
          <span>tickets found</span>
          {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assignmentFilter !== "all") && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setAssignmentFilter("all");
              }}
              sx={{ textTransform: "none", ml: 1 }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Paper>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
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
          <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assignmentFilter !== "all"
              ? "Try adjusting your filters"
              : userRole === "admin"
              ? "No tickets have been assigned to you yet"
              : "No support tickets have been created yet"}
          </p>
        </Paper>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const statusStyle = getStatusColor(ticket.status);
            const priorityStyle = getPriorityColor(ticket.priority);

            return (
              <Paper
                key={ticket.id}
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
                    <Avatar
                      sx={{
                        bgcolor: "#4F46E5",
                        width: 48,
                        height: 48,
                        fontSize: "1.2rem",
                      }}
                    >
                      {ticket.customerName?.charAt(0).toUpperCase() || "?"}
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{ticket.subject}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {ticket.customerName || "Unknown Customer"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(ticket.createdAt)}
                            </span>
                            <span className="text-gray-400">#{ticket.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center mt-3">
                        <Chip
                          icon={priorityStyle.icon}
                          label={`${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority`}
                          size="small"
                          sx={{
                            bgcolor: priorityStyle.bgcolor,
                            color: priorityStyle.color,
                            fontWeight: 600,
                          }}
                        />
                        {ticket.assignedAdminName ? (
                          <Chip
                            icon={<User size={14} />}
                            label={`Assigned to: ${ticket.assignedAdminName}`}
                            size="small"
                            sx={{ bgcolor: "#F0F9FF", color: "#3B82F6", fontWeight: 600 }}
                          />
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            sx={{ bgcolor: "#FFF1F0", color: "#FF5F5E", fontWeight: 600 }}
                          />
                        )}
                        {ticket?.messages?.length > 0 && (
                          <Chip
                            icon={<MessageSquare size={14} />}
                            label={`${ticket.messages.length} Message${ticket.messages.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{ bgcolor: "#F6FFED", color: "#6CC464", fontWeight: 600 }}
                          />
                        )}
                        {ticket?.internalNotes?.length > 0 && (
                          <Chip
                            icon={<FileText size={14} />}
                            label={`${ticket.internalNotes.length} Note${ticket.internalNotes.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{ bgcolor: "#FEF3C7", color: "#F59E0B", fontWeight: 600 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start ml-4">
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
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
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                        <MenuItem value="reopened">Reopened</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
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