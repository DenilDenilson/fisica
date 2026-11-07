import data from './elements.json';
export type Element = (typeof data)[number];
export const elements: readonly Element[] = data;
export const families = [...new Set(elements.map(element => element.family))];
export function tablePosition(z: number): [number, number] {
  if (z === 1) return [0, 0];
  if (z === 2) return [17, 0];
  if (z <= 10) return [z <= 4 ? z - 3 : z + 7, 1];
  if (z <= 18) return [z <= 12 ? z - 11 : z - 1, 2];
  if (z <= 36) return [z - 19, 3];
  if (z <= 54) return [z - 37, 4];
  if (z <= 56) return [z - 55, 5];
  if (z <= 71) return [z - 55, 8];
  if (z <= 86) return [z - 69, 5];
  if (z <= 88) return [z - 87, 6];
  if (z <= 103) return [z - 87, 9];
  return [z - 101, 6];
}
export function matches(element: Element, query: string, family: string, state: string) {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return (!query.trim() || normalize(element.name + ' ' + element.englishName + ' ' + element.symbol + ' ' + element.number).includes(normalize(query.trim())))
    && (!family || element.family === family) && (!state || element.state === state);
}
