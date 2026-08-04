import React, { useState } from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { DataService } from '../services/dataService';

export default function BlogPage({ setActiveTab, setSelectedBlogId }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const blogs = DataService.getBlogs();

  const categories = ['All', 'Kinh nghiệm thuê phòng', 'Tin tức Tiny Houses', 'Tuyển dụng'];

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge badge-warning">◆ Tin Tức & Cẩm Nang ◆</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: 8 }}>Blog Tiny Houses</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Chia sẻ kinh nghiệm thuê phòng, tin tức vận hành và cơ hội nghề nghiệp</p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 20px' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {filteredBlogs.map((blog) => (
            <div 
              key={blog.id} 
              className="card" 
              onClick={() => { setSelectedBlogId(blog.id); setActiveTab('blog-detail'); }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ height: 180, overflow: 'hidden' }}>
                <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 20 }}>
                <span className="badge badge-warning" style={{ fontSize: '0.75rem', marginBottom: 10 }}>{blog.category}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>{blog.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16, lineHeight: 1.5 }}>{blog.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <span>{blog.date}</span>
                  <span style={{ color: '#E8920A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Đọc tiếp <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
