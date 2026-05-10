import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { User as UserIcon, Upload } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext); 
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [message, setMessage] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };



  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, profileData, config);
      updateUser(data);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, payload, config);
      setMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className="py-6 px-8 border-b border-border bg-white">
        <h1 className="font-serif text-[1.8rem] m-0">Settings</h1>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Column - User Info Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded shadow-sm border border-border p-5 sm:p-6 lg:p-8 text-center">
            
            <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] lg:w-[120px] lg:h-[120px] mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-100">
              <UserIcon size={48} color="#ccc" />
            </div>
            
            <h2 className="font-serif text-[1.3rem] sm:text-[1.5rem] mb-1 break-words">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-muted text-[0.8rem] uppercase tracking-[1px] mb-8">{user?.role === 'writer' ? 'Content Creator' : 'Chief Editor'}</p>
            
            <div className="text-left text-[0.85rem]">
              <div className="mb-4">
                <strong className="block text-muted">Email Address</strong>
                {user?.email}
              </div>
              <div className="mb-4">
                <strong className="block text-muted">Clearance Level</strong>
                {user?.role === 'admin' && 'Level 1 (Full Access)'}
                {user?.role === 'writer' && 'Level 3 (Content Access)'} <br />
                {user?.role === 'writer' && '(Admin Approved)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full flex-1 flex flex-col gap-6 lg:gap-8">
          {message && <div className="p-3 sm:p-4 bg-[#e6f4ea] text-[#137333] rounded text-sm sm:text-base break-words">{message}</div>}
          
          <div className="bg-white rounded shadow-sm border border-border p-5 sm:p-6 lg:p-8 w-full">
            <h2 className="font-serif text-[1.5rem] mb-2 border-b border-border pb-4">My Profile</h2>
            <p className="text-muted text-[0.9rem] mb-6">Update your personal information and contact details.</p>
            
            <form onSubmit={submitProfile}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="w-full flex-1">
                  <label className="block text-[0.75rem] font-semibold text-muted mb-1">First Name</label>
                  <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} disabled={user?.role === 'writer'} className={`input-control ${user?.role === 'writer' ? 'bg-gray-100 cursor-not-allowed text-muted' : ''}`} />
                </div>
                <div className="w-full flex-1">
                  <label className="block text-[0.75rem] font-semibold text-muted mb-1">Last Name</label>
                  <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} disabled={user?.role === 'writer'} className={`input-control ${user?.role === 'writer' ? 'bg-gray-100 cursor-not-allowed text-muted' : ''}`} />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[0.75rem] font-semibold text-muted mb-1">Author Bio (Optional)</label>
                <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} className="input-control min-h-[100px] resize-y w-full" placeholder="Brief biography for article bylines..."></textarea>
              </div>
              <div className="flex justify-center sm:justify-end">
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded shadow-sm border border-border p-5 sm:p-6 lg:p-8 w-full">
            <h2 className="font-serif text-[1.5rem] mb-2 border-b border-border pb-4">Change Password</h2>
            <p className="text-muted text-[0.9rem] mb-6">Ensure your account uses a long, random password to stay secure.</p>
            
            <form onSubmit={submitPassword}>
              <div className="mb-4">
                <label className="block text-[0.75rem] font-semibold text-muted mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="input-control w-full sm:max-w-[400px]"/>
              </div>
              <div className="mb-6">
                <label className="block text-[0.75rem] font-semibold text-muted mb-1">New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input-control w-full sm:max-w-[400px]" />
              </div>
              <div className="flex justify-center sm:justify-start">
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
