import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const getExcerpt = (html) => {
  if (!html) return '';
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const Category = () => {
  const { name } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

// Side Effects
  useEffect(() => {

    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news?status=Published&category=${name}`);
        setNews(data.news);
      } catch (error) {
        console.error('Error fetching category news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [name]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-12 pb-16">
      <div className="border-b-[2px] border-black pb-4 mb-8">
        <h1 className="font-serif text-4xl uppercase">{name}</h1>
      </div>
      
      {loading ? (
        <div className="loader mt-8"></div>
      ) : news.length === 0 ? (
        <p className="text-muted font-semibold">No published articles found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {news.map((item) => (
            <Link key={item._id} to={`/article/${item._id}`} className="block border border-border p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
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
              <p className="text-[0.85rem] text-[#555] line-clamp-3 break-words mt-2">
                {getExcerpt(item.content)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
