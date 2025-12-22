import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { Button, Chip } from "@mui/material";

const PurchaseRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const q = query(
      collection(db, "purchaseRequests"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    setRequests(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (requests.length === 0)
    return <p className="text-center mt-10">No purchase requests found</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Purchase Requests</h2>

      <div className="grid grid-cols-6 font-semibold py-2 border-b">
        <span>Customer</span>
        <span>Phone</span>
        <span>Model</span>
        <span>Units</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {requests.map(req => (
        <div
          key={req.id}
          className="grid grid-cols-6 py-3 border-b items-center"
        >
          <span>{req.customerName}</span>
          <span>{req.customerPhone}</span>
          <span>{req.modelId}</span>
          <span>{req.requestedUnits}</span>

          <Chip
            label={req.status}
            color={
              req.status === "approved"
                ? "success"
                : req.status === "rejected"
                ? "error"
                : req.status === "completed"
                ? "info"
                : "warning"
            }
          />

          <Button
            variant="outlined"
            onClick={() => {
              window.location.href = `/requests/${req.id}`;
            }}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PurchaseRequests;
