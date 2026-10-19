"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import chatData from './data/chatData.json';

export default function ChatApp() {
  // Lock Screen State: starts locked!
  const [isLocked, setIsLocked] = useState(true);
  const [passInput, setPassInput] = useState('');
  const [lockError, setLockError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Chat State
  const [messages, setMessages] = useState(chatData.items);
  const [inputValue, setInputValue] = useState('');
  const [theme, setTheme] = useState('blush'); // 'blush' | 'midnight' | 'mint'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Audio Player State (Rahat Fateh Ali Khan - Zaroori Tha)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Modals
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [callModal, setCallModal] = useState({ open: false, isVideo: false });
  const [lightboxImg, setLightboxImg] = useState(null);

  // Piyari live status
  const [piyariStatus, setPiyariStatus] = useState('online • in your heart ✨');

  // Message Reactions map: id -> emoji
  const [reactions, setReactions] = useState({});

  const messagesContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const sfxAudioCtxRef = useRef(null);
  const itemRefs = useRef(new Map());

  // Set theme on html tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    playCutePop();
    const themes = ['blush', 'midnight', 'mint'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  const themeLabel = {
    blush: '🌸 Blush',
    midnight: '🌙 Midnight',
    mint: '🌿 Mint'
  }[theme];

  // Initialize emotional background song
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.22; // Halki aawaz (soft emotional volume)
    }
  }, []);

  const startEmotionalMusic = () => {
    const audio = audioRef.current;
    if (audio && !isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const togglePlayMusic = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleMuteMusic = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Lock unlock handler
  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    if (passInput.trim().toLowerCase() === 'piyari') {
      playCutePop();
      startEmotionalMusic();
      setIsLocked(false);
    } else {
      setLockError(true);
      setTimeout(() => setLockError(false), 900);
    }
  };

  // Synthesized Web Audio API Sound Effects for clicks
  const initSfxAudio = () => {
    if (!sfxAudioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sfxAudioCtxRef.current = new AudioCtx();
    }
  };

  const playCutePop = useCallback(() => {
    try {
      initSfxAudio();
      if (!sfxAudioCtxRef.current) return;
      const ctx = sfxAudioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }, []);

  const playCuteRingtone = useCallback(() => {
    try {
      initSfxAudio();
      if (!sfxAudioCtxRef.current) return;
      const ctx = sfxAudioCtxRef.current;
      [0, 0.15, 0.3].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const freqs = [659.25, 783.99, 987.77];
        osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      });
    } catch (e) {}
  }, []);

  // Floating background canvas (falling petals & hearts)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const hearts = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 15 + 10,
      speedY: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.15,
      char: ['🥀', '💔', '🌸', '✨', '💕'][Math.floor(Math.random() * 5)]
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      hearts.forEach((h) => {
        ctx.font = `${h.size}px serif`;
        ctx.globalAlpha = h.opacity;
        ctx.fillText(h.char, h.x, h.y);
        h.y -= h.speedY;
        h.x += h.speedX;
        if (h.y < -20) {
          h.y = height + 20;
          h.x = Math.random() * width;
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // START AT THE BEGINNING (TOP OF CHAT - October 16, 2025)
  useEffect(() => {
    if (!isLocked && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0; // Starts from the very first chat
    }
  }, [isLocked]);

  // Scroll detection for "Scroll to Bottom" button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distFromBottom > 350);
  };

  const scrollToBottom = () => {
    playCutePop();
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return messages
      .filter((m) => m.type === 'message' && m.text && m.text.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIdx(0);
      scrollToMatch(searchMatches[0]);
    }
  }, [searchMatches]);

  const scrollToMatch = (id) => {
    const el = itemRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    playCutePop();
    const nextIdx = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(nextIdx);
    scrollToMatch(searchMatches[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    playCutePop();
    const prevIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(prevIdx);
    scrollToMatch(searchMatches[prevIdx]);
  };

  // Send message (disabled: read-only chat)
  const handleSendMessage = () => {
    setInputValue('');
  };



  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reactions
  const handleAddReaction = (id, emoji) => {
    playCutePop();
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === emoji ? null : emoji
    }));
  };

  // Date jump
  const handleJumpToDate = (rawDate) => {
    playCutePop();
    setDateModalOpen(false);
    const targetEl = document.getElementById(`date-${rawDate.replace(/\//g, '-')}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calls
  const startCall = (isVideo) => {
    setCallModal({ open: true, isVideo });
    playCuteRingtone();
  };

  return (
    <>
      {/* Background emotional song: Rahat Fateh Ali Khan - Zaroori Tha */}
      <audio ref={audioRef} src="/assets/zaroori_tha.mp3" loop />

      {/* Floating particles */}
      <canvas id="canvas-hearts" ref={canvasRef} />

      {/* ==========================================================================
          EMOTIONAL LOCK SCREEN GATE
          ========================================================================== */}
      {isLocked && (
        <div className="lock-screen-container">
          <div className={`lock-card ${lockError ? 'shake' : ''}`}>
            {/* Couple Photos */}
            <div className="lock-couple-row">
              <div className="lock-photo-bubble tabarak">
                <div className="lock-avatar-img-wrap">
                  <img
                    className="lock-avatar-img"
                    src={chatData.me.avatar}
                    alt="Md Tabarak"
                  />
                </div>
                <span className="lock-avatar-tag">Md Tabarak 👑</span>
              </div>

              <div className="lock-heart-divider">💔🥀</div>

              <div className="lock-photo-bubble piyari">
                <div className="lock-avatar-img-wrap">
                  <img
                    className="lock-avatar-img"
                    src={chatData.contact.avatar}
                    alt="Piyari"
                  />
                </div>
                <span className="lock-avatar-tag">Piyari 🌸</span>
              </div>
            </div>

            <h1 className="lock-title">Tabarak &amp; Piyari</h1>
            <p className="lock-quote">
              &ldquo;Wo dono ab baat nahi karte... lekin Tabarak usko ek pal bhi bhula nahi paata.&rdquo;
            </p>

            <div className="lock-story-box">
              <span>🥀</span> Silsile khatam ho gaye, par uski yaadein aaj bhi dil me dharakti hain...
              2,664 baaton ka ek adhoora khwab.
            </div>

            {/* Password Form */}
            <form className="lock-form" onSubmit={handleUnlock}>
              <div className="lock-input-group">
                <span className="lock-input-icon">🔒</span>
                <input
                  type="text"
                  className="lock-input"
                  placeholder="Dil ki chaabi (Enter Password)..."
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {lockError && (
                <div className="lock-error-msg">
                  ⚠️ Galat password! Sirf wahi naam jise dil se mitaya nahi jaa sakta... (Hint: piyari)
                </div>
              )}

              <button type="submit" className="lock-submit-btn">
                <span>Yaadon Ka Darwaza Kholein</span>
                <span>🔓</span>
              </button>
            </form>

            <button
              type="button"
              className="lock-hint-btn"
              onClick={() => setShowHint(!showHint)}
            >
              {showHint ? "Password is: piyari" : "Password Hint?"}
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MAIN CHAT INTERFACE (Accessible only after entering 'piyari')
          ========================================================================== */}
      <div className="app-container" style={{ visibility: isLocked ? 'hidden' : 'visible' }}>
        <div className="chat-window">
          <div className="chat-wallpaper"></div>

          {/* Header */}
          <header className="chat-header">
            <div
              className="contact-info-wrap"
              onClick={() => {
                playCutePop();
                setStoryModalOpen(true);
              }}
              title="Click to view our love story & stats!"
            >
              <div className="avatar-container">
                <div className="avatar-ring"></div>
                <img
                  className="avatar-img"
                  src={chatData.contact.avatar}
                  alt={chatData.contact.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    playCutePop();
                    setLightboxImg(chatData.contact.avatar);
                  }}
                  title="Click to preview photo"
                />
                <div className="online-badge"></div>
              </div>
              <div className="contact-meta">
                <div className="contact-name-row">
                  <span className="contact-name">{chatData.contact.name}</span>
                  <span className="heart-sparkle">💕</span>
                </div>
                <div className="contact-status">
                  <span className="status-dot"></span>
                  <span>{piyariStatus}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button className="theme-pill-btn" onClick={toggleTheme} title="Change Theme Style">
                <span className="theme-label">{themeLabel}</span>
              </button>
              <button
                className={`btn-icon ${searchOpen ? 'active' : ''}`}
                onClick={() => {
                  playCutePop();
                  setSearchOpen(!searchOpen);
                  if (searchOpen) setSearchQuery('');
                }}
                title="Search in Chat"
              >
                🔍
              </button>
              <button
                className="btn-icon"
                onClick={() => {
                  playCutePop();
                  setDateModalOpen(true);
                }}
                title="Jump to Date"
              >
                📅
              </button>
              <button
                className="btn-icon"
                onClick={() => {
                  playCutePop();
                  setStoryModalOpen(true);
                }}
                title="Our Love Memories & Stats"
              >
                💖
              </button>
              <button
                className="btn-icon"
                onClick={() => startCall(false)}
                title="Voice Call Piyari"
              >
                📞
              </button>
              <button
                className="btn-icon"
                onClick={() => startCall(true)}
                title="Video Call Piyari"
              >
                📹
              </button>
            </div>
          </header>

          {/* Memorial Title Ribbon & Music Player Bar */}
          <div className="memorial-banner">
            <div className="memorial-text">
              <span className="memorial-rose">🥀</span>
              <span>Tabarak aur Piyari ki aakhri nishani... Ek adhoori daastaan 💔</span>
            </div>

            {/* Emotional Song Player */}
            <div className="music-player-pill" title="Rahat Fateh Ali Khan - Zaroori Tha">
              <span className={`music-disc ${isPlaying ? 'playing' : ''}`}>💿</span>
              <div className="music-title-wrap">
                <span className="music-title">Zaroori Tha</span>
                <span className="music-sub">Rahat Fateh Ali Khan</span>
              </div>
              <button
                className="music-ctrl-btn"
                onClick={togglePlayMusic}
                title={isPlaying ? 'Pause Song' : 'Play Song'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className="music-ctrl-btn"
                onClick={toggleMuteMusic}
                title={isMuted ? 'Unmute Song' : 'Mute Song'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          {/* Search Drawer */}
          <div className={`search-drawer ${searchOpen ? 'open' : ''}`}>
            <div className="search-input-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search across all 2,664 messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="search-nav">
              <span>
                {searchMatches.length > 0
                  ? `${currentMatchIdx + 1} of ${searchMatches.length}`
                  : '0 matches'}
              </span>
              <button className="search-nav-btn" onClick={handlePrevMatch} title="Previous match">
                ▲
              </button>
              <button className="search-nav-btn" onClick={handleNextMatch} title="Next match">
                ▼
              </button>
              <button
                className="search-nav-btn"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                title="Close search"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container (Starts from beginning / top) */}
          <main
            className="chat-messages-container"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((item, index) => {
              const prevItem = messages[index - 1];
              const showDateDivider = !prevItem || prevItem.date !== item.date;
              const dateObj = chatData.dates.find((d) => d.raw === item.date);
              const dateLabel = dateObj ? dateObj.short : item.date;
              const fullDateLabel = dateObj ? dateObj.full : item.date;
              const isMatch = searchMatches.includes(item.id);
              const isCurrentMatch = searchMatches[currentMatchIdx] === item.id;

              return (
                <React.Fragment key={item.id}>
                  {showDateDivider && (
                    <div
                      className="date-divider"
                      id={`date-${item.date.replace(/\//g, '-')}`}
                    >
                      <div className="date-badge" title={fullDateLabel}>
                        <span className="icon">🌸</span>
                        <span>{dateLabel}</span>
                      </div>
                    </div>
                  )}

                  {item.type === 'system' ? (
                    <div className="system-notice-card">
                      <span className="system-notice-icon">🔒</span>
                      <span>{item.text}</span>
                    </div>
                  ) : (
                    <div
                      ref={(el) => {
                        if (el) itemRefs.current.set(item.id, el);
                        else itemRefs.current.delete(item.id);
                      }}
                      className={`msg-row ${item.is_me ? 'outgoing' : 'incoming'} ${
                        isCurrentMatch ? 'highlighted' : ''
                      }`}
                    >
                      {/* Avatar for both Md Tabarak and Piyari beside their bubbles */}
                      {item.is_me ? (
                        <img
                          className="msg-avatar"
                          src={chatData.me.avatar}
                          alt={chatData.me.name}
                          title="Md Tabarak 👑 (Click to preview)"
                          onClick={() => setLightboxImg(chatData.me.avatar)}
                        />
                      ) : (
                        <img
                          className="msg-avatar"
                          src={chatData.contact.avatar}
                          alt={chatData.contact.name}
                          title="Piyari 🌸 (Click to preview)"
                          onClick={() => setLightboxImg(chatData.contact.avatar)}
                        />
                      )}

                      <div className="msg-bubble-wrap">
                        <div className="reaction-picker">
                          {['❤️', '😘', '🥺', '🌸', '✨', '🥀'].map((emoji) => (
                            <button
                              key={emoji}
                              className="reaction-btn"
                              onClick={() => handleAddReaction(item.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        <div className="msg-bubble">
                          {item.is_deleted ? (
                            <div className="msg-deleted">
                              <span className="msg-deleted-icon">🤫</span>
                              <span>{item.text}</span>
                            </div>
                          ) : (
                            <div className="msg-text">{item.text}</div>
                          )}

                          <div className="msg-footer">
                            <span className="msg-time">{item.time}</span>
                            {item.is_me && <span className="msg-ticks">✓✓</span>}
                          </div>

                          {reactions[item.id] && (
                            <div
                              className="reaction-pill"
                              onClick={() => handleAddReaction(item.id, reactions[item.id])}
                            >
                              <span>{reactions[item.id]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </main>

          {/* Floating Scroll to Bottom Button */}
          <button
            className={`btn-scroll-bottom ${showScrollBottom ? 'visible' : ''}`}
            onClick={scrollToBottom}
            title="Scroll to latest chat"
          >
            ↓
          </button>

          {/* Input Bar */}
          <footer className="chat-input-bar">
            <div className="quick-stickers-row">
              {[
                'Bolo jaaneman 💕',
                'Khana khaye? 🌸',
                'Meri jaan 🥰',
                'Photo bhejo na 🥺',
                'Mast lag rahi ho ✨',
                'Zaroori tha 🥀'
              ].map((sticker) => (
                <div
                  key={sticker}
                  className="sticker-pill"
                  onClick={() => {
                    playCutePop();
                    setInputValue((prev) => (prev ? prev + ' ' : '') + sticker);
                  }}
                >
                  {sticker}
                </div>
              ))}
            </div>

            <div className="input-field-wrap">
              <textarea
                className="chat-textarea"
                rows={1}
                placeholder="Ye sirf padhne ke liye hai 💕"
                value=""
                disabled
                readOnly
              />
            </div>
            <button className="btn-send" disabled title="Sending disabled">
              ➤
            </button>
          </footer>
        </div>
      </div>

      {/* Story & Love Stats Modal */}
      <div
        className={`modal-overlay ${storyModalOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) setStoryModalOpen(false);
        }}
      >
        <div className="modal-box">
          <div className="modal-header-banner">
            <button className="modal-close-btn" onClick={() => setStoryModalOpen(false)}>
              ✕
            </button>
            <div className="couple-showcase">
              <div className="couple-member tabarak">
                <div
                  className="couple-photo-wrap"
                  onClick={() => {
                    playCutePop();
                    setLightboxImg(chatData.me.avatar);
                  }}
                  title="Click to view photo"
                >
                  <img className="couple-photo" src={chatData.me.avatar} alt="Md Tabarak" />
                </div>
                <span className="couple-name">Md Tabarak 👑</span>
              </div>

              <div className="couple-heart-divider">💖</div>

              <div className="couple-member piyari">
                <div
                  className="couple-photo-wrap"
                  onClick={() => {
                    playCutePop();
                    setLightboxImg(chatData.contact.avatar);
                  }}
                  title="Click to view photo"
                >
                  <img className="couple-photo" src={chatData.contact.avatar} alt="Piyari" />
                </div>
                <span className="couple-name">Piyari 🌸</span>
              </div>
            </div>
          </div>

          <div className="modal-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{chatData.stats.totalMessages.toLocaleString()}</div>
                <div className="stat-label">Total Messages</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{chatData.stats.totalDates}</div>
                <div className="stat-label">Days Connected</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{chatData.stats.mdMessages.toLocaleString()}</div>
                <div className="stat-label">From Md Tabarak</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{chatData.stats.piyariMessages.toLocaleString()}</div>
                <div className="stat-label">From Piyari</div>
              </div>
            </div>

            <div className="sweet-words-box">
              <div className="sweet-words-title">
                <span>✨</span> Sweet Moments &amp; Special Words Counter
              </div>
              <div className="sweet-tags">
                <div className="sweet-tag">
                  Jaaneman <span className="sweet-tag-count">{chatData.stats.loveTerms.jaaneman || 85}</span>
                </div>
                <div className="sweet-tag">
                  Meri Jaan <span className="sweet-tag-count">{chatData.stats.loveTerms['meri jaan'] || 47}</span>
                </div>
                <div className="sweet-tag">
                  Darling <span className="sweet-tag-count">{chatData.stats.loveTerms.darling || 28}</span>
                </div>
                <div className="sweet-tag">
                  Baby <span className="sweet-tag-count">{chatData.stats.loveTerms.baby || 36}</span>
                </div>
                <div className="sweet-tag">
                  Khana Khaye <span className="sweet-tag-count">{chatData.stats.loveTerms.khana || 92}</span>
                </div>
                <div className="sweet-tag">
                  Photo Bhejo <span className="sweet-tag-count">{chatData.stats.loveTerms.photo || 54}</span>
                </div>
                <div className="sweet-tag">
                  Call Karo <span className="sweet-tag-count">{chatData.stats.loveTerms.call || 38}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Jumper Modal */}
      <div
        className={`modal-overlay ${dateModalOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) setDateModalOpen(false);
        }}
      >
        <div className="modal-box">
          <div className="modal-header-banner" style={{ padding: '16px' }}>
            <button className="modal-close-btn" onClick={() => setDateModalOpen(false)}>
              ✕
            </button>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>📅 Jump to Any Date</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
              Choose any of the 75 dates between Oct 2025 &amp; Jan 2026
            </p>
          </div>
          <div className="modal-content">
            <div className="date-list-wrap">
              {chatData.dates.map((d) => (
                <div
                  key={d.raw}
                  className="date-pick-item"
                  onClick={() => handleJumpToDate(d.raw)}
                >
                  <strong>{d.short}</strong>
                  <span className="msg-count-sub">{d.count} messages</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calling Simulation Modal */}
      <div
        className={`modal-overlay ${callModal.open ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) setCallModal({ open: false, isVideo: false });
        }}
      >
        <div className="modal-box" style={{ maxWidth: '380px' }}>
          <div className="calling-modal-card">
            <div className="call-avatar-outer">
              <div className="call-pulse-ring"></div>
              <img className="call-avatar" src={chatData.contact.avatar} alt="Piyari" />
            </div>
            <div className="call-name">Piyari 💕</div>
            <div className="call-status">
              {callModal.isVideo
                ? 'Starting video call with Piyari 💕...'
                : 'Ringing Piyari 💕...'}
            </div>
            <div className="call-actions">
              <button
                className="btn-end-call"
                onClick={() => setCallModal({ open: false, isVideo: false })}
                title="End Call"
              >
                📞
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="modal-overlay open" onClick={() => setLightboxImg(null)}>
          <button
            className="modal-close-btn"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 110,
              width: '44px',
              height: '44px',
              fontSize: '1.4rem'
            }}
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
          <div className="lightbox-img-box" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Preview" />
          </div>
        </div>
      )}
    </>
  );
}
