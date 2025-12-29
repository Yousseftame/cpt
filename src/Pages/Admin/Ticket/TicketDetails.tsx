import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  TextField,
  Chip,
  Box,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ArrowLeft,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Send,
  Paperclip,
 
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { collection, getDocs } from "firebase/firestore";
import { useTicket } from "../../../store/MasterContext/TicketContext";
import { useAuth } from "../../../store/AuthContext/AuthContext";
import PagesLoader from "../../../components/shared/PagesLoader";
import { db } from "../../../service/firebase";

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

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getTicketById,
    addMessage,
    addInternalNote,
    removeInternalNote,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority,
    reopenTicket,
    closeTicket,
  } = useTicket();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteDialog, setNoteDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [priorityDialog, setPriorityDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminName, setAdminName] = useState("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Get user role and admin name from localStorage or context
    const role = localStorage.getItem("userRole") || "";
    const name = localStorage.getItem("userName") || user?.email || "Admin";
    setUserRole(role);
    setAdminName(name);
  }, [user]);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const ticketData = await getTicketById(id);
        if (ticketData) {
          setTicket(ticketData);
          setSelectedAdmin(ticketData.assignedAdminId || "");
          setNewStatus(ticketData.status);
          setNewPriority(ticketData.priority);
        } else {
          toast.error("Ticket not found");
          navigate("/ticket");
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, getTicketById, navigate]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "admins"));
        const adminsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().email,
        }));
        setAdmins(adminsList);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const refreshTicket = async () => {
    if (!id) return;
    const ticketData = await getTicketById(id);
    if (ticketData) {
      setTicket(ticketData);
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
        return { bgcolor: "#FFF1F0", color: "#DC2626" };
      case "medium":
        return { bgcolor: "#FEF3C7", color: "#F59E0B" };
      case "low":
        return { bgcolor: "#F0F9FF", color: "#3B82F6" };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !user) return;

    try {
      await addMessage(id, {
        message: newMessage,
        senderId: user.uid,
        senderType: "admin",
        senderName: adminName,
        attachments: [],
      });
      setNewMessage("");
      await refreshTicket();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id || !user) return;

    try {
      await addInternalNote(id, {
        note: newNote,
        createdBy: user.uid,
        createdByName: adminName,
      });
      setNewNote("");
      setNoteDialog(false);
      await refreshTicket();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (noteIndex: number) => {
    if (!id) return;

    try {
      await removeInternalNote(id, noteIndex);
      await refreshTicket();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedAdmin || !id) return;

    try {
      const admin = admins.find((a) => a.id === selectedAdmin);
      await assignTicket(id, selectedAdmin, admin?.name || "Admin");
      setAssignDialog(false);
      await refreshTicket();
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };

  const handleStatusChange = async () => {
    if (!id) return;

    try {
      await updateTicketStatus(id, newStatus as any);
      setStatusDialog(false);
      await refreshTicket();
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const handlePriorityChange = async () => {
    if (!id) return;

    try {
      await updateTicketPriority(id, newPriority as any);
      setPriorityDialog(false);
      await refreshTicket();
    } catch (error) {
      console.error("Error changing priority:", error);
    }
  };

  const handleReopen = async () => {
    if (!id) return;

    try {
      await reopenTicket(id);
      await refreshTicket();
    } catch (error) {
      console.error("Error reopening ticket:", error);
    }
  };

  const handleClose = async () => {
    if (!id) return;

    try {
      await closeTicket(id);
      await refreshTicket();
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  if (loading) {
    return <PagesLoader text="Loading ticket details..." />;
  }

  if (!ticket) {
    return null;
  }

  const statusStyle = getStatusColor(ticket.status);
  const priorityStyle = getPriorityColor(ticket.priority);
  const isSuperAdmin = userRole === "superAdmin";

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/ticket")}
          sx={{
            textTransform: "none",
            mb: 2,
            borderRadius: 2,
          }}
        >
          Back to Tickets
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                label={ticket.status.replace("_", " ").toUpperCase()}
                size="small"
                sx={{ ...statusStyle, fontWeight: 600 }}
              />
              <Chip
                label={`${ticket.priority.toUpperCase()} Priority`}
                size="small"
                sx={{ ...priorityStyle, fontWeight: 600, cursor: "pointer" }}
                onClick={() => setPriorityDialog(true)}
              />
              <Chip
                label={`#${ticket.id.slice(0, 8)}`}
                size="small"
                sx={{ color: colors.textSecondary, fontWeight: 600 }}
              />
             
            </div>
          </Box>

          <div className="flex gap-2 flex-wrap">
            {isSuperAdmin && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAssignDialog(true)}
                sx={{ textTransform: "none" }}
              >
                {ticket.assignedAdminId ? "Reassign" : "Assign"}
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setStatusDialog(true)}
              sx={{ textTransform: "none" }}
            >
              Change Status
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPriorityDialog(true)}
              sx={{ textTransform: "none" }}
            >
              Change Priority
            </Button>
            {ticket.status === "closed" ? (
              <Button
                variant="contained"
                size="small"
                onClick={handleReopen}
                sx={{
                  textTransform: "none",
                  bgcolor: "#4F46E5",
                  "&:hover": { bgcolor: "#4338CA" },
                }}
              >
                Reopen Ticket
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={handleClose}
                sx={{
                  textTransform: "none",
                  bgcolor: "#DC2626",
                  "&:hover": { bgcolor: "#B91C1C" },
                }}
              >
                Close Ticket
              </Button>
            )}
          </div>
        </Box>
      </Box>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chat & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Section */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
            }}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare size={24} className="text-indigo-600" />
                Conversation
              </h2>
            </Box>

            <Box sx={{ p: 3, maxHeight: "500px", overflowY: "auto" }}>
              <div className="space-y-4">
                {(ticket.messages || []).map((msg: any, index: number) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${msg.senderType === "admin" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar
                      sx={{
                        bgcolor: msg.senderType === "admin" ? "#4F46E5" : "#10B981",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {msg.senderName?.charAt(0) || "?"}
                    </Avatar>
                    <div className={`flex-1 ${msg.senderType === "admin" ? "text-right" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{msg.senderName || "Unknown"}</span>
                        <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                      </div>
                      <div
                        className={`inline-block p-3 rounded-2xl ${
                          msg.senderType === "admin"
                            ? "bg-indigo-500 text-white rounded-tr-none"
                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Box>

            <Box sx={{ p: 3, borderTop: "1px solid", borderColor: "grey.200" }}>
              <div className="flex gap-2">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={ticket.status === "closed"}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <div className="flex flex-col gap-2">
                  <IconButton
                    sx={{
                      bgcolor: "#F3F4F6",
                      "&:hover": { bgcolor: "#E5E7EB" },
                    }}
                    disabled={ticket.status === "closed"}
                  >
                    <Paperclip size={20} />
                  </IconButton>
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || ticket.status === "closed"}
                    sx={{
                      bgcolor: "#4F46E5",
                      "&:hover": { bgcolor: "#4338CA" },
                      minWidth: "auto",
                      px: 2,
                    }}
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </div>
              {ticket.status === "closed" && (
                <p className="text-sm text-gray-500 mt-2">
                  This ticket is closed. Reopen it to send messages.
                </p>
              )}
            </Box>
          </Paper>

          {/* Internal Notes */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid",
                borderColor: "grey.200",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={24} className="text-indigo-600" />
                Internal Notes
              </h2>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setNoteDialog(true)}
                sx={{ textTransform: "none" }}
              >
                Add Note
              </Button>
            </Box>

            <Box sx={{ p: 3 }}>
              {(ticket.internalNotes || []).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No internal notes yet</p>
              ) : (
                <div className="space-y-3">
                  {(ticket.internalNotes || []).map((note: any, index: number) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#F59E0B" }}>
                            {note.createdByName?.charAt(0) || "?"}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{note.createdByName || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                          </div>
                        </div>
                        <IconButton size="small" sx={{ color: "#DC2626" }} onClick={() => handleDeleteNote(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                      <p className="text-sm text-gray-700">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          </Paper>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Ticket Information */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
            }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Information</h2>
            <Divider sx={{ mb: 3 }} />

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(ticket.createdAt)}
                </p>
              </div>

              {ticket.assignedAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(ticket.assignedAt)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <User size={14} />
                  {ticket.assignedAdminName || "Unassigned"}
                </p>
              </div>
            </div>
          </Paper>

          {/* Customer Information */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
            }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
            <Divider sx={{ mb: 3 }} />

            <div className="flex items-center gap-3 mb-4">
              <Avatar
                sx={{
                  bgcolor: "#4F46E5",
                  width: 56,
                  height: 56,
                  fontSize: "1.5rem",
                }}
              >
                {ticket.customerName?.charAt(0) || "?"}
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800">{ticket.customerName || "Unknown"}</p>
                <p className="text-sm text-gray-500">Customer ID: {ticket.customerId.slice(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{ticket.customerEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-800">{ticket.customerPhone || "N/A"}</p>
              </div>
            </div>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/customer/${ticket.customerId}`)}
              sx={{ textTransform: "none", mt: 3 }}
            >
              View Customer Profile
            </Button>
          </Paper>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Internal Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setNoteDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={!newNote.trim()}
            sx={{
              textTransform: "none",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {isSuperAdmin && (
        <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Admin</InputLabel>
              <Select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                label="Select Admin"
              >
                {admins.map((admin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAssignDialog(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignTicket}
              variant="contained"
              disabled={!selectedAdmin}
              sx={{
                textTransform: "none",
                bgcolor: "#4F46E5",
                "&:hover": { bgcolor: "#4338CA" },
              }}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Ticket Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Select Status">
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="reopened">Reopened</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStatusDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={priorityDialog} onClose={() => setPriorityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Ticket Priority</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Priority</InputLabel>
            <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} label="Select Priority">
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPriorityDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handlePriorityChange}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Update Priority
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}