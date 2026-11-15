import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dices,
  Download,
  Flag,
  Globe,
  Home,
  Keyboard,
  LayoutGrid,
  LogOut,
  MessageSquarePlus,
  MoreVertical,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Video,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { CATALOG } from '@/src/data/catalogService';
import { AvatarBadge, BrandFooterLockup, BrandMark } from './BrandMark';

interface SiteHeaderProps {
  scrolled: boolean;
  hidden: boolean;
  overArt: boolean;
  pinnedOpen: boolean;
  onTogglePin: () => void;
  onMenuOpenChange?: (open: boolean) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  scrolled,
  hidden,
  overArt,
  pinnedOpen,
  onTogglePin,
  onMenuOpenChange,
}) => {
  const {
    t,
    locale,
    localeEntry,
    locales,
    setLocale,
    user,
    signOut,
    setSearchOpen,
    setChatOpen,
    chatOpen,
    setAuthOpen,
    setShortcutsOpen,
    setReportOpen,
    setRequestAnimeOpen,
    library,
    showToast,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [moreOpen, setMoreOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [langSubmenu, setLangSubmenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 56, right: 16 });

  const optionsBtnRef = useRef<HTMLButtonElement | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const path = location.pathname;
  const isNavActive = (prefix: string) => {
    if (prefix === '/') return path === '/';
    if (prefix === '/anime?format=MOVIE') return path === '/anime' && location.search.includes('MOVIE');
    if (prefix === '/anime') return (path === '/anime' && !location.search.includes('MOVIE')) || path.startsWith('/anime/');
    return path.startsWith(prefix);
  };

  useEffect(() => {
    setMoreOpen(false);
    setOptionsOpen(false);
    setLangSubmenu(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    onMenuOpenChange?.(moreOpen || optionsOpen || profileOpen);
  }, [moreOpen, optionsOpen, profileOpen, onMenuOpenChange]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (
        (optionsOpen || profileOpen) &&
        !menuPanelRef.current?.contains(target) &&
        !optionsBtnRef.current?.contains(target) &&
        !profileBtnRef.current?.contains(target)
      ) {
        setOptionsOpen(false);
        setProfileOpen(false);
        setLangSubmenu(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [optionsOpen, profileOpen]);

  const openOptions = () => {
    const rect = optionsBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: Math.round(rect.bottom + 8),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      });
    }
    setProfileOpen(false);
    setLangSubmenu(false);
    setOptionsOpen((prev) => !prev);
  };

  const openProfileMenu = () => {
    const rect = profileBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: Math.round(rect.bottom + 8),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      });
    }
    setOptionsOpen(false);
    setProfileOpen((prev) => !prev);
  };

  const rollRandomAnime = () => {
    const picked = CATALOG[Math.floor(Math.random() * CATALOG.length)];
    setOptionsOpen(false);
    if (picked) navigate(`/anime/${picked.routeId}`);
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), tier: 1 },
    { to: '/anime', label: t('nav.browse'), tier: 1 },
    { to: '/latest', label: t('nav.latest'), tier: 1 },
    { to: '/genres', label: t('nav.genres'), tier: 2 },
    { to: '/manga', label: t('nav.manga'), tier: 1 },
    { to: '/library', label: t('nav.library'), tier: 1 },
    { to: '/community', label: t('nav.community'), tier: 3 },
    { to: '/watch-together', label: t('nav.watchTogether'), tier: 3 },
    { to: '/anime?format=MOVIE', label: t('nav.movies'), tier: 3 },
  ];

  const watchlistCount = Object.keys(library.entries).length;
  const historyCount = library.history.length;

  const effectiveHidden = hidden && !pinnedOpen && !moreOpen && !optionsOpen && !profileOpen;

  return (
    <header
      className="sitebar"
      data-scrolled={scrolled ? 'true' : 'false'}
      data-hidden={effectiveHidden ? 'true' : 'false'}
      data-over-art={overArt ? 'true' : 'false'}
      data-pinned={pinnedOpen ? 'true' : 'false'}
    >
      <div className="sitebar__shade" aria-hidden="true" />
      <BrandMark />

      <nav className="sitebar__nav" aria-label="Primary navigation">
        {navLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            data-tier={item.tier}
            className="sitebar__link"
            aria-current={isNavActive(item.to) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}

        <div className="sitebar__more" ref={moreRef}>
          <button
            type="button"
            className="sitebar__link"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((p) => !p)}
          >
            <span>{t('nav.more')}</span>
            <ChevronDown size={14} />
          </button>
          {moreOpen && (
            <div className="sitebar__more-panel">
              {navLinks
                .filter((x) => x.tier >= 2)
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="yt-mmenu__row"
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className="yt-mmenu__label">{item.label}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </nav>

      <div className="sitebar__spacer" />

      <button
        type="button"
        className="sitebar__search"
        onClick={() => setSearchOpen(true)}
        aria-label={t('nav.searchPlaceholder')}
      >
        <Search size={15} />
        <span className="sitebar__search-label">{t('nav.searchPlaceholder')}</span>
        <kbd className="sitebar__kbd">Ctrl K</kbd>
      </button>

      <div className="sitebar__actions">
        <button
          type="button"
          className="yt-icon-button"
          aria-label="Community chat"
          title="Community chat"
          aria-expanded={chatOpen}
          onClick={() => setChatOpen(!chatOpen)}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
          </svg>
        </button>

        <div className="yt-mmenu">
          <button
            ref={optionsBtnRef}
            type="button"
            className="yt-icon-button"
            aria-label="More options"
            title="More"
            aria-expanded={optionsOpen}
            onClick={openOptions}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {user ? (
          <button
            ref={profileBtnRef}
            type="button"
            className="yt-pmenu__trigger"
            aria-expanded={profileOpen}
            onClick={openProfileMenu}
          >
            <AvatarBadge
              username={user.username}
              avatar={user.avatar}
              color={user.accentColor}
              size={26}
              frameStyle={user.frameStyle}
            />
            <span className="yt-pmenu__trigger-name">{user.username}</span>
          </button>
        ) : (
          <button
            type="button"
            className="yt-signin"
            onClick={() => setAuthOpen(true)}
          >
            <span className="yt-signin__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 016.447 15.276 7 7 0 00-12.895 0A9 9 0 0112 3Zm0 2a4 4 0 100 8 4 4 0 000-8Zm0 2a2 2 0 110 4 2 2 0 010-4Zm-.1 9.001L11.899 16a5 5 0 014.904 3.61A8.96 8.96 0 0112 21a8.96 8.96 0 01-4.804-1.391 5 5 0 014.704-3.608Z" />
              </svg>
            </span>
            <span>{t('nav.signIn')}</span>
          </button>
        )}

        <button
          type="button"
          className="sitebar__pin"
          title="Keep the top bar open"
          aria-label="Keep the top bar open"
          aria-pressed={pinnedOpen}
          onClick={onTogglePin}
        >
          <ChevronDown size={15} style={{ transform: pinnedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
        </button>
      </div>

      {/* Options Popover / Mobile Bottom Sheet */}
      {optionsOpen &&
        createPortal(
          <>
            <div className="sheet-mobile-scrim" onClick={() => setOptionsOpen(false)} />
            <div
              ref={menuPanelRef}
              className="yt-mmenu__panel"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              {langSubmenu ? (
                <div>
                  <div className="yt-mmenu__head">
                    <button
                      type="button"
                      className="yt-mmenu__row yt-mmenu__back"
                      aria-label="Back"
                      onClick={() => setLangSubmenu(false)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>{t('menu.chooseLanguage')}</span>
                  </div>
                  <div className="yt-mmenu__list">
                    {locales.map((loc) => {
                      const checked = loc.tag === locale;
                      return (
                        <button
                          key={loc.tag}
                          type="button"
                          role="menuitemradio"
                          aria-checked={checked}
                          className="yt-mmenu__row yt-mmenu__row--choice"
                          onClick={() => {
                            setLocale(loc.tag);
                            setLangSubmenu(false);
                            setOptionsOpen(false);
                          }}
                        >
                          <span className="yt-mmenu__tick">
                            {checked ? <Check size={14} /> : null}
                          </span>
                          <span className="yt-mmenu__label">{loc.label}</span>
                          <span className="yt-mmenu__value">{loc.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="yt-mmenu__count">{t('menu.languagesAvailable')}</p>
                </div>
              ) : (
                <div>
                  <div className="yt-mmenu__section">
                    <div className="yt-mmenu__heading">{t('menu.explore')}</div>
                    <Link
                      to="/genres"
                      className="yt-mmenu__row"
                      onClick={() => setOptionsOpen(false)}
                    >
                      <LayoutGrid size={16} />
                      <span className="yt-mmenu__label">{t('nav.genres')}</span>
                    </Link>
                    <Link
                      to="/community"
                      className="yt-mmenu__row"
                      onClick={() => setOptionsOpen(false)}
                    >
                      <Bookmark size={16} />
                      <span className="yt-mmenu__label">{t('nav.community')}</span>
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="yt-mmenu__row"
                      onClick={() => setOptionsOpen(false)}
                    >
                      <Trophy size={16} />
                      <span className="yt-mmenu__label">{t('nav.leaderboard')}</span>
                    </Link>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={rollRandomAnime}
                    >
                      <Dices size={16} />
                      <span className="yt-mmenu__label">{t('menu.rollRandom')}</span>
                    </button>
                  </div>

                  <div className="yt-mmenu__section">
                    <div className="yt-mmenu__heading">{t('menu.tools')}</div>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={() => {
                        setOptionsOpen(false);
                        showToast('Use your browser "Add to Home Screen" / Install App menu');
                      }}
                    >
                      <Download size={16} />
                      <span className="yt-mmenu__label">{t('menu.installApp')}</span>
                    </button>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={() => {
                        setOptionsOpen(false);
                        setShortcutsOpen(true);
                      }}
                    >
                      <Keyboard size={16} />
                      <span className="yt-mmenu__label">{t('menu.keyboardShortcuts')}</span>
                    </button>
                  </div>

                  <div className="yt-mmenu__section">
                    <div className="yt-mmenu__heading">{t('menu.preferences')}</div>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={() => setLangSubmenu(true)}
                    >
                      <Globe size={16} />
                      <span className="yt-mmenu__label">{t('menu.language')}</span>
                      <span className="yt-mmenu__value">
                        <span>{localeEntry.label}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>
                    <Link
                      to="/settings"
                      className="yt-mmenu__row"
                      onClick={() => setOptionsOpen(false)}
                    >
                      <Settings size={16} />
                      <span className="yt-mmenu__label">{t('nav.settings')}</span>
                    </Link>
                  </div>

                  <div className="yt-mmenu__section">
                    <div className="yt-mmenu__heading">{t('menu.help')}</div>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={() => {
                        setOptionsOpen(false);
                        setReportOpen(true);
                      }}
                    >
                      <Flag size={16} />
                      <span className="yt-mmenu__label">{t('menu.report')}</span>
                    </button>
                    <button
                      type="button"
                      className="yt-mmenu__row"
                      onClick={() => {
                        setOptionsOpen(false);
                        setRequestAnimeOpen(true);
                      }}
                    >
                      <MessageSquarePlus size={16} />
                      <span className="yt-mmenu__label">{t('menu.requestAnime')}</span>
                    </button>
                  </div>

                  <div className="yt-mmenu__foot">
                    <Link to="/about" onClick={() => setOptionsOpen(false)}>
                      {t('menu.about')}
                    </Link>
                    <span className="yt-mmenu__dot" />
                    <Link to="/terms" onClick={() => setOptionsOpen(false)}>
                      {t('menu.terms')}
                    </Link>
                    <span className="yt-mmenu__dot" />
                    <Link to="/privacy" onClick={() => setOptionsOpen(false)}>
                      {t('menu.privacy')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>,
          document.body
        )}

      {/* Signed-in Profile Popover / Mobile Bottom Sheet */}
      {profileOpen &&
        user &&
        createPortal(
          <>
            <div className="sheet-mobile-scrim" onClick={() => setProfileOpen(false)} />
            <div
              ref={menuPanelRef}
              className="yt-pmenu__panel"
              style={{
                top: menuPos.top,
                right: menuPos.right,
                ['--pm-hue' as string]: user.accentColor || '#8ac4ff',
              }}
            >
              <div className="yt-pmenu__card">
                <Link
                  to="/profile"
                  className="yt-pmenu__who"
                  onClick={() => setProfileOpen(false)}
                >
                  <AvatarBadge
                    username={user.username}
                    avatar={user.avatar}
                    color={user.accentColor}
                    size={44}
                    frameStyle={user.frameStyle}
                  />
                  <div className="yt-pmenu__ident">
                    <p className="yt-pmenu__name">
                      {user.username}{' '}
                      {user.isVip && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 5px',
                            borderRadius: 5,
                            background: 'rgba(138,196,255,0.2)',
                            color: '#9fd0ff',
                            marginLeft: 4,
                          }}
                        >
                          VIP
                        </span>
                      )}
                    </p>
                    <span className="yt-pmenu__handle">{user.handle}</span>
                  </div>
                </Link>
                <div className="yt-pmenu__level">
                  <span className="yt-pmenu__level-lv">Level {user.level}</span>
                  <span className="yt-pmenu__level-xp">
                    {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
                  </span>
                  <div className="yt-pmenu__level-track">
                    <span
                      className="yt-pmenu__level-fill"
                      style={{ width: `${Math.min(100, (user.xp / user.nextLevelXp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="yt-pmenu__tiles">
                <Link
                  to="/library"
                  className="yt-pmenu__tile"
                  onClick={() => setProfileOpen(false)}
                >
                  <Bookmark size={16} />
                  <span>Library ({watchlistCount})</span>
                </Link>
                <Link
                  to="/library?tab=history"
                  className="yt-pmenu__tile"
                  onClick={() => setProfileOpen(false)}
                >
                  <Video size={16} />
                  <span>History ({historyCount})</span>
                </Link>
              </div>

              <div className="yt-pmenu__group">
                <Link
                  to="/profile"
                  className="yt-pmenu__row"
                  onClick={() => setProfileOpen(false)}
                >
                  <Sparkles size={16} />
                  <span>Profile & badges</span>
                </Link>
                <Link
                  to="/settings"
                  className="yt-pmenu__row"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={16} />
                  <span>{t('nav.settings')}</span>
                </Link>
                <Link
                  to="/leaderboard"
                  className="yt-pmenu__row"
                  onClick={() => setProfileOpen(false)}
                >
                  <Trophy size={16} />
                  <span>{t('nav.leaderboard')}</span>
                </Link>
                <Link
                  to="/settings?section=account"
                  className="yt-pmenu__row"
                  onClick={() => setProfileOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Sync & privacy</span>
                </Link>
              </div>

              <div className="yt-pmenu__group">
                <button
                  type="button"
                  className="yt-pmenu__row yt-pmenu__row--danger"
                  onClick={() => {
                    setProfileOpen(false);
                    signOut();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
};

export const MobileTabBar: React.FC = () => {
  const { t, setSearchOpen, searchOpen, library } = useApp();
  const { pathname } = useLocation();
  const savedCount = Object.keys(library.entries).length;

  const isHome = pathname === '/' && !searchOpen;
  const isBrowse = (pathname === '/anime' || pathname.startsWith('/anime/') || pathname === '/genres') && !searchOpen;
  const isLatest = pathname === '/latest' && !searchOpen;
  const isLibrary = pathname.startsWith('/library') && !searchOpen;

  return (
    <nav className="mobile-tabbar" aria-label="Mobile navigation dock">
      <Link to="/" className={`mobile-tabbar__btn ${isHome ? 'active' : ''}`} aria-current={isHome ? 'page' : undefined}>
        <span className="mobile-tabbar__icon">
          <Home size={20} strokeWidth={isHome ? 2.2 : 1.8} fill={isHome ? 'currentColor' : 'none'} />
        </span>
        <span className="mobile-tabbar__label">{t('nav.home')}</span>
      </Link>

      <Link
        to="/anime"
        className={`mobile-tabbar__btn ${isBrowse ? 'active' : ''}`}
        aria-current={isBrowse ? 'page' : undefined}
      >
        <span className="mobile-tabbar__icon">
          <LayoutGrid size={20} strokeWidth={isBrowse ? 2.2 : 1.8} />
        </span>
        <span className="mobile-tabbar__label">{t('nav.browse')}</span>
      </Link>

      <Link
        to="/latest"
        className={`mobile-tabbar__btn ${isLatest ? 'active' : ''}`}
        aria-current={isLatest ? 'page' : undefined}
      >
        <span className="mobile-tabbar__icon">
          <Clock size={20} strokeWidth={isLatest ? 2.2 : 1.8} />
        </span>
        <span className="mobile-tabbar__label">{t('nav.latest')}</span>
      </Link>

      <button
        type="button"
        className={`mobile-tabbar__btn mobile-tabbar__btn--search ${searchOpen ? 'active' : ''}`}
        onClick={() => setSearchOpen(true)}
        aria-label="Search anime"
      >
        <span className="mobile-tabbar__icon">
          <Search size={20} strokeWidth={2.0} />
        </span>
        <span className="mobile-tabbar__label">Search</span>
      </button>

      <Link
        to="/library"
        className={`mobile-tabbar__btn ${isLibrary ? 'active' : ''}`}
        aria-current={isLibrary ? 'page' : undefined}
      >
        <span className="mobile-tabbar__icon">
          <Bookmark size={20} strokeWidth={isLibrary ? 2.2 : 1.8} fill={isLibrary ? 'currentColor' : 'none'} />
          {savedCount > 0 && <span className="mobile-tabbar__badge">{savedCount > 99 ? '99' : savedCount}</span>}
        </span>
        <span className="mobile-tabbar__label">{t('nav.library')}</span>
      </Link>
    </nav>
  );
};

export const SiteFooter: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="site-footer">
      <div className="app-content-frame site-footer__inner">
        <div className="site-footer__top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '36rem' }}>
            <BrandFooterLockup />
            <p className="site-footer__tagline">{t('footer.tagline')}</p>
            <nav className="site-footer__nav" aria-label="Footer navigation">
              <Link to="/about">{t('menu.about')}</Link>
              <Link to="/terms">{t('menu.terms')}</Link>
              <Link to="/privacy">{t('menu.privacy')}</Link>
              <Link to="/terms#dmca">DMCA</Link>
              <Link to="/developers">Developers</Link>
            </nav>
          </div>

          <nav className="site-footer__nav site-footer__nav--discover" aria-label="Discover links">
            <Link to="/anime">{t('nav.browse')}</Link>
            <Link to="/latest">{t('nav.latest')}</Link>
            <Link to="/genres">{t('nav.genres')}</Link>
            <Link to="/manga">{t('nav.manga')}</Link>
            <Link to="/watch-together">{t('nav.watchTogether')}</Link>
            <Link to="/community">{t('nav.community')}</Link>
            <Link to="/leaderboard">{t('nav.leaderboard')}</Link>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__disclaimer">
            Ani.pm does not host any media files. It provides links to third-party services. Legal
            concerns about those files should be addressed directly to the hosts and providers
            responsible for them. Ani.pm bears no responsibility for media displayed by those providers.
          </p>
          <div className="site-footer__meta">
            <a
              href="https://discord.gg/anipm"
              target="_blank"
              rel="noreferrer"
              className="site-footer__discord"
              aria-label="Discord"
              title="Discord"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.198.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <p className="site-footer__copy">© {new Date().getFullYear()} Ani.pm</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const ToastPresenter: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return createPortal(
    <div
      className="app-toast"
      data-tone={toast.tone}
      role="status"
      aria-live="polite"
    >
      {toast.text}
    </div>,
    document.body
  );
};
