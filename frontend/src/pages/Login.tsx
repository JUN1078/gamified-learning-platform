import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import Button from '@/components/shared/Button';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, token } = await authService.login({ email, password });
      login(user, token);
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Logged in as ${user.username}`,
      });
      navigate('/');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Login failed',
        message: error.response?.data?.error || 'Invalid credentials',
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
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Login
      </Button>

      {/* Register link */}
      <p className="text-center text-sm text-white/70">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent-gold hover:underline font-semibold">
          Register
        </Link>
      </p>
    </form>
  );
};

export default Login;
