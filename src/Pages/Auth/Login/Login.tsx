import React, { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  // const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await userCredential.user.reload();
      const currentUser = auth.currentUser;

      const docRef = doc(db, "admins", userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        localStorage.setItem('userRole', docSnap.data().role);
        localStorage.setItem('userName', docSnap.data().name || '');
      }

      if (!currentUser?.emailVerified) {
        setError('Please verify your email before logging in.');
        navigate('/verify-account');
        toast.error('Please verify your email first.');
        return;
      }

      toast.success('Login successful!');
      navigate('/dashboard');

    } catch (err: any) {
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
    <div>
      {/* Logo */}
      <div className="mb-8">
        {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
          <Lock className="text-white" size={24} />
        </div> */}
        <h1 className="text-8xl font-bold text-gray-900 mb-2">
          Hello!
        </h1>
        <p className="text-gray-600 ">
          Enter to get unlimited access to data & information.
        </p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="Enter your mail address"
          required
          disabled={loading}
        />

        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          disabled={loading}
          showPasswordToggle
        />
        

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            {/* <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span  className="text-sm text-gray-700">Remember me</span> */}
          </label>

          <button
            onClick={() => navigate('/forget-password')}
            type="button"
            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          icon={<ArrowRight size={20} />}
        >
          Log In
        </AuthButton>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#dad7cd]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4  bg-white font-medium">or</span>
        </div>
      </div>

      <p className="text-center text-sm  mt-8">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/register')}
          type="button"
          className="text-purple-600 hover:text-purple-600 font-bold transition-all duration-300 disabled:opacity-50 hover:underline underline-offset-4"
          disabled={loading}
        >
          Create Account
        </button>
      </p>
    </div>
  );
};

export default Login;