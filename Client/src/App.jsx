import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/public/Header';
import Footer from './components/public/Footer';
import Home from './pages/public/Home';
import AdminLayout from './components/admin/AdminLayout';
import WriterLayout from './components/Writer/WriterLayout';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Editor from './pages/admin/Editor';
import Settings from './pages/admin/Settings';
import AddWriter from './pages/admin/AddWriter';
import Article from './pages/public/Article';
import Category from './pages/public/Category';
import Search from './pages/public/Search';


const PublicLayout = () => {
  return(
    <>
    <Header/>
    <main style={{minHeight: 'calc(100vh - 200px'}}>
      <Outlet/>
    </main>
    <Footer/>
    </>
  );
};
const App = () => {
  return (
     <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:name" element={<Category />} />
          <Route path="search" element={<Search />} />
          <Route path="article/:id" element={<Article />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="editor" element={<Editor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="add-writer" element={<AddWriter />} />
        </Route>

        {/* Writer Routes */}
        <Route path="/writer" element={<WriterLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="editor" element={<Editor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App