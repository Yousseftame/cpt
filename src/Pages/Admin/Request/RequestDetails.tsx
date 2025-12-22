import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { Button } from "@mui/material";
import AssignUnitsSection from "./AssignUnitsSection";

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);


    // fetch request details
  const fetchRequest = async () => {
    const docRef = doc(db, "purchaseRequests", id!);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      setRequest({ id: snapshot.id, ...snapshot.data() });
    }

    setLoading(false);
  };


  // review action case
  const moveToReview = async () => {
    if (!id) return;

    const docRef = doc(db, "purchaseRequests", id);

    await updateDoc(docRef, {
      status: "in_review",
      inReviewAt: serverTimestamp()
    });

    // refresh request
    fetchRequest();
  };



  // contacted action case
  const markAsContacted = async () => {
  if (!id) return;

  const docRef = doc(db, "purchaseRequests", id);

  await updateDoc(docRef, {
    status: "contacted",
    contactedAt: serverTimestamp(),
    contactMethod: "phone" // لاحقاً ممكن نخليها اختيار
  });

  fetchRequest();
};

 
  // approve action case
const approveRequest = async () => {
  if (!id) return;

  const docRef = doc(db, "purchaseRequests", id);

  await updateDoc(docRef, {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  fetchRequest();
};

// reject action case
const rejectRequest = async () => {
  if (!id) return;

  const docRef = doc(db, "purchaseRequests", id);

  await updateDoc(docRef, {
    status: "rejected",
    rejectedAt: serverTimestamp()
  });

  fetchRequest();
};




  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  if (!request) return <p className="text-center mt-10">Request Not Found</p>;

  return (
    <div className="p-8">

      <h2 className="text-2xl font-semibold mb-6">Request Details</h2>

      <p><strong>Customer Name:</strong> {request.customerName}</p>
      <p><strong>Phone:</strong> {request.customerPhone}</p>
      <p><strong>Units:</strong> {request.requestedUnits}</p>
      <p><strong>Status:</strong> {request.status}</p>
      <p><strong>Created At:</strong> {String(request.createdAt?.toDate?.() || "")}</p>

      {/* Action */}
      {request.status === "new" && (
        <Button
          className="mt-6"
          variant="contained"
          onClick={moveToReview}
        >
          Move to Review
        </Button>
      )}
      {request.status === "in_review" && (
  <Button
    className="mt-4"
    variant="contained"
    onClick={markAsContacted}
  >
    Mark as Contacted
  </Button>
)}
{request.status === "contacted" && (
  <div className="flex gap-4 mt-4">
    <Button
      variant="contained"
      color="success"
      onClick={approveRequest}
    >
      Approve
    </Button>

    <Button
      variant="contained"
      color="error"
      onClick={rejectRequest}
    >
      Reject
    </Button>
  </div>
)}
{request.status === "approved" && (
  <AssignUnitsSection request={request} />
)}





    </div>
  );
};

export default RequestDetails;
