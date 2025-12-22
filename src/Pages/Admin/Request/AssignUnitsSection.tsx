import { useEffect, useState } from "react";
import { doc, updateDoc, arrayUnion, collection, getDocs } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { TextField, Button } from "@mui/material";

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
      alert("Please select model and serial.");
      return;
    }

    const ref = doc(db, "purchaseRequests", request.id);

    await updateDoc(ref, {
      assignedUnits: arrayUnion({
        modelId: selectedModel,
        serial: serial,
        assignedAt: new Date().toISOString()
      })
    });

    alert("Unit Assigned!");
  };


  // add internal note
  const handleAddNote = async () => {
    if (!note.trim()) return;

    const ref = doc(db, "purchaseRequests", request.id);

    await updateDoc(ref, {
      internalNotes: arrayUnion({
        note,
        createdAt: new Date().toISOString(),
        createdBy: "admin" //  لاحقاً هبقى محتاج اسم المستخدم الحقيقى  
      })
    });

    setNote("");
    alert("Note added!");
  };

 
    // complete request case
  const handleCompleteRequest = async () => {
  const ref = doc(db, "purchaseRequests", request.id);

  await updateDoc(ref, {
    status: "completed"
  });

  setCompleted(true);   // <<< هنا
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
        className="border p-2 mt-2"
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
        onChange={(e) => setSerial(e.target.value)}
      />

      <Button
        variant="contained"
        className="mt-3"
        onClick={handleAssignUnit}
      >
        Add Assigned Unit
      </Button>


      <hr className="my-4" />

      <h3 className="text-lg font-semibold">Internal Notes</h3>

      <TextField
        label="Add Note"
        multiline
        fullWidth
        value={note}
        onChange={(e) => setNote(e.target.value)}
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
          by {n.createdBy} — {new Date(n.createdAt).toLocaleString()}
        </small>
      </div>
    ))}
  </div>
)}

{request.assignedUnits?.length > 0 && (
  <div className="mt-6">
    <h3 className="font-semibold">Assigned Units</h3>

    {request.assignedUnits.map((unit: any, index: number) => (
      <div key={index} className="border p-2 mb-2 rounded">
        <p><strong>Model:</strong> {unit.modelId}</p>
        <p><strong>Serial:</strong> {unit.serial}</p>
        <p><strong>Assigned At:</strong> {new Date(unit.assignedAt).toLocaleString()}</p>
      </div>
    ))}
  </div>
)}

    </div>
    
  );
};

export default AssignUnitsSection;
