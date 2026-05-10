import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user?.role === 'writer') {
        navigate('/writer/dashboard');
      } else {
        setError('Unauthorized access. Admin or Writer role required.');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9f9f9]">
      <div className="text-center mb-8">
        <h1 className="font-serif text-[2.5rem] tracking-[-1px] mb-2">THE CHRONICLE</h1>
        <p className="text-muted text-[0.9rem]">Administration Portal</p>
      </div>

      <div className="bg-white p-10 w-full max-w-[400px] border border-border shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
        {error && <div className="text-red-500 mb-4 text-[0.85rem]">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[0.75rem] uppercase tracking-[1px] mb-1 font-semibold">Email ID</label>
            <input 
              type="email" 
              className="input-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-[0.75rem] uppercase tracking-[1px] font-semibold">Password</label>
            </div>
            <input 
              type="password" 
              className="input-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-full flex justify-center items-center gap-2 p-3 mt-6">
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <div className="mt-8 text-[0.7rem] text-[#888] tracking-[1px] uppercase">
        &bull; AUTHORIZED PERSONNEL ONLY &bull; 
        
      </div>
    </div>
  );
};

export default Login;
