import md5 from 'crypto-js/md5';

export function getGravatarUrl(email: string, size = 128) {
  const hash = md5(email.trim().toLowerCase()).toString();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
} 