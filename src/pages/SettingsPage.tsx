import React, { useMemo, useState } from 'react';
import {
  Bell,
  Captions,
  Check,
  Database,
  Palette,
  PlayCircle,
  Search,
  Shield,
  Sliders,
  User,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { ACCENT_SWATCHES, THEME_OPTIONS } from '@/src/utils/themeUtils';

type SettingsSection =
  | 'account'
  | 'appearance'
  | 'content'
  | 'player'
  | 'captions'
  | 'notifications'
  | 'data';

export const SettingsPage: React.FC = () => {
  const {
    t,
    locale,
    locales,
    setLocale,
    user,
    setAuthOpen,
    signOut,
    themePrefs,
    setThemePrefs,
    contentPrefs,
    setContentPrefs,
    playerPrefs,
    setPlayerPrefs,
    captionPrefs,
    setCaptionPrefs,
    privacyPrefs,
    setPrivacyPrefs,
    resetPlayerPrefs,
    resetShortcuts,
    clearHistory,
    clearRecentSearches,
    exportStorageJson,
    resetDeviceData,
    showToast,
  } = useApp();

  const [section, setSection] = useState<SettingsSection>('account');
  const [filterQuery, setFilterQuery] = useState('');

  const sections: { id: SettingsSection; label: string; icon: React.ReactNode; keywords: string }[] = [
    { id: 'account', label: t('settings.account'), icon: <User size={16} />, keywords: 'account sign in profile sync guest' },
    { id: 'appearance', label: t('settings.appearance'), icon: <Palette size={16} />, keywords: 'theme accent dark light language english animations blur text size' },
    { id: 'content', label: t('settings.content'), icon: <Sliders size={16} />, keywords: 'title language sort mature thumbs continue watching' },
    { id: 'player', label: t('settings.player'), icon: <PlayCircle size={16} />, keywords: 'audio sub dub server autoplay auto skip speed' },
    { id: 'captions', label: t('settings.captions'), icon: <Captions size={16} />, keywords: 'subtitle font color background opacity edge' },
    { id: 'notifications', label: t('settings.notifications'), icon: <Bell size={16} />, keywords: 'alerts push episodes privacy' },
    { id: 'data', label: t('settings.yourData'), icon: <Database size={16} />, keywords: 'export history reset device storage' },
  ];

  const visibleSections = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => s.label.toLowerCase().includes(q) || s.keywords.includes(q));
  }, [filterQuery]);

  const showSection = (id: SettingsSection) => {
    if (!filterQuery.trim()) return true;
    return visibleSections.some((s) => s.id === id);
  };

  const scrollToSection = (id: SettingsSection) => {
    setSection(id);
    const el = document.getElementById(`settings-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExport = () => {
    const blob = new Blob([exportStorageJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anipm-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-nav" aria-label="Settings sections">
          <div className="browse-search-pill" style={{ width: '100%', marginBottom: 8 }}>
            <Search size={14} style={{ opacity: 0.6 }} />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search settings"
            />
          </div>

          <div className="settings-nav__list">
            {visibleSections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`settings-nav__item ${section === s.id ? 'is-active' : ''}`}
                onClick={() => scrollToSection(s.id)}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {showSection('account') && (
            <section id="settings-account" style={{ scrollMarginTop: 84 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <User size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.account')}</h2>
              </div>
              <div className="settings-card">
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{user.username}</div>
                      <div style={{ fontSize: 13, color: 'rgb(var(--c-text2))' }}>
                        {user.handle} · Connected via {user.provider} · Level {user.level}
                      </div>
                    </div>
                    <button type="button" className="watch-pill" onClick={signOut}>
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'rgb(var(--c-text2))' }}>
                      Browsing as a guest. Your list stays on this device.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAuthOpen(true)}
                      style={{
                        height: 36,
                        padding: '0 18px',
                        borderRadius: 999,
                        border: 0,
                        background: '#ffffff',
                        color: '#09090b',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('nav.signIn')}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {showSection('appearance') && (
            <section id="settings-appearance" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Palette size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.appearance')}</h2>
              </div>

              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Language</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>Interface language</span>
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.08)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: 'rgb(var(--c-text2))',
                        }}
                      >
                        THIS DEVICE
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgb(var(--c-text2))', marginTop: 3 }}>
                      Browser language: English
                    </div>
                  </div>

                  <select
                    className="watch-panel__select"
                    style={{ width: 'auto', minWidth: 140, borderRadius: 999, paddingInline: 14 }}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as typeof locale)}
                    aria-label="Interface language"
                  >
                    {locales.map((loc) => (
                      <option key={loc.tag} value={loc.tag}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 650 }}>Theme &amp; accent</h3>
                    <div style={{ fontSize: 12.5, color: 'rgb(var(--c-text2))', marginTop: 4 }}>Theme</div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={themePrefs.followSystem}
                      onChange={(e) =>
                        setThemePrefs((p) => ({ ...p, followSystem: e.target.checked }))
                      }
                    />
                    <span>Follow system</span>
                  </label>
                </div>

                <div className="theme-swatches">
                  {THEME_OPTIONS.map((th) => {
                    const active = themePrefs.theme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        className={`theme-swatch ${active ? 'is-active' : ''}`}
                        style={{
                          background: th.swatchBg,
                          color: th.isLight ? '#18181b' : '#ffffff',
                        }}
                        onClick={() =>
                          setThemePrefs((p) => ({ ...p, theme: th.id, followSystem: false }))
                        }
                      >
                        <div className="theme-swatch__preview">
                          <span className="theme-swatch__dot" style={{ background: th.swatchDot }} />
                          <span className="theme-swatch__bar" style={{ background: th.swatchSurface }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{th.label}</span>
                          {active && <Check size={13} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {themePrefs.theme === 'custom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, paddingTop: 8 }}>
                    {(
                      [
                        { k: 'bg', l: 'Background' },
                        { k: 'surface', l: 'Surface' },
                        { k: 'accent', l: 'Accent' },
                        { k: 'text', l: 'Text' },
                      ] as const
                    ).map((field) => (
                      <label key={field.k} style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span>{field.l}</span>
                        <input
                          type="color"
                          value={themePrefs.customColors[field.k]}
                          onChange={(e) =>
                            setThemePrefs((p) => ({
                              ...p,
                              customColors: { ...p.customColors, [field.k]: e.target.value },
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {ACCENT_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Accent ${hex}`}
                        onClick={() => setThemePrefs((p) => ({ ...p, accentColor: hex }))}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          border: themePrefs.accentColor === hex ? '2.5px solid rgb(var(--c-text))' : '1px solid rgba(128,128,140,0.42)',
                          background: hex,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: 13.5 }}>Text size</span>
                    <div className="watch-audio-switch">
                      {(['small', 'medium', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          aria-pressed={themePrefs.textSize === sz}
                          onClick={() => setThemePrefs((p) => ({ ...p, textSize: sz }))}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                    <span>UI animations &amp; transitions</span>
                    <input
                      type="checkbox"
                      checked={themePrefs.animations}
                      onChange={(e) => setThemePrefs((p) => ({ ...p, animations: e.target.checked }))}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                    <span>Frosted glass backdrop blur</span>
                    <input
                      type="checkbox"
                      checked={themePrefs.backdropBlur}
                      onChange={(e) => setThemePrefs((p) => ({ ...p, backdropBlur: e.target.checked }))}
                    />
                  </label>
                </div>
              </div>
            </section>
          )}

          {showSection('content') && (
            <section id="settings-content" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Sliders size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.content')}</h2>
              </div>
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5 }}>Preferred title language</span>
                  <div className="watch-audio-switch">
                    {(['english', 'original'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        aria-pressed={contentPrefs.titleLanguage === lang}
                        onClick={() => setContentPrefs((p) => ({ ...p, titleLanguage: lang }))}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Show Continue Watching on Home</span>
                  <input
                    type="checkbox"
                    checked={contentPrefs.showContinueWatchingOnHome}
                    onChange={(e) =>
                      setContentPrefs((p) => ({ ...p, showContinueWatchingOnHome: e.target.checked }))
                    }
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Show episode thumbnails on Home</span>
                  <input
                    type="checkbox"
                    checked={contentPrefs.showEpisodeThumbsOnHome}
                    onChange={(e) =>
                      setContentPrefs((p) => ({ ...p, showEpisodeThumbsOnHome: e.target.checked }))
                    }
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Include mature (18+) catalog items</span>
                  <input
                    type="checkbox"
                    checked={contentPrefs.showMature18Plus}
                    onChange={(e) =>
                      setContentPrefs((p) => ({ ...p, showMature18Plus: e.target.checked }))
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {showSection('player') && (
            <section id="settings-player" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <PlayCircle size={18} />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.player')}</h2>
                </div>
                <button type="button" className="watch-pill" onClick={resetPlayerPrefs}>
                  Reset defaults
                </button>
              </div>
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5 }}>Default audio</span>
                  <div className="watch-audio-switch">
                    {(['sub', 'dub'] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={playerPrefs.preferredAudio === a}
                        onClick={() => setPlayerPrefs((p) => ({ ...p, preferredAudio: a }))}
                      >
                        {a.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5 }}>Default server</span>
                  <div className="watch-audio-switch">
                    {(['default', 'beta'] as const).map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        aria-pressed={playerPrefs.defaultServer === srv}
                        onClick={() => setPlayerPrefs((p) => ({ ...p, defaultServer: srv }))}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Autoplay next episode</span>
                  <input
                    type="checkbox"
                    checked={playerPrefs.autoplayNext}
                    onChange={(e) => setPlayerPrefs((p) => ({ ...p, autoplayNext: e.target.checked }))}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Auto-skip intro / outro segments</span>
                  <input
                    type="checkbox"
                    checked={playerPrefs.autoSkip}
                    onChange={(e) => setPlayerPrefs((p) => ({ ...p, autoSkip: e.target.checked }))}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                  <span>Skip step ({playerPrefs.skipStepSec}s)</span>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={playerPrefs.skipStepSec}
                    onChange={(e) => setPlayerPrefs((p) => ({ ...p, skipStepSec: Number(e.target.value) }))}
                  />
                </label>

                <div>
                  <button type="button" className="watch-pill" onClick={resetShortcuts}>
                    Reset keyboard shortcuts
                  </button>
                </div>
              </div>
            </section>
          )}

          {showSection('captions') && (
            <section id="settings-captions" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Captions size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.captions')}</h2>
              </div>
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Live Subtitle Preview Box */}
                <div
                  style={{
                    position: 'relative',
                    height: 120,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #1b2234, #0e1017)',
                    display: 'grid',
                    placeItems: 'end center',
                    padding: 18,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontFamily:
                        captionPrefs.fontFamily === 'serif'
                          ? 'Georgia, serif'
                          : captionPrefs.fontFamily === 'mono'
                            ? 'monospace'
                            : 'var(--font-sans)',
                      fontSize:
                        captionPrefs.fontSize === 'small'
                          ? 14
                          : captionPrefs.fontSize === 'large'
                            ? 22
                            : captionPrefs.fontSize === 'xlarge'
                              ? 26
                              : 18,
                      fontWeight: captionPrefs.fontWeight === 'bold' ? 700 : 400,
                      fontStyle: captionPrefs.italic ? 'italic' : 'normal',
                      textTransform: captionPrefs.uppercase ? 'uppercase' : 'none',
                      color: captionPrefs.fontColor,
                      backgroundColor:
                        captionPrefs.bgOpacity === 'none'
                          ? 'transparent'
                          : captionPrefs.bgOpacity === 'subtle'
                            ? 'rgba(0,0,0,0.35)'
                            : captionPrefs.bgOpacity === 'medium'
                              ? 'rgba(0,0,0,0.62)'
                              : 'rgba(0,0,0,0.85)',
                      textShadow: captionPrefs.edgeStyle === 'none' ? 'none' : '0 2px 6px rgba(0,0,0,0.9)',
                    }}
                  >
                    The Grand Line awaits beyond Reverse Mountain.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <label style={{ fontSize: 13 }}>
                    Font size
                    <select
                      className="watch-panel__select"
                      style={{ marginTop: 6 }}
                      value={captionPrefs.fontSize}
                      onChange={(e) =>
                        setCaptionPrefs((p) => ({ ...p, fontSize: e.target.value as typeof p.fontSize }))
                      }
                    >
                      <option value="small">Small</option>
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                      <option value="xlarge">Extra Large</option>
                    </select>
                  </label>

                  <label style={{ fontSize: 13 }}>
                    Background opacity
                    <select
                      className="watch-panel__select"
                      style={{ marginTop: 6 }}
                      value={captionPrefs.bgOpacity}
                      onChange={(e) =>
                        setCaptionPrefs((p) => ({ ...p, bgOpacity: e.target.value as typeof p.bgOpacity }))
                      }
                    >
                      <option value="none">None</option>
                      <option value="subtle">Subtle</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </label>

                  <label style={{ fontSize: 13 }}>
                    Font color
                    <div style={{ marginTop: 6 }}>
                      <input
                        type="color"
                        value={captionPrefs.fontColor}
                        onChange={(e) => setCaptionPrefs((p) => ({ ...p, fontColor: e.target.value }))}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </section>
          )}

          {showSection('notifications') && (
            <section id="settings-notifications" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Bell size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.notifications')} &amp; Privacy</h2>
              </div>
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Anonymous audience analytics</span>
                  <input
                    type="checkbox"
                    checked={privacyPrefs.audienceAnalytics}
                    onChange={(e) =>
                      setPrivacyPrefs((p) => ({ ...p, audienceAnalytics: e.target.checked }))
                    }
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, cursor: 'pointer' }}>
                  <span>Playback buffering diagnostics</span>
                  <input
                    type="checkbox"
                    checked={privacyPrefs.playbackDiagnostics}
                    onChange={(e) =>
                      setPrivacyPrefs((p) => ({ ...p, playbackDiagnostics: e.target.checked }))
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {showSection('data') && (
            <section id="settings-data" style={{ scrollMarginTop: 84, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Shield size={18} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('settings.yourData')}</h2>
              </div>
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: 0, fontSize: 13.5, color: 'rgb(var(--c-text2))' }}>
                  All local watch progress, lists, folders, and appearance preferences stay right in your browser unless you sign in to sync.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <button type="button" className="watch-pill" onClick={handleExport}>
                    Export storage JSON
                  </button>
                  <button type="button" className="watch-pill" onClick={clearHistory}>
                    Clear watch history
                  </button>
                  <button
                    type="button"
                    className="watch-pill"
                    onClick={() => {
                      clearRecentSearches();
                      showToast('Recent searches cleared');
                    }}
                  >
                    Clear recent searches
                  </button>
                  <button
                    type="button"
                    className="watch-pill"
                    style={{ color: '#fda4af', borderColor: 'rgba(251,113,133,0.35)' }}
                    onClick={resetDeviceData}
                  >
                    Reset all device data
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
