import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  neteaseCookie: string | null;
  uid: number | null;
  nickname: string | null;
  avatarUrl: string | null;

  setLoggedIn: (cookie: string) => void;
  setUserInfo: (nickname: string, avatarUrl: string, uid?: number) => void;
  logout: () => void;
  checkStatus: () => Promise<void>;
  fetchAccount: () => Promise<void>;
}

function loadSavedAuth(): { cookie: string | null; nickname: string | null; avatarUrl: string | null; uid: number | null } {
  try {
    return {
      cookie: localStorage.getItem('netease_cookie'),
      nickname: localStorage.getItem('netease_nickname'),
      avatarUrl: localStorage.getItem('netease_avatar'),
      uid: Number(localStorage.getItem('netease_uid')) || null,
    };
  } catch {
    return { cookie: null, nickname: null, avatarUrl: null, uid: null };
  }
}

const saved = loadSavedAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: !!saved.cookie,
  neteaseCookie: saved.cookie,
  uid: saved.uid,
  nickname: saved.nickname,
  avatarUrl: saved.avatarUrl,

  setLoggedIn: (cookie: string) => {
    localStorage.setItem('netease_cookie', cookie);
    set({ isLoggedIn: true, neteaseCookie: cookie });
  },

  setUserInfo: (nickname: string, avatarUrl: string, uid?: number) => {
    localStorage.setItem('netease_nickname', nickname);
    localStorage.setItem('netease_avatar', avatarUrl);
    if (uid) localStorage.setItem('netease_uid', String(uid));
    set({ nickname, avatarUrl, uid: uid || get().uid });
  },

  logout: () => {
    localStorage.removeItem('netease_cookie');
    localStorage.removeItem('netease_nickname');
    localStorage.removeItem('netease_avatar');
    localStorage.removeItem('netease_uid');
    set({ isLoggedIn: false, neteaseCookie: null, uid: null, nickname: null, avatarUrl: null });
  },

  checkStatus: async () => {
    try {
      const res = await fetch('/api/auth/status', {
        headers: { 'x-netease-cookie': get().neteaseCookie || '' },
      });
      const data = await res.json();
      if (!data.loggedIn && get().isLoggedIn) {
        get().logout();
      }
    } catch {
      // ignore
    }
  },

  fetchAccount: async () => {
    try {
      const cookie = get().neteaseCookie || '';
      if (!cookie) return;
      const res = await fetch('/api/auth/account', {
        headers: { 'x-netease-cookie': cookie },
      });
      const data = await res.json();
      if (data.success && data.profile) {
        get().setUserInfo(
          data.profile.nickname || '',
          data.profile.avatarUrl || '',
          data.profile.userId || data.account?.id,
        );
      }
    } catch {
      // ignore
    }
  },
}));