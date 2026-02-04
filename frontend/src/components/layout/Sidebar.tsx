import { NavLink } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import {
  Home,
  User,
  Mountain,
  CreditCard,
  Award,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Character', to: '/character', icon: User },
  { name: 'Expedition', to: '/expedition', icon: Mountain },
  { name: 'Cards', to: '/cards', icon: CreditCard },
  { name: 'Badges', to: '/badges', icon: Award },
  { name: 'Peer Review', to: '/peer-review', icon: Users },
  { name: 'Profile', to: '/profile', icon: UserCircle },
];

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen glass-strong border-r border-white/20 transition-all duration-300 z-50',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-accent-gold" />
              <span className="font-display font-bold text-xl">LearnHub</span>
            </div>
          )}
          {!sidebarOpen && (
            <Sparkles className="w-8 h-8 text-accent-gold mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-accent-gold text-primary-900 shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Toggle button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
