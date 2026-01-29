import React, { useState } from 'react';
import { motion } from 'framer-motion';
import socialService from '../../services/socialService';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSuccess }) => {
  const [postType, setPostType] = useState<string>('discussion');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const postTypes = [
    { value: 'discussion', label: 'Discussion', icon: '💬', color: 'from-purple-400 to-pink-500' },
    { value: 'question', label: 'Question', icon: '❓', color: 'from-blue-400 to-cyan-500' },
    { value: 'tip', label: 'Tip', icon: '💡', color: 'from-green-400 to-emerald-500' },
    { value: 'achievement', label: 'Achievement', icon: '🏆', color: 'from-yellow-400 to-orange-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await socialService.createPost(postType, content);
      onSuccess();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-2xl w-full
                 shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Create a Post</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post type selector */}
          <div>
            <label className="block text-white font-semibold mb-3">Post Type</label>
            <div className="grid grid-cols-2 gap-3">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    postType === type.value
                      ? `border-white bg-gradient-to-r ${type.color}`
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-white font-semibold">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white font-semibold mb-3">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="w-full p-4 bg-white/5 border-2 border-white/20 rounded-xl text-white
                       placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
              required
            />
            <div className="text-sm text-white/50 mt-2">
              {content.length} / 1000 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl
                       font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600
                       hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
