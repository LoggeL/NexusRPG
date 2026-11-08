import type { Director } from './director';

let current: Director | null = null;

export function setDirector(director: Director | null): void { current = director; }

export function getDirector(): Director {
  if (!current) throw new Error('Director ist noch nicht initialisiert.');
  return current;
}
