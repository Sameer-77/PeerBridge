import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Filter,
  Search,
  Clock,
  User,
  MessageCircle,
  Award,
  TrendingUp,
  Eye,
  Calendar,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDoubts: 0,
    resolvedDoubts: 0,
    inProgressDoubts: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([fetchDoubts(), fetchStats()]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'junior' ? '/api/doubts/my-doubts' : '/api/doubts';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const doubtsData = response.data.doubts || response.data;
      setDoubts(Array.isArray(doubtsData) ? doubtsData : []);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to fetch doubts');
      }
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch stats:', error);
      }
    }
  };

  const handleClaimDoubt = async (doubtId) => {
    try {
      await axios.post(`/api/doubts/${doubtId}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Doubt claimed successfully!');
      fetchDoubts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim doubt');
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    try {
      // Optimistic update - remove from local state immediately
      setDoubts(prevDoubts => prevDoubts.filter(doubt => doubt._id !== doubtId));

      await axios.delete(`/api/doubts/${doubtId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Doubt deleted successfully');

      // Refresh stats after deletion
      await fetchStats();
    } catch (error) {
      // Revert optimistic update if deletion fails
      fetchDoubts();
      toast.error(error.response?.data?.message || 'Failed to delete doubt');
    }
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesFilter = filter === 'all' || doubt.status === filter;
    const matchesSearch = doubt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doubt.tags && doubt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'in_progress': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'resolved': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-20 pb-6 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {user?.role === 'junior'
              ? 'Track your doubts and learning progress'
              : 'Help juniors solve their doubts and grow together'
            }
          </p>
        </div>

        {user?.role === 'junior' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/post-doubt"
              className="btn-primary inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Doubt
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<MessageCircle className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          title={user?.role === 'junior' ? 'My Doubts' : 'Total Doubts'}
          value={stats.totalDoubts}
          bgColor="bg-primary-100 dark:bg-primary-900"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-green-500 dark:text-green-400" />}
          title="Resolved"
          value={stats.resolvedDoubts}
          bgColor="bg-green-100 dark:bg-green-900"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />}
          title="In Progress"
          value={stats.inProgressDoubts}
          bgColor="bg-orange-100 dark:bg-orange-900"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
          title={user?.role === 'junior' ? 'Learning Points' : 'Mentor Points'}
          value={stats.totalPoints}
          bgColor="bg-purple-100 dark:bg-purple-900"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            isJunior={user?.role === 'junior'}
          />
        ) : (
          filteredDoubts.map((doubt) => (
            <DoubtCard
              key={doubt._id}
              doubt={doubt}
              isSenior={user?.role === 'senior'}
              currentUserId={user?._id}
              onClaim={handleClaimDoubt}
              onDelete={handleDeleteDoubt}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, bgColor }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-4 ${bgColor}`}>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchTerm, isJunior }) => (
  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {searchTerm ? 'No doubts found' : 'No doubts yet'}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4">
      {searchTerm
        ? 'Try adjusting your search terms'
        : isJunior
          ? 'Start by posting your first doubt'
          : 'Check back later for new doubts to help with'
      }
    </p>
    {isJunior && !searchTerm && (
      <Link
        to="/post-doubt"
        className="btn-primary inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Post Your First Doubt
      </Link>
    )}
  </div>
);

// Doubt Card Component
const DoubtCard = ({ doubt, isSenior, currentUserId, onClaim, onDelete, getPriorityColor, getStatusColor }) => {
  const canDelete = doubt.postedBy?._id === currentUserId && doubt.status !== 'resolved';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400">
              <Link to={`/doubt/${doubt._id}`}>
                {doubt.title}
              </Link>
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doubt.status)}`}>
              {doubt.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(doubt.priority)}`}>
              {doubt.priority} priority
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {doubt.description}
          </p>

          {doubt.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {doubt.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {doubt.postedBy?.name || 'Anonymous'}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true })}
            </div>
            {doubt.responses?.length > 0 && (
              <div className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                {doubt.responses.length} {doubt.responses.length === 1 ? 'response' : 'responses'}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Link
            to={`/doubt/${doubt._id}`}
            className="btn-outline px-2 py-1 text-xs sm:text-sm inline-flex items-center border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            View
          </Link>

          {isSenior && doubt.status === 'open' && (
            <button
              onClick={() => onClaim(doubt._id)}
              className="btn-primary px-2 py-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Claim
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(doubt._id)}
              className="btn-danger px-2 py-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors inline-flex items-center"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;