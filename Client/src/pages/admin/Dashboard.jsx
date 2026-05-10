import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/admin?status=${statusFilter}`, config);
        if (isMounted) {
          setNews(data.news);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchNews();

    const interval = setInterval(() => {
      fetchNews();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [statusFilter, user?.token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/news/${id}`, config);
      setNews(news.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. You might not have permission.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/news/${id}`, { status: newStatus }, config);
      setNews(news.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const getStatusBadge = (status, isBreaking) => {
    if (isBreaking) {
      return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-accent text-white">Breaking</span>;
    }
    switch (status) {
      case 'Published':
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-black text-white">Published</span>;
      case 'Draft':
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-transparent text-[#666] border border-[#ccc]">Draft</span>;
      case 'In-review':
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-[#e0e0e0] text-[#333]">In-review</span>;
      case 'Scheduled':
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-[#f0f0f0] text-[#333]">Scheduled</span>;
      case 'Scheduled-Live':
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-black text-white">Published</span>;
      default:
        return <span className="inline-block px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[1px] bg-gray-200 text-black">{status}</span>;
    }
  };

  return (
    <div>
      <div className="py-6 px-8 border-b border-border bg-white">
        <h1 className="font-serif text-[1.8rem] m-0">Dashboard</h1>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="font-serif text-[2rem] mb-2">News Management</h2>
            <p className="text-muted text-[0.9rem]">Manage and monitor all editorial content across the platform.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            {user?.role === 'admin' && (
              <button className="btn bg-gray-100 text-primary border border-border flex items-center gap-2 hover:bg-gray-200" onClick={() => navigate('/admin/add-writer')}>
                <Plus size={16} /> Add Writer
              </button>
            )}
            <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate(user?.role === 'writer' ? '/writer/editor' : '/admin/editor')}>
              <Plus size={16} /> New Draft
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-border p-4 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {['All', 'Draft', 'Scheduled', 'In-review', 'Published'].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 hover:border-2 hover:scale-110 hover:border-blue-300 border-blue-500 border border-border rounded-xl cursor-pointer text-[0.85rem] transition-colors duration-200 ${statusFilter === status ? 'bg-[#f0f0f0] font-semibold' : 'bg-white font-normal hover:bg-gray-50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-auto">
              <Search size={16} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#888]" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="input-control pl-[35px] w-full lg:w-[250px]" 
              />
            </div>
          </div>

          {loading ? (
            <div className="loader"></div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px]">TITLE</th>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px]">AUTHOR</th>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px]">CATEGORY</th>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px]">STATUS</th>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px]">DATE</th>
                      <th className="p-4 text-left border-b border-border text-[0.75rem] uppercase text-muted tracking-[1px] text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map(item => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4 text-left border-b border-border font-semibold">
                          <Link to={`${user?.role === 'writer' ? '/writer/editor' : '/admin/editor'}?id=${item._id}`} className="hover:text-accent">
                            {item.isBreaking && <span className="text-red-500 mr-1">&bull;</span>}{item.title}
                          </Link>
                        </td>
                        <td className="p-4 text-left border-b border-border text-muted">{item.author}</td>
                        <td className="p-4 text-left border-b border-border">
                          <span className="text-[0.7rem] font-semibold bg-[#f0f0f0] px-2 py-1 tracking-[1px] uppercase text-[#333]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-left border-b border-border">
                          {getStatusBadge(
                            item.status === 'Scheduled' && item.scheduleDate && new Date(item.scheduleDate) <= new Date() ? 'Scheduled-Live' : item.status, 
                            item.isBreaking
                          )}
                        </td>
                        <td className="p-4 text-left border-b border-border text-muted text-[0.85rem]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </td>
                        <td className="p-4 text-right border-b border-border">
                          <div className="flex gap-2 justify-end items-center">
                            {user?.role === 'admin' && item.status === 'In-review' && (
                              <>
                                <button onClick={() => handleStatusChange(item._id, item.scheduleDate && new Date(item.scheduleDate) > new Date() ? 'Scheduled' : 'Published')} className="bg-[#e6f4ea] text-[#137333] px-2 py-1 text-xs rounded hover:bg-[#ceead6] cursor-pointer hover:scale-110">Approve</button>
                                <button onClick={() => handleStatusChange(item._id, 'Draft')} className="bg-[#fce8e6] text-[#c5221f] px-2 py-1 text-xs rounded hover:bg-[#fad2cf] cursor-pointer hover:scale-110">Reject</button>
                              </>
                            )}
                            <button onClick={() => navigate(`${user?.role === 'writer' ? '/writer/editor' : '/admin/editor'}?id=${item._id}`)} className="bg-gray-100 text-primary px-2 py-1 text-xs rounded hover:bg-gray-200 cursor-pointer hover:scale-110">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="bg-red-50 text-red-600 px-2 py-1 text-xs rounded hover:bg-red-100 cursor-pointer hover:scale-110">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden flex flex-col -mx-4 border-t border-border">
                {news.map(item => (
                  <div key={item._id} className="border-b border-border bg-white flex flex-col">
                    <div 
                      className="p-4 flex flex-col gap-3 cursor-pointer"
                      onClick={() => toggleRow(item._id)}
                    >
                      <div className="font-bold text-[1rem] leading-tight text-black">
                        {item.isBreaking && <span className="text-red-500 mr-1">&bull;</span>}{item.title}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[0.65rem] font-bold bg-[#f0f0f0] px-2 py-1 tracking-[1px] uppercase text-[#333]">
                            {item.category}
                          </span>
                          {getStatusBadge(
                            item.status === 'Scheduled' && item.scheduleDate && new Date(item.scheduleDate) <= new Date() ? 'Scheduled-Live' : item.status, 
                            item.isBreaking
                          )}
                        </div>
                        <ChevronDown size={20} className={`text-black transition-transform duration-300 ${expandedRow === item._id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedRow === item._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1">
                            <div className="border-t border-[#eee] pt-4 flex flex-col gap-2">
                              <div className="text-[0.9rem]">
                                <span className="font-bold text-black">Author:</span> <span className="uppercase text-[#444] ml-1">{item.author}</span>
                              </div>
                              <div className="text-[0.9rem]">
                                <span className="font-bold text-black">Date:</span> <span className="text-[#444] ml-1">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}
                                </span>
                              </div>
                              
                              <div className="flex gap-3 mt-3">
                                {user?.role === 'admin' && item.status === 'In-review' && (
                                  <>
                                    <button onClick={() => handleStatusChange(item._id, item.scheduleDate && new Date(item.scheduleDate) > new Date() ? 'Scheduled' : 'Published')} className="bg-[#e6f4ea] text-[#137333] px-4 py-1.5 text-[0.85rem] rounded font-medium">Approve</button>
                                    <button onClick={() => handleStatusChange(item._id, 'Draft')} className="bg-[#fce8e6] text-[#c5221f] px-4 py-1.5 text-[0.85rem] rounded font-medium">Reject</button>
                                  </>
                                )}
                                <button onClick={() => navigate(`${user?.role === 'writer' ? '/writer/editor' : '/admin/editor'}?id=${item._id}`)} className="bg-[#e2e8f0] text-[#334155] px-4 py-1.5 text-[0.85rem] rounded font-medium">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="bg-[#fee2e2] text-[#ef4444] px-4 py-1.5 text-[0.85rem] rounded font-medium">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
