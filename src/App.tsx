import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from '@/src/context/AppContext';
import {
  MobileTabBar,
  SiteFooter,
  SiteHeader,
  ToastPresenter,
} from '@/src/components/SiteHeader';
import { SearchModal } from '@/src/components/SearchModal';
import { ChatDrawer } from '@/src/components/ChatDrawer';
import {
  AuthModal,
  KeyboardHelpModal,
  ReportModal,
  RequestAnimeDialog,
} from '@/src/components/Dialogs';

import { HomePage } from '@/src/pages/HomePage';
import { BrowsePage } from '@/src/pages/BrowsePage';
import { LatestPage } from '@/src/pages/LatestPage';
import { GenresPage } from '@/src/pages/GenresPage';
import { MangaPage } from '@/src/pages/MangaPage';
import { LibraryPage } from '@/src/pages/LibraryPage';
import { CommunityPage } from '@/src/pages/CommunityPage';
import { WatchTogetherPage } from '@/src/pages/WatchTogetherPage';
import { LeaderboardPage } from '@/src/pages/LeaderboardPage';
import { AnimeDetailPage } from '@/src/pages/AnimeDetailPage';
import { WatchPage } from '@/src/pages/WatchPage';
import { SettingsPage } from '@/src/pages/SettingsPage';
import { ProfilePage } from '@/src/pages/ProfilePage';
import {
  AboutPage,
  DevelopersPage,
  NotFoundPage,
  PrivacyPage,
  SearchPage,
  TermsPage,
} from '@/src/pages/DocsPages';

import { computeNavbarScrollState } from '@/src/utils/navbarScroll';
import { parseAnimeEpQuery } from '@/src/utils/homeSchedule';

const AnimeOrWatchRoute: React.FC = () => {
  const { search } = useLocation();
  const ep = parseAnimeEpQuery(search);
  return ep !== null ? <WatchPage /> : <AnimeDetailPage />;
};

const AppLayout: React.FC = () => {
  const { pathname, search } = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const epQuery = parseAnimeEpQuery(search);
  const pageTag = pathname === '/' ? 'home' : pathname.split('/')[1] || 'home';
  const overArt =
    pathname === '/' ||
    (/^\/(anime|ani)\/[^/]+$/.test(pathname) && epQuery === null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0 });
    lastScrollTopRef.current = 0;
    setScrolled(false);
    setHeaderHidden(false);
  }, [pathname, epQuery]);

  useEffect(() => {
    if (pinnedOpen || headerMenuOpen) {
      setHeaderHidden(false);
    }
  }, [pinnedOpen, headerMenuOpen]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <SiteHeader
        scrolled={scrolled}
        hidden={headerHidden}
        overArt={overArt}
        pinnedOpen={pinnedOpen}
        onTogglePin={() => setPinnedOpen((p) => !p)}
        onMenuOpenChange={setHeaderMenuOpen}
      />

      <main
        id="main-content"
        ref={scrollRef}
        className="content browse-scroll"
        data-page={pageTag}
        onScroll={(e) => {
          const top = (e.currentTarget as HTMLDivElement).scrollTop;
          const next = computeNavbarScrollState({
            scrollTop: top,
            prevScrollTop: lastScrollTopRef.current,
            wasHidden: headerHidden,
            isPinned: pinnedOpen,
            hasOpenMenu: headerMenuOpen,
          });
          lastScrollTopRef.current = next.nextPrevScrollTop;
          setScrolled(next.scrolled);
          setHeaderHidden(next.hidden);
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime" element={<BrowsePage />} />
          <Route path="/latest" element={<LatestPage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/manga" element={<MangaPage />} />
          <Route path="/manga/:title" element={<MangaPage />} />
          <Route path="/manga/:title/:chapter" element={<MangaPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/downloads" element={<Navigate to="/library" replace />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/t/:id" element={<CommunityPage />} />
          <Route path="/watch-together" element={<WatchTogetherPage />} />
          <Route path="/watch-together/:code" element={<WatchTogetherPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/anime/:id" element={<AnimeOrWatchRoute />} />
          <Route path="/ani/:id" element={<AnimeOrWatchRoute />} />
          <Route path="/anime/:id/:episode" element={<WatchPage />} />
          <Route path="/ani/:id/:episode" element={<WatchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/sync" element={<Navigate to="/settings" replace />} />
          <Route path="/sync" element={<Navigate to="/settings" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:username" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <SiteFooter />
      </main>

      <MobileTabBar />

      {/* Portaled Overlays */}
      <SearchModal />
      <ChatDrawer />
      <AuthModal />
      <KeyboardHelpModal />
      <ReportModal />
      <RequestAnimeDialog />
      <ToastPresenter />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
