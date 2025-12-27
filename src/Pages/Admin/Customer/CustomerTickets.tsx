import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  ArrowLeft,
  Ticket as TicketIcon,
  AlertCircle,
  Clock,
  Filter,
  Search,
  X,
  MoreVertical,
  Eye,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
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

interface TicketData {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  createdAt: any;
  description?: string;
}

const CustomerTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  const fetchTickets = async () => {
    try {
      const q = query(
        collection(db, "tickets"),
        where("customerId", "==", id),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as TicketData[];
      
      setTickets(data);
      setFilteredTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [id]);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => 
        ticket.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => 
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, ticket: TicketData) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return { bgcolor: colors.lavender, color: colors.primary, icon: <AlertCircle size={16} /> };
      case "in progress":
      case "in_progress":
        return { bgcolor: "#E3F2FD", color: colors.secondary, icon: <TrendingUp size={16} /> };
      case "resolved":
        return { bgcolor: "#E8F5E9", color: colors.success, icon: <CheckCircle2 size={16} /> };
      case "closed":
        return { bgcolor: "#ECEFF1", color: colors.textSecondary, icon: <CheckCircle2 size={16} /> };
      case "reopened":
        return { bgcolor: "#FFF3E0", color: colors.accent, icon: <RefreshCw size={16} /> };
      default:
        return { bgcolor: "#ECEFF1", color: colors.textSecondary, icon: <AlertCircle size={16} /> };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { bgcolor: "#FFEBEE", color: colors.error, icon: <AlertTriangle size={16} /> };
      case "medium":
        return { bgcolor: "#FFF3E0", color: colors.accent, icon: <AlertCircle size={16} /> };
      case "low":
        return { bgcolor: "#E3F2FD", color: colors.secondary, icon: <Clock size={16} /> };
      default:
        return { bgcolor: "#ECEFF1", color: colors.textSecondary, icon: <AlertCircle size={16} /> };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp.toDate());
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

  const getTicketStats = () => {
    const open = tickets.filter(t => t.status?.toLowerCase() === "open").length;
    const inProgress = tickets.filter(t => t.status?.toLowerCase() === "in progress" || t.status?.toLowerCase() === "in_progress").length;
    const resolved = tickets.filter(t => t.status?.toLowerCase() === "resolved").length;
    const closed = tickets.filter(t => t.status?.toLowerCase() === "closed").length;

    return { open, inProgress, resolved, closed };
  };

  const stats = getTicketStats();

  if (loading) {
    return <PagesLoader text="Loading tickets..." />;
  }

  return (
    <Box sx={{ maxWidth: 1900, mx: "auto", p: { xs: 2, md: 3 }, bgcolor: colors.lightBg, minHeight: "100vh" }}>
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MessageSquare size={32} style={{ color: colors.primary }} />
          <div>
            <h1 style={{ color: colors.primary }} className="text-3xl font-bold">
              Customer Tickets
            </h1>
            <p style={{ color: colors.textSecondary }}>View and manage all support tickets</p>
          </div>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
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
              background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
              color: "white",
              boxShadow: "0 4px 20px rgba(30, 136, 229, 0.3)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">In Progress</p>
                <p className="text-3xl font-bold mt-1">{stats.inProgress}</p>
              </div>
              <TrendingUp size={40} className="opacity-75" />
            </div>
          </Paper>
        </Box>

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
        <div className="flex flex-col md:flex-row gap-3">
          <TextField
            placeholder="Search tickets by subject or description..."
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
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <span className="font-bold">{filteredTickets.length}</span>
          <span>tickets found</span>
          {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              sx={{ textTransform: "none", ml: 1, color: colors.primary }}
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
          <TicketIcon size={64} className="mx-auto mb-4" style={{ color: colors.border }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No tickets found
          </h3>
          <p style={{ color: colors.textSecondary }}>
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters"
              : "This customer hasn't created any support tickets yet"}
          </p>
        </Paper>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const statusStyle = getStatusColor(ticket.status);
            const priorityStyle = getPriorityColor(ticket.priority || "");

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
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        <TicketIcon size={20} style={{ color: colors.primary }} />
                      </div>
                      <div className="flex-1">
                        <h3 style={{ color: colors.textPrimary }} className="text-lg font-semibold mb-2">
                          {ticket.subject}
                        </h3>
                        {ticket.description && (
                          <p style={{ color: colors.textSecondary }} className="text-sm line-clamp-2 mb-3">
                            {ticket.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 items-center">
                          <Chip
                            icon={statusStyle.icon}
                            label={ticket.status}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bgcolor,
                              color: statusStyle.color,
                              fontWeight: 600,
                            }}
                          />
                          {ticket.priority && (
                            <Chip
                              icon={priorityStyle.icon}
                              label={`${ticket.priority} Priority`}
                              size="small"
                              sx={{
                                bgcolor: priorityStyle.bgcolor,
                                color: priorityStyle.color,
                                fontWeight: 600,
                              }}
                            />
                          )}
                          <div className="flex items-center gap-1 text-xs ml-2" style={{ color: colors.textSecondary }}>
                            <Clock size={14} />
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      sx={{
                        textTransform: "none",
                        bgcolor: colors.primary,
                        "&:hover": { bgcolor: colors.primaryLight },
                        boxShadow: "0 2px 8px rgba(94, 53, 177, 0.3)",
                      }}
                    >
                      View Details
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, ticket)}
                    >
                      <MoreVertical size={20} />
                    </IconButton>
                  </div>
                </div>
              </Paper>
            );
          })}
        </div>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedTicket) navigate(`/ticket/${selectedTicket.id}`);
            handleMenuClose();
          }}
        >
          <Eye size={16} className="mr-2" />
          View Ticket
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomerTickets;