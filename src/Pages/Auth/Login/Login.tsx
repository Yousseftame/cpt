import React, { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCardWrapper from '../../../components/shared/AuthCardWrapper';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';
import { doc, getDoc } from 'firebase/firestore';
import PagesLoader from '../../../components/shared/PagesLoader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // CRITICAL: Reload user to get the latest emailVerified state from Firebase server
      await userCredential.user.reload();

      // Get the fresh user object after reload
      const currentUser = auth.currentUser;

      console.log('User logged in:', currentUser);
      console.log('Email verified:', currentUser?.emailVerified);

      // جلب الـ role من Firestore
      const docRef = doc(db, "admins", userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Role after login:", docSnap.data().role);
      }

      if (!currentUser?.emailVerified) {
        setError('Please verify your email before logging in.');
        navigate('/verify-account');
        toast.error('Please verify your email first.', {
          style: {
            borderRadius: '10px',
            background: '#344e41',
            color: '#dad7cd',
          },
        });
        return;
      }

      // Success - navigate to dashboard
      toast.success('Welcome back!', {
        style: {
          borderRadius: '10px',
          background: '#588157',
          color: 'white',
        },
      });

      navigate('/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sign out any authenticated user when landing on login page
    const signOutUser = async () => {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setCheckingAuth(false);
    };

    signOutUser();
  }, []);

  if (checkingAuth) {
    return <PagesLoader text="Preparing login page..." />;
  }

  return (
    <AuthCardWrapper
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      icon={<Sparkles className="text-white" size={28} strokeWidth={2.5} />}
    >
      <ErrorAlert message={error} onClose={() => setError('')} />

      <form onSubmit={handleLogin} className="space-y-6">
        <AuthInput
          label="Email Address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
        />

        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
          showPasswordToggle
        />

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/forget-password')}
            type="button"
            className="text-sm text-[#588157] hover:text-[#344e41] font-semibold transition-colors duration-300 hover:underline underline-offset-4"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          icon={<ArrowRight size={20} strokeWidth={2.5} />}
        >
          Sign In
        </AuthButton>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#dad7cd]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-[#a3b18a] bg-white font-medium">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-[#3a5a40] mt-8">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/register')}
          type="button"
          className="text-[#588157] hover:text-[#344e41] font-bold transition-all duration-300 disabled:opacity-50 hover:underline underline-offset-4"
          disabled={loading}
        >
          Create Account
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default Login;