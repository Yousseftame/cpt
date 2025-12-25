// src/pages/Tickets/TicketsPage.tsx

import { useNavigate } from "react-router-dom";
import { useTickets } from "../../../hooks/useTickets";

const TicketsPage = () => {
  const role = 'superAdmin'; // جاية من auth context
  const adminId = 'adminId123';
  const navigate = useNavigate();

  const { tickets, loading } = useTickets({ role, adminId });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tickets</h1>

      {tickets.length === 0 && <p>No tickets found</p>}

      <table className="w-full border">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.subject}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.status}</td>
              <td>{ticket.assignedAdminId ?? 'Unassigned'}</td>
              <button
  onClick={() => navigate(`/ticket/${ticket.id}`)}
  className="text-blue-600 underline text-sm"
>
  View Details
</button>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsPage;
