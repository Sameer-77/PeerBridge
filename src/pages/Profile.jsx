// // pages/Profile.jsx
// import React, { useState, useEffect } from 'react'
// import { useAuth } from '../contexts/AuthContext'
// import axios from 'axios'
// import { toast } from 'react-hot-toast'
// import {
//     User,
//     Mail,
//     BookOpen,
//     Award,
//     Clock,
//     TrendingUp,
//     Edit,
//     Check,
//     X
// } from 'lucide-react'

// const Profile = () => {
//     const { user, logout } = useAuth()
//     const [profile, setProfile] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [isEditing, setIsEditing] = useState(false)
//     const [formData, setFormData] = useState({
//         name: '',
//         bio: '',
//         skills: ''
//     })

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const response = await axios.get(`/api/users/profile/${user._id}`)
//                 setProfile(response.data)
//                 setFormData({
//                     name: response.data.name,
//                     bio: response.data.bio || '',
//                     skills: (response.data.skills || []).join(', ')
//                 })
//             } catch (error) {
//                 toast.error('Failed to fetch profile')
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchProfile()
//     }, [user._id])

//     const handleUpdateProfile = async () => {
//         try {
//             const updatedData = {
//                 name: formData.name,
//                 bio: formData.bio,
//                 skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
//             }

//             const response = await axios.put('/api/users/profile', updatedData)
//             setProfile(response.data)
//             setIsEditing(false)
//             toast.success('Profile updated successfully!')
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update profile')
//         }
//     }

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
//             </div>
//         )
//     }

//     if (!profile) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div>Profile not found</div>
//             </div>
//         )
//     }

//     return (
//         <div className="max-w-4xl mx-auto animate-fade-in">
//             <div className="card p-6 mb-6">
//                 <div className="flex justify-between items-start mb-6">
//                     <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
//                     {isEditing ? (
//                         <div className="flex space-x-2">
//                             <button
//                                 onClick={handleUpdateProfile}
//                                 className="btn-success flex items-center"
//                             >
//                                 <Check className="w-5 h-5 mr-1" />
//                                 Save
//                             </button>
//                             <button
//                                 onClick={() => setIsEditing(false)}
//                                 className="btn-danger flex items-center"
//                             >
//                                 <X className="w-5 h-5 mr-1" />
//                                 Cancel
//                             </button>
//                         </div>
//                     ) : (
//                         <button
//                             onClick={() => setIsEditing(true)}
//                             className="btn-primary flex items-center"
//                         >
//                             <Edit className="w-5 h-5 mr-1" />
//                             Edit Profile
//                         </button>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div>
//                         <h2 className="text-lg font-semibold mb-4 flex items-center">
//                             <User className="w-5 h-5 mr-2" />
//                             Personal Information
//                         </h2>
//                         {isEditing ? (
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={formData.name}
//                                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                         className="input-field"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Bio
//                                     </label>
//                                     <textarea
//                                         value={formData.bio}
//                                         onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                                         className="input-field h-32"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Skills (comma separated)
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={formData.skills}
//                                         onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
//                                         className="input-field"
//                                     />
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="space-y-4">
//                                 <div className="flex items-center">
//                                     <span className="font-medium w-24">Name:</span>
//                                     <span>{profile.name}</span>
//                                 </div>
//                                 <div className="flex items-start">
//                                     <span className="font-medium w-24">Bio:</span>
//                                     <span>{profile.bio || 'Not provided'}</span>
//                                 </div>
//                                 <div className="flex items-start">
//                                     <span className="font-medium w-24">Skills:</span>
//                                     <div className="flex flex-wrap gap-2">
//                                         {profile.skills?.length > 0 ? (
//                                             profile.skills.map((skill, index) => (
//                                                 <span
//                                                     key={index}
//                                                     className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
//                                                 >
//                                                     {skill}
//                                                 </span>
//                                             ))
//                                         ) : (
//                                             <span>No skills listed</span>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <div>
//                         <h2 className="text-lg font-semibold mb-4 flex items-center">
//                             <Mail className="w-5 h-5 mr-2" />
//                             Account Information
//                         </h2>
//                         <div className="space-y-4">
//                             <div className="flex items-center">
//                                 <span className="font-medium w-24">Email:</span>
//                                 <span>{profile.email}</span>
//                             </div>
//                             <div className="flex items-center">
//                                 <span className="font-medium w-24">Role:</span>
//                                 <span className="capitalize">{profile.role}</span>
//                             </div>
//                             <div className="flex items-center">
//                                 <span className="font-medium w-24">Member since:</span>
//                                 <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//                 <div className="card p-6">
//                     <div className="flex items-center">
//                         <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
//                             <BookOpen className="w-6 h-6 text-primary-500" />
//                         </div>
//                         <div className="ml-4">
//                             <p className="text-sm font-medium text-gray-600">Doubts Posted</p>
//                             <p className="text-2xl font-bold text-gray-900">{profile.stats?.doubtsPosted || 0}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="card p-6">
//                     <div className="flex items-center">
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <Award className="w-6 h-6 text-green-500" />
//                         </div>
//                         <div className="ml-4">
//                             <p className="text-sm font-medium text-gray-600">Doubts Resolved</p>
//                             <p className="text-2xl font-bold text-gray-900">{profile.stats?.doubtsResolved || 0}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="card p-6">
//                     <div className="flex items-center">
//                         <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                             <Clock className="w-6 h-6 text-orange-500" />
//                         </div>
//                         <div className="ml-4">
//                             <p className="text-sm font-medium text-gray-600">Doubts Helped</p>
//                             <p className="text-2xl font-bold text-gray-900">{profile.stats?.doubtsHelped || 0}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="card p-6">
//                     <div className="flex items-center">
//                         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                             <TrendingUp className="w-6 h-6 text-purple-500" />
//                         </div>
//                         <div className="ml-4">
//                             <p className="text-sm font-medium text-gray-600">Points</p>
//                             <p className="text-2xl font-bold text-gray-900">{profile.points || 0}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex justify-end">
//                 <button
//                     onClick={logout}
//                     className="btn-danger"
//                 >
//                     Logout
//                 </button>
//             </div>
//         </div>
//     )
// }

