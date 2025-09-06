import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, userProfile, loading, error, logout, updateUserProfile } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    phone: '',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data when editing starts
  React.useEffect(() => {
    if (isEditing) {
      const displayProfile = userProfile || user;
      setFormData({
        displayName: displayProfile?.displayName || '',
        username: userProfile?.username || '',
        phone: userProfile?.phone || '',
        bio: userProfile?.bio || ''
      });
      setFormErrors({});
    }
  }, [isEditing, user, userProfile]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    if (formData.username && formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: '',
      username: '',
      phone: '',
      bio: ''
    });
    setFormErrors({});
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare update data (only include changed fields)
      const updates = {};
      
      if (formData.displayName !== (userProfile?.displayName || user?.displayName)) {
        updates.displayName = formData.displayName;
      }
      
      if (formData.username !== (userProfile?.username || '')) {
        updates.username = formData.username;
      }
      
      if (formData.phone !== (userProfile?.phone || '')) {
        updates.phone = formData.phone;
      }
      
      if (formData.bio !== (userProfile?.bio || '')) {
        updates.bio = formData.bio;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
      setIsEditing(false);
      setFormErrors({});
      
    } catch (err) {
      console.error('Profile update failed:', err);
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const displayProfile = userProfile || user;

  return (
    <div className="min-h-screen gradient-main">
      <Navbar />

      {/* Profile Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center fade-in">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              My Profile
            </h1>
            <p className="text-gray-600 text-xl">
              Manage your account and marketplace activity
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="glass border border-accent border-opacity-30 rounded-2xl p-6 mb-8 fade-in">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-lg text-primary font-semibold">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              className="mb-6"
            />
          )}

          {/* Profile Card */}
          <div className="card-elevated overflow-hidden slide-up">
            {/* Profile Header */}
            <div className="gradient-primary p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 relative z-10">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={displayProfile?.photoURL || '/default-avatar.png'}
                      alt="Profile"
                      className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayProfile?.displayName || 'User')}&background=67C090&color=fff&size=128`;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full border-4 border-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Basic Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {displayProfile?.displayName || 'User'}
                  </h2>
                  <p className="text-blue-100 text-lg mb-4">
                    {displayProfile?.email}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ✨ Active Member
                    </span>
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      🔄 Sustainability Champion
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                    className="btn-glass px-6 py-3"
                  >
                    {isEditing ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              {!isEditing ? (
                // Display Mode
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-primary">
                        Personal Information
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Display Name
                        </label>
                        <p className="text-gray-900 text-lg font-medium">
                          {displayProfile?.displayName || 'Not set'}
                        </p>
                      </div>
                      
                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Email Address
                        </label>
                        <p className="text-gray-900 text-lg font-medium">
                          {displayProfile?.email}
                        </p>
                      </div>

                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Username
                        </label>
                        <p className="text-gray-900 text-lg font-medium">
                          {userProfile?.username || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-primary">
                        Additional Information
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Phone Number
                        </label>
                        <p className="text-gray-900 text-lg font-medium">
                          {userProfile?.phone || 'Not set'}
                        </p>
                      </div>

                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Bio
                        </label>
                        <p className="text-gray-900 text-lg font-medium leading-relaxed min-h-[100px]">
                          {userProfile?.bio || 'Tell us about yourself...'}
                        </p>
                      </div>

                      <div className="glass p-4 rounded-2xl">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Member Since
                        </label>
                        <p className="text-gray-900 text-lg font-medium">
                          {userProfile?.createdAt ? 
                            new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 
                            'Recently joined'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-6">
                    Edit Profile Information
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Display Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name *
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.displayName ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your display name"
                        />
                        {formErrors.displayName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
                        )}
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Choose a username"
                        />
                        {formErrors.username && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your phone number"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Email (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={displayProfile?.email || ''}
                          disabled
                          className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className={`input-field resize-none ${formErrors.bio ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        {formErrors.bio && (
                          <p className="text-sm text-red-600">{formErrors.bio}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="small" color="white" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Actions */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary">
                    Quick Actions
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    to="/"
                    className="card p-6 text-center hover:scale-105 transform transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-primary mb-2">Browse Items</h4>
                    <p className="text-gray-600 text-sm">Discover pre-owned treasures</p>
                  </Link>
                  
                  <button className="card p-6 text-center hover:scale-105 transform transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-primary mb-2">Download Data</h4>
                    <p className="text-gray-600 text-sm">Export your information</p>
                  </button>
                  
                  <button className="card p-6 text-center hover:scale-105 transform transition-all duration-300 group border-red-200 hover:border-red-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-red-600 mb-2">Delete Account</h4>
                    <p className="text-gray-600 text-sm">Permanently remove account</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;