import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import Button from '@/components/shared/Button';
import { Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords do not match',
        message: 'Please make sure your passwords match',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await authService.register({ email, username, password });
      login(user, token);
      addToast({
        type: 'success',
        title: 'Welcome to LearnHub!',
        message: 'Your account has been created successfully',
      });
      navigate('/');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: error.response?.data?.error || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
              placeholder="username"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Create Account
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-white/70">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-gold hover:underline font-semibold">
          Login
        </Link>
      </p>
    </form>
  );
};

export default Register;
