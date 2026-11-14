import React from 'react';
import { Link } from 'react-router-dom';
import { FACETS } from '@/src/data/catalogService';
import { useApp } from '@/src/context/AppContext';

export const GenresPage: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('nav.genres')}</h1>
          <span className="page-subtitle">{FACETS.genres.length} genres</span>
        </div>
      </div>

      <div className="genres-grid">
        {FACETS.genres.map((g) => (
          <Link
            key={g.name}
            to={`/anime?genre=${encodeURIComponent(g.name)}`}
            className="genre-row"
          >
            <span className="genre-row__name">{g.name}</span>
            <span className="genre-row__count">{g.count.toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
