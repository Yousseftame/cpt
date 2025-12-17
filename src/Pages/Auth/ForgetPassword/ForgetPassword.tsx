import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCardWrapper from '../../../components/shared/AuthCardWrapper';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset email sent!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      setEmailSent(true);

      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      console.error('Reset password error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardWrapper
      title="Forgot Password?"
      subtitle="Enter your email to reset your password"
      icon={<KeyRound className="text-white" size={32} />}
    >
      <ErrorAlert message={error} onClose={() => setError('')} />

      {emailSent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Reset email sent successfully!
          </p>
          <p className="text-xs text-green-600 mt-1">
            Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-6">
        <AuthInput
          label="Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading || emailSent}
        />

        <AuthButton
          type="submit"
          loading={loading}
          disabled={emailSent}
          loadingText="Sending..."
          icon={<ArrowRight size={20} />}
        >
          {emailSent ? "Email Sent!" : "Send Reset Link"}
        </AuthButton>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-12">
        Remember your password?{' '}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Back to Login
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default ForgetPassword;