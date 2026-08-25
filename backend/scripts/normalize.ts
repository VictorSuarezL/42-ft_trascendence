import { load } from 'cheerio';
import type { FandomPage } from './fandom.client';

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function extractObjective(html: string): string {
  const $ = load(html);

  const heading = $('#Objective').closest('h2');

  if (heading.length === 0) {
    throw new Error('Objective section was not found');
  }

  const paragraph = heading.nextUntil('h2').filter('p').first();

  const objective = cleanText(paragraph.text());

  if (!objective) {
    throw new Error('Objective text was not found');
  }

  return objective;
}

export interface RealmLocation {
  position: number;
  location: string;
  topActions: string[];
  bottomActions: string[];
}

export interface DeckCard {
  name: string;
  pageTitle: string;
  quantity: number;
}

export interface Deck {
  totalCards: number;
  cards: DeckCard[];
}

export interface Decks {
  villain: Deck;
  fate: Deck;
}

function extractActions(value: string): string[] {
  return cleanText(value)
    .split('|')
    .map((action) => action.trim())
    .filter(Boolean);
}

function extractRealm(html: string): RealmLocation[] {
  const $ = load(html);

  const heading = $('#Realm').closest('h2');

  if (heading.length === 0) {
    throw new Error('Realm section was not found');
  }

  const realmList = heading.nextUntil('h2').filter('ul').first();

  if (realmList.length === 0) {
    throw new Error('Realm location list was not found');
  }

  const realm: RealmLocation[] = [];

  realmList.children('li').each((index, element) => {
    const locationElement = $(element);

    const location = cleanText(locationElement.children('a').first().text());

    const actionRows = locationElement.children('ul').first().children('li');

    if (!location) {
      throw new Error(`Realm location ${index + 1} has no name`);
    }

    if (actionRows.length < 2) {
      throw new Error(
        `Realm location "${location}" does not have two action rows`,
      );
    }

    const topActions = extractActions(actionRows.eq(0).text());

    const bottomActions = extractActions(actionRows.eq(1).text());

    realm.push({
      position: index + 1,
      location,
      topActions,
      bottomActions,
    });
  });

  if (realm.length === 0) {
    throw new Error('No Realm locations were found');
  }

  return realm;
}

function extractDeck(html: string, sectionId: string): Deck {
  const $ = load(html);

  const heading = $(`#${sectionId}`).closest('h2');

  if (heading.length === 0) {
    throw new Error(`Deck section "${sectionId}" was not found`);
  }

  const cardList = heading.nextUntil('h2').filter('ul').first();

  if (cardList.length === 0) {
    throw new Error(`Card list for "${sectionId}" was not found`);
  }

  const cards: DeckCard[] = [];

  cardList.children('li').each((index, element) => {
    const cardElement = $(element);
    const completeText = cleanText(cardElement.text());

    const cardLink = cardElement.find('a').first();

    const quantityMatch = completeText.match(/\((?:×|x)\s*(\d+)\)\s*$/i);

    const quantity = quantityMatch ? Number.parseInt(quantityMatch[1], 10) : 1;

    const linkedName = cleanText(cardElement.find('a').first().text());

    const fallbackName = cleanText(
      completeText.replace(/\((?:×|x)\s*\d+\)\s*$/i, ''),
    );

    const name = linkedName || fallbackName;
    const pageTitle = cardLink.attr('title') ?? name;

    if (!name) {
      throw new Error(`Card ${index + 1} in "${sectionId}" has no name`);
    }

    cards.push({
      name,
      pageTitle,
      quantity,
    });
  });

  if (cards.length === 0) {
    throw new Error(`No cards were found in "${sectionId}"`);
  }

  const totalCards = cards.reduce((total, card) => total + card.quantity, 0);

  return {
    totalCards,
    cards,
  };
}

function extractDecks(html: string): Decks {
  return {
    villain: extractDeck(html, 'Villain_deck'),
    fate: extractDeck(html, 'Fate_deck'),
  };
}

export interface NormalizedCard {
  name: string;
  villain: string;
  type: string;
  cost: number | null;
  strength: number | null;
  text: string;
  imageName: string | null;
}

function parseOptionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function normalizeCardPage(page: FandomPage): NormalizedCard {
  const $ = load(page.html);

  const infobox = $('.portable-infobox').first();

  if (infobox.length === 0) {
    throw new Error(`Card infobox was not found for "${page.title}"`);
  }

  const getValue = (source: string): string => {
    return cleanText(
      infobox
        .find(`.pi-data[data-source="${source}"] .pi-data-value`)
        .first()
        .text(),
    );
  };

  const name =
    cleanText(infobox.find('.pi-title').first().text()) || page.title;

  const villain = getValue('villain');
  const type = getValue('type');

  if (!villain) {
    throw new Error(`Card villain was not found for "${page.title}"`);
  }

  if (!type) {
    throw new Error(`Card type was not found for "${page.title}"`);
  }

  return {
    name,
    villain,
    type,
    cost: parseOptionalNumber(getValue('cost')),
    strength: parseOptionalNumber(getValue('strength')),
    text: getValue('text'),
    imageName:
      infobox.find('.pi-image img').first().attr('data-image-name') ?? null,
  };
}

export interface NormalizedFandomPage {
  id: string;
  name: string;
  game: string;
  realm: RealmLocation[];
  decks: Decks;
  source: {
    article: string;
    sourceLanguage: 'en';
  };
  translations: {
    en: {
      objective: string;
    };
  };
}

function createSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createArticleUrl(title: string): string {
  const pageName = title.replaceAll(' ', '_');

  return `https://disney-villainous.fandom.com/wiki/${encodeURIComponent(pageName)}`;
}

export function normalizeFandomPage(page: FandomPage): NormalizedFandomPage {
  const objective = extractObjective(page.html);
  const realm = extractRealm(page.html);
  const decks = extractDecks(page.html);

  return {
    id: createSlug(page.title),
    name: page.title,
    game: 'Disney Villainous',
    realm,
    decks,
    source: {
      article: createArticleUrl(page.title),
      sourceLanguage: 'en',
    },
    translations: {
      en: {
        objective: objective,
      },
    },
  };
}
