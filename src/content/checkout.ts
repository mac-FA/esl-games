export type CheckoutItem = {
  id: string;
  emoji: string;
  singular: string;
  plural: string; // for uncountable items, set to singular (unused in question UI)
  countable: boolean;
  // Optional short note explaining *why* something is un/countable (shown on wrong answers).
  note?: string;
};

// Focuses on items Japanese learners often mis-sort.
// Uncountable: substances, abstract/collective nouns.
// Countable: discrete objects.
export const ITEMS: CheckoutItem[] = [
  // ---- Uncountable ----
  { id: 'rice', emoji: '🍚', singular: 'rice', plural: 'rice', countable: false, note: 'Rice is a mass of tiny grains \u2014 uncountable.' },
  { id: 'bread', emoji: '🍞', singular: 'bread', plural: 'bread', countable: false, note: 'Bread is uncountable. We count loaves or slices.' },
  { id: 'water', emoji: '💧', singular: 'water', plural: 'water', countable: false, note: 'Water is a liquid \u2014 uncountable.' },
  { id: 'milk', emoji: '🥛', singular: 'milk', plural: 'milk', countable: false, note: 'Milk is a liquid \u2014 uncountable.' },
  { id: 'coffee', emoji: '☕', singular: 'coffee', plural: 'coffee', countable: false, note: 'As a drink substance, coffee is uncountable. (\u201Ctwo coffees\u201D means two cups.)' },
  { id: 'tea', emoji: '🍵', singular: 'tea', plural: 'tea', countable: false, note: 'Like coffee \u2014 uncountable as a drink.' },
  { id: 'sugar', emoji: '🍬', singular: 'sugar', plural: 'sugar', countable: false, note: 'Sugar is uncountable (a substance).' },
  { id: 'salt', emoji: '🧂', singular: 'salt', plural: 'salt', countable: false, note: 'Salt is uncountable (a substance).' },
  { id: 'butter', emoji: '🧈', singular: 'butter', plural: 'butter', countable: false, note: 'Butter is uncountable (a substance).' },
  { id: 'money', emoji: '💴', singular: 'money', plural: 'money', countable: false, note: 'Money is uncountable. We count yen, dollars, or coins.' },
  { id: 'luggage', emoji: '🧳', singular: 'luggage', plural: 'luggage', countable: false, note: 'Luggage is always uncountable in English. We count bags or suitcases.' },
  { id: 'news', emoji: '📰', singular: 'news', plural: 'news', countable: false, note: 'News is uncountable, even though it ends in \u201Cs.\u201D' },
  { id: 'advice', emoji: '💡', singular: 'advice', plural: 'advice', countable: false, note: 'Advice is always uncountable in English.' },
  { id: 'flour', emoji: '🌾', singular: 'flour', plural: 'flour', countable: false, note: 'Flour is uncountable (a powder).' },
  { id: 'soup', emoji: '🍲', singular: 'soup', plural: 'soup', countable: false, note: 'Soup is uncountable (a liquid).' },

  // ---- Countable ----
  { id: 'egg', emoji: '🥚', singular: 'egg', plural: 'eggs', countable: true },
  { id: 'apple', emoji: '🍎', singular: 'apple', plural: 'apples', countable: true },
  { id: 'banana', emoji: '🍌', singular: 'banana', plural: 'bananas', countable: true },
  { id: 'potato', emoji: '🥔', singular: 'potato', plural: 'potatoes', countable: true },
  { id: 'tomato', emoji: '🍅', singular: 'tomato', plural: 'tomatoes', countable: true },
  { id: 'orange', emoji: '🍊', singular: 'orange', plural: 'oranges', countable: true },
  { id: 'cookie', emoji: '🍪', singular: 'cookie', plural: 'cookies', countable: true },
  { id: 'coin', emoji: '🪙', singular: 'coin', plural: 'coins', countable: true },
  { id: 'bag', emoji: '🛍️', singular: 'bag', plural: 'bags', countable: true },
  { id: 'chair', emoji: '🪑', singular: 'chair', plural: 'chairs', countable: true },
  { id: 'letter', emoji: '✉️', singular: 'letter', plural: 'letters', countable: true },
  { id: 'onion', emoji: '🧅', singular: 'onion', plural: 'onions', countable: true },
  { id: 'carrot', emoji: '🥕', singular: 'carrot', plural: 'carrots', countable: true },
  { id: 'lemon', emoji: '🍋', singular: 'lemon', plural: 'lemons', countable: true },
  { id: 'umbrella', emoji: '☂️', singular: 'umbrella', plural: 'umbrellas', countable: true },
];

export const ROUND_SIZE = 12;
