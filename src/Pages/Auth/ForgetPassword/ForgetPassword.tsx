import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCardWrapper from '../../../components/shared/AuthCardWrapper';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';

// Import reusable components

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
const handleResetPassword = async () => {
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

    // اختياري: رجوع لصفحة اللوجين
    navigate("/verify-account");

  } catch (err: any) {
    setError("Failed to send reset email. Please check your email.");
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthCardWrapper
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      icon={<Lock className="text-white" size={32} />}
    >
      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="space-y-6">
        <AuthInput
          label="Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e :any) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
        />

       

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/forget-password')}
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <AuthButton
          type="button"
          onClick={handleResetPassword}
          loading={loading}
          loadingText="Signing in..."
          icon={<ArrowRight size={20} />}
        >
          Sign In
        </AuthButton>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-12">
        Go Back to?{' '}
        <button
          onClick={() => navigate('/')}
          type="button"
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Login
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default ForgetPassword;