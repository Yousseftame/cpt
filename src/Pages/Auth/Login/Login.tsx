import React, { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCardWrapper from '../../../components/shared/AuthCardWrapper';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';

// Import reusable components

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Reload user to get the latest emailVerified state
    await userCredential.user.reload();

    console.log('User logged in:', userCredential.user);

    if (!userCredential.user.emailVerified) {
      navigate('/verify-account');
      toast.error('Please verify your email first.');
      return;
    }

    navigate('/dashboard');
    toast.success('Login successful!', {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  } catch (err: any) {
    setError('Failed to login. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (auth.currentUser && auth.currentUser.emailVerified) {
    navigate('/dashboard');
  }
}, []);


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

        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e :any) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
          showPasswordToggle
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
          onClick={handleLogin}
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
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/register')}
          type="button"
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Sign up
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default Login;