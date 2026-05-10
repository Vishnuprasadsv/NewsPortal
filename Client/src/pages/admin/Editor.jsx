import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Quote, Upload } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Editor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Politics',
    author: user ? `${user.firstName} ${user.lastName}` : 'System Administrator',
    content: '',
    tags: '',
    imageUrl: '',
    status: 'Draft',
    isBreaking: false,
    scheduleDate: ''
  });


  const [uploadingImage, setUploadingImage] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (id) {

      const fetchNews = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/${id}`);
          if (user?.role === 'writer' && data.user !== user._id) {
            alert('Unauthorized to edit this post');
            navigate('/writer/dashboard');
            return;
          }
          setFormData({
            title: data.title,
            category: data.category,
            author: data.user ? `${data.user.firstName} ${data.user.lastName}` : data.author,
            content: data.content,
            tags: data.tags.join(', '),
            imageUrl: data.imageUrl,
            status: data.status,
            isBreaking: data.isBreaking,
            scheduleDate: data.scheduleDate ? new Date(data.scheduleDate).toISOString().slice(0, 16) : ''
          });
        } catch (error) {
          console.error('Error fetching article:', error);
        }
      };
      fetchNews();
    }
  }, [id, user, navigate]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, uploadData, config);
      setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (statusOverride) => {
    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/news/${id}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/news`, payload, config);
      }
      
      setShowScheduleModal(false);
      navigate(user?.role === 'writer' ? '/writer/dashboard' : '/admin/dashboard');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/news/${id}`, config);
      navigate(user?.role === 'writer' ? '/writer/dashboard' : '/admin/dashboard');
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  return (
    <div>
      <div className="py-6 px-8 border-b border-border bg-white">
        <h1 className="font-serif text-[1.8rem] m-0">Dashboard</h1>
      </div>

      <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Main Editor */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded shadow-sm border border-border p-4 md:p-8 mb-8">
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Article Title..." 
              className="w-full font-serif text-[2.5rem] font-bold border-none border-b border-border pb-4 mb-6 focus:outline-none focus:border-primary" 
            />
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-[0.75rem] font-semibold text-muted mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-control p-2">
                  {['Politics', 'Economy', 'Technology', 'Culture', 'Science'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[0.75rem] font-semibold text-muted mb-1">Author</label>
                <input type="text" name="author" value={formData.author} readOnly disabled className="input-control p-2 bg-gray-100 cursor-not-allowed" />
              </div>
            </div>

            <ReactQuill 
              theme="snow"
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              modules={modules}
              className="w-full min-h-[400px] mb-8"
              placeholder="Start writing..."
            />
          </div>
        </div>

        {/* Right Column - Sidebar  */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 shrink-0">
          
          <div className="bg-white rounded shadow-sm border border-border p-6">
            <h3 className="text-[0.85rem] uppercase tracking-[1px] mb-4 border-b border-border pb-2">PUBLISHING ACTIONS</h3>
            
            <div className="flex items-center mb-4 gap-2">
              <input type="checkbox" id="isBreaking" name="isBreaking" checked={formData.isBreaking} onChange={handleChange} />
              <label htmlFor="isBreaking" className="text-[0.85rem] font-semibold text-accent cursor-pointer">Mark as Breaking News</label>
            </div>

            <button onClick={() => handleSave('In-review')} className="btn btn-primary w-full mb-2 p-3 flex justify-center items-center gap-2">
              <span>&#9658; Send for Approval</span>
            </button>
            <button onClick={() => handleSave('Draft')} className="btn w-full mb-2 p-3 bg-white border border-border text-primary hover:bg-gray-50 flex justify-center items-center gap-2">
              <span>&#128190; Save as Draft</span>
            </button>
            <button onClick={() => setShowScheduleModal(true)} className="btn w-full p-3 bg-white border border-border text-primary hover:bg-gray-50 flex justify-center items-center gap-2">
              <span>&#128336; Schedule</span>
            </button>
            {user?.role === 'admin' && formData.status === 'In-review' ? (
              <div className="flex gap-2 w-full mt-2">
                <button onClick={() => handleSave(formData.scheduleDate && new Date(formData.scheduleDate) > new Date() ? 'Scheduled' : 'Published')} className="btn flex-1 p-3 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] hover:bg-[#ceead6]">
                  Approve
                </button>
                <button onClick={() => handleSave('Draft')} className="btn flex-1 p-3 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] hover:bg-[#fad2cf]">
                  Reject
                </button>
              </div>
            ) : user?.role !== 'writer' ? (
              <button onClick={() => handleSave('Published')} className="btn w-full mt-2 p-3 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] hover:bg-[#ceead6]">
                Publish Now
              </button>
            ) : null}
          </div>

          <div className="bg-white rounded shadow-sm border border-border p-6">
            <h3 className="text-[0.85rem] uppercase tracking-[1px] mb-4 border-b border-border pb-2">METADATA</h3>
            
            <div className="mb-4">
              <label className="block text-[0.75rem] font-semibold text-muted mb-1">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Add tags separated by comma..." className="input-control p-2" />
            </div>

            <div>
              <label className="block text-[0.75rem] font-semibold text-muted mb-1">Featured Image</label>
              
              <div className="mb-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="btn bg-gray-100 text-primary border border-border w-full py-2 flex justify-center items-center gap-2 text-xs"
                  disabled={uploadingImage}
                >
                  <Upload size={14} />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>

              {formData.imageUrl ? (
                <div className="relative group mt-2">
                  <img src={formData.imageUrl} alt="Featured" className="w-full h-[150px] object-cover rounded" />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))} 
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-full h-[150px] bg-[#f4f4f5] flex flex-col items-center justify-center rounded border border-dashed border-border mt-2">
                  <ImageIcon size={24} color="#aaa" className="mb-2" />
                  <span className="text-xs text-muted">No image selected</span>
                </div>
              )}
            </div>
          </div>

          {id && (
            <button onClick={handleDelete} className="btn w-full p-3 bg-white border border-[#fce8e6] text-accent hover:bg-[#fce8e6]">
              Delete Post
            </button>
          )}

        </div>

      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="font-serif text-2xl mb-4">Schedule Article</h2>
            <p className="text-sm text-muted mb-6">Select a date and time. This article will be automatically published at the chosen time.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Date & Time</label>
              <input 
                type="datetime-local" 
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                className="input-control w-full"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="btn w-full bg-gray-100 text-primary border border-border hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSave(user?.role === 'writer' ? 'In-review' : 'Scheduled')}
                disabled={!formData.scheduleDate}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {user?.role === 'writer' ? 'Schedule (Needs Approval)' : 'Schedule Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
