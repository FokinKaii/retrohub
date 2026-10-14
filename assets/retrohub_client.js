/**
 * RetroHub Master Client Engine (Nintendo Clean Edition)
 * Handles: Fullscreen Nintendo Setup Wizard, Authentication, Real Friends Network,
 * Server-Enforced Privacy and Realtime Socket.io Synchronization.
 * Compliant with: nuevos_requisitos_del_proyecto.md
 */

const RetroHub = {
  token: localStorage.getItem('retrohub_jwt_token') || null,
  user: null,
  profile: null,
  privacy: null,
  favoriteEmulators: ['n64', 'snes', 'gba', 'ps1'],
  socket: null,
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  blockedUsers: [],
  activeChatUser: null,
  chatMessages: {},

  onboardingData: {
    step: 1,
    displayName: '',
    bio: 'Coleccionista de joyas en caja original y entusiasta de los 60 FPS.',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=MarioN64',
    systemAura: 'scarlet',
    favoriteSystem: 'n64',
    favoriteEmulators: ['n64', 'snes', 'gba', 'ps1']
  },

  // ========================================================
  // 1. INICIALIZACIÓN Y GESTIÓN DE SESIÓN
  // ========================================================
  async init() {
    console.log('[RetroHub]: Inicializando cliente maestro Nintendo Clean...');
    this.initLiveUsernameCheck();
    if (this.token) {
      try {
        const res = await this.api('/api/auth/me');
        if (res.success && res.user) {
          this.user = res.user;
          this.profile = res.profile;
          this.privacy = res.privacy;
          this.favoriteEmulators = res.favoriteEmulators || ['n64', 'snes', 'gba', 'ps1'];
          this.applyProfileToUI();
          this.initSocket();

          if (!this.user.onboarding_completed) {
            // Usuario autenticado pero pendiente de configurar su perfil inicial
            this.openSetupScreen(3);
          } else {
            // Usuario con configuración completa: cerrar setup y entrar directo
            this.closeSetupScreen();
            this.loadSocialData();
            this.filterCarouselFavorites();
          }
          return;
        }
      } catch (err) {
        console.warn('[RetroHub]: Token inválido o expirado, iniciando configuración.');
        this.clearSession(false);
      }
    }
    // Si no está autenticado -> Mostrar Pantalla Completa de Primer Saludo
    this.openSetupScreen(1);
  },

  async api(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(endpoint, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = (data && data.error && data.error.message) || data.message || 'Error en la petición al servidor';
      throw new Error(err);
    }
    return data;
  },

  setSession(token, user, profile) {
    this.token = token;
    this.user = user;
    this.profile = profile;
    localStorage.setItem('retrohub_jwt_token', token);
    this.applyProfileToUI();
    this.initSocket();
  },

  clearSession(reopenWizard = true) {
    this.token = null;
    this.user = null;
    this.profile = null;
    this.privacy = null;
    this.favoriteEmulators = ['n64', 'snes', 'gba', 'ps1'];
    localStorage.removeItem('retrohub_jwt_token');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (reopenWizard) {
      this.openSetupScreen(1);
    }
  },

  async login(identifier, password) {
    try {
      const res = await this.api('/api/auth/login', 'POST', { identifier, password });
      this.setSession(res.token, res.user, res.profile);
      return res;
    } catch (err) {
      this.showSetupAuthError(err.message);
      throw err;
    }
  },

  async register(email, username, password, confirmPassword) {
    try {
      const res = await this.api('/api/auth/register', 'POST', {
        email,
        username,
        password,
        confirmPassword
      });
      this.setSession(res.token, res.user, res.profile);
      return res;
    } catch (err) {
      this.showSetupAuthError(err.message);
      throw err;
    }
  },

  async logout() {
    try {
      if (this.token) {
        await this.api('/api/auth/logout', 'POST').catch(() => {});
      }
    } finally {
      this.clearSession(true);
      this.showToast('👋 Sesión cerrada correctamente.', 'info');
    }
  },

  // ========================================================
  // 2. NUEVO FLUJO DE PANTALLA COMPLETA NINTENDO (SETUP WIZARD)
  // ========================================================
  openSetupScreen(step = 1) {
    const screen = document.getElementById('nintendoSetupScreen');
    if (!screen) return;
    screen.style.display = 'flex';
    screen.style.opacity = '1';
    screen.style.pointerEvents = 'auto';
    this.goToSetupStep(step);
  },

  closeSetupScreen() {
    const screen = document.getElementById('nintendoSetupScreen');
    if (!screen) return;
    screen.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    screen.style.opacity = '0';
    screen.style.transform = 'scale(1.02)';
    screen.style.pointerEvents = 'none';
    setTimeout(() => {
      screen.style.display = 'none';
      screen.style.transform = 'none';
    }, 480);
  },

  goToSetupStep(step, subTab = null) {
    this.onboardingData.step = step;

    // Actualizar indicador de pasos
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`setupDot${i}`);
      const card = document.getElementById(`setupStep${i}`);
      const line = document.getElementById(`setupLine${i}`);

      if (card) {
        card.style.display = (i === step) ? 'flex' : 'none';
      }
      if (dot) {
        if (i < step) {
          dot.className = 'nintendo-step-dot completed';
        } else if (i === step) {
          dot.className = 'nintendo-step-dot active';
        } else {
          dot.className = 'nintendo-step-dot';
        }
      }
      if (line) {
        line.className = (i < step) ? 'nintendo-step-line completed' : 'nintendo-step-line';
      }
    }

    const stepNumEl = document.getElementById('setupStepNumber');
    if (stepNumEl) stepNumEl.textContent = step;

    // Desplazar contenedor al inicio suavemente para evitar cortes
    const screen = document.getElementById('nintendoSetupScreen');
    if (screen) screen.scrollTo({ top: 0, behavior: 'smooth' });

    // Subpestaña si se especifica
    if (step === 2 && subTab) {
      this.switchSetupAuthTab(subTab);
    }

    // Paso 3: Rellenar con los datos actuales
    if (step === 3) {
      const nameInput = document.getElementById('setupDisplayName');
      const bioInput = document.getElementById('setupBio');
      const previewImg = document.getElementById('setupAvatarPreview');

      const currentName = this.onboardingData.displayName || (this.user ? this.user.username : '');
      if (nameInput) nameInput.value = currentName;
      if (bioInput) bioInput.value = this.onboardingData.bio || '';
      if (previewImg) previewImg.src = this.onboardingData.avatarUrl;
    }

    // Paso 4: Preparar resumen
    if (step === 4) {
      this.renderSetupSummary();
    }

    if (window.n3dsAudio) window.n3dsAudio.play('move');
  },

  switchSetupAuthTab(tab) {
    const regForm = document.getElementById('setupRegisterForm');
    const loginForm = document.getElementById('setupLoginForm');
    const tabReg = document.getElementById('tabBtnRegister');
    const tabLogin = document.getElementById('tabBtnLogin');
    const errBox = document.getElementById('setupAuthErrorBox');

    if (errBox) errBox.style.display = 'none';

    if (tab === 'login') {
      if (regForm) regForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
    } else {
      if (regForm) regForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabReg) tabReg.classList.add('active');
    }
  },

  showSetupAuthError(msg) {
    const errBox = document.getElementById('setupAuthErrorBox');
    const textEl = document.getElementById('setupAuthErrorText');
    if (errBox) {
      if (textEl) textEl.textContent = msg;
      else errBox.textContent = msg;
      errBox.style.display = 'flex';
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  initLiveUsernameCheck() {
    const userEl = document.getElementById('setupRegUsername');
    const statusEl = document.getElementById('setupRegUsernameStatus');
    if (!userEl || !statusEl) return;

    let timer = null;
    userEl.addEventListener('input', () => {
      clearTimeout(timer);
      const val = userEl.value.trim();
      if (!val) {
        statusEl.style.display = 'none';
        return;
      }
      if (val.length < 3) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#f87171';
        statusEl.textContent = 'Mínimo 3 caracteres';
        return;
      }
      if (!/^[a-zA-Z0-9_\-]{3,24}$/.test(val)) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#f87171';
        statusEl.textContent = 'Solo letras, números, - y _';
        return;
      }

      statusEl.style.display = 'block';
      statusEl.style.color = '#94a3b8';
      statusEl.textContent = 'Comprobando disponibilidad...';

      timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/users/check-username/${encodeURIComponent(val)}`);
          const data = await res.json();
          if (data.available) {
            statusEl.style.color = '#34d399';
            statusEl.textContent = '✓ Nombre de usuario disponible';
          } else {
            statusEl.style.color = '#f87171';
            statusEl.textContent = `✕ ${data.message || 'Nombre no disponible'}`;
          }
        } catch (e) {
          statusEl.style.display = 'none';
        }
      }, 350);
    });
  },

  async handleSetupRegister() {
    const emailEl = document.getElementById('setupRegEmail');
    const userEl = document.getElementById('setupRegUsername');
    const passEl = document.getElementById('setupRegPassword');
    const cpassEl = document.getElementById('setupRegConfirmPassword');
    const btn = document.getElementById('btnSubmitRegister');

    if (!emailEl || !userEl || !passEl || !cpassEl) return;

    if (passEl.value !== cpassEl.value) {
      this.showSetupAuthError('⚠️ Las contraseñas no coinciden. Por favor revísalas.');
      if (cpassEl.focus) cpassEl.focus();
      return;
    }
    if (passEl.value.length < 6) {
      this.showSetupAuthError('⚠️ La contraseña debe tener al menos 6 caracteres.');
      if (passEl.focus) passEl.focus();
      return;
    }
    if (userEl.value.trim().length < 3) {
      this.showSetupAuthError('⚠️ El nombre de usuario debe tener al menos 3 caracteres.');
      if (userEl.focus) userEl.focus();
      return;
    }

    if (btn) btn.disabled = true;

    try {
      await this.register(emailEl.value.trim(), userEl.value.trim(), passEl.value, cpassEl.value);
      this.onboardingData.displayName = userEl.value.trim();
      this.showToast('✨ Cuenta creada con éxito. Personaliza tu perfil.', 'success');
      this.goToSetupStep(3);
    } catch (e) {
      // Error handled in register()
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async handleSetupLogin() {
    const idEl = document.getElementById('setupLoginIdentifier');
    const passEl = document.getElementById('setupLoginPassword');
    const btn = document.getElementById('btnSubmitLogin');

    if (!idEl || !passEl) return;
    if (btn) btn.disabled = true;

    try {
      const res = await this.login(idEl.value.trim(), passEl.value);
      if (!res.user.onboarding_completed) {
        this.goToSetupStep(3);
      } else {
        this.goToSetupStep(4);
      }
    } catch (e) {
      // Error handled in login()
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  selectSetupAvatar(url, element) {
    this.onboardingData.avatarUrl = url;
    document.querySelectorAll('.nintendo-avatar-thumb').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    const preview = document.getElementById('setupAvatarPreview');
    if (preview) preview.src = url;
    if (window.n3dsAudio) window.n3dsAudio.play('select');
  },

  toggleSetupEmu(emuId, element) {
    const list = this.onboardingData.favoriteEmulators;
    const idx = list.indexOf(emuId);
    if (idx > -1) {
      if (list.length > 1) {
        list.splice(idx, 1);
        if (element) element.classList.remove('selected');
      } else {
        this.showToast('Selecciona al menos 1 consola favorita.', 'info');
      }
    } else {
      list.push(emuId);
      if (element) element.classList.add('selected');
    }
    if (window.n3dsAudio) window.n3dsAudio.play('select');
  },

  async submitSetupProfile() {
    const nameEl = document.getElementById('setupDisplayName');
    const bioEl = document.getElementById('setupBio');

    if (nameEl && nameEl.value.trim()) {
      this.onboardingData.displayName = nameEl.value.trim();
    }
    if (bioEl && bioEl.value.trim()) {
      this.onboardingData.bio = bioEl.value.trim();
    }

    try {
      const res = await this.api('/api/users/onboarding', 'PUT', {
        displayName: this.onboardingData.displayName || (this.user ? this.user.username : 'Gamer'),
        bio: this.onboardingData.bio,
        avatarUrl: this.onboardingData.avatarUrl,
        bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80',
        titleHonor: '🎮 Campeón RetroHub',
        systemAura: this.onboardingData.systemAura,
        favoriteSystem: this.onboardingData.favoriteEmulators[0] || 'n64',
        favoriteEmulators: this.onboardingData.favoriteEmulators
      });

      if (this.user) this.user.onboarding_completed = true;
      this.profile = res.profile || {
        displayName: this.onboardingData.displayName || (this.user ? this.user.username : 'Gamer'),
        bio: this.onboardingData.bio,
        avatarUrl: this.onboardingData.avatarUrl
      };
      this.favoriteEmulators = this.onboardingData.favoriteEmulators;
      this.applyProfileToUI();
      this.goToSetupStep(4);
    } catch (err) {
      this.showToast('Error guardando perfil: ' + err.message, 'error');
    }
  },

  renderSetupSummary() {
    const avatarEl = document.getElementById('setupSummaryAvatar');
    const nameEl = document.getElementById('setupSummaryName');
    const userEl = document.getElementById('setupSummaryUsername');
    const bioEl = document.getElementById('setupSummaryBio');
    const emusEl = document.getElementById('setupSummaryEmus');

    const avUrl = (this.profile && this.profile.avatarUrl) || this.onboardingData.avatarUrl;
    const dName = (this.profile && this.profile.displayName) || this.onboardingData.displayName || (this.user ? this.user.username : 'Jugador');
    const uName = (this.user ? this.user.username : (this.onboardingData.displayName || 'retro'));
    const bText = (this.profile && this.profile.bio) || this.onboardingData.bio || 'Explorador del multiverso retro.';

    if (avatarEl) avatarEl.src = avUrl;
    if (nameEl) nameEl.textContent = dName;
    if (userEl) userEl.textContent = `@${uName}`;
    if (bioEl) bioEl.textContent = bText;

    if (emusEl) {
      const favs = (this.favoriteEmulators && this.favoriteEmulators.length) ? this.favoriteEmulators : this.onboardingData.favoriteEmulators;
      emusEl.innerHTML = favs.map(id => {
        const found = (window.CONSOLES || []).find(c => c.id === id);
        return `<span class="nintendo-summary-chip">🎮 ${found ? found.name : id.toUpperCase()}</span>`;
      }).join(' ');
    }
  },

  finishSetupAndLaunch() {
    if (window.n3dsAudio) window.n3dsAudio.play('launch');
    this.closeSetupScreen();
    this.applyProfileToUI();
    this.loadSocialData();
    this.filterCarouselFavorites();
    const name = (this.profile && this.profile.displayName) || (this.user ? this.user.username : 'Gamer');
    this.showToast(`🎮 ¡Bienvenido a RetroHub, ${name}! Tu consola está lista.`, 'success');
  },

  finishSetupAndGoHome() {
    if (window.n3dsAudio) window.n3dsAudio.play('launch');
    this.closeSetupScreen();
    this.applyProfileToUI();
    const name = (this.profile && this.profile.displayName) || (this.user ? this.user.username : 'Gamer');
    this.showToast(`🏠 ¡Listo, ${name}! Redirigiendo a Página de Inicio...`, 'success');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 380);
  },

  // Proxies para compatibilidad
  openAuthModal() { this.openSetupScreen(2); },
  closeAuthModal() { this.closeSetupScreen(); },
  openOnboardingModal(step = 1) { this.openSetupScreen(step === 1 ? 1 : 3); },
  closeOnboardingModal() { this.closeSetupScreen(); },

  // ========================================================
  // 3. ACTUALIZACIÓN VISUAL DEL PERFIL EN HEADER
  // ========================================================
  applyProfileToUI() {
    if (!this.profile) return;
    const name = this.profile.displayName || (this.user ? this.user.username : 'Gamer');
    const avatar = this.profile.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`;

    // Header Badge
    const headerName = document.getElementById('headerUsername');
    const headerAvatar = document.getElementById('headerAvatarImg');
    const joyconAvatar = document.getElementById('joyconUserAvatar');
    if (headerName) headerName.textContent = name;
    if (headerAvatar) headerAvatar.src = avatar;
    if (joyconAvatar) joyconAvatar.src = avatar;

    // Pasaporte VIP Modal
    const pName = document.getElementById('profileDisplayName');
    const pHandle = document.getElementById('profileHandle');
    const pAvatar = document.getElementById('profileAvatarImg');
    const pBioInput = document.getElementById('inputProfBio');
    const pNameInput = document.getElementById('inputProfName');
    const pTitle = document.getElementById('profileActiveHonorTitle');
    const pBanner = document.getElementById('profileBannerImg');

    if (pName) pName.textContent = name;
    if (pHandle) pHandle.textContent = `@${this.user ? this.user.username : name.toLowerCase()}`;
    if (pAvatar) pAvatar.src = avatar;
    if (pBioInput) pBioInput.value = this.profile.bio || '';
    if (pNameInput) pNameInput.value = name;
    if (pTitle) pTitle.textContent = this.profile.titleHonor || '🎮 Maestro de los Clásicos';
    if (pBanner && this.profile.bannerUrl) pBanner.src = this.profile.bannerUrl;
  },

  filterCarouselFavorites() {
    if (!this.favoriteEmulators || this.favoriteEmulators.length === 0) return;
    if (typeof window.rebuildCarouselWithFavorites === 'function') {
      window.rebuildCarouselWithFavorites(this.favoriteEmulators);
    }
  },

  // ========================================================
  // 4. SISTEMA DE AMIGOS REAL (BACKEND + SOCKET.IO)
  // ========================================================
  async loadSocialData() {
    if (!this.token) return;
    try {
      const [friendsRes, inRes, outRes] = await Promise.all([
        this.api('/api/friends/list'),
        this.api('/api/friends/requests/incoming'),
        this.api('/api/friends/requests/outgoing')
      ]);

      this.friends = friendsRes.friends || [];
      this.incomingRequests = inRes.requests || [];
      this.outgoingRequests = outRes.requests || [];

      this.updateFriendsUI();
    } catch (e) {
      console.warn('[Social]: Error cargando datos sociales:', e);
    }
  },

  updateFriendsUI() {
    const badge = document.getElementById('friendsCountNumber');
    if (badge) badge.textContent = this.friends.length;

    this.renderFriendsDrawerContent();
    this.renderFriendsCarouselStrip();
  },

  async sendFriendRequest(targetUsername) {
    if (!targetUsername || !targetUsername.trim()) {
      this.showToast('Introduce un @nombre de usuario válido.', 'error');
      return;
    }
    let clean = targetUsername.trim();
    if (clean.startsWith('@')) clean = clean.slice(1);

    try {
      const res = await this.api('/api/friends/request', 'POST', { targetUsername: clean });
      this.showToast(res.message || '📨 Solicitud enviada.', 'success');
      await this.loadSocialData();
      const input = document.getElementById('socialSearchInput');
      if (input) input.value = '';
      const resContainer = document.getElementById('socialSearchResults');
      if (resContainer) resContainer.innerHTML = '';
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async acceptFriendRequest(requestId) {
    try {
      const res = await this.api(`/api/friends/requests/${requestId}/accept`, 'PUT');
      this.showToast(res.message || '✅ Solicitud aceptada.', 'success');
      await this.loadSocialData();
      if (window.n3dsAudio) window.n3dsAudio.play('select');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async rejectFriendRequest(requestId) {
    try {
      await this.api(`/api/friends/requests/${requestId}/reject`, 'PUT');
      this.showToast('Solicitud rechazada.', 'info');
      await this.loadSocialData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async cancelFriendRequest(requestId) {
    try {
      await this.api(`/api/friends/requests/${requestId}/cancel`, 'PUT');
      this.showToast('Solicitud cancelada.', 'info');
      await this.loadSocialData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async confirmRemoveFriend(friendId, friendName) {
    const ok = confirm(`¿Estás seguro de que quieres eliminar a ${friendName} de tu lista de amigos?`);
    if (!ok) return;

    try {
      await this.api(`/api/friends/${friendId}`, 'DELETE');
      this.showToast(`Amigo ${friendName} eliminado.`, 'info');
      if (this.activeChatUser === friendId) this.closeChat();
      await this.loadSocialData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async confirmBlockUser(userId, username) {
    const ok = confirm(`¿Bloquear a @${username}? No podrá enviarte solicitudes ni ver tu actividad.`);
    if (!ok) return;

    try {
      await this.api(`/api/friends/block/${userId}`, 'POST');
      this.showToast(`Usuario @${username} bloqueado.`, 'info');
      if (this.activeChatUser === userId) this.closeChat();
      await this.loadSocialData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async searchUsers(query) {
    const container = document.getElementById('socialSearchResults');
    if (!container) return;

    if (!query || query.trim().length < 2) {
      container.innerHTML = '';
      return;
    }

    try {
      const res = await this.api(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
      const results = res.results || [];

      if (results.length === 0) {
        container.innerHTML = `<div style="font-size:12px;color:var(--text-muted);padding:10px;text-align:center;">No se encontró ningún usuario con ese nombre.</div>`;
        return;
      }

      container.innerHTML = results.map(u => `
        <div class="nintendo-user-search-card">
          <img src="${u.avatarUrl}" class="nintendo-user-search-avatar" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}'">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:13px;color:var(--text-main);">${u.displayName || u.username}</div>
            <div style="font-size:11px;color:var(--text-muted);">@${u.username}</div>
          </div>
          ${u.isFriend ? `
            <span class="nintendo-badge-friend">Amigos</span>
          ` : `
            <button class="nintendo-btn-add-friend" onclick="RetroHub.sendFriendRequest('${u.username}')">+ Añadir</button>
          `}
        </div>
      `).join('');
    } catch (e) {
      container.innerHTML = '';
    }
  },

  // ========================================================
  // 5. CAJÓN DE AMIGOS CON ESTÉTICA NINTENDO CLEAN
  // ========================================================
  renderFriendsDrawerContent() {
    const drawer = document.getElementById('friendsDrawer');
    if (!drawer) return;
    if (this.activeChatUser) return;

    const onlineFriends = this.friends.filter(f => f.status === 'online' || f.status === 'playing');
    const offlineFriends = this.friends.filter(f => f.status === 'offline');

    const pendingInHtml = this.incomingRequests.length > 0 ? `
      <div>
        <div class="nintendo-drawer-subtitle">
          <span>🔔</span> Solicitudes Recibidas (${this.incomingRequests.length})
        </div>
        ${this.incomingRequests.map(req => `
          <div class="nintendo-pending-card">
            <img src="${req.avatar_url}" style="width:36px;height:36px;border-radius:50%;" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.username}'">
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:var(--text-main);">${req.display_name || req.username}</div>
              <div style="font-size:11px;color:var(--text-muted);">@${req.username}</div>
            </div>
            <button class="nintendo-btn-icon-accept" onclick="RetroHub.acceptFriendRequest(${req.id})" title="Aceptar">✓</button>
            <button class="nintendo-btn-icon-reject" onclick="RetroHub.rejectFriendRequest(${req.id})" title="Rechazar">✕</button>
          </div>
        `).join('')}
      </div>
    ` : '';

    const pendingOutHtml = this.outgoingRequests.length > 0 ? `
      <div>
        <div class="nintendo-drawer-subtitle">
          📤 Solicitudes Enviadas (${this.outgoingRequests.length})
        </div>
        ${this.outgoingRequests.map(req => `
          <div class="nintendo-pending-out-card">
            <img src="${req.avatar_url}" style="width:28px;height:28px;border-radius:50%;" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.username}'">
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:700;color:var(--text-main);">@${req.username}</div>
              <div style="font-size:10px;color:var(--text-muted);">Pendiente de respuesta</div>
            </div>
            <button class="nintendo-btn-cancel-req" onclick="RetroHub.cancelFriendRequest(${req.id})">Cancelar</button>
          </div>
        `).join('')}
      </div>
    ` : '';

    const makeFriendCard = (f) => {
      let statusBadge = '';
      if (f.status === 'playing') {
        const gameStr = f.game ? f.game.title : (f.emulator ? f.emulator.name : 'En partida');
        statusBadge = `<div style="font-size:11px;color:#00a2ed;font-weight:700;">🎮 ${gameStr}</div>`;
      } else if (f.status === 'online') {
        statusBadge = `<div style="font-size:11px;color:#10b981;font-weight:600;">🟢 En línea</div>`;
      } else {
        statusBadge = `<div style="font-size:11px;color:var(--text-muted);">⚫ Desconectado</div>`;
      }

      return `
        <div class="friend-row-card">
          <div style="position:relative;flex-shrink:0;">
            <img src="${f.avatarUrl}" style="width:42px;height:42px;border-radius:50%;border:2px solid ${f.status === 'online'||f.status==='playing' ? '#10b981' : '#e2e8f0'};" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${f.username}'">
          </div>
          <div style="flex:1;min-width:0;" onclick="RetroHub.openChat(${f.userId})">
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="friend-name">${f.displayName || f.username}</span>
              <span style="font-size:11px;color:var(--text-muted);">@${f.username}</span>
            </div>
            ${statusBadge}
          </div>
          <div style="display:flex;gap:6px;">
            <button class="nintendo-action-sm-btn" onclick="RetroHub.openChat(${f.userId})" title="Chatear">💬</button>
            <button class="nintendo-action-sm-btn danger" onclick="RetroHub.confirmRemoveFriend(${f.userId}, '${f.displayName||f.username}')" title="Eliminar amigo">🗑️</button>
            <button class="nintendo-action-sm-btn muted" onclick="RetroHub.confirmBlockUser(${f.userId}, '${f.username}')" title="Bloquear">🚫</button>
          </div>
        </div>
      `;
    };

    drawer.innerHTML = `
      <div class="drawer-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:22px;">🤝</span>
          <div class="drawer-title">Amigos & Red Social</div>
        </div>
        <button class="btn-close-games-modal" onclick="toggleFriendsDrawer()">✕</button>
      </div>

      <!-- Tarjeta de Usuario Actual -->
      <div class="nintendo-my-passport-badge">
        <img src="${this.profile ? this.profile.avatarUrl : ''}" style="width:42px;height:42px;border-radius:50%;border:2px solid #e60012;" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.user?this.user.username:'me'}'">
        <div style="flex:1;min-width:0;">
          <div style="font-size:10px;font-weight:800;color:#e60012;text-transform:uppercase;letter-spacing:0.5px;">Tu Usuario RetroHub</div>
          <div style="font-family:'Space Grotesk';font-size:15px;font-weight:800;color:var(--text-main);">@${this.user ? this.user.username : '...'}</div>
        </div>
        <button class="nintendo-copy-code-btn" onclick="navigator.clipboard.writeText('@${this.user ? this.user.username : ''}').then(()=>RetroHub.showToast('📋 Usuario copiado','success'))">Copiar</button>
      </div>

      <!-- Buscador de Amigos -->
      <div>
        <div class="nintendo-drawer-subtitle">🔍 Buscar Amigo por @Username</div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="socialSearchInput" class="nintendo-input" placeholder="Ej: alex, beatriz..." style="flex:1;font-size:13px;padding:9px 14px;" oninput="RetroHub.searchUsers(this.value)" onkeydown="if(event.key==='Enter')RetroHub.sendFriendRequest(this.value);">
          <button class="nintendo-btn-primary" style="padding:8px 18px;font-size:13px;" onclick="const el=document.getElementById('socialSearchInput');if(el)RetroHub.sendFriendRequest(el.value);">Añadir</button>
        </div>
        <div id="socialSearchResults" style="margin-top:8px;"></div>
      </div>

      ${pendingInHtml}
      ${pendingOutHtml}

      <!-- En línea -->
      ${onlineFriends.length > 0 ? `
        <div>
          <div class="nintendo-drawer-subtitle" style="color:#10b981;">
            🟢 En Línea (${onlineFriends.length})
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">${onlineFriends.map(makeFriendCard).join('')}</div>
        </div>
      ` : ''}

      <!-- Desconectados -->
      ${offlineFriends.length > 0 ? `
        <div>
          <div class="nintendo-drawer-subtitle">
            ⚫ Desconectados (${offlineFriends.length})
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">${offlineFriends.map(makeFriendCard).join('')}</div>
        </div>
      ` : ''}

      ${this.friends.length === 0 && this.incomingRequests.length === 0 ? `
        <div class="nintendo-empty-friends-card">
          <div style="font-size:36px;margin-bottom:10px;">👥</div>
          <div style="font-size:15px;font-weight:800;color:var(--text-main);">Tu lista de amigos está vacía</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">Busca el @username de otro jugador para conectar, ver qué está emulando y compartir partidas.</div>
        </div>
      ` : ''}
    `;
  },

  renderFriendsCarouselStrip() {
    const strip = document.getElementById('friendsStripInner');
    const stripContainer = document.getElementById('friendsCarouselStrip');
    if (!strip || !stripContainer) return;

    const onlineFriends = this.friends.filter(f => f.status === 'online' || f.status === 'playing');
    if (onlineFriends.length === 0) {
      stripContainer.style.display = 'none';
      strip.innerHTML = '';
      return;
    }

    stripContainer.style.display = 'block';
    strip.innerHTML = onlineFriends.map(f => {
      let bubble = '🌐 En línea';
      let tag = '';
      if (f.status === 'playing') {
        bubble = f.game ? `🎮 ${f.game.title}` : (f.emulator ? `🕹️ ${f.emulator.name}` : '🎮 Jugando');
        tag = f.emulator ? `<div class="friend-platform-tag" style="background:#e60012;">${f.emulator.name}</div>` : '';
      }
      return `
        <div class="friend-status-card" onclick="toggleFriendsDrawer();RetroHub.openChat(${f.userId})">
          <div class="friend-speech-bubble">${bubble}</div>
          <div class="friend-avatar-platform">
            <img src="${f.avatarUrl}" class="friend-avatar-img" alt="${f.displayName||f.username}" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=${f.username}'">
            ${tag}
          </div>
          <span class="friend-name-label">${f.displayName || f.username}</span>
        </div>
      `;
    }).join('');
  },

  // ========================================================
  // 6. CHAT DIRECTO ENTRE AMIGOS (NINTENDO CLEAN)
  // ========================================================
  openChat(userId) {
    this.activeChatUser = userId;
    const friend = this.friends.find(f => f.userId === userId);
    if (!friend) return;

    const drawer = document.getElementById('friendsDrawer');
    if (!drawer) return;
    if (!drawer.classList.contains('open')) drawer.classList.add('open');

    const statusText = friend.status === 'playing' ? (friend.game ? `🎮 ${friend.game.title}` : '🎮 En juego') : (friend.status === 'online' ? '🟢 En línea' : '⚫ Desconectado');

    drawer.innerHTML = `
      <div class="drawer-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="RetroHub.closeChat()" style="background:none;border:none;color:var(--text-main);font-size:20px;cursor:pointer;line-height:1;font-weight:bold;">←</button>
          <img src="${friend.avatarUrl}" style="width:36px;height:36px;border-radius:50%;border:2px solid ${friend.status==='online'||friend.status==='playing'?'#10b981':'#cbd5e1'}">
          <div>
            <div style="font-family:'Space Grotesk';font-size:14px;font-weight:800;color:var(--text-main);">${friend.displayName || friend.username}</div>
            <div style="font-size:11px;color:${friend.status==='online'||friend.status==='playing'?'#10b981':'var(--text-muted)'};">${statusText}</div>
          </div>
        </div>
        <button class="btn-close-games-modal" onclick="toggleFriendsDrawer()">✕</button>
      </div>

      <div id="chatMessagesArea" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;padding:10px 4px;min-height:0;"></div>

      <div style="display:flex;gap:8px;padding-top:12px;border-top:1px solid #e2e8f0;">
        <input id="chatInputField" type="text" class="nintendo-input" placeholder="Escribe un mensaje..." style="flex:1;font-size:13px;" onkeydown="if(event.key==='Enter'&&this.value.trim()){RetroHub.sendChatMessage(${userId}, this.value);this.value='';}">
        <button class="nintendo-btn-primary" onclick="const i=document.getElementById('chatInputField');if(i&&i.value.trim()){RetroHub.sendChatMessage(${userId},i.value);i.value='';}" style="padding:8px 16px;font-size:14px;">▶</button>
      </div>
    `;

    // Cargar historial
    this.api(`/api/social/messages/${this.user.id}/${userId}`).then(res => {
      const chatArea = document.getElementById('chatMessagesArea');
      if (chatArea && res.messages) {
        chatArea.innerHTML = '';
        res.messages.forEach(m => this.appendChatBubble(m.sender_id === this.user.id, m.content, m.sent_at));
      }
    }).catch(() => {});

    setTimeout(() => {
      const input = document.getElementById('chatInputField');
      if (input) input.focus();
    }, 100);
  },

  closeChat() {
    this.activeChatUser = null;
    this.renderFriendsDrawerContent();
  },

  sendChatMessage(toUserId, content) {
    if (!content || !content.trim()) return;
    const clean = content.trim();

    if (this.socket) {
      this.socket.emit('chat_message', { toUserId, content: clean });
    }
    this.appendChatBubble(true, clean, Date.now());
  },

  appendChatBubble(isMe, content, timestamp) {
    const chatArea = document.getElementById('chatMessagesArea');
    if (!chatArea) return;

    const div = document.createElement('div');
    div.style.cssText = `display:flex;flex-direction:column;align-items:${isMe ? 'flex-end' : 'flex-start'};margin:6px 0;`;
    const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const timeStr = new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div style="max-width:80%;background:${isMe ? '#e60012' : '#f1f5f9'};color:${isMe ? '#ffffff' : '#1e293b'};padding:8px 14px;border-radius:${isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};font-size:13.5px;font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,0.06);word-break:break-word;">
        ${escaped}
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:3px;padding:0 4px;">${timeStr}</div>
    `;

    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  },

  // ========================================================
  // 7. TIEMPO REAL SOCKET.IO CON JWT
  // ========================================================
  initSocket() {
    if (!this.token) return;
    if (typeof io === 'undefined') return;

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io({
      auth: { token: this.token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('[RetroHub Socket]: Conectado al servidor.');
      this.socket.emit('authenticate', { token: this.token });
    });

    this.socket.on('authenticated', () => {
      console.log('[RetroHub Socket]: Sesión autenticada.');
    });

    this.socket.on('friend_request_received', (data) => {
      this.loadSocialData();
      this.showToast(`🤝 Solicitud de amistad de ${data.displayName || data.username}`, 'info');
      if (window.n3dsAudio) window.n3dsAudio.play('friend');
    });

    this.socket.on('friend_request_accepted', (data) => {
      this.loadSocialData();
      this.showToast(`🎉 ¡Ahora eres amigo de ${data.friendUsername || 'un jugador'}!`, 'success');
      if (window.n3dsAudio) window.n3dsAudio.play('launch');
    });

    this.socket.on('friend_removed', () => {
      this.loadSocialData();
    });

    this.socket.on('presence_update', (data) => {
      const idx = this.friends.findIndex(f => f.userId === data.userId);
      if (idx > -1) {
        this.friends[idx] = { ...this.friends[idx], ...data };
        this.updateFriendsUI();
      }
    });

    this.socket.on('chat_message_received', (data) => {
      if (this.activeChatUser === data.fromId) {
        this.appendChatBubble(false, data.content, data.sentAt);
      } else {
        this.showToast(`💬 Mensaje de ${data.fromName}: ${data.content.slice(0, 35)}...`, 'info', () => this.openChat(data.fromId));
      }
      if (window.n3dsAudio) window.n3dsAudio.play('menu');
    });
  },

  // ========================================================
  // 8. ACTIVIDAD DE JUEGO (REPORTE AL SERVIDOR)
  // ========================================================
  async reportGameStart(emulatorId, emulatorName, romId, romName) {
    if (!this.token) return;
    try {
      await this.api('/api/activity/start', 'POST', { emulatorId, emulatorName, romId, romName });
      if (this.socket) {
        this.socket.emit('user_update_presence', {
          status: 'playing',
          playing: { systemId: emulatorId, systemName: emulatorName, romId, gameTitle: romName }
        });
      }
    } catch (e) {}
  },

  async reportGameStop() {
    if (!this.token) return;
    try {
      await this.api('/api/activity/stop', 'POST');
      if (this.socket) {
        this.socket.emit('user_update_presence', { status: 'online', playing: null });
      }
    } catch (e) {}
  },

  // ========================================================
  // 9. PRIVACIDAD (FASE 7)
  // ========================================================
  async loadPrivacySettings() {
    if (!this.token) return;
    try {
      const res = await this.api('/api/users/privacy');
      if (res.success && res.privacy) {
        this.privacy = res.privacy;
        const setSelect = (id, val) => {
          const el = document.getElementById(id);
          if (el && val) el.value = val;
        };
        setSelect('privProfileVis', res.privacy.profile_visibility);
        setSelect('privOnlineVis', res.privacy.online_visibility);
        setSelect('privEmuVis', res.privacy.emulator_visibility);
        setSelect('privGameVis', res.privacy.game_visibility);
        setSelect('privReqPerm', res.privacy.friend_request_permission);
      }
    } catch (e) {}
  },

  async savePrivacySettings() {
    const getVal = id => document.getElementById(id) ? document.getElementById(id).value : 'all';
    try {
      const res = await this.api('/api/users/privacy', 'PUT', {
        profile_visibility: getVal('privProfileVis'),
        online_visibility: getVal('privOnlineVis'),
        emulator_visibility: getVal('privEmuVis'),
        game_visibility: getVal('privGameVis'),
        friend_request_permission: getVal('privReqPerm')
      });
      this.privacy = res.privacy;
      this.showToast('🔒 Preferencias de privacidad guardadas.', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // Toast Flotante Nintendo Clean
  showToast(msg, type = 'info', onClickAction = null) {
    const accentColors = { success: '#10b981', error: '#ef4444', info: '#00a2ed' };
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      z-index: 9999999; background: #ffffff;
      border: 1.5px solid ${accentColors[type] || accentColors.info};
      border-radius: 30px; padding: 11px 24px; font-size: 13.5px; font-weight: 700;
      color: #1e293b; cursor: ${onClickAction ? 'pointer' : 'default'};
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12); white-space: nowrap;
      transition: opacity 0.4s ease, transform 0.4s ease;
      display: flex; align-items: center; gap: 8px;
    `;
    el.textContent = msg;
    if (onClickAction) el.onclick = onClickAction;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(8px)';
    }, 3200);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 3700);
  }
};

// Exponer globalmente
window.RetroHub = RetroHub;
window.addEventListener('DOMContentLoaded', () => {
  RetroHub.init();
});
