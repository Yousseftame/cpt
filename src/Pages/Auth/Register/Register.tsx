import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const db = getFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);

      toast.success("Verification email sent! Please check your inbox.");
      sessionStorage.setItem('emailSentAt', Date.now().toString());
      navigate('/verify-account');

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
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
          <User className="text-white" size={24} />
        </div> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600">
          Sign up to get started with your account.
        </p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <form onSubmit={handleRegister} className="space-y-5">
        <AuthInput
          label="Full Name"
          icon={User}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
          disabled={loading}
        />

        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          required
          disabled={loading}
          showPasswordToggle
        />

        <AuthInput
          label="Confirm Password"
          icon={Lock}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          disabled={loading}
          showPasswordToggle
        />

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Creating account..."
          icon={<ArrowRight size={20} />}
        >
          Sign Up
        </AuthButton>
      </form>

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="text-purple-600 hover:text-purple-800 font-semibold transition-colors underline"
          disabled={loading}
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Register;