/* ══════════════════════════════════════════════════════════
   Shared Page Init — Common functions for all pages
   ══════════════════════════════════════════════════════════ */

const luxeAuth = {
  TOKEN_KEY: 'luxe_user_token',
  USER_KEY: 'luxe_user',

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUser() { try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.getToken(); },

  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateNavUI();
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateNavUI();
  },

  updateNavUI() {
    const loginLinks = document.querySelectorAll('.nav__login-link');
    const userMenus = document.querySelectorAll('.nav__user-menu');
    const mobileLoginLinks = document.querySelectorAll('.mobile-login-link');
    const mobileUserLinks = document.querySelectorAll('.mobile-user-link');

    if (this.isLoggedIn()) {
      const user = this.getUser();
      loginLinks.forEach(el => el.style.display = 'none');
      userMenus.forEach(el => {
        el.style.display = 'flex';
        const nameEl = el.querySelector('.nav__user-name');
        if (nameEl) nameEl.textContent = user?.name || 'Account';
      });
      mobileLoginLinks.forEach(el => el.style.display = 'none');
      mobileUserLinks.forEach(el => el.style.display = 'block');
    } else {
      loginLinks.forEach(el => el.style.display = '');
      userMenus.forEach(el => el.style.display = 'none');
      mobileLoginLinks.forEach(el => el.style.display = 'block');
      mobileUserLinks.forEach(el => el.style.display = 'none');
    }
  },

  async authGet(endpoint) {
    const token = this.getToken();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`authGet failed (${endpoint}):`, err.message);
      return null;
    }
  },

  async authPost(endpoint, data) {
    const token = this.getToken();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`authPost failed (${endpoint}):`, err.message);
      return { error: err.message };
    }
  },
};

// Initialize nav UI on load
document.addEventListener('DOMContentLoaded', () => {
  luxeAuth.updateNavUI();

  // Handle logout buttons
  document.querySelectorAll('.nav__logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      luxeAuth.logout();
      window.location.href = 'index.html';
    });
  });
});
