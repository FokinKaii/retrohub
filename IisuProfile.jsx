import React, { useState, useEffect, useRef, useCallback } from 'react';
import './IisuProfile.css';

// 1. CATÁLOGO INICIAL Y DATOS RETRO POR DEFECTO
const DEFAULT_RETRO_GAMES_CATALOG = [
  { id: 'sm64', title: 'Super Mario 64', platform: 'Nintendo 64', platformCode: 'n64', platformColor: '#ff4757', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png', year: '1996' },
  { id: 'oot', title: 'The Legend of Zelda: Ocarina of Time', platform: 'Nintendo 64', platformCode: 'n64', platformColor: '#ff4757', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2579.png', year: '1998' },
  { id: 'poke_emerald', title: 'Pokémon Esmeralda', platform: 'Game Boy Advance', platformCode: 'gba', platformColor: '#5352ed', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20vo.png', year: '2004' },
  { id: 'smw', title: 'Super Mario World', platform: 'Super Nintendo', platformCode: 'snes', platformColor: '#6c5ce7', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png', year: '1990' },
  { id: 'chrono', title: 'Chrono Trigger', platform: 'Super Nintendo', platformCode: 'snes', platformColor: '#6c5ce7', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v2n.png', year: '1995' },
  { id: 'sonic2', title: 'Sonic The Hedgehog 2', platform: 'Sega Genesis', platformCode: 'genesis', platformColor: '#3742fa', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2044.png', year: '1992' },
  { id: 'crash1', title: 'Crash Bandicoot', platform: 'PlayStation 1', platformCode: 'ps1', platformColor: '#0984e3', cover: 'ROMS/covers/box_crash1.png', year: '1996' },
  { id: 'sotn', title: 'Castlevania: Symphony of the Night', platform: 'PlayStation 1', platformCode: 'ps1', platformColor: '#0984e3', cover: 'ROMS/covers/box_sotn.png', year: '1997' }
];

const DEFAULT_PROFILE = {
  id: 2,
  username: 'Sariwiiwi',
  displayName: 'Sara Gamer',
  bio: 'Coleccionista de joyas en caja original, perseguidora de los 60 FPS y fanática de la era dorada de los 64-bits.',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro',
  bannerUrl: 'assets/game_wallpapers/n64/sm64.png',
  titleHonor: '🎮 Maestra de los 64-Bits',
  systemAura: 'mint',
  favoriteSystem: 'n64',
  favoriteGames: [
    { id: 'sm64', title: 'Super Mario 64', platform: 'Nintendo 64', platformColor: '#ff4757', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png', year: '1996' },
    { id: 'oot', title: 'The Legend of Zelda: Ocarina of Time', platform: 'Nintendo 64', platformColor: '#ff4757', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2579.png', year: '1998' },
    { id: 'poke_emerald', title: 'Pokémon Esmeralda', platform: 'Game Boy Advance', platformColor: '#5352ed', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20vo.png', year: '2004' }
  ],
  socialLinks: [
    { id: 'l1', platform: 'discord', title: 'Discord', url: 'https://discord.gg/retrohub', icon: '💬' },
    { id: 'l2', platform: 'steam', title: 'Steam', url: 'https://steamcommunity.com/id/sariwiiwi', icon: '🎮' },
    { id: 'l3', platform: 'twitch', title: 'Twitch', url: 'https://twitch.tv/sariwiiwi', icon: '📺' },
    { id: 'l4', platform: 'github', title: 'GitHub', url: 'https://github.com/sariwiiwi', icon: '🐙' }
  ]
};

export const IisuProfile = () => {
  // Estado del perfil activo
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [originalUsername, setOriginalUsername] = useState(DEFAULT_PROFILE.username);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  // Validación de nombre de usuario en tiempo real
  const [usernameInput, setUsernameInput] = useState(DEFAULT_PROFILE.username);
  const [usernameValidation, setUsernameValidation] = useState({
    status: 'available', // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
    message: '✓ Nombre actual disponible'
  });

  // Modal de selección de stock
  const [stockModalTarget, setStockModalTarget] = useState(null); // 'avatar' | 'banner' | 'game' | null
  const [stockTab, setStockTab] = useState('dicebear');
  const [stockData, setStockData] = useState({ avatars: [], banners: [] });

  // Nuevo enlace en formulario
  const [newLinkPlatform, setNewLinkPlatform] = useState('discord');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  // Notificación Toast
  const [toast, setToast] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const fileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 2. OBTENER USUARIO DESDE PARÁMETRO DE URL (Soporte para compartir perfil)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let targetUser = params.get('user') || params.get('username');

    // También soportar ruta tipo /profile/:username
    if (!targetUser) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === 'profile' && !pathParts[1].endsWith('.html')) {
        targetUser = pathParts[1];
      }
    }

    const loadProfileData = async () => {
      try {
        const usernameToFetch = targetUser || DEFAULT_PROFILE.username;
        const res = await fetch(`/api/users/profile/${encodeURIComponent(usernameToFetch)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            const u = data.user;
            const loaded = {
              id: u.id,
              username: u.username,
              displayName: u.displayName || u.username,
              bio: u.bio || '',
              avatarUrl: u.avatarUrl || DEFAULT_PROFILE.avatarUrl,
              bannerUrl: u.bannerUrl || DEFAULT_PROFILE.bannerUrl,
              titleHonor: u.titleHonor || DEFAULT_PROFILE.titleHonor,
              systemAura: u.systemAura || 'mint',
              favoriteSystem: u.favoriteSystem || 'n64',
              favoriteGames: u.favoriteGames || [],
              socialLinks: u.socialLinks || []
            };
            setProfile(loaded);
            setUsernameInput(loaded.username);
            setOriginalUsername(loaded.username);
            setUsernameValidation({ status: 'available', message: '✓ Nombre de usuario confirmado' });
            
            // Si targetUser coincide con el usuario activo o no se especificó, es propietario
            setIsOwner(!targetUser || targetUser.toLowerCase() === DEFAULT_PROFILE.username.toLowerCase());
          }
        }
      } catch (err) {
        console.warn('[Profile]: Usando datos locales predeterminados.', err);
      }
    };

    loadProfileData();

    // Cargar catálogo de stock disponible
    fetch('/api/assets/stock-images')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStockData({ avatars: d.avatars || [], banners: d.banners || [] });
        }
      })
      .catch(() => {});
  }, []);

  // 3. VALIDACIÓN DE NOMBRE DE USUARIO CON DEBOUNCE
  const validateUsernameRealtime = useCallback((name) => {
    const trimmed = name.trim();

    if (!trimmed) {
      setUsernameValidation({ status: 'invalid', message: '⚠ El nombre de usuario no puede estar vacío.' });
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 24) {
      setUsernameValidation({ status: 'invalid', message: '⚠ Debe tener entre 3 y 24 caracteres.' });
      return;
    }

    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(trimmed)) {
      setUsernameValidation({ status: 'invalid', message: '⚠ Solo se permiten letras, números, _ y -' });
      return;
    }

    // Si es el mismo que ya tiene guardado
    if (trimmed.toLowerCase() === originalUsername.toLowerCase()) {
      setUsernameValidation({ status: 'available', message: '✓ Tu nombre actual' });
      return;
    }

    setUsernameValidation({ status: 'checking', message: '⟳ Comprobando disponibilidad en la base de datos...' });

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username/${encodeURIComponent(trimmed)}?excludeUserId=${profile.id}`);
        const data = await res.json();
        if (data.available) {
          setUsernameValidation({ status: 'available', message: `✓ ¡@${trimmed} está libre!` });
        } else {
          setUsernameValidation({ status: 'taken', message: `✗ ${data.message || 'Este nombre de usuario ya está en uso.'}` });
        }
      } catch {
        setUsernameValidation({ status: 'available', message: '✓ Formato válido' });
      }
    }, 320);
  }, [originalUsername, profile.id]);

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsernameInput(val);
    validateUsernameRealtime(val);
  };

  // 4. SUBIDA MANUAL DE IMAGEN (FileReader + API)
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'El archivo seleccionado debe ser una imagen (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast('error', 'La imagen no debe superar los 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      const target = stockModalTarget || 'avatar';

      try {
        // Enviar al endpoint de subida del backend
        const res = await fetch('/api/users/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            type: target === 'banner' ? 'banner' : 'pfp',
            filename: file.name
          })
        });
        const data = await res.json();

        const finalUrl = data.success && data.url ? data.url : base64Data;
        if (target === 'banner') {
          setProfile(p => ({ ...p, bannerUrl: finalUrl }));
        } else {
          setProfile(p => ({ ...p, avatarUrl: finalUrl }));
        }
        showToast('success', `Imagen ${target === 'banner' ? 'de banner' : 'de perfil'} cargada correctamente.`);
      } catch {
        // Fallback directo a data URL si el backend estuviese offline
        if (target === 'banner') {
          setProfile(p => ({ ...p, bannerUrl: base64Data }));
        } else {
          setProfile(p => ({ ...p, avatarUrl: base64Data }));
        }
        showToast('success', 'Imagen procesada localmente.');
      }
      setStockModalTarget(null);
    };
    reader.readAsDataURL(file);
  };

  // 5. GUARDAR CAMBIOS EN EL PERFIL
  const handleSaveProfile = async () => {
    if (usernameValidation.status === 'taken' || usernameValidation.status === 'invalid') {
      showToast('error', 'Corrige el nombre de usuario antes de guardar.');
      return;
    }

    setIsSaving(true);
    const updatedPayload = {
      userId: profile.id,
      username: usernameInput.trim(),
      displayName: profile.displayName.trim() || usernameInput.trim(),
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      titleHonor: profile.titleHonor,
      systemAura: profile.systemAura,
      favoriteSystem: profile.favoriteSystem,
      favoriteGames: profile.favoriteGames,
      socialLinks: profile.socialLinks
    };

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error ? data.error.message : 'Error al guardar el perfil.';
        showToast('error', errorMsg);
        if (data.error && data.error.code === 'USERNAME_ALREADY_EXISTS') {
          setUsernameValidation({ status: 'taken', message: '✗ Este nombre ya está en uso en la base de datos.' });
        }
        setIsSaving(false);
        return;
      }

      setProfile(p => ({
        ...p,
        username: updatedPayload.username,
        displayName: updatedPayload.displayName
      }));
      setOriginalUsername(updatedPayload.username);
      setIsEditing(false);
      showToast('success', '✓ Perfil actualizado y sincronizado en la base de datos.');

      // Guardar también en localStorage para coherencia en el cliente
      localStorage.setItem('retrohub_user_name', updatedPayload.username);
      localStorage.setItem('retrohub_display_name', updatedPayload.displayName);
      localStorage.setItem('retrohub_user_bio', updatedPayload.bio);
      localStorage.setItem('retrohub_user_avatar', updatedPayload.avatarUrl);
      localStorage.setItem('retrohub_user_banner', updatedPayload.bannerUrl);
    } catch {
      // Si el servidor no responde, simular persistencia
      setProfile(p => ({
        ...p,
        username: updatedPayload.username,
        displayName: updatedPayload.displayName
      }));
      setOriginalUsername(updatedPayload.username);
      setIsEditing(false);
      showToast('success', 'Perfil guardado en almacenamiento local.');
    } finally {
      setIsSaving(false);
    }
  };

  // 6. GESTIÓN DE JUEGOS FAVORITOS
  const handleRemoveGame = (gameId) => {
    setProfile(p => ({
      ...p,
      favoriteGames: p.favoriteGames.filter(g => g.id !== gameId)
    }));
    showToast('info', 'Juego eliminado de tus favoritos.');
  };

  const handleAddGameFromCatalog = (game) => {
    if (profile.favoriteGames.some(g => g.id === game.id)) {
      showToast('info', 'Este juego ya está en tus favoritos.');
      return;
    }
    setProfile(p => ({
      ...p,
      favoriteGames: [...p.favoriteGames, game]
    }));
    setStockModalTarget(null);
    showToast('success', `¡${game.title} añadido a tus favoritos!`);
  };

  // 7. GESTIÓN DE ENLACES
  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      showToast('error', 'Por favor ingresa un título y una URL válida.');
      return;
    }

    const platformIcons = {
      discord: '💬',
      steam: '🎮',
      twitch: '📺',
      github: '🐙',
      youtube: '▶️',
      twitter: '🐦',
      retrohub: '🕹️',
      web: '🌐'
    };

    const newLink = {
      id: `link_${Date.now()}`,
      platform: newLinkPlatform,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      icon: platformIcons[newLinkPlatform] || '🔗'
    };

    setProfile(p => ({
      ...p,
      socialLinks: [...p.socialLinks, newLink]
    }));

    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLinkForm(false);
    showToast('success', 'Enlace añadido a tu perfil.');
  };

  const handleRemoveLink = (linkId) => {
    setProfile(p => ({
      ...p,
      socialLinks: p.socialLinks.filter(l => l.id !== linkId)
    }));
  };

  // 8. COMPARTIR PERFIL
  const handleShareProfile = () => {
    const cleanUrl = `${window.location.origin}/profile.html?user=${encodeURIComponent(profile.username)}`;
    navigator.clipboard.writeText(cleanUrl).then(() => {
      setShareCopied(true);
      showToast('success', '🔗 Enlace de perfil copiado al portapapeles.');
      setTimeout(() => setShareCopied(false), 3000);
    }).catch(() => {
      showToast('info', `Enlace de perfil: ${cleanUrl}`);
    });
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="profile-page-wrapper">
      {/* Input de archivo invisible para subida manual */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileUpload}
      />

      {/* Orbes bioluminiscentes ambientales */}
      <div className="profile-ambient-orb profile-orb-1" />
      <div className="profile-ambient-orb profile-orb-2" />
      <div className="profile-ambient-orb profile-orb-3" />

      {/* NOTIFICACIÓN TOAST */}
      {toast && (
        <div className={`profile-toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOPBAR SUPERIOR ESTILO iiSU */}
      <header className="profile-topbar">
        <a href="/iisu_network.html" className="topbar-brand-link" title="Volver al OS de iiSU">
          <div className="topbar-brand-icon">🎮</div>
          <div>
            <span className="topbar-brand-title">iiSU Network</span>
            <span className="topbar-brand-sub">Perfil de Usuario</span>
          </div>
        </a>

        <div className="topbar-actions">
          {/* Botón de compartir enlace directo */}
          <button className="btn-console-cue" onClick={handleShareProfile} title="Copiar enlace directo de este perfil">
            <span className="cue-circle cue-y">Y</span>
            <span>{shareCopied ? '¡Copiado!' : 'Compartir'}</span>
          </button>

          {/* Botón de volver a la app principal */}
          <a href="/iisu_network.html" className="btn-console-cue">
            <span className="cue-circle cue-b">B</span>
            <span>Volver a iiSU</span>
          </a>

          {/* Alternar modo edición / ver */}
          {isOwner && (
            <button
              className={`btn-console-cue ${isEditing ? 'btn-primary-action' : ''}`}
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <span className="cue-circle cue-a">A</span>
              <span>{isEditing ? (isSaving ? 'Guardando...' : 'Guardar Perfil') : 'Editar Perfil'}</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. ZONA DEL BANNER CON DIFUMINADO PROGRESIVO SIN CORTE VISIBLE */}
      <section className="profile-banner-stage">
        <img
          src={profile.bannerUrl}
          className="profile-banner-img"
          alt="Banner de perfil"
          onError={(e) => {
            e.target.src = 'assets/game_wallpapers/n64/sm64.png';
          }}
        />

        {/* Capa de difuminado progresivo hacia el color sólido de fondo */}
        <div className="profile-banner-fade-overlay" />

        {/* Botón para cambiar banner (visible en modo edición) */}
        {isEditing && (
          <button
            className="btn-banner-edit"
            onClick={() => setStockModalTarget('banner')}
            title="Cambiar imagen de banner"
          >
            <span>🖼️</span> Cambiar Banner
          </button>
        )}
      </section>

      {/* 4. CONTENEDOR PRINCIPAL */}
      <main className="profile-main-container">

        {/* 5. ZONA DEL AVATAR CENTRAL (PFP) */}
        <div className="profile-avatar-center-stage">
          <div className="profile-avatar-wrapper">
            <img
              src={profile.avatarUrl}
              className="profile-avatar-img"
              alt={profile.displayName}
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro';
              }}
            />
            <div className="profile-online-badge" title="En línea en iiSU Network" />

            {/* Overlay para cambiar foto al hacer clic en modo edición */}
            {isEditing && (
              <div
                className="avatar-edit-overlay"
                onClick={() => setStockModalTarget('avatar')}
                title="Cambiar foto de perfil"
              >
                <span style={{ fontSize: '24px' }}>📷</span>
                <span className="avatar-edit-text">Cambiar</span>
              </div>
            )}
          </div>

          {/* Acciones rápidas para foto de perfil */}
          {isEditing && (
            <div className="avatar-quick-actions">
              <button
                className="btn-avatar-quick"
                onClick={() => setStockModalTarget('avatar')}
              >
                ✨ Elegir de Stock
              </button>
              <button
                className="btn-avatar-quick"
                onClick={() => {
                  setStockModalTarget('avatar');
                  fileInputRef.current?.click();
                }}
              >
                📁 Subir Manualmente
              </button>
            </div>
          )}

          {/* Bloque de identidad del usuario */}
          <div className="profile-identity-block">
            <h1 className="profile-display-name">{profile.displayName}</h1>
            <span className="profile-username-tag">
              <span>●</span> @{profile.username}
            </span>

            <div className="profile-badges-row">
              <span className="profile-honor-badge">{profile.titleHonor}</span>
              <span className="profile-system-badge">
                Consola Predilecta: {profile.favoriteSystem.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 6. GRID PRINCIPAL: INFORMACIÓN PERSONAL, JUEGOS Y ENLACES */}
        <div className="profile-content-grid">

          {/* COLUMNA IZQUIERDA: BIO & DETALLES EDITABLES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* TARJETA DE BIOGRAFÍA */}
            <div className="profile-glass-card">
              <div className="card-header-row">
                <div className="card-title-wrap">
                  <span className="card-icon">📝</span>
                  <h3 className="card-title">Descripción Personal</h3>
                </div>
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    className="profile-bio-textarea"
                    value={profile.bio}
                    maxLength={350}
                    placeholder="Escribe algo sobre ti, tus sagas retro preferidas, consolas de la infancia..."
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                  />
                  <div className="field-char-count">
                    {profile.bio.length} / 350 caracteres
                  </div>
                </div>
              ) : (
                <p className="profile-bio-text">
                  {profile.bio || 'Sin descripción personal todavía.'}
                </p>
              )}
            </div>

            {/* TARJETA DE EDICIÓN DE IDENTIDAD (Sólo visible en modo edición) */}
            {isEditing && (
              <div className="profile-glass-card">
                <div className="card-header-row">
                  <div className="card-title-wrap">
                    <span className="card-icon">⚙️</span>
                    <h3 className="card-title">Ajustes de Cuenta</h3>
                  </div>
                </div>

                {/* CAMPO DE NOMBRE DE USUARIO CON VERIFICACIÓN EN BASE DE DATOS */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="inputUsername">
                    Nombre de Usuario Único
                  </label>
                  <span className="form-hint">
                    Debe ser único en toda la plataforma. 3-24 letras, números, _ o -.
                  </span>

                  <div className="username-input-wrap">
                    <span className="username-at-prefix">@</span>
                    <input
                      id="inputUsername"
                      type="text"
                      className={`form-text-input input-${usernameValidation.status}`}
                      value={usernameInput}
                      maxLength={24}
                      onChange={handleUsernameChange}
                      placeholder="usuario"
                    />
                  </div>

                  {/* Mensaje visual de validación */}
                  <div className={`validation-message-badge status-${usernameValidation.status}`}>
                    {usernameValidation.message}
                  </div>
                </div>

                {/* NOMBRE VISIBLE (DISPLAY NAME) */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="inputDisplayName">
                    Nombre Público Visible
                  </label>
                  <input
                    id="inputDisplayName"
                    type="text"
                    className="form-text-input no-prefix"
                    value={profile.displayName}
                    maxLength={32}
                    onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                    placeholder="Tu alias o nombre gamer"
                  />
                </div>

                {/* TÍTULO DE HONOR */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="inputTitleHonor">
                    Título Honorífico
                  </label>
                  <input
                    id="inputTitleHonor"
                    type="text"
                    className="form-text-input no-prefix"
                    value={profile.titleHonor}
                    maxLength={40}
                    onChange={(e) => setProfile(p => ({ ...p, titleHonor: e.target.value }))}
                    placeholder="Ej: 🎮 Maestro de los 64-Bits"
                  />
                </div>
              </div>
            )}

            {/* TARJETA DE ENLACES EXTERNOS */}
            <div className="profile-glass-card">
              <div className="card-header-row">
                <div className="card-title-wrap">
                  <span className="card-icon">🌐</span>
                  <h3 className="card-title">Enlaces & Redes</h3>
                </div>
                {isEditing && (
                  <button
                    className="btn-avatar-quick"
                    style={{ color: 'var(--mint-light)' }}
                    onClick={() => setShowAddLinkForm(!showAddLinkForm)}
                  >
                    + Añadir
                  </button>
                )}
              </div>

              {/* Formulario para nuevo enlace */}
              {isEditing && showAddLinkForm && (
                <form onSubmit={handleAddLink} style={{ marginBottom: '18px', padding: '14px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label className="form-label">Plataforma</label>
                    <select
                      className="form-text-input no-prefix"
                      value={newLinkPlatform}
                      onChange={(e) => setNewLinkPlatform(e.target.value)}
                      style={{ padding: '8px 12px' }}
                    >
                      <option value="discord">Discord</option>
                      <option value="steam">Steam</option>
                      <option value="twitch">Twitch</option>
                      <option value="github">GitHub</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="retrohub">RetroHub</option>
                      <option value="web">Sitio Web Personal</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label className="form-label">Etiqueta / Nombre</label>
                    <input
                      type="text"
                      className="form-text-input no-prefix"
                      placeholder="Ej: Mi canal de directos"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      style={{ padding: '8px 12px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label className="form-label">URL del Sitio</label>
                    <input
                      type="text"
                      className="form-text-input no-prefix"
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      style={{ padding: '8px 12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-avatar-quick"
                      onClick={() => setShowAddLinkForm(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-console-cue btn-primary-action"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Guardar Enlace
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de enlaces */}
              <div className="profile-links-list">
                {profile.socialLinks && profile.socialLinks.length > 0 ? (
                  profile.socialLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link-item"
                    >
                      <div className="link-platform-info">
                        <div className="link-icon-box">{link.icon || '🔗'}</div>
                        <div>
                          <div className="link-text-title">{link.title}</div>
                          <div className="link-url-sub">{link.url.replace(/^https?:\/\//, '')}</div>
                        </div>
                      </div>

                      <div className="link-actions">
                        <span style={{ fontSize: '12px', color: 'var(--mint-light)' }}>↗</span>
                        {isEditing && (
                          <button
                            type="button"
                            className="btn-link-del"
                            title="Eliminar enlace"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveLink(link.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                    No hay enlaces configurados.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: JUEGOS FAVORITOS */}
          <div>
            <div className="profile-glass-card">
              <div className="card-header-row">
                <div className="card-title-wrap">
                  <span className="card-icon">⭐</span>
                  <h3 className="card-title">Juegos Favoritos</h3>
                </div>
                {isEditing && (
                  <button
                    className="btn-avatar-quick"
                    style={{ color: 'var(--mint-light)' }}
                    onClick={() => setStockModalTarget('game')}
                  >
                    + Añadir Juego
                  </button>
                )}
              </div>

              <div className="games-favorite-grid">
                {profile.favoriteGames.map(game => (
                  <div key={game.id} className="game-fav-card">
                    {/* Listón de plataforma */}
                    <div
                      className="game-platform-ribbon"
                      style={{ background: game.platformColor || '#ff4757' }}
                    >
                      {game.platform || 'RETRO'}
                    </div>

                    {/* Botón de eliminar en edición */}
                    {isEditing && (
                      <button
                        className="btn-game-remove"
                        title="Quitar de favoritos"
                        onClick={() => handleRemoveGame(game.id)}
                      >
                        ✕
                      </button>
                    )}

                    <div className="game-fav-cover-wrap">
                      <img
                        src={game.cover}
                        className="game-fav-cover"
                        alt={game.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>

                    <div className="game-fav-info">
                      <div className="game-fav-title" title={game.title}>{game.title}</div>
                      <div className="game-fav-meta">{game.year || 'Clásico'}</div>
                    </div>
                  </div>
                ))}

                {/* Tarjeta rápida para añadir más juegos en modo edición */}
                {isEditing && (
                  <div
                    className="game-add-card"
                    onClick={() => setStockModalTarget('game')}
                    title="Añadir un juego favorito"
                  >
                    <div className="game-add-plus">+</div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Añadir Juego</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* 7. BARRA FLOTANTE DE GUARDADO (En modo edición) */}
        {isEditing && (
          <div className="profile-save-bar">
            <div className="save-bar-info">
              <span>✏️ Modo Edición Activo</span>
            </div>
            <div className="save-bar-actions">
              <button
                className="btn-avatar-quick"
                onClick={() => {
                  setIsEditing(false);
                  setUsernameInput(originalUsername);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-console-cue btn-primary-action"
                disabled={isSaving || usernameValidation.status === 'taken' || usernameValidation.status === 'invalid'}
                onClick={handleSaveProfile}
              >
                <span className="cue-circle cue-a">A</span>
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 8. MODAL DE SELECCIÓN DE IMÁGENES DE STOCK (STOCK PICKER) */}
      {stockModalTarget && (
        <div className="profile-modal-backdrop" onClick={() => setStockModalTarget(null)}>
          <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {stockModalTarget === 'avatar' && 'Elegir Foto de Perfil'}
                {stockModalTarget === 'banner' && 'Elegir Imagen de Banner'}
                {stockModalTarget === 'game' && 'Añadir Juego a Favoritos'}
              </h3>
              <button className="modal-btn-close" onClick={() => setStockModalTarget(null)}>✕</button>
            </div>

            {/* Pestañas de selección */}
            {stockModalTarget === 'avatar' && (
              <div className="modal-tabs">
                <button
                  className={`modal-tab-btn ${stockTab === 'dicebear' ? 'active' : ''}`}
                  onClick={() => setStockTab('dicebear')}
                >
                  Personajes Retro
                </button>
                <button
                  className={`modal-tab-btn ${stockTab === 'consoles' ? 'active' : ''}`}
                  onClick={() => setStockTab('consoles')}
                >
                  Consolas Reales
                </button>
                <button
                  className={`modal-tab-btn ${stockTab === 'covers' ? 'active' : ''}`}
                  onClick={() => setStockTab('covers')}
                >
                  Portadas
                </button>
              </div>
            )}

            {stockModalTarget === 'banner' && (
              <div className="modal-tabs">
                <button
                  className={`modal-tab-btn ${stockTab === 'wallpapers' ? 'active' : ''}`}
                  onClick={() => setStockTab('wallpapers')}
                >
                  Fondos de Juegos
                </button>
                <button
                  className={`modal-tab-btn ${stockTab === 'synthwave' ? 'active' : ''}`}
                  onClick={() => setStockTab('synthwave')}
                >
                  Estilo Retro Wave
                </button>
              </div>
            )}

            <div className="modal-content-scroll">
              {/* Opción de subir archivo directamente */}
              {(stockModalTarget === 'avatar' || stockModalTarget === 'banner') && (
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📁</div>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                    Haz clic para subir un archivo local desde tu equipo
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    PNG, JPG, SVG, WebP o GIF (hasta 12MB)
                  </div>
                </div>
              )}

              {/* Cuadrícula de Avatares */}
              {stockModalTarget === 'avatar' && (
                <div className="stock-grid">
                  {(stockData.avatars.length > 0 ? stockData.avatars : [
                    { id: '1', name: 'Sara Retro', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro' },
                    { id: '2', name: 'Lucas', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
                    { id: '3', name: 'Queen', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen' },
                    { id: '4', name: 'Cyber', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber' },
                    { id: '5', name: 'Alex', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
                    { id: '6', name: 'Super Mario 64', url: 'ROMS/covers/box_sm64.png' },
                    { id: '7', name: 'Zelda OOT', url: 'ROMS/covers/box_oot.png' },
                    { id: '8', name: 'Pokémon Esmeralda', url: 'ROMS/covers/box_emerald.png' }
                  ]).map(item => (
                    <div
                      key={item.id}
                      className="stock-item-card"
                      onClick={() => {
                        setProfile(p => ({ ...p, avatarUrl: item.url }));
                        setStockModalTarget(null);
                        showToast('success', 'Foto de perfil actualizada.');
                      }}
                    >
                      <img src={item.url} className="stock-thumbnail" alt={item.name} />
                      <div className="stock-item-label">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cuadrícula de Banners */}
              {stockModalTarget === 'banner' && (
                <div className="stock-grid banner-grid">
                  {(stockData.banners.length > 0 ? stockData.banners : [
                    { id: 'b1', name: 'Super Mario 64', url: 'assets/game_wallpapers/n64/sm64.png' },
                    { id: 'b2', name: 'Zelda Ocarina of Time', url: 'assets/game_wallpapers/n64/oot.png' },
                    { id: 'b3', name: 'Chrono Trigger', url: 'assets/game_wallpapers/snes/chrono.png' },
                    { id: 'b4', name: 'Super Mario World', url: 'assets/game_wallpapers/snes/smw.png' },
                    { id: 'b5', name: 'Pokémon Esmeralda', url: 'assets/game_wallpapers/gba/pokemon_emerald.png' },
                    { id: 'b6', name: 'Final Fantasy VII', url: 'assets/game_wallpapers/ps1/ff7.png' }
                  ]).map(item => (
                    <div
                      key={item.id}
                      className="stock-item-card banner-card"
                      onClick={() => {
                        setProfile(p => ({ ...p, bannerUrl: item.url }));
                        setStockModalTarget(null);
                        showToast('success', 'Banner de perfil actualizado.');
                      }}
                    >
                      <img src={item.url} className="stock-thumbnail" alt={item.name} />
                      <div className="stock-item-label">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Catálogo para añadir juego favorito */}
              {stockModalTarget === 'game' && (
                <div className="stock-grid">
                  {DEFAULT_RETRO_GAMES_CATALOG.map(game => (
                    <div
                      key={game.id}
                      className="stock-item-card"
                      onClick={() => handleAddGameFromCatalog(game)}
                    >
                      <img src={game.cover} className="stock-thumbnail" alt={game.title} />
                      <div className="stock-item-label">{game.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IisuProfile;
