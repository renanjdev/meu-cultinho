export const INTERNAL_DOMAIN = 'meucultinho.app';
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${INTERNAL_DOMAIN}`;
export const emailToUsername = (e: string) => e.replace(`@${INTERNAL_DOMAIN}`, '');
