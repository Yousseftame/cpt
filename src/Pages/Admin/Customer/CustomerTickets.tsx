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
  AlertTriangle
} from "lucide-react";
import PagesLoader from "../../../components/shared/PagesLoader";

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
        orderBy("createdAt", "desc")   // composite index 
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
        return { bgcolor: "#EEF2FF", color: "#4F46E5", icon: <AlertCircle size={16} /> };
      case "in progress":
        return { bgcolor: "#FEF3C7", color: "#F59E0B", icon: <TrendingUp size={16} /> };
      case "resolved":
        return { bgcolor: "#F6FFED", color: "#6CC464", icon: <CheckCircle2 size={16} /> };
      case "closed":
        return { bgcolor: "#F3F4F6", color: "#6B7280", icon: <CheckCircle2 size={16} /> };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280", icon: <AlertCircle size={16} /> };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { bgcolor: "#FFF1F0", color: "#FF5F5E", icon: <AlertTriangle size={16} /> };
      case "medium":
        return { bgcolor: "#FEF3C7", color: "#F59E0B", icon: <AlertCircle size={16} /> };
      case "low":
        return { bgcolor: "#F0F9FF", color: "#3B82F6", icon: <Clock size={16} /> };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280", icon: <AlertCircle size={16} /> };
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
    const inProgress = tickets.filter(t => t.status?.toLowerCase() === "in progress").length;
    const resolved = tickets.filter(t => t.status?.toLowerCase() === "resolved").length;
    const closed = tickets.filter(t => t.status?.toLowerCase() === "closed").length;

    return { open, inProgress, resolved, closed };
  };

  const stats = getTicketStats();

  if (loading) {
    return (
      <PagesLoader text="Loading tickets..." />

    );
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TicketIcon size={32} className="text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customer Tickets</h1>
            <p className="text-gray-600">View and manage all support tickets</p>
          </div>
        </Box>
      </Box>

      {/* Stats Cards */}
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
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
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
            placeholder="Search tickets by subject or description..."
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
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
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
          <TicketIcon size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
          <p className="text-gray-500">
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
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        <TicketIcon size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {ticket.subject}
                        </h3>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
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
                          <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
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
                        bgcolor: "#4F46E5",
                        "&:hover": { bgcolor: "#4338CA" },
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
            if (selectedTicket) navigate(`/tickets/${selectedTicket.id}`);
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