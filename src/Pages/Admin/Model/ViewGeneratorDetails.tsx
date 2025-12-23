import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../service/firebase";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Edit, 
  Zap, 
  DollarSign, 
  Info, 
  Settings,
  Package,
  Calendar,
  Tag
} from "lucide-react";
import { 
  Paper, 
  Button, 
  Chip, 
  CircularProgress, 
  Box,
  Divider 
} from "@mui/material";

interface GeneratorModel {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  powerRating: string;
  description: string;
  specifications: {
    phase: string;
    voltage: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export default function ViewGeneratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<GeneratorModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "generatorModels", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setModel({
            id: docSnap.id,
            ...(docSnap.data() as Omit<GeneratorModel, "id">),
          });
        } else {
          toast.error("Model not found");
          navigate("/models");
        }
      } catch (error) {
        toast.error("Failed to fetch model details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id, navigate]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <CircularProgress />
          <p className="mt-4 text-gray-600">Loading model details...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/models")}
          sx={{
            textTransform: "none",
            mb: 2,
            borderRadius: 2,
          }}
        >
          Back to Models
        </Button>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {model.name}
            </h1>
            <Chip
              label={model.category}
              sx={{
                bgcolor: "#EEF2FF",
                color: "#4F46E5",
                fontWeight: 600,
              }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<Edit size={20} />}
            onClick={() => navigate(`/models/edit/${id}`)}
            sx={{
              textTransform: "none",
              px: 4,
              py: 1.5,
              bgcolor: "#4F46E5",
              borderRadius: 2,
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Edit Model
          </Button>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Overview Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Zap size={32} />
              </Box>
              <Box>
                <p className="text-sm opacity-90">Power Output</p>
                <h2 className="text-3xl font-bold">{model.powerRating}</h2>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${model.specifications.phase}`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600
                }}
              />
              <Chip
                label={`${model.specifications.voltage}`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600
                }}
              />
            </Box>
          </Paper>

          {/* Description Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Info className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <p className="text-gray-700 leading-relaxed">{model.description}</p>
          </Paper>

          {/* Specifications Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Settings className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">
                Technical Specifications
              </h2>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 2
              }}>
                <span className="text-gray-600 font-medium">Phase Configuration</span>
                <span className="text-gray-900 font-semibold">
                  {model.specifications.phase}
                </span>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 2
              }}>
                <span className="text-gray-600 font-medium">Voltage Rating</span>
                <span className="text-gray-900 font-semibold">
                  {model.specifications.voltage}
                </span>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 2
              }}>
                <span className="text-gray-600 font-medium">Power Output</span>
                <span className="text-gray-900 font-semibold">
                  {model.powerRating}
                </span>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Price Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DollarSign size={24} />
              <span className="text-sm opacity-90">Price</span>
            </Box>
            <h2 className="text-4xl font-bold mb-1">
              ${model.price.toLocaleString()}
            </h2>
            <p className="text-sm opacity-90">USD</p>
          </Paper>

          {/* Product Info Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Package className="text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">
                Product Information
              </h2>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Tag size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">SKU</span>
                </Box>
                <p className="text-gray-900 font-semibold">{model.sku}</p>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Package size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Category</span>
                </Box>
                <p className="text-gray-900 font-semibold">{model.category}</p>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Created</span>
                </Box>
                <p className="text-gray-900 font-semibold">
                  {formatDate(model.createdAt)}
                </p>
              </Box>

              {model.updatedAt && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Last Updated</span>
                  </Box>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(model.updatedAt)}
                  </p>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Quick Stats Card */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid', 
            borderColor: 'grey.200', 
            borderRadius: 3,
            bgcolor: '#F9FAFB'
          }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              QUICK STATS
            </h3>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-sm text-gray-600">Status</span>
                <Chip 
                  label="Active" 
                  size="small"
                  sx={{ bgcolor: '#10B981', color: 'white', fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-semibold text-gray-900">
                  Generator
                </span>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}