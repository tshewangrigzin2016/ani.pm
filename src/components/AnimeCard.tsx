import React from 'react';
import { Link } from 'react-router-dom';
import { Captions, Mic, Star } from 'lucide-react';
import type { AnimeTitle } from '@/src/types/anime';
import { useApp } from '@/src/context/AppContext';
import { getDisplayTitle } from '@/src/data/catalogService';
import { LibraryStatusTrigger } from './LibraryStatusTrigger';

import type { UpcomingBadgeInfo } from '@/src/utils/homeSchedule';

interface AnimeCardProps {
  anime: AnimeTitle;
  variant?: 'rail' | 'grid';
  anticipatedBadge?: UpcomingBadgeInfo;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, variant = 'rail', anticipatedBadge }) => {
  const { contentPrefs } = useApp();
  const title = getDisplayTitle(anime, contentPrefs.titleLanguage === 'original');
  const primaryGenre = anime.genres[0] ?? anime.type ?? 'Anime';
  const rootClass = variant === 'rail' ? 't10' : 'ac';
  const posterClass = variant === 'rail' ? 't10-poster' : 'ac-poster';
  const fadeClass = variant === 'rail' ? 't10-fade' : 'ac-fade';

  return (
    <article className={rootClass}>
      <div className={posterClass}>
        <Link to={`/anime/${anime.routeId}`} className="poster-clip" aria-label={title}>
          <img
            src={anime.poster}
            alt={title}
            loading="lazy"
            decoding="async"
          />
          <div className={fadeClass} />
          {anticipatedBadge && (
            <div className="cov-anticipated">
              <span className="cov-anticipated__date">{anticipatedBadge.dateLabel}</span>
              <span className="cov-anticipated__countdown">{anticipatedBadge.countdownLabel}</span>
            </div>
          )}
          <div className="cov-cap">
            <span className="cov-title-clip">
              <span className="cov-title">{title}</span>
            </span>
            <div className="cov-meta">
              <span className="cov-genre">{primaryGenre}</span>
              {!anticipatedBadge && (anime.subCount > 0 || anime.dubCount > 0) && (
                <span className="cov-language">
                  {anime.subCount > 0 && (
                    <span className="cov-language-pair" title={`${anime.subCount} Subbed`}>
                      <span className="cov-language-icon">
                        <Captions size={11} strokeWidth={2.2} />
                      </span>
                      <span className="cov-language-n">{anime.subCount}</span>
                    </span>
                  )}
                  {anime.dubCount > 0 && (
                    <span className="cov-language-pair" title={`${anime.dubCount} Dubbed`}>
                      <span className="cov-language-icon">
                        <Mic size={11} strokeWidth={2.2} />
                      </span>
                      <span className="cov-language-n">{anime.dubCount}</span>
                    </span>
                  )}
                </span>
              )}
              {!anticipatedBadge && anime.score !== null && anime.score > 0 && (
                <span className="cov-score">
                  <Star size={10} />
                  <span>{anime.score.toFixed(1)}</span>
                </span>
              )}
            </div>
          </div>
        </Link>
        <LibraryStatusTrigger routeId={anime.routeId} variant="card" />
      </div>
    </article>
  );
};
