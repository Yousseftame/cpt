import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../service/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCardWrapper from '../../../components/shared/AuthCardWrapper';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import AuthInput from '../../../components/shared/AuthInput';
import AuthButton from '../../../components/shared/AuthButton';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// Import reusable components


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
    console.log('User registered:', user);

    // Save user in Firestore
    await setDoc(doc(db, 'Admins', user.uid), {
      uid: user.uid,
      email: user.email,
      role: 'admin',
      createdAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(user);

    toast.success("Verification email sent! Please check your inbox.", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });

    // بعد كده بدل navigate Dashboard
    navigate('/verify-account');

  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      setError('This email is already registered');
    } else if (err.code === 'auth/invalid-email') {
      setError('Invalid email address');
    } else {
      setError('Failed to create account. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthCardWrapper
      title="Create Account"
      subtitle="Sign up to get started"
      icon={<User className="text-white" size={32} />}
    >
      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="space-y-6">
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
          label="Email Address"
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
          type="button"
          onClick={handleRegister}
          loading={loading}
          loadingText="Creating account..."
          icon={<ArrowRight size={20} />}
        >
          Sign Up
        </AuthButton>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-12">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Sign in
        </button>
      </p>
    </AuthCardWrapper>
  );
};

export default Register;