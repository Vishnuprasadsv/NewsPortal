import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  return (
    <footer className="bg-primary text-secondary py-8 mt-8 md:py-16 md:mt-16">
      <div className="max-w-300 mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-serif text-2xl md:text-3xl text-white text-center md:text-left">THE CHRONICLE</div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted">
          <Link to="#" className="hover:text-accent text-gray-300">About</Link>
          <Link to="#" className="hover:text-accent text-gray-300">Archives</Link>
          <Link to="#" className="hover:text-accent text-gray-300">Masthead</Link>
          <Link to="#" className="hover:text-accent text-gray-300">Terms of Service</Link>
          <Link to="#" className="hover:text-accent text-gray-300">Privacy Policy</Link>
        </div>
      </div>
      <div className="max-w-300 mx-auto px-4 mt-6 md:mt-4 text-[0.65rem] md:text-xs text-muted text-center md:text-left">
        &copy; 2026 THE CHRONICLE. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