// export default Profile


import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    User,
    Mail,
    BookOpen,
    Award,
    Clock,
    TrendingUp,
    Edit,
    Check,
    X
} from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`/api/users/profile/${user._id}`);
                setProfile(response.data);
                setFormData({
                    name: response.data.name,
                    bio: response.data.bio || '',
                    skills: (response.data.skills || []).join(', ')
                });
            } catch (error) {
                toast.error('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user._id]);

    const handleUpdateProfile = async () => {
        try {
            const updatedData = {
                name: formData.name,
                bio: formData.bio,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
            };

            const response = await axios.put('/api/users/profile', updatedData);
            setProfile(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-800 dark:text-gray-200">Profile not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pt-20 pb-6 px-4 md:px-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Profile</h1>
                    {isEditing ? (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleUpdateProfile}
                                className="btn-success flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Check className="w-5 h-5 mr-1" />
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="btn-danger flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 mr-1" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Edit className="w-5 h-5 mr-1" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
                            <User className="w-5 h-5 mr-2 text-primary-500" />
                            Personal Information
                        </h2>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white h-32"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Skills (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                <div className="flex items-center">
                                    <span className="font-medium w-24">Name:</span>
                                    <span className="text-gray-800 dark:text-white">{profile.name}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium w-24">Bio:</span>
                                    <span className="text-gray-800 dark:text-white">{profile.bio || 'Not provided'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium w-24">Skills:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills?.length > 0 ? (
                                            profile.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">No skills listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Account Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
                            <Mail className="w-5 h-5 mr-2 text-primary-500" />
                            Account Information
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                                <span className="font-medium w-24">Email:</span>
                                <span className="text-gray-800 dark:text-white">{profile.email}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-24">Role:</span>
                                <span className="capitalize text-gray-800 dark:text-white">{profile.role}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-24">Member since:</span>
                                <span className="text-gray-800 dark:text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doubts Posted</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.doubtsPosted || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-green-500 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doubts Resolved</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.doubtsResolved || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doubts Helped</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.doubtsHelped || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.points || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end">
                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;