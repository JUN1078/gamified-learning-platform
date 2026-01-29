import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socialService, { SocialPost, PostComment } from '../../services/socialService';
import CreatePostModal from './CreatePostModal';

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, PostComment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  useEffect(() => {
    loadFeed();
  }, [selectedType]);

  const loadFeed = async () => {
    try {
      const type = selectedType === 'all' ? undefined : selectedType;
      const response = await socialService.getFeed(type);
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await socialService.toggleLike('post', postId);
      // Update local state
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes_count: post.user_liked ? post.likes_count - 1 : post.likes_count + 1,
              user_liked: !post.user_liked
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const response = await socialService.getComments(postId);
      if (response.success) {
        setComments(prev => ({ ...prev, [postId]: response.data }));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const toggleComments = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await socialService.addComment(postId, text);
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
      // Update comment count
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
      ));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'question': return '❓';
      case 'discussion': return '💬';
      case 'tip': return '💡';
      default: return '📝';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'from-yellow-400 to-orange-500';
      case 'question': return 'from-blue-400 to-cyan-500';
      case 'discussion': return 'from-purple-400 to-pink-500';
      case 'tip': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">💬 Community</h1>
            <p className="text-gray-300">Connect, share, and learn together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600
                     hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            + New Post
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {['all', 'achievement', 'question', 'discussion', 'tip'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedType === type
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
            >
              {/* Post header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600
                             flex items-center justify-center text-white font-bold text-xl">
                  {post.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{post.username}</h3>
                    {post.user_level && (
                      <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded text-xs font-semibold">
                        Lv. {post.user_level}
                      </span>
                    )}
                    {post.user_title && (
                      <span className="text-gray-400 text-sm">• {post.user_title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r
                                   ${getPostTypeColor(post.post_type)} text-white`}>
                      {getPostTypeIcon(post.post_type)} {post.post_type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post content */}
              <p className="text-gray-200 mb-4 whitespace-pre-line">{post.content}</p>

              {post.media_url && (
                <img
                  src={post.media_url}
                  alt="Post media"
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}

              {/* Post actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.user_liked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                  }`}
                >
                  <span className="text-xl">{post.user_liked ? '❤️' : '🤍'}</span>
                  <span className="font-semibold">{post.likes_count}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <span className="text-xl">💬</span>
                  <span className="font-semibold">{post.comments_count}</span>
                </button>
              </div>

              {/* Comments section */}
              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    {/* Add comment */}
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl
                                 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl
                                 font-semibold transition-colors"
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600
                                       flex items-center justify-center text-white font-bold text-sm">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold text-sm">{comment.username}</span>
                              {comment.is_answer && (
                                <span className="px-2 py-0.5 bg-green-500/30 text-green-300 rounded text-xs font-semibold">
                                  ✓ Answer
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-white/70">No posts yet</p>
            <p className="text-gray-400 mt-2">Be the first to share something!</p>
          </div>
        )}
      </div>

      {/* Create post modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadFeed();
          }}
        />
      )}
    </div>
  );
};

export default SocialFeed;
