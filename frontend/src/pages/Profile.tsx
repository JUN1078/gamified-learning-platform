import { useAuthStore } from '@/stores/authStore';
import { useCharacterStore } from '@/stores/characterStore';
import Card from '@/components/shared/Card';
import AvatarDisplay from '@/components/character/AvatarDisplay';
import { User, Mail, Calendar, Award } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const Profile = () => {
  const { user } = useAuthStore();
  const { character } = useCharacterStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
          Profile
        </h1>
        <p className="text-white/70 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {character && (
            <AvatarDisplay avatar={character.avatar} size="xl" showBadges />
          )}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-display font-bold mb-2">{user.username}</h2>
            {character && (
              <p className="text-accent-gold font-semibold mb-4">{character.title}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="text-sm text-white/70">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="glass rounded-lg p-4 flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-accent-gold" />
                <div>
                  <p className="text-sm text-white/70">Member Since</p>
                  <p className="font-semibold">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      {character && (
        <Card>
          <h3 className="font-display font-bold text-xl mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-accent-gold mx-auto mb-2" />
              <p className="text-3xl font-bold text-accent-gold">{character.level}</p>
              <p className="text-sm text-white/70 mt-1">Character Level</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-accent-gold">
                {character.xp.toLocaleString()}
              </p>
              <p className="text-sm text-white/70 mt-1">Total XP Earned</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-accent-gold">
                {character.avatar.badges.length}
              </p>
              <p className="text-sm text-white/70 mt-1">Equipped Badges</p>
            </div>
          </div>
        </Card>
      )}

      {/* Account Settings */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Account Settings</h3>
        <div className="space-y-3">
          <button className="btn-secondary w-full justify-start">
            <User className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
          <button className="btn-secondary w-full justify-start">
            <Mail className="w-5 h-5 mr-2" />
            Change Email
          </button>
          <button className="btn-secondary w-full justify-start">
            <Calendar className="w-5 h-5 mr-2" />
            Change Password
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between glass rounded-lg p-4">
            <div>
              <p className="font-semibold">Email Notifications</p>
              <p className="text-sm text-white/70">Receive updates about achievements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
            </label>
          </div>
          <div className="flex items-center justify-between glass rounded-lg p-4">
            <div>
              <p className="font-semibold">Show Progress Animations</p>
              <p className="text-sm text-white/70">Celebrate achievements with animations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
