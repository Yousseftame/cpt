import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import { Plus, Edit, Trash2, Package, Hash } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../service/firebase";
import { useCustomer, type PurchasedUnit } from "../../../store/MasterContext/CustomerContext";
import toast from "react-hot-toast";

interface CustomerUnitsTabProps {
  customerId: string;
  units: PurchasedUnit[];
  onUnitsUpdate?: () => void;
}

interface GeneratorModel {
  id: string;
  name: string;
  sku: string;
}

export default function CustomerUnitsTab({ customerId, units, onUnitsUpdate }: CustomerUnitsTabProps) {
  const { assignUnit, removeUnit, updateUnit } = useCustomer();
  const [models, setModels] = useState<GeneratorModel[]>([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PurchasedUnit | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [formData, setFormData] = useState({
    modelId: "",
    serial: "",
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const q = query(
        collection(db, "generatorModels"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        sku: doc.data().sku,
      }));
      setModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleAssign = async () => {
    if (!formData.modelId || !formData.serial.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const newUnit: PurchasedUnit = {
        modelId: formData.modelId,
        serial: formData.serial,
        assignedAt: new Date().toISOString(),
      };
      await assignUnit(customerId, newUnit);
      setAssignDialog(false);
      setFormData({ modelId: "", serial: "" });
      
      // Refresh customer data
      if (onUnitsUpdate) {
        onUnitsUpdate();
      }
    } catch (error) {
      console.error("Error assigning unit:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedUnit || !formData.modelId || !formData.serial.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const updatedUnit: PurchasedUnit = {
        modelId: formData.modelId,
        serial: formData.serial,
        assignedAt: selectedUnit.assignedAt,
      };
      await updateUnit(customerId, selectedUnit, updatedUnit);
      setEditDialog(false);
      setSelectedUnit(null);
      setFormData({ modelId: "", serial: "" });
      
      // Refresh customer data
      if (onUnitsUpdate) {
        onUnitsUpdate();
      }
    } catch (error) {
      console.error("Error updating unit:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;

    try {
      await removeUnit(customerId, selectedUnit);
      setDeleteDialog(false);
      setSelectedUnit(null);
      
      // Refresh customer data
      if (onUnitsUpdate) {
        onUnitsUpdate();
      }
    } catch (error) {
      console.error("Error removing unit:", error);
    }
  };

  const openEditDialog = (unit: PurchasedUnit, index: number) => {
    setSelectedUnit(unit);
    setSelectedIndex(index);
    setFormData({
      modelId: unit.modelId,
      serial: unit.serial,
    });
    setEditDialog(true);
  };

  const openDeleteDialog = (unit: PurchasedUnit) => {
    setSelectedUnit(unit);
    setDeleteDialog(true);
  };

  const getModelName = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    return model?.name || "Unknown Model";
  };

  const getModelSKU = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    return model?.sku || "N/A";
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <h3 className="text-lg font-semibold text-gray-800">Purchased Units</h3>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => setAssignDialog(true)}
          sx={{
            textTransform: "none",
            bgcolor: "#4F46E5",
            "&:hover": { bgcolor: "#4338CA" },
          }}
        >
          Assign Unit
        </Button>
      </Box>

      {/* Units List */}
      {units.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-lg">No units assigned</p>
          <p className="text-sm">Click "Assign Unit" to add a generator</p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">{getModelName(unit.modelId)}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Chip
                      label={getModelSKU(unit.modelId)}
                      size="small"
                      sx={{ bgcolor: "#EEF2FF", color: "#4F46E5" }}
                    />
                    <Chip
                      icon={<Hash size={14} />}
                      label={unit.serial}
                      size="small"
                      sx={{ bgcolor: "#F6FFED", color: "#6CC464" }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Assigned: {new Date(unit.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(unit, index)}
                    sx={{ color: "#4F46E5" }}
                  >
                    <Edit size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => openDeleteDialog(unit)}
                    sx={{ color: "#DC2626" }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Unit Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Unit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Model Generator"
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Select Model Generator</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.sku})
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Serial Number"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              placeholder="Enter serial number"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAssignDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Assign Unit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Unit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Generator Model"
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              SelectProps={{ native: true }}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.sku})
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Serial Number"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Update Unit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-red-600">Remove Unit</DialogTitle>
        <DialogContent>
          <p className="text-gray-700">
            Are you sure you want to remove this unit? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
          >
            Remove Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}