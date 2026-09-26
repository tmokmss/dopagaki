/** base (/omocha/) を考慮したサイト内リンクを作る */
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path}`;
