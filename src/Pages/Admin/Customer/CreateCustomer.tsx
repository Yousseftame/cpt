import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../service/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const CreateCustomer: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // 1️⃣ إنشاء مستخدم في Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCred.user.uid;

      // 2️⃣ إنشاء Document داخل Firestore
      await addDoc(collection(db, "customers"), {
        uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: "customer",
        status: "active",
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || "unknown",
        purchasedUnits: [],
      });

      alert("Customer created successfully!");
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        address: "",
      });
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[450px] shadow-xl">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create Customer
          </Typography>

          <div className="flex flex-col gap-4 mt-4">

            <TextField label="Name" name="name" value={formData.name} onChange={handleChange} />

            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} />

            <TextField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />

            <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

            <TextField label="Address" name="address" value={formData.address} onChange={handleChange} />

            {error && <p className="text-red-600">{error}</p>}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCustomer;
