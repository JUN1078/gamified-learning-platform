import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gold/20 mb-4">
            <Sparkles className="w-8 h-8 text-accent-gold" />
          </div>
          <h1 className="text-4xl font-display font-bold text-shadow-lg mb-2">
            LearnHub
          </h1>
          <p className="text-white/70">
            Your journey to mastery begins here
          </p>
        </div>

        {/* Auth form */}
        <div className="glass-strong rounded-2xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-6">
          Advanced gamification platform for next-gen learning
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
