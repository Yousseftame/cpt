import React, { useState } from 'react';
import { Mail,  ArrowRight } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
      toast.success("Password reset email sent!");
      setEmailSent(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
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
    <div>
      {/* Logo */}
      <div className="mb-8">
        {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
          <KeyRound className="text-white" size={24} />
        </div> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-600">
          Enter your email to reset your password.
        </p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {emailSent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Reset email sent successfully!
          </p>
          <p className="text-xs text-green-600 mt-1">
            Please check your inbox and follow the instructions.
          </p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-5">
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

      <p className="text-center text-sm text-gray-600 mt-8">
        Remember your password?{' '}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="text-purple-600 hover:text-purple-800 font-semibold transition-colors underline"
          disabled={loading}
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default ForgetPassword;