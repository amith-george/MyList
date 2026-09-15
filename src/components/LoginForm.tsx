'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';

import { FiEye, FiEyeOff } from 'react-icons/fi';

type Props = {
  onForgotPassword: () => void;
};

export default function LoginForm({ onForgotPassword }: Props) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('avatar', data.user.avatar);

      toast.success("Welcome back to MyList!");
      window.location.href = '/';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    'w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <div className="w-full max-w-md bg-white border border-black p-8 rounded-xl shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mt-2">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">
          Login to access your account and media lists.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputStyle}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
        </div>

        {/* Forgot Password - now left-aligned and above submit */}
        <div className="text-left">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-600 text-sm hover:underline"
          >
            Forgot your password?
          </button>
        </div>



        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 space-y-2 text-center text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
