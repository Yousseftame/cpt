import { useEffect, useState } from "react";
import { doc, updateDoc, arrayUnion, collection, getDocs, getDoc } from "firebase/firestore";
import { db, auth } from "../../../service/firebase";
import { TextField, Button } from "@mui/material";
import toast from "react-hot-toast";
import { auditLogger } from "../../../service/auditLogger";
import { Check } from "lucide-react";

type GeneratorModel = {
  id: string;
  name?: string;
  [key: string]: any;
};

const AssignUnitsSection = ({ request }: any) => {
  const [models, setModels] = useState<GeneratorModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [serial, setSerial] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // fetch generator models for selection
  const fetchModels = async () => {
    const snap = await getDocs(collection(db, "generatorModels"));
    setModels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // assign unit models 
  const handleAssignUnit = async () => {
    if (!selectedModel || !serial) {
      toast.error("Please select model and serial.");
      return;
      
    }
    setLoading(true);

    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      const ref = doc(db, "purchaseRequests", request.id);

      const newUnit = {
        modelId: selectedModel,
        serial: serial,
        assignedAt: new Date().toISOString()
      };

      await updateDoc(ref, {
        assignedUnits: arrayUnion(newUnit)
      });

      // Get model name
      const modelDoc = await getDoc(doc(db, "generatorModels", selectedModel));
      const modelName = modelDoc.exists() ? modelDoc.data().name : selectedModel;

      // 🔥 LOG AUDIT: Unit Assigned to Request
      await auditLogger.log({
        action: "ASSIGNED_UNIT_TO_REQUEST",
        entityType: "purchaseRequest",
        entityId: request.id,
        entityName: `Request from ${request.customerName || "Unknown"}`,
        after: {
          unit: {
            modelId: selectedModel,
            modelName: modelName,
            serial: serial,
          }
        },
      });

      toast.success("Unit Assigned!");
      setSelectedModel("");
      setSerial("");
      
      // Refresh page or parent component
      window.location.reload();
    } catch (error) {
      console.error("Error assigning unit:", error);
      toast.error("Failed to assign unit");
    }
    finally {
      setLoading(false);
    }
  };

  // add internal note
  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      const adminUid = auth.currentUser?.uid;
      const adminName = localStorage.getItem("userName") || "Admin";
      
      if (!adminUid) throw new Error('Not authenticated');

      const ref = doc(db, "purchaseRequests", request.id);

      const newNote = {
        note,
        createdAt: new Date().toISOString(),
        createdBy: adminUid,
        createdByName: adminName
      };

      await updateDoc(ref, {
        internalNotes: arrayUnion(newNote)
      });

      // 🔥 LOG AUDIT: Note Added to Request
      await auditLogger.log({
        action: "ADDED_REQUEST_NOTE",
        entityType: "purchaseRequest",
        entityId: request.id,
        entityName: `Request from ${request.customerName || "Unknown"}`,
        after: {
          note: note.substring(0, 100) + (note.length > 100 ? "..." : "")
        },
      });

      toast.success("Note added!");
      setNote("");
      
      // Refresh page or parent component
      window.location.reload();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  // complete request case
  const handleCompleteRequest = async () => {
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Not authenticated');

      const ref = doc(db, "purchaseRequests", request.id);

      // Get current status before update
      const docSnap = await getDoc(ref);
      const oldStatus = docSnap.exists() ? docSnap.data().status : "unknown";

      await updateDoc(ref, {
        status: "completed"
      });

      // 🔥 LOG AUDIT: Request Completed
      await auditLogger.log({
        action: "COMPLETED_REQUEST",
        entityType: "purchaseRequest",
        entityId: request.id,
        entityName: `Request from ${request.customerName || "Unknown"}`,
        before: {
          status: oldStatus,
        },
        after: {
          status: "completed",
        },
      });

      setCompleted(true);
      toast.success("Request marked as completed!");
    } catch (error) {
      console.error("Error completing request:", error);
      toast.error("Failed to complete request");
    }
  };

  if (completed || request.status === "completed") {
    return (
      <div className="mt-6 p-4 border rounded bg-green-50">
        <p className="font-semibold text-green-700">
          Request Completed ✔
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold">Assign Units</h3>

      <select
        className="border p-2 mt-2 w-full rounded"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="">Select Model</option>
        {models.map((m: any) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <TextField
        label="Serial Number"
        className="mt-3"
        fullWidth
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
      />

      <Button
        variant="contained"
        className="mt-3"
        onClick={handleAssignUnit}
        sx={{ 
          bgcolor: '#5E35B1',
          '&:hover': { bgcolor: '#7E57C2' }
        }}
        disabled={loading}
      >
        {loading ? <Check /> : "Add Assigned Unit"}
      </Button>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold">Internal Notes</h3>

      <TextField
        label="Add Note"
        multiline
        fullWidth
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2"
      />

      <Button
        variant="outlined"
        className="mt-3"
        onClick={handleAddNote}
      >
        Add Note
      </Button>

      <hr className="my-4" />

      <Button
        variant="contained"
        color="success"
        onClick={handleCompleteRequest}
      >
        Mark as Completed
      </Button>

      {request.internalNotes?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Internal Notes</h3>

          {request.internalNotes.map((n: any, index: number) => (
            <div key={index} className="border p-2 mb-2 rounded bg-gray-50">
              <p>{n.note}</p>
              <small className="text-gray-500">
                by {n.createdByName || n.createdBy} — {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {request.assignedUnits?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Assigned Units</h3>

          {request.assignedUnits.map((unit: any, index: number) => {
            const model = models.find(m => m.id === unit.modelId);
            return (
              <div key={index} className="border p-2 mb-2 rounded">
                <p><strong>Model:</strong> {model?.name || unit.modelId}</p>
                <p><strong>Serial:</strong> {unit.serial}</p>
                <p><strong>Assigned At:</strong> {new Date(unit.assignedAt).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignUnitsSection;