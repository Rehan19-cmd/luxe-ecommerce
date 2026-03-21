/* ══════════════════════════════════════════════════════════
   Auth Module — Shared authentication & nav UI for all pages
   Handles login state, nav dropdown, and logout actions
   ══════════════════════════════════════════════════════════ */

const luxeAuth = {
  TOKEN_KEY: 'luxe_user_token',
  USER_KEY: 'luxe_user',

  // ── Token & User Getters ──────────────────────────────
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUser() { try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.getToken(); },

  // ── Set Auth Data ─────────────────────────────────────
  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateNavUI();
  },

  // ── Logout ────────────────────────────────────────────
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateNavUI();
  },

  // ── Update Navbar UI Based on Auth State ──────────────
  updateNavUI() {
    const loginBtns = document.querySelectorAll('.nav__login-btn');
    const accountDropdowns = document.querySelectorAll('.nav__account-dropdown');
    const mobileLoginLinks = document.querySelectorAll('.mobile-login-link');
    const mobileUserLinks = document.querySelectorAll('.mobile-user-link');

    if (this.isLoggedIn()) {
      const user = this.getUser();
      const displayName = user?.name || 'Account';

      // Hide login buttons, show account dropdown
      loginBtns.forEach(el => el.style.display = 'none');
      accountDropdowns.forEach(el => {
        el.style.display = 'flex';
        const nameEl = el.querySelector('.nav__account-name');
        if (nameEl) nameEl.textContent = displayName;
      });
      mobileLoginLinks.forEach(el => el.style.display = 'none');
      mobileUserLinks.forEach(el => el.style.display = 'block');
    } else {
      // Show login buttons, hide account dropdown
      loginBtns.forEach(el => el.style.display = '');
      accountDropdowns.forEach(el => el.style.display = 'none');
      mobileLoginLinks.forEach(el => el.style.display = 'block');
      mobileUserLinks.forEach(el => el.style.display = 'none');
    }
  },

  // ── Authenticated API Requests ────────────────────────
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

/* ══════════════════════════════════════════════════════════
   Toast Notification System — Luxury styled messages
   ══════════════════════════════════════════════════════════ */
function showLuxeToast(message, type = 'info', duration = 3500) {
  // Remove any existing toast
  const existing = document.querySelector('.luxe-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `luxe-toast luxe-toast--${type}`;
  toast.innerHTML = `
    <span class="luxe-toast__icon">${type === 'warning' ? '🔒' : type === 'success' ? '✓' : '◆'}</span>
    <span class="luxe-toast__message">${message}</span>
  `;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('luxe-toast--visible');
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('luxe-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ══════════════════════════════════════════════════════════
   Initialize Nav UI & Event Listeners on DOM Ready
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  luxeAuth.updateNavUI();

  // ── Account Dropdown Toggle (Desktop) ─────────────────
  document.querySelectorAll('.nav__account-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav__account-trigger');
    const menu = dropdown.querySelector('.nav__account-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    }
  });

  // ── Log Out Button Handler ────────────────────────────
  document.querySelectorAll('.nav__logout-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      luxeAuth.logout();
      window.location.href = 'index.html';
    });
  });

  // ── Use Different Account Handler ─────────────────────
  document.querySelectorAll('.nav__switch-account-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      luxeAuth.logout();
      window.location.href = 'login.html';
    });
  });

  // ── Mobile logout handler ─────────────────────────────
  document.querySelectorAll('.mobile-user-link .nav__logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      luxeAuth.logout();
      window.location.href = 'index.html';
    });
  });
});
