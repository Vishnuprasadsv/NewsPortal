import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded text-sm font-semibold transition-colors duration-200 ${
    isActive
      ? 'bg-primary text-secondary'
      : 'text-primary hover:bg-gray-300 hover:scale-105'
  }`;

  return (
    <header className="bg-secondary border-b border-border py-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <Link to="/" className="font-serif text-2xl md:text-4xl font-bold tracking-tight shrink-0">THE CHRONICLE</Link>
          
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search news..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-[0.85rem] font-semibold border-2 border-border bg-[#f4f4f5] focus:bg-white focus:outline-none focus:border-accent w-64 lg:w-80 transition-all rounded-xl shadow-inner"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            </form>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="p-2 text-primary hover:bg-gray-100 rounded-full transition-colors">
                <Search size={24} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-primary hover:bg-gray-100 rounded-full transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-4 border-b border-border">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                placeholder="Search news..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full text-[1rem] font-semibold border-2 border-border bg-[#f4f4f5] focus:bg-white focus:outline-none focus:border-accent rounded-xl shadow-inner"
                autoFocus
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            </form>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row justify-center gap-2 md:gap-8 pt-4 pb-4 md:pb-0">
            <li><NavLink to="/" className={navClass}>HOME</NavLink></li>
            <li><NavLink to="/category/Politics" className={navClass}>POLITICS</NavLink></li>
            <li><NavLink to="/category/Economy" className={navClass}>ECONOMY</NavLink></li>
            <li><NavLink to="/category/Technology" className={navClass}>TECHNOLOGY</NavLink></li>
            <li><NavLink to="/category/Culture" className={navClass}>CULTURE</NavLink></li>
            <li><NavLink to="/category/Science" className={navClass}>SCIENCE</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
