import React, { useState, useEffect } from 'react';
import './IisuNetwork.css';

// 5. MOCK DE DATOS OFICIAL
export const IISU_MOCK_DATA = {
  user: {
    name: "Sara Gamer",
    handle: "@saragamer",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro",
    status: "Conectada"
  },
  friends: [
    {
      id: "f1",
      name: "Lucas_Fox",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
      statusText: "¡Jugando Smash Bros Melee!",
      platformName: "Wii",
      platformColor: "#00d2d3",
      notifications: 3
    },
    {
      id: "f2",
      name: "PixelQueen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Queen",
      statusText: "En el Templo del Agua 💧",
      platformName: "N64",
      platformColor: "#ff4757",
      notifications: 1
    },
    {
      id: "f3",
      name: "Alex_Speedrun",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      statusText: "Nuevo PB Mario 64 (16★)",
      platformName: "Switch",
      platformColor: "#e60012",
      notifications: 0
    },
    {
      id: "f4",
      name: "CyberKidd",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber",
      statusText: "Capturando a Mewtwo",
      platformName: "GB",
      platformColor: "#8e44ad",
      notifications: 2
    }
  ],
  games: [
    {
      id: "smash",
      title: "Super Smash Bros. Melee",
      platformLabel: "SWITCH",
      platformColor: "#e60012",
      boxArt: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2224.png",
      fallbackArt: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
      activeFriends: [
        { name: "Lucas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
        { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" }
      ]
    },
    {
      id: "mario64",
      title: "Super Mario 64",
      platformLabel: "N64",
      platformColor: "#f39c12",
      boxArt: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png",
      fallbackArt: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
      activeFriends: [
        { name: "PixelQueen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Queen" }
      ]
    },
    {
      id: "mariokart",
      title: "Mario Kart Wii",
      platformLabel: "Wii",
      platformColor: "#00d2d3",
      boxArt: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7f.png",
      fallbackArt: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
      activeFriends: [
        { name: "Lucas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
        { name: "Sara", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro" },
        { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" }
      ]
    },
    {
      id: "pokemon",
      title: "Pokémon Esmeralda",
      platformLabel: "GBA",
      platformColor: "#8e44ad",
      boxArt: "https://images.igdb.com/igdb/image/upload/t_cover_big/co20vo.png",
      fallbackArt: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      activeFriends: [
        { name: "CyberKidd", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber" }
      ]
    }
  ],
  feed: [
    {
      id: "post1",
      authorName: "Kamek_Fan_09",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kamek",
      headline: "Coughing Baby vs Hydrogenic Bomb: ¿Quién gana en Final Destination con Fox?",
      subtext: "Por @Kamek_Fan_09 • hace 2h en Torneos Melee",
      upvotes: 84,
      downvotes: 41
    },
    {
      id: "post2",
      authorName: "SpeedyGonzales",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Speedy",
      headline: "Nuevo récord mundial conseguido en Rainbow Road 64 (Sin atajos glitcheados)",
      subtext: "Por @SpeedyGonzales • hace 4h en Speedrunning",
      upvotes: 126,
      downvotes: 12
    }
  ]
};

export const IisuNetwork = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTool, setActiveTool] = useState('clock');
  const [time, setTime] = useState({ clock: '12:00', date: '09/30' });
  const [feedPosts, setFeedPosts] = useState(IISU_MOCK_DATA.feed);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const clock = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const date = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
      setTime({ clock, date });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (id, delta) => {
    setFeedPosts(prev => prev.map(p => {
      if (p.id === id) {
        return delta > 0 ? { ...p, upvotes: p.upvotes + 1 } : { ...p, downvotes: p.downvotes + 1 };
      }
      return p;
    }));
  };

  return (
    <div className="iisu-app-viewport">
      {/* Orbes bioluminiscentes de fondo dinámico */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* 1. VENTANA FLOTANTE (Glassmorphism con blur 15px) */}
      <div className="iisu-window">
        
        {/* 2. BARRA LATERAL IZQUIERDA (Sidebar) */}
        <aside className="iisu-sidebar">
          <div>
            <div className="sidebar-brand">
              <div className="brand-icon-box">🎮</div>
              <div className="brand-text-wrap">
                <span className="brand-title">iiSU</span>
                <span className="brand-sub">Network OS</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <img src={IISU_MOCK_DATA.user.avatar} className="user-nav-avatar" alt="Avatar" />
                <span>Mi Perfil</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                <span className="nav-icon">👥</span>
                <span>Amigos</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'global' ? 'active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                <span className="nav-icon">🌐</span>
                <span>Global</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <span className="nav-icon">💬</span>
                <span>Mensajes</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          <div className="sidebar-footer">
            <img src={IISU_MOCK_DATA.user.avatar} className="user-chip-avatar" alt="Sara" />
            <div className="user-chip-info">
              <span className="user-chip-name">{IISU_MOCK_DATA.user.name}</span>
              <span className="user-chip-status">{IISU_MOCK_DATA.user.status}</span>
            </div>
          </div>
        </aside>

        {/* CONTENEDOR DERECHO */}
        <main className="iisu-main">
          
          {/* 3. CABECERA SUPERIOR (Top Bar) */}
          <header className="iisu-topbar">
            {/* Izquierda: Título + Carita sonriente clásica */}
            <div className="topbar-left">
              <div className="classic-smiley">😊</div>
              <h2 className="topbar-title">iiSU Network</h2>
            </div>

            {/* Centro: Botones estilo consola */}
            <div className="console-controls-bar">
              <div className="btn-prompt">
                <span className="btn-bubble btn-a">A</span>
                <span>Select</span>
              </div>
              <div className="btn-prompt">
                <span className="btn-bubble btn-b">B</span>
                <span>Back</span>
              </div>
              <div className="btn-prompt">
                <span className="btn-bubble btn-y">Y</span>
                <span>Share</span>
              </div>
              <div className="btn-prompt">
                <span className="btn-bubble btn-start">START</span>
                <span>Menu</span>
              </div>
            </div>

            {/* Derecha: Estado RT, Reloj, Fecha, Batería */}
            <div className="topbar-right">
              <span className="trigger-indicator">RT</span>
              <span className="live-clock">{time.clock}</span>
              <span className="live-date">{time.date}</span>
              <div className="battery-widget">
                <div className="battery-shell">
                  <div className="battery-fill" />
                </div>
                <span className="battery-text">82%</span>
              </div>
            </div>
          </header>

          {/* 4. ÁREA CENTRAL (3 Filas Principales) */}
          <section className="central-stage">

            {/* FILA 1: CARRUSEL DE ESTADO DE AMIGOS */}
            <div className="row-friends-carousel">
              {IISU_MOCK_DATA.friends.map(friend => (
                <div key={friend.id} className="friend-status-card">
                  {/* Globo de texto de estado */}
                  <div className="speech-bubble" title={friend.statusText}>
                    {friend.statusText}
                  </div>

                  <div className="avatar-platform-group">
                    <img src={friend.avatar} className="friend-avatar-img" alt={friend.name} />
                    {friend.notifications > 0 && (
                      <div className="notification-red-badge">{friend.notifications}</div>
                    )}
                    {/* Detalle crítico: icono de plataforma */}
                    <div className="platform-mini-tag" style={{ background: friend.platformColor }}>
                      {friend.platformName}
                    </div>
                  </div>

                  <span className="friend-name-label">{friend.name}</span>
                </div>
              ))}
            </div>

            {/* FILA 2: CUADRÍCULA DE JUEGOS ACTIVOS CON MINI-COLUMNA */}
            <div className="row-games-section">
              {/* Mini-columna con botones de Reloj y Documento */}
              <div className="mini-side-tools">
                <button 
                  className={`tool-icon-btn ${activeTool === 'clock' ? 'active' : ''}`}
                  title="Historial de juegos recientes"
                  onClick={() => setActiveTool('clock')}
                >
                  🕒
                </button>
                <button 
                  className={`tool-icon-btn ${activeTool === 'doc' ? 'active' : ''}`}
                  title="Logs de actividad y noticias"
                  onClick={() => setActiveTool('doc')}
                >
                  📄
                </button>
              </div>

              {/* Cuadrícula de juegos cuadrados con Box Art */}
              <div className="games-grid-container">
                {IISU_MOCK_DATA.games.map(game => (
                  <div key={game.id} className="game-card-box">
                    {/* Detalle crítico 1: Listón de consola en esquina superior izquierda */}
                    <div className="platform-ribbon-tag" style={{ background: game.platformColor }}>
                      <span>●</span> {game.platformLabel}
                    </div>

                    <img 
                      src={game.boxArt} 
                      className="game-box-art" 
                      alt={game.title}
                      onError={(e) => { e.target.src = game.fallbackArt; }}
                    />

                    {/* Detalle crítico 2: Avatares superpuestos en esquina inferior izquierda */}
                    <div className="active-friends-cluster">
                      {game.activeFriends.map((af, i) => (
                        <img 
                          key={i} 
                          src={af.avatar} 
                          className="cluster-avatar" 
                          title={af.name} 
                          alt={af.name} 
                        />
                      ))}
                      <span className="cluster-count">+{game.activeFriends.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FILA 3: FEED DE COMUNIDAD */}
            <div className="row-community-feed">
              {feedPosts.map(post => (
                <div key={post.id} className="feed-post-card">
                  <div className="feed-author-wrap">
                    <img src={post.authorAvatar} className="feed-avatar" alt={post.authorName} />
                    <div className="feed-text-col">
                      <div className="feed-headline">{post.headline}</div>
                      <div className="feed-subtext">{post.subtext}</div>
                    </div>
                  </div>

                  {/* Detalle crítico: Píldora verde menta con upvotes / downvotes */}
                  <div className="vote-pill-badge">
                    <button className="vote-btn" onClick={() => handleVote(post.id, 1)}>▲</button>
                    <span>{post.upvotes}</span>
                    <span className="vote-divider">|</span>
                    <button className="vote-btn" onClick={() => handleVote(post.id, -1)}>▼</button>
                    <span>{post.downvotes}</span>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </main>
      </div>
    </div>
  );
};

export default IisuNetwork;
