import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Code2, Trophy, Wrench, Mic2, LayoutGrid, Layers } from 'lucide-react';
import './EventCategories.css';

const CATEGORIES = [
  { name: 'Cultural', icon: Music, label: 'Cultural Fests & Arts' },
  { name: 'Technical', icon: Code2, label: 'Hackathons & Coding' },
  { name: 'Sports', icon: Trophy, label: 'Tournaments & Athletics' },
  { name: 'Workshop', icon: Wrench, label: 'Hands-on Bootcamps' },
  { name: 'Seminar', icon: Mic2, label: 'Keynotes & Lectures' },
  { name: 'Others', icon: LayoutGrid, label: 'Food, Games & Social' }
];

export const EventCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/explore?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle-pill">
            <Layers size={14} />
            <span>Curated Campus Genres</span>
          </div>
          <h2 className="section-main-title">Explore by Category</h2>
          <p className="section-description">
            Filter through college festivals, coding marathons, athletics, and masterclasses designed for your interests.
          </p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => handleCategoryClick(cat.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryClick(cat.name);
                  }
                }}
                aria-label={`Browse ${cat.name} events`}
              >
                <div className="category-icon-wrapper">
                  <IconComponent size={26} strokeWidth={2} />
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-action-text">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

