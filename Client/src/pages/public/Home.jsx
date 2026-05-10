import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getExcerpt = (html) => {
  if (!html) return '';
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBreakingIndex, setCurrentBreakingIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news?status=Published`);
        setNews(data.news);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const breakingNewsList = news.filter(n => n.isBreaking);
    if (breakingNewsList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBreakingIndex((prev) => (prev + 1) % breakingNewsList.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [news]);

  if (loading) return <div className="loader mt-8"></div>;

  const breakingNewsList = news.filter(n => n.isBreaking);
  const breakingNews = breakingNewsList.length > 0 ? breakingNewsList[currentBreakingIndex] : null;
  
  // Exclude breaking news from Latest Reports
  const otherNews = news.filter(n => !n.isBreaking).slice(0, 8);

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8">
      {breakingNews && (
        <section className="mb-16 mt-4 relative overflow-hidden border-2 border-gray-200 shadow-xl/20 rounded-[20px] p-6 mx-2 md:mx-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={breakingNews._id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-8"
            >
              <div className="flex-1 min-w-0">
                {breakingNews.isBreaking && <span className="inline-block text-accent text-[0.7rem] font-bold uppercase tracking-[1px] mb-4 border border-accent px-2 py-1">BREAKING NEWS</span>}
                <span className={`text-muted text-[0.8rem] font-semibold uppercase ${breakingNews.isBreaking ? 'ml-4' : ''}`}>
                  {new Date(breakingNews.createdAt).toLocaleDateString()}
                </span>
                <h1 className="font-serif text-[2rem] md:text-[3.5rem] mt-4 mb-6 tracking-[-1px] leading-[1.2] break-words">
                  <Link to={`/article/${breakingNews._id}`} className="hover:text-accent transition-colors">{breakingNews.title}</Link>
                </h1>
                <p className="text-[1rem] md:text-[1.1rem] text-[#555] mb-8 leading-[1.8] line-clamp-3 break-words">
                  {getExcerpt(breakingNews.content)}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <p className="text-muted text-[0.85rem] font-semibold">
                    By {breakingNews.user ? `${breakingNews.user.firstName} ${breakingNews.user.lastName}` : breakingNews.author}
                  </p>
                </div>
                {breakingNews.isBreaking && (
                  <p className="text-accent text-[0.85rem] font-bold mt-4">
                    BREAKING NEWS
                  </p>
                )}
              </div>
              {breakingNews.imageUrl && (
                <div className="flex-1 flex items-center justify-center">
                  <Link to={`/article/${breakingNews._id}`} className="block w-full h-full">
                    <img src={breakingNews.imageUrl} alt={breakingNews.title} className="w-full h-full max-h-[400px] object-cover rounded-[12px] hover:opacity-90 transition-opacity" />
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center border-b-[2px] border-black pb-2 mb-8">
          <h2 className="font-serif text-3xl">Latest Reports</h2>
          <Link to="/category/All" className="text-muted text-[0.8rem] font-bold tracking-[1px] hover:text-accent">VIEW ALL &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {otherNews.map((item) => (
            <Link key={item._id} to={`/article/${item._id}`} className={`block border border-border p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white ${item.isBreaking ? 'border-accent border-2' : ''}`}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-[150px] object-cover mb-4 rounded" />
              )}
              <div className="text-muted text-[0.7rem] font-bold tracking-[1px] mb-2 uppercase flex justify-between items-center">
                <span>{item.category} <span className="font-normal">&bull; {new Date(item.createdAt).toLocaleDateString()}</span></span>
                {item.isBreaking && <span className="text-accent text-[0.6rem] border border-accent px-1 rounded">BREAKING</span>}
              </div>
              <h3 className="font-serif text-[1.1rem] md:text-[1.2rem] mb-4 leading-tight hover:text-accent transition-colors break-words">
                {item.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[0.7rem] text-muted font-semibold">{item.user ? `${item.user.firstName} ${item.user.lastName}` : item.author}</span>
              </div>

              <p className="text-[0.85rem] text-[#555] line-clamp-3 break-words">
                {getExcerpt(item.content)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
