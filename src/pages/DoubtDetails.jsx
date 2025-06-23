import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    MessageSquare,
    CheckCircle,
    Clock,
    User,
    Award,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Loader2,
    Star,
    HelpCircle,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DoubtDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [doubt, setDoubt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseContent, setResponseContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedResponse, setExpandedResponse] = useState(null);

    useEffect(() => {
        if (!user) {
            toast.error('Please login to view this doubt');
            navigate('/login');
            return;
        }

        const fetchDoubt = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/doubts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (user.role === 'junior' && user._id !== response.data.postedBy._id) {
                    toast.error("You don't have permission to view this doubt");
                    navigate('/dashboard');
                    return;
                }

                setDoubt(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching doubt:', err);
                setError(err.response?.data?.message || 'Failed to load doubt');
                toast.error(err.response?.data?.message || 'Failed to load doubt');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDoubt();
    }, [id, user, token, navigate]);

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        if (!responseContent.trim()) return;

        setIsSubmitting(true);
        try {
            await axios.post(`/api/doubts/${id}/response`, { content: responseContent }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await axios.get(`/api/doubts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoubt(response.data);
            setResponseContent('');
            toast.success('Response submitted successfully!');
        } catch (err) {
            console.error('Error submitting response:', err);
            toast.error(err.response?.data?.message || 'Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.patch(`/api/doubts/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await axios.get(`/api/doubts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoubt(response.data);
            toast.success(`Doubt marked as ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleVote = async (type) => {
        try {
            await axios.post(`/api/doubts/${id}/vote`, { type }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await axios.get(`/api/doubts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoubt(response.data);
        } catch (err) {
            console.error('Error voting:', err);
            toast.error(err.response?.data?.message || 'Failed to vote');
        }
    };

    const toggleResponse = (id) => {
        setExpandedResponse(expandedResponse === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 dark:text-primary-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        Error loading doubt
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!doubt) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                    <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        Doubt not found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">The doubt you're looking for doesn't exist or was deleted</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
            </button>

            {/* Doubt Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                        {doubt.title}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-center ${doubt.status === 'open' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        doubt.status === 'in_progress' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                            'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                        {doubt.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-4 gap-4">
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {doubt.postedBy?.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true })}
                    </div>
                    {doubt.claimedBy && (
                        <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1" />
                            <span className="text-gray-700 dark:text-gray-300">Mentor: {doubt.claimedBy.name}</span>
                        </div>
                    )}
                </div>

                <div className="prose max-w-none mb-6 dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{doubt.description}</p>
                </div>

                {doubt.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <button
                                onClick={() => handleVote('up')}
                                className={`${doubt.upvotes?.includes(user?._id) ? 'text-green-500' : 'text-gray-500 hover:text-green-500'} transition-colors`}
                                disabled={isSubmitting}
                            >
                                <ThumbsUp className="w-5 h-5" />
                            </button>
                            <span className="font-medium min-w-[20px] text-center text-gray-700 dark:text-gray-300">
                                {(doubt.upvotes?.length || 0) - (doubt.downvotes?.length || 0)}
                            </span>
                            <button
                                onClick={() => handleVote('down')}
                                className={`${doubt.downvotes?.includes(user?._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                                disabled={isSubmitting}
                            >
                                <ThumbsDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {user?.role === 'senior' && doubt.status === 'open' && (
                            <button
                                onClick={() => handleStatusChange('in_progress')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                                <Star className="w-5 h-5 mr-2" />
                                Claim This Doubt
                            </button>
                        )}
                        {(user?.role === 'senior' || user?._id === doubt.postedBy?._id) && (
                            <>
                                {doubt.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleStatusChange('resolved')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Mark as Resolved
                                    </button>
                                )}
                                {doubt.status !== 'open' && (
                                    <button
                                        onClick={() => handleStatusChange('open')}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                    >
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        Reopen Doubt
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Responses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <MessageSquare className="w-5 h-5 mr-2 text-primary-500" />
                    Responses ({doubt.responses?.length || 0})
                </h2>

                {doubt.responses?.length > 0 ? (
                    <div className="space-y-4">
                        {doubt.responses.map((response) => (
                            <div key={response._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => toggleResponse(response._id)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                            {response.responder?.name || 'Anonymous'}
                                            {response.responder?._id === doubt.claimedBy?._id && (
                                                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                    Mentor
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {expandedResponse === response._id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                                {expandedResponse === response._id && (
                                    <div className="prose max-w-none dark:prose-invert mt-2">
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{response.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No responses yet. Be the first to respond!</p>
                )}
            </div>

            {/* Response Form */}
            {(user?.role === 'senior' || user?._id === doubt.postedBy?._id) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Your Response</h2>
                    <form onSubmit={handleSubmitResponse}>
                        <textarea
                            value={responseContent}
                            onChange={(e) => setResponseContent(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white mb-4"
                            placeholder="Type your response here..."
                            rows="4"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !responseContent.trim()}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${isSubmitting || !responseContent.trim() ? 'bg-primary-400 dark:bg-primary-600 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Submit Response
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DoubtDetails;