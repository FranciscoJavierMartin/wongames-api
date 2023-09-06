/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';

const gameService = 'api::game.game';
const publisherService = 'api::publisher.publisher';
const developerService = 'api::developer.developer';
const categoryService = 'api::category.category';
const platformService = 'api::platform.platform';

type EntityService =
  | typeof gameService
  | typeof publisherService
  | typeof developerService
  | typeof categoryService
  | typeof platformService;

export interface Catalog {
  pages: number;
  productCount: number;
  products: Product[];
  filters: Filters;
}

export interface Product {
  id: string;
  slug: string;
  features: Feature[];
  screenshots: string[];
  userPreferredLanguage: UserPreferredLanguage;
  releaseDate: string;
  storeReleaseDate: string;
  productType: string;
  title: string;
  coverHorizontal: string;
  coverVertical: string;
  developers: string[];
  publishers: string[];
  operatingSystems: string[];
  price: Price;
  productState: string;
  genres: Genre[];
  tags: Tag[];
  reviewsRating: number;
}

export interface Feature {
  name: string;
  slug: string;
}

export interface UserPreferredLanguage {
  code: string;
  inAudio: boolean;
  inText: boolean;
}

export interface Price {
  final: string;
  base: string;
  discount?: string;
  finalMoney: FinalMoney;
  baseMoney: BaseMoney;
}

export interface FinalMoney {
  amount: string;
  currency: string;
  discount: string;
}

export interface BaseMoney {
  amount: string;
  currency: string;
}

export interface Genre {
  name: string;
  slug: string;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Filters {
  releaseDateRange: ReleaseDateRange;
  priceRange: PriceRange;
  genres: Genre2[];
  languages: Language[];
  systems: System[];
  tags: Tag2[];
  discounted: boolean;
  features: Feature2[];
  releaseStatuses: ReleaseStatuse[];
  types: string[];
  fullGenresList: FullGenresList[];
  fullTagsList: FullTagsList[];
}

export interface ReleaseDateRange {
  min: number;
  max: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
  decimalPlaces: number;
}

export interface Genre2 {
  name: string;
  slug: string;
}

export interface Language {
  slug: string;
  name: string;
}

export interface System {
  slug: string;
  name: string;
}

export interface Tag2 {
  name: string;
  slug: string;
}

export interface Feature2 {
  slug: string;
  name: string;
}

export interface ReleaseStatuse {
  slug: string;
  name: string;
}

export interface FullGenresList {
  name: string;
  slug: string;
  level: number;
}

export interface FullTagsList {
  name: string;
  slug: string;
}

async function getGameInfo(slug) {
  const gogSlug = slug.replaceAll('-', '_').toLowerCase();

  const body = await axios.get(`${process.env.GAME_URL}${gogSlug}`);
  const dom = new JSDOM(body.data);

  const raw_description = dom.window.document.querySelector('.description');
  const description = raw_description.innerHTML;
  const short_description = raw_description.textContent.slice(0, 160);

  const ratingElement =
    dom.window.document
      .querySelector('.age-restrictions__icon use')
      ?.getAttribute('xlink:href')
      .replace(/_/g, ' ')
      .replace('#', '')
      .toUpperCase() ?? 'PEGI_3';

  return {
    description,
    short_description,
    ratingElement,
  };
}

async function getByName(name: string, entityService: EntityService) {
  const item = await strapi.service(entityService).find({
    filters: { name },
  });

  return item.results.length ? item.results[0] : null;
}

async function create(name: string, entityService: EntityService) {
  const item = await getByName(name, entityService);

  if (!item) {
    await strapi.service(entityService).create({
      data: {
        name,
        slug: slugify(name, { strict: true, lower: true }),
      },
    });
  }
}

function createCall(
  set: Set<string>,
  entityName: EntityService
): Promise<void>[] {
  return Array.from(set).map((name) => create(name, entityName));
}

async function createManyToManyData(products: Product[]): Promise<void[]> {
  const developersSet = new Set<string>();
  const publishersSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const platformsSet = new Set<string>();

  products.forEach((product) => {
    const { developers, publishers, genres, operatingSystems } = product;

    genres?.forEach(({ name }) => {
      categoriesSet.add(name);
    });

    operatingSystems?.forEach((platform) => {
      platformsSet.add(platform);
    });

    developers?.forEach((developer) => {
      developersSet.add(developer);
    });

    publishers?.forEach((publisher) => {
      publishersSet.add(publisher);
    });
  });

  return Promise.all([
    ...createCall(developersSet, developerService),
    ...createCall(publishersSet, publisherService),
    ...createCall(categoriesSet, categoryService),
    ...createCall(platformsSet, platformService),
  ]);
}

export default factories.createCoreService('api::game.game', () => ({
  async populate(params) {
    const {
      data: { products },
    } = await axios.get<Catalog>(process.env.CATALOG_URL);

    // await getGameInfo('cyberpunk_2077_phantom_liberty');

    // products[2].developers.map(async (developer) => {
    //   await create(developer, developerService);
    // });

    // products[2].publishers.map(async (publisher) => {
    //   await create(publisher, publisherService);
    // });

    // products[2].genres.map(async ({ name }) => {
    //   await create(name, categoryService);
    // });
  },
}));
