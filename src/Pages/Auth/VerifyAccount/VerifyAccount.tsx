import React, { useState } from "react";
import { MailCheck, ArrowRight } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../../service/firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthCardWrapper from "../../../components/shared/AuthCardWrapper";
import ErrorAlert from "../../../components/shared/ErrorAlert";
import AuthButton from "../../../components/shared/AuthButton";

const VerifyAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);

  const navigate = useNavigate();

  const handleVerifyAccount = async () => {
    setLoading(true);
    setError("");

    try {
      if (!auth.currentUser) {
        setDisabled(true);
        setError("You must be logged in to verify your email.");
        return;
      }

      await sendEmailVerification(auth.currentUser);

      toast.success("Verification email sent!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      navigate("/login");
    } catch (err: any) {
      setError("Failed to send verification email. Please try again.");
    } finally {
      setTimeout(() => setDisabled(false), 30000); // 30s
      setLoading(false);
    }
  };

  return (
    <AuthCardWrapper
      title="Verify your email"
      subtitle="We need to verify your email address before continuing"
      icon={<MailCheck className="text-white" size={32} />}
    >
      <ErrorAlert message={error} onClose={() => setError("")} />

      <p className="text-sm text-gray-600 text-center mb-6">
        Click the button below and we’ll send you a verification email.
      </p>

      <AuthButton
        type="button"
        onClick={handleVerifyAccount}
        loading={loading}
        loadingText="Sending..."
        icon={<ArrowRight size={20} />}
      >
        Send Verification Email
      </AuthButton>

      <p className="text-center text-sm text-gray-600 mt-10">
        Already verified?{" "}
        <button
          onClick={() => navigate("/login")}
          type="button"
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
          disabled={loading}
        >
          Go to Login
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default VerifyAccount;
