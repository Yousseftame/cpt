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

// Purple & Blue Color Palette (from Berry dashboard)
const colors = {
  primary: "#5E35B1",      // Deep purple
  primaryLight: "#7E57C2", // Light purple
  secondary: "#1E88E5",    // Bright blue
  secondaryLight: "#42A5F5", // Light blue
  accent: "#FFB74D",       // Warm orange/yellow
  success: "#66BB6A",      // Green
  error: "#EF5350",        // Red
  lightBg: "#F5F5F5",      // Light gray background
  cardBg: "#FFFFFF",       // White
  textPrimary: "#263238",  // Dark text
  textSecondary: "#607D8B", // Gray text
  border: "#E0E0E0",       // Light border
  lavender: "#EDE7F6",     // Very light purple
};

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
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    let filtered = tickets;

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
        return { bgcolor: colors.lavender, color: colors.primary };
      case "in_progress":
        return { bgcolor: "#E3F2FD", color: colors.secondary };
      case "resolved":
        return { bgcolor: "#E8F5E9", color: colors.success };
      case "closed":
        return { bgcolor: "#ECEFF1", color: colors.textSecondary };
      case "reopened":
        return { bgcolor: "#FFF3E0", color: colors.accent };
      default:
        return { bgcolor: "#ECEFF1", color: colors.textSecondary };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { bgcolor: "#FFEBEE", color: colors.error, icon: <AlertTriangle size={14} /> };
      case "medium":
        return { bgcolor: "#FFF3E0", color: colors.accent, icon: <AlertCircle size={14} /> };
      case "low":
        return { bgcolor: "#E3F2FD", color: colors.secondary, icon: <Clock size={14} /> };
      default:
        return { bgcolor: "#ECEFF1", color: colors.textSecondary, icon: <AlertCircle size={14} /> };
    }
  };

  const getStats = () => {
    let statsTickets = tickets;
    
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
      unassigned: tickets.filter((t) => !t.assignedAdminId).length,
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
    <Box sx={{ maxWidth: 1900, mx: "auto", p: { xs: 2, md: 3 }, bgcolor: colors.lightBg, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 style={{ color: colors.primary }} className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare size={32} />
              Support Tickets
            </h1>
            <p style={{ color: colors.textSecondary }} className="mt-1">
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
              borderRadius: 3,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: "white",
              boxShadow: "0 4px 20px rgba(94, 53, 177, 0.3)",
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
              borderRadius: 3,
              background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
              color: "white",
              boxShadow: "0 4px 20px rgba(30, 136, 229, 0.3)",
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
              borderRadius: 3,
              bgcolor: colors.lavender,
              color: colors.primary,
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
              borderRadius: 3,
              bgcolor: "#E3F2FD",
              color: colors.secondary,
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
              borderRadius: 3,
              bgcolor: "#E8F5E9",
              color: colors.success,
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
              borderRadius: 3,
              bgcolor: "#ECEFF1",
              color: colors.textSecondary,
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
              borderRadius: 3,
              bgcolor: "#FFF3E0",
              color: colors.accent,
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
          borderRadius: 3,
          bgcolor: colors.cardBg,
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

          <div className="flex flex-wrap items-center gap-2">
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Tickets</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
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
              sx={{ 
                textTransform: "none", 
                ml: 1,
                color: colors.primary,
              }}
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
            borderRadius: 3,
            bgcolor: colors.cardBg,
          }}
        >
          <MessageSquare size={64} className="mx-auto mb-4" style={{ color: colors.border }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>No tickets found</h3>
          <p style={{ color: colors.textSecondary }}>
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
                  borderRadius: 3,
                  bgcolor: colors.cardBg,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(94, 53, 177, 0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <Avatar
                      sx={{
                        bgcolor: colors.primary,
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
                          <h3 className="text-lg font-semibold mb-1" style={{ color: colors.textPrimary }}>
                            {ticket.subject}
                          </h3>
                          <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {ticket.customerName || "Unknown Customer"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(ticket.createdAt)}
                            </span>
                            <span style={{ color: colors.border }}>#{ticket.id.slice(0, 8)}</span>
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
                            sx={{ bgcolor: "#E3F2FD", color: colors.secondary, fontWeight: 600 }}
                          />
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            sx={{ bgcolor: "#FFEBEE", color: colors.error, fontWeight: 600 }}
                          />
                        )}
                        {ticket?.messages?.length > 0 && (
                          <Chip
                            icon={<MessageSquare size={14} />}
                            label={`${ticket.messages.length} Message${ticket.messages.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{ bgcolor: "#E8F5E9", color: colors.success, fontWeight: 600 }}
                          />
                        )}
                        {ticket?.internalNotes?.length > 0 && (
                          <Chip
                            icon={<FileText size={14} />}
                            label={`${ticket.internalNotes.length} Note${ticket.internalNotes.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{ bgcolor: "#FFF3E0", color: colors.accent, fontWeight: 600 }}
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
                        bgcolor: colors.primary,
                        "&:hover": { bgcolor: colors.primaryLight },
                        px: 3,
                        py : 1,
                        boxShadow: "0 2px 8px rgba(94, 53, 177, 0.3)",
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