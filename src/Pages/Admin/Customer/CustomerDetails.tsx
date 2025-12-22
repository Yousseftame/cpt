import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { arrayRemove, collection, doc, getDoc, getDocs,  updateDoc } from "firebase/firestore";
import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { db } from "../../../service/firebase";
import { arrayUnion } from "firebase/firestore";


const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState<any>(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState("");
    const [modelsMap, setModelsMap] = useState<any>({});
    const [editOpen, setEditOpen] = useState(false);
const [editSerial, setEditSerial] = useState("");
const [editIndex, setEditIndex] = useState<number | null>(null);
const [editModel, setEditModel] = useState("");



    const [serial, setSerial] = useState("");

    const navigate = useNavigate();


    const openEditModal = (unit: any, index: number) => {
  setEditSerial(unit.serial);
  setEditModel(unit.modelId); // NEW
  setEditIndex(index);
  setEditOpen(true);
};

//  fetch generatrors
    const fetchGenerators = async () => {
        const snapshot = await getDocs(collection(db, "generatorModels"));

        const map: any = {};
        const list: any[] = [];

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            map[docSnap.id] = data;
            list.push({ id: docSnap.id, ...data });
        });

        setModelsMap(map); // used for showing model name later
        setModels(list);   // used for dropdown
    };




// fetch customer

    const fetchCustomer = async () => {
        if (!id) return;

        const docRef = doc(db, "customers", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            setCustomer({ id: snapshot.id, ...snapshot.data() });
        }

        setLoading(false);
    };


    //  edit units ( generator - serial )
   const handleSaveEdit = async () => {
  if (editIndex === null) return;

  const updatedUnits = [...customer.purchasedUnits];

  updatedUnits[editIndex] = {
    ...updatedUnits[editIndex],
    serial: editSerial,
    modelId: editModel,
  };

  const docRef = doc(db, "customers", id!);
  await updateDoc(docRef, { purchasedUnits: updatedUnits });

  setEditOpen(false);
  fetchCustomer();
};





// remove unit

    const handleRemoveUnit = async (unit: any) => {
        const docRef = doc(db, "customers", id!);

        await updateDoc(docRef, {
            purchasedUnits: arrayRemove(unit)
        });

        fetchCustomer();
    };

//  fetch assign unit 

    const handleAssign = async () => {
        if (!selectedModel) {
            alert("Select a model!");
            return;
        }

        const docRef = doc(db, "customers", id!);

        await updateDoc(docRef, {
            purchasedUnits: arrayUnion({
                modelId: selectedModel,
                serial: serial || null,
                assignedAt: new Date().toISOString(),
            }),
        });

        alert("Unit assigned!");

        setAssignOpen(false);
        fetchCustomer(); // refresh data
    };





    useEffect(() => {
        fetchCustomer();
        fetchGenerators();
    }, [id]);

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    if (!customer) return <p className="text-center mt-10">Customer not found</p>;

    return (
        <div className="flex justify-center mt-10">
            {/* list  generators models  */}
            {customer.purchasedUnits?.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Purchased Units</h3>

                    {customer.purchasedUnits.map((unit: any, index: number) => (
                        <div key={index} className="border p-3 rounded mb-2">
                            <p><strong>Model:</strong> {modelsMap[unit.modelId]?.name || "Unknown"}</p>
                            <p><strong>Serial:</strong> {unit.serial}</p>
                            <p><strong>Assigned:</strong> {unit.assignedAt}</p>


                            {/* modelsMap[unit.modelId]?.name translate from id to name  */}

                            <Button
                                variant="contained"

                                className="   underline text-sm"
                                onClick={() => handleRemoveUnit(unit)}
                            >
                                Remove
                            </Button>

                            <Button
  className="text-blue-600 underline text-sm ml-3"
  onClick={() => openEditModal(unit, index)}
>
  Edit
</Button>
                        </div>
                    ))}
                </div>
            )}

            {/* edit from  */}
  {editOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-5 rounded shadow-lg w-100">

      <h3 className="text-lg font-semibold mb-3">Edit Unit</h3>

      <label className="block text-sm font-medium mb-1">Generator Model</label>
      <select
        className="border rounded p-2 w-full"
        value={editModel}
        onChange={(e) => setEditModel(e.target.value)}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <TextField
        label="Serial Number"
        className="mt-3"
        fullWidth
        value={editSerial}
        onChange={(e) => setEditSerial(e.target.value)}
      />

      <div className="flex justify-end gap-3 mt-5">
        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button onClick={handleSaveEdit} variant="contained">Save</Button>
      </div>

    </div>
  </div>
)}





            <Card className="w-150 shadow-xl">
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Customer Details
                    </Typography>

                    <div className="mt-6 space-y-4">

                        <TextField
                            label="Name"
                            fullWidth
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        />

                        <TextField
                            label="Phone"
                            fullWidth
                            value={customer.phone}
                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        />

                        <TextField
                            label="Address"
                            fullWidth
                            value={customer.address}
                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        />

                        <Button
                            variant="contained"
                            onClick={async () => {
                                const docRef = doc(db, "customers", id!);
                                await updateDoc(docRef, {
                                    name: customer.name,
                                    phone: customer.phone,
                                    address: customer.address,
                                });

                                alert("Customer updated!");
                            }}
                        >
                            Save Changes
                        </Button>

                        <Typography variant="body1" className="mt-4">
                            Purchased Units: {customer.purchasedUnits?.length || 0}
                        </Typography>

                        <Button
                            variant="outlined"
                            onClick={() => setAssignOpen(true)}
                        >
                            Assign Unit
                        </Button>
                        <Button
  variant="outlined"
  onClick={() => navigate(`/customer/${id}/tickets`)}
>
  View Tickets
</Button>


                    </div>
                </CardContent>
            </Card>
            {/* add units form */}
            {assignOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black/50">
                    <div className="bg-white p-6 rounded shadow-lg w-100">

                        <Typography variant="h6">Assign Unit</Typography>

                        <select
                            className="border p-2 rounded w-full mt-3"
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            <option value="">Select Generator</option>
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>

                        <TextField
                            className="mt-3 w-full"
                            label="Serial Number"
                            onChange={(e) => setSerial(e.target.value)}
                        />

                        <div className="flex justify-end gap-3 mt-5">
                            <Button variant="text" onClick={() => setAssignOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleAssign}>
                                Assign
                            </Button>
                            
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
};

export default CustomerDetails;
