import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // side effects
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/${id}`);
        setArticle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="loader mt-8"></div>;
  if (!article) return <div className="max-w-[800px] mx-auto px-4 pt-16 text-center font-serif text-2xl">Article not found.</div>;

  return (
    <div className="max-w-[800px] mx-auto px-4 pt-8 pb-16">
      <div className="mb-8">
        <Link to={`/category/${article.category}`} className="text-muted text-[0.8rem] font-bold tracking-[1px] mb-4 uppercase inline-block hover:text-accent transition-colors">
          {article.category}
        </Link>
        <h1 className="font-serif text-[2.5rem] md:text-[4rem] leading-[1.1] tracking-[-1px] mb-6 break-words">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-muted text-[0.85rem] font-semibold border-b border-border pb-6 mb-8">
          <span>By <span className="text-primary">{article.user ? `${article.user.firstName} ${article.user.lastName}` : article.author}</span></span>
          <span>&bull;</span>
          <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {article.imageUrl && (
        <div className="mb-10">
          <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div 
        className="font-sans text-[1.1rem] leading-[1.8] text-[#333] ql-editor px-0" 
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />

      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-2">
          {article.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-muted text-[0.75rem] font-bold uppercase tracking-wider rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Article;
