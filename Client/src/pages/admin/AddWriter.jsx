import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AddWriter = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If not admin, redirect
  if (user?.role !== 'admin') {
    return <div className="p-8 text-center">Unauthorized access. Only Admins can add writers.</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        role: 'writer'
      });
      
      setSuccess(true);
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add writer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="py-6 px-8 border-b border-border bg-white">
        <h1 className="font-serif text-[1.8rem] m-0">Add Writer</h1>
      </div>

      <div className="p-8 max-w-[600px] mx-auto mt-8">
        <div className="bg-white rounded shadow-sm border border-border p-8">
          <h2 className="font-serif text-[1.5rem] mb-6">Create Writer Account</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          {success && <div className="bg-[#e6f4ea] text-[#137333] p-3 rounded mb-4 text-sm">Writer account created successfully! Redirecting...</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.85rem] font-semibold text-muted mb-2">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="input-control" 
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-[0.85rem] font-semibold text-muted mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="input-control" 
                placeholder="writer@chronicle.com"
              />
            </div>

            <div>
              <label className="block text-[0.85rem] font-semibold text-muted mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength={6}
                className="input-control" 
                placeholder="Enter strong password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary mt-4 py-3">
              {loading ? 'Creating Account...' : 'Add Writer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWriter;
