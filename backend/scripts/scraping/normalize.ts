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
  id: string;
  position: number;
  topActions: RealmAction[];
  bottomActions: RealmAction[];
}

export type SimpleRealmActionType =
  | 'PLAY_CARD'
  | 'FATE'
  | 'VANQUISH'
  | 'DISCARD_CARDS'
  | 'MOVE_ITEM_OR_ALLY'
  | 'MOVE_HERO'
  | 'ACTIVATE';

export type RealmAction =
  | {
      type: 'GAIN_POWER';
      amount: number;
    }
  | {
      type: SimpleRealmActionType;
    };

interface ExtractedRealm {
  locations: RealmLocation[];
  locationTranslations: Record<string, string>;
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

export type VillainImageId =
  | 'portrait'
  | 'mover'
  | 'realm'
  | 'villainDeckBack'
  | 'fateDeckBack';

export interface VillainImageReference {
  id: VillainImageId;
  sourceName: string;
  sourceUrl: string;
}

const simpleRealmActionTypes: Record<string, SimpleRealmActionType> = {
  'play a card': 'PLAY_CARD',
  fate: 'FATE',
  vanquish: 'VANQUISH',
  'discard cards': 'DISCARD_CARDS',
  'move an item or ally': 'MOVE_ITEM_OR_ALLY',
  'move a hero': 'MOVE_HERO',
  activate: 'ACTIVATE',
};

export function parseRealmAction(value: string): RealmAction {
  const actionText = cleanText(value);

  const gainPowerMatch = actionText.match(/^Gain\s+(\d+)\s+Power$/i);

  if (gainPowerMatch) {
    return {
      type: 'GAIN_POWER',
      amount: Number.parseInt(gainPowerMatch[1], 10),
    };
  }

  const actionType = simpleRealmActionTypes[actionText.toLowerCase()];

  if (!actionType) {
    throw new Error(`Unknown Realm action "${actionText}"`);
  }

  return {
    type: actionType,
  };
}

function extractActions(value: string): RealmAction[] {
  return cleanText(value)
    .split('|')
    .map((action) => parseRealmAction(action));
}

function extractRealm(html: string): ExtractedRealm {
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
  const locationTranslations: Record<string, string> = {};

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

    if (topActions.length !== 2 || bottomActions.length !== 2) {
      throw new Error(
        `Realm location "${location}" does not have two actions per row`,
      );
    }

    const locationId = createSlug(location);

    if (locationTranslations[locationId]) {
      throw new Error(`Duplicated Realm location id "${locationId}"`);
    }

    locationTranslations[locationId] = location;

    realm.push({
      id: locationId,
      position: index + 1,
      topActions,
      bottomActions,
    });
  });

  if (realm.length === 0) {
    throw new Error('No Realm locations were found');
  }

  return {
    locations: realm,
    locationTranslations,
  };
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
  type: CardType;
  cost: number | null;
  strength: number | null;
  text: string;
  imageName: string | null;
  imageSourceUrl: string | null;
}

export type CardType =
  | 'ALLY'
  | 'CONDITION'
  | 'CURSE'
  | 'EFFECT'
  | 'HERO'
  | 'ITEM'
  | 'TITAN';

const cardTypes: Record<string, CardType> = {
  ally: 'ALLY',
  condition: 'CONDITION',
  curse: 'CURSE',
  effect: 'EFFECT',
  hero: 'HERO',
  item: 'ITEM',
  titan: 'TITAN',
};

export function parseCardType(value: string): CardType {
  const typeText = cleanText(value);
  const cardType = cardTypes[typeText.toLowerCase()];

  if (!cardType) {
    throw new Error(`Unknown card type "${typeText}"`);
  }

  return cardType;
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
  const typeText = getValue('type');

  if (!villain) {
    throw new Error(`Card villain was not found for "${page.title}"`);
  }

  if (!typeText) {
    throw new Error(`Card type was not found for "${page.title}"`);
  }

  const imageElement = infobox.find('.pi-image').first();

  const imageName =
    imageElement.find('img').first().attr('data-image-name') ?? null;

  const imageSourceUrl =
    imageElement.find('a[href]').first().attr('href') ?? null;

  return {
    name,
    villain,
    type: parseCardType(typeText),
    cost: parseOptionalNumber(getValue('cost')),
    strength: parseOptionalNumber(getValue('strength')),
    text: getValue('text'),
    imageName,
    imageSourceUrl,
  };
}

function extractVillainImages(html: string): VillainImageReference[] {
  const $ = load(html);

  const article = $('.mw-parser-output').first();

  if (article.length === 0) {
    throw new Error('Article content was not found');
  }

  const realmHeading = $('#Realm').closest('h2');
  const villainDeckHeading = $('#Villain_deck').closest('h2');
  const fateDeckHeading = $('#Fate_deck').closest('h2');

  if (realmHeading.length === 0) {
    throw new Error('Realm section was not found');
  }

  if (villainDeckHeading.length === 0) {
    throw new Error('Villain deck section was not found');
  }

  if (fateDeckHeading.length === 0) {
    throw new Error('Fate deck section was not found');
  }

  const realmSection = realmHeading.nextUntil('h2');

  const villainDeckSection = villainDeckHeading.nextUntil('h2');

  const fateDeckSection = fateDeckHeading.nextUntil('h2');

  const realmImages = realmSection.find('img[data-image-name]');

  const candidates = [
    {
      id: 'portrait',
      element: article.find('img[data-image-name]').first(),
    },
    {
      id: 'mover',
      element: realmImages.first(),
    },
    {
      id: 'realm',
      element: realmImages.last(),
    },
    {
      id: 'villainDeckBack',
      element: villainDeckSection.find('img[data-image-name]').first(),
    },
    {
      id: 'fateDeckBack',
      element: fateDeckSection.find('img[data-image-name]').first(),
    },
  ] as const;

  const images: VillainImageReference[] = [];

  for (const candidate of candidates) {
    const sourceName = candidate.element.attr('data-image-name');

    const sourceUrl = candidate.element.closest('a[href]').attr('href');

    if (!sourceName || !sourceUrl) {
      throw new Error(`Image "${candidate.id}" was not found`);
    }

    images.push({
      id: candidate.id,
      sourceName,
      sourceUrl,
    });
  }

  const mover = images.find((image) => image.id === 'mover');

  const realm = images.find((image) => image.id === 'realm');

  if (mover?.sourceName === realm?.sourceName) {
    throw new Error('Mover and Realm resolved to the same image');
  }

  return images;
}

export interface NormalizedFandomPage {
  id: string;
  game: string;
  images: VillainImageReference[];
  realm: RealmLocation[];
  decks: Decks;
  source: {
    article: string;
    sourceLanguage: 'en';
  };
  translations: {
    en: {
      name: string;
      objective: string;
      locations: Record<string, string>;
    };
  };
}

export function createSlug(value: string): string {
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
  const images = extractVillainImages(page.html);

  return {
    id: createSlug(page.title),
    game: 'Disney Villainous',
    images,
    realm: realm.locations,
    decks,
    source: {
      article: createArticleUrl(page.title),
      sourceLanguage: 'en',
    },
    translations: {
      en: {
        name: page.title,
        objective: objective,
        locations: realm.locationTranslations,
      },
    },
  };
}
