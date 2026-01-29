import { useAuthStore } from '@/stores/authStore';
import { useCharacterStore } from '@/stores/characterStore';
import { Bell, Settings, LogOut } from 'lucide-react';
import { getInitials } from '@/utils/helpers';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { character } = useCharacterStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="glass-strong border-b border-white/20 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Page title or breadcrumb */}
        <div>
          <h2 className="text-2xl font-display font-bold text-shadow">
            Welcome back, {user?.username}
          </h2>
          {character && (
            <p className="text-sm text-white/70">
              Level {character.level} • {character.title}
            </p>
          )}
        </div>

        {/* Right: User actions */}
        <div className="flex items-center space-x-4">
          {/* XP Display */}
          {character && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10">
              <span className="text-sm text-white/70">XP:</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-accent-gold">
                  {character.xp.toLocaleString()}
                </span>
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold transition-all duration-500"
                    style={{
                      width: `${((character.xp % character.nextLevelXp) / character.nextLevelXp) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center border-2 border-accent-gold">
              <span className="font-bold text-accent-gold">
                {user && getInitials(user.username)}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
