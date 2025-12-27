import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { Button, Chip, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Ticket, Clock, AlertCircle } from "lucide-react";
import PagesLoader from "../../../components/shared/PagesLoader";

interface CustomerTicketsTabProps {
  customerId: string;
}

interface TicketData {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  createdAt: any;
}

export default function CustomerTicketsTab({ customerId }: CustomerTicketsTabProps) {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [customerId]);

  const fetchTickets = async () => {
    try {
      const q = query(collection(db, "tickets"), where("customerId", "==", customerId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TicketData[];
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return { bgcolor: "#EEF2FF", color: "#4F46E5" };
      case "in progress":
        return { bgcolor: "#FEF3C7", color: "#F59E0B" };
      case "resolved":
        return { bgcolor: "#F6FFED", color: "#6CC464" };
      case "closed":
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
      default:
        return { bgcolor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { bgcolor: "#FFF1F0", color: "#FF5F5E" };
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
      return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <PagesLoader text="Loading tickets..." />
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Ticket size={48} className="mx-auto mb-2 opacity-50" />
        <p className="text-lg">No tickets found</p>
        <p className="text-sm">This customer hasn't created any support tickets yet</p>
      </div>
    );
  }

  return (
    <Box>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Support Tickets</h3>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-gray-400" />
                  {ticket.subject}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label={ticket.status}
                    size="small"
                    sx={getStatusColor(ticket.status)}
                  />
                  {ticket.priority && (
                    <Chip
                      label={`${ticket.priority} Priority`}
                      size="small"
                      sx={getPriorityColor(ticket.priority)}
                    />
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>
              {/* <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                sx={{
                  textTransform: "none",
                  ml: 2,
                }}
              >
                View
              </Button> */}
            </div>
          </div>
        ))}
      </div>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="text"
          onClick={() => navigate(`/customer/${customerId}/tickets`)}
          sx={{ textTransform: "none" }}
        >
          View All Tickets →
        </Button>
      </Box>
    </Box>
  );
}