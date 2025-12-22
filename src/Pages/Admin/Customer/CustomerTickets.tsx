import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../../service/firebase";
import { Button } from "@mui/material";

const CustomerTickets = () => {
  const { id } = useParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

      const navigate = useNavigate();


console.log("customer ID param:", id);

    //    we use query to fetch tickets by customerId and filter first 
  const fetchTickets = async () => {
    const q = query(
      collection(db, "tickets"),
      where("customerId", "==", id)
    );

    const snapshot = await getDocs(q);

    setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [id]);
  
  if (loading) return <p>Loading...</p>;

  if (tickets.length === 0)
    return <p className="text-center mt-10">No tickets found</p>

  return (
  <div className="p-8">
    <h2 className="text-2xl font-semibold mb-6">Customer Tickets</h2>

    {tickets.map(ticket => (
      <div key={ticket.id} className="border p-4 rounded mb-3">
        <p><strong>Subject:</strong> {ticket.subject}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Date:</strong>{ticket.createdAt?.toDate().toLocaleString()}</p>

        <Button
          variant="outlined"
          className="mt-2"
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
          View Ticket
        </Button>
      </div>
    ))}
  </div>
);
};
export default CustomerTickets;




