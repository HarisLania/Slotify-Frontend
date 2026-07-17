const ACCESS_TOKEN_KEY = 'slotify.accessToken';
const REFRESH_TOKEN_KEY = 'slotify.refreshToken';

/** Thin wrapper around localStorage so AuthService stays test-friendly and the keys live in one place. */
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  setAccessToken: (access: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
