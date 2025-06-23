import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    MessageCircle,
    Send,
    ArrowLeft,
    User,
    Search,
    Plus,
    ChevronRight,
    MoreVertical,
    Paperclip,
    Smile
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
    const { user, token } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeConversation, setActiveConversation] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [showMobileConversations, setShowMobileConversations] = useState(true);

    // Fetch conversations
    useEffect(() => {
        if (!user || !token) return;

        const fetchConversations = async () => {
            try {
                const response = await axios.get('/api/chat/my-chats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversations(response.data);

                if (conversationId) {
                    const conv = response.data.find(c => c._id === conversationId);
                    if (conv) {
                        setActiveConversation(conv);
                        setShowMobileConversations(false);
                        markMessagesAsRead(conv._id);
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user, token, conversationId]);

    // Fetch messages for active conversation
    useEffect(() => {
        if (!activeConversation || !token) return;

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/chat/doubt/${activeConversation.doubt._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(response.data.messages || []);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load messages');
            }
        };

        fetchMessages();
    }, [activeConversation, token]);

    // Socket.io listeners
    useEffect(() => {
        if (!socket || !activeConversation) return;

        const handleNewMessage = (data) => {
            if (data.chatId === activeConversation._id) {
                setMessages(prev => [...prev, data.message]);
                markMessagesAsRead(activeConversation._id);
            }

            // Update last message in conversations list
            setConversations(prev => prev.map(conv =>
                conv._id === data.chatId
                    ? {
                        ...conv,
                        lastMessage: data.message.createdAt,
                        lastMessagePreview: data.message.content.substring(0, 30) + '...'
                    }
                    : conv
            ));
        };

        const handleTyping = (data) => {
            if (data.chatId === activeConversation._id && data.userId !== user._id) {
                setOtherUserTyping(data.isTyping);
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userTyping', handleTyping);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userTyping', handleTyping);
        };
    }, [socket, activeConversation, user]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const markMessagesAsRead = async (chatId) => {
        try {
            await axios.put(`/api/chat/doubt/${chatId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update unread count in conversations list
            setConversations(prev => prev.map(conv =>
                conv._id === chatId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            ));
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const message = {
                content: newMessage,
                messageType: 'text'
            };

            // Optimistic update
            const tempId = Date.now().toString();
            setMessages(prev => [...prev, {
                ...message,
                _id: tempId,
                sender: user,
                createdAt: new Date()
            }]);
            setNewMessage('');

            // Send via API
            const response = await axios.post(
                `/api/chat/doubt/${activeConversation.doubt._id}/message`,
                message,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Replace optimistic message with actual one
            setMessages(prev => prev.map(msg =>
                msg._id === tempId ? response.data : msg
            ));

            // Update last message in conversations list
            setConversations(prev => prev.map(conv =>
                conv._id === activeConversation._id
                    ? {
                        ...conv,
                        lastMessage: new Date(),
                        lastMessagePreview: newMessage.substring(0, 30) + '...'
                    }
                    : conv
            ));

            // Notify other participants via socket
            socket.emit('sendMessage', {
                chatId: activeConversation._id,
                message: response.data
            });
        } catch (error) {
            toast.error('Failed to send message');
            // Remove optimistic message if failed
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
        }
    };

    const handleTyping = (isTyping) => {
        setIsTyping(isTyping);
        socket.emit('typing', {
            chatId: activeConversation?._id,
            isTyping
        });
    };

    const getOtherUser = (conversation) => {
        return conversation.participants.find(p => p._id !== user._id);
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm) return true;

        const otherUser = getOtherUser(conv);
        return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessagePreview?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-6 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="flex h-[calc(100vh-9rem)]">
                    {/* Conversations sidebar */}
                    <div className={`${showMobileConversations ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
                                <button
                                    className="md:hidden p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setShowMobileConversations(false)}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative mt-3">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                        No conversations yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Start a new conversation by claiming a doubt
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map(conversation => {
                                    const otherUser = getOtherUser(conversation);
                                    const isActive = activeConversation?._id === conversation._id;
                                    const isOnline = onlineUsers.includes(otherUser?._id);

                                    return (
                                        <div
                                            key={conversation._id}
                                            className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                            onClick={() => {
                                                setActiveConversation(conversation);
                                                navigate(`/messages/${conversation._id}`);
                                                setShowMobileConversations(false);
                                                markMessagesAsRead(conversation._id);
                                            }}
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                    {otherUser?.avatar ? (
                                                        <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </div>
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                                                )}
                                                {conversation.unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {otherUser?.name || 'Unknown User'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDistanceToNow(new Date(conversation.lastMessage), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {conversation.lastMessagePreview || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Messages area */}
                    <div className={`${!showMobileConversations ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-white dark:bg-gray-800`}>
                        {activeConversation ? (
                            <>
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <button
                                            className="md:hidden p-1 mr-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => setShowMobileConversations(true)}
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                {getOtherUser(activeConversation)?.avatar ? (
                                                    <img
                                                        src={getOtherUser(activeConversation).avatar}
                                                        alt={getOtherUser(activeConversation).name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </div>
                                            {onlineUsers.includes(getOtherUser(activeConversation)?._id) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {getOtherUser(activeConversation)?.name || 'Unknown User'}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {getOtherUser(activeConversation)?.role === 'senior' ? 'Senior' : 'Junior'}
                                                {otherUserTyping && ' • typing...'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                                No messages yet
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Start the conversation with {getOtherUser(activeConversation)?.name || 'this user'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map(message => (
                                                <div
                                                    key={message._id}
                                                    className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.sender._id === user._id
                                                            ? 'bg-primary-500 text-white rounded-br-none'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                                                            }`}
                                                    >
                                                        <p>{message.content}</p>
                                                        <p className={`text-xs mt-1 ${message.sender._id === user._id ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <form onSubmit={handleSendMessage} className="flex items-center">
                                        <div className="flex items-center space-x-2 mr-2">
                                            <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
                                                <Smile className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTyping(e.target.value.length > 0);
                                            }}
                                            onBlur={() => handleTyping(false)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-r-md transition-colors"
                                            disabled={!newMessage.trim()}
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6">
                                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                                    Choose an existing conversation from the sidebar
                                </p>
                                <button
                                    onClick={() => setShowMobileConversations(true)}
                                    className="btn-primary inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    View Conversations
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;