/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';
import qs from 'querystring';
import utils from '@strapi/utils';
import os from 'os';
import * as fse from 'fs-extra';
import * as stream from 'stream';
import path from 'path';
import crypto from 'crypto';

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

function Exception(e) {
  return { e, data: e.data?.errors };
}

async function getGameInfo(slug) {
  try {
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
  } catch (error) {
    console.log('getGameInfo', Exception(error));
  }
}

async function getByName(name: string, entityService: EntityService) {
  try {
    const item = await strapi.service(entityService).find({
      filters: { name },
    });

    return item.results.length ? item.results[0] : null;
  } catch (error) {
    console.log('getByName', Exception(error));
  }
}

async function create(name: string, entityService: EntityService) {
  try {
    const item = await getByName(name, entityService);

    if (!item) {
      await strapi.service(entityService).create({
        data: {
          name,
          slug: slugify(name, { strict: true, lower: true }),
        },
      });
    }
  } catch (error) {
    console.log('create', Exception(error));
  }
}

function createCall(
  set: Set<string>,
  entityName: EntityService
): Promise<void>[] {
  return Array.from(set).map((name) => create(name, entityName));
}

async function setImage({
  image,
  game,
  field = 'cover',
}: {
  image: string;
  game: any;
  field?: 'cover' | 'gallery';
}): Promise<void> {
  // const { data } = await axios.get(image, { responseType: 'arraybuffer' });
  // const buffer = Buffer.from(data, 'base64');
  // const FormData = require('form-data');
  // const formData: any = new FormData();
  // formData.append('refId', game.id);
  // formData.append('ref', `${gameService}`);
  // formData.append('field', field);
  // formData.append('files', buffer, { filename: `${game.slug}.jpg` });
  // console.info(`Uploading ${field} image: ${game.slug}.jpg`);
  // try {
  //   await axios({
  //     method: 'POST',
  //     // TODO: Change url
  //     url: `http://localhost:1337/api/upload/`,
  //     data: formData,
  //     headers: {
  //       'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
  //     },
  //   });
  // } catch (error) {
  //   console.log('setImage', Exception(error));
  // }
}

async function setImage2({
  image,
  game,
  field = 'cover',
}: {
  image: string;
  game: any;
  field?: 'cover' | 'gallery';
}) {
  // console.log(image);
  // console.log({ image, refIf: game.id, ref: gameService, field });
  // const myImage = await fetch(image);
  // const myBlob = await myImage.blob();
  // const form = new FormData();
  // form.append('refId', game.id);
  // form.append('ref', `${gameService}`);
  // form.append('field', field);
  // form.append('files', myBlob, `${game.slug}.jpg`);
  // axios.post('http://localhost:1337/api/upload', form, {
  //   headers: {
  //     'Content-Type': `multipart/form-data`,
  //   },
  // });
  // const response = await fetch('http://localhost:1337/api/upload', {
  //   method: 'post',
  //   body: form,
  //   // headers: {
  //   //   'Content-Type': `multipart/form-data`,
  //   // },
  // });
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

async function createGames(products: Product[]) {
  await Promise.all(
    products.map(async (product) => {
      const item = await getByName(product.title, gameService);

      if (!item) {
        console.info(`Creating: ${product.title}...`);

        const game = await strapi.service(gameService).create({
          data: {
            name: product.title,
            slug: product.slug,
            price: product.price.finalMoney.amount,
            release_date: new Date(product.releaseDate),
            categories: await Promise.all(
              product.genres.map(({ name }) => getByName(name, categoryService))
            ),
            platforms: await Promise.all(
              product.operatingSystems.map((name) =>
                getByName(name, platformService)
              )
            ),
            developers: await Promise.all(
              product.developers.map((name) =>
                getByName(name, developerService)
              )
            ),
            publisher: await Promise.all(
              product.publishers.map((name) =>
                getByName(name, publisherService)
              )
            ),
            ...(await getGameInfo(product.slug)),
            publishedAt: new Date(),
          },
        });
        await setImage2({ image: product.coverHorizontal, game });
        await Promise.all(
          product.screenshots.slice(0, 5).map((url) =>
            setImage2({
              image: `${url.replace(
                '{formatter}',
                'product_card_v2_mobile_slider_639'
              )}`,
              game,
              field: 'gallery',
            })
          )
        );
        return game;
      }
    })
  );
}

async function uploadFileBuffer({
  file,
  fileName,
  // folder,
  mime,
  ext,
  alternativeText,
  caption,
  refId,
  ref,
  field,
}) {
  if (!mime) {
    throw new utils.errors.ApplicationError('mime type is undefined');
  }
  if (!ext) {
    throw new utils.errors.ApplicationError('ext is undefined');
  }
  if (!file) {
    throw new utils.errors.ApplicationError('file is undefined');
  }
  if (!fileName) {
    throw new utils.errors.ApplicationError('fileName is undefined');
  }

  const config = strapi.config.get('plugin.upload');
  const uploadService = strapi.service('plugin::upload.upload');

  const randomSuffix = () => crypto.randomBytes(5).toString('hex');
  const generateFileName = (name) => {
    const baseName = utils.nameToSlug(name, {
      separator: '_',
      lowercase: false,
    });

    return `${baseName}_${randomSuffix()}`;
  };

  const createAndAssignTmpWorkingDirectoryToFiles = async (files) => {
    const tmpWorkingDirectory = await fse.mkdtemp(
      path.join(os.tmpdir(), 'strapi-upload-')
    );

    if (Array.isArray(files)) {
      files.forEach((file) => {
        file.tmpWorkingDirectory = tmpWorkingDirectory;
      });
    } else {
      files.tmpWorkingDirectory = tmpWorkingDirectory;
    }

    return tmpWorkingDirectory;
  };

  const entity = {
    name: `${fileName}${ext}`,
    hash: generateFileName(fileName),
    ext,
    mime,
    size: utils.file.bytesToKbytes(Number(file.length)),
    provider: config.provider,
    // folder,
    caption,
    alternativeText,
    tmpWorkingDirectory: await createAndAssignTmpWorkingDirectoryToFiles({}),
    getStream() {
      return stream.Readable.from(file);
    },
    related: [
      {
        id: refId,
        __type: ref,
        __pivot: { field },
      },
    ],
  };

  await uploadService.uploadImage(entity);
  return strapi.query('plugin::upload.file').create({ data: entity });
}

async function setImage3() {
  const test = {
    image:
      'https://images.gog-statics.com/83e7fba76846120d81b564977290f82b4f16583c0b980e3565a03350d5720f98_product_card_v2_mobile_slider_639.jpg',
    refIf: 22,
    ref: 'api::game.game',
    field: 'gallery',
  };

  const response = await axios.get(test.image, { responseType: 'arraybuffer' });
  const fileParts = path.parse('my-image.jpg');
  const uploadedFile = await uploadFileBuffer({
    file: response.data,
    fileName: fileParts.name,
    mime: response.headers['content-type'],
    ext: fileParts.ext,
    alternativeText: 'Alt text',
    caption: 'My caption',
    refId: test.refIf,
    ref: test.ref,
    field: test.field,
    // folder: '/',
  });

  console.log(uploadedFile);
}

export default factories.createCoreService('api::game.game', () => ({
  async populate(params) {
    try {
      const {
        data: { products },
      } = await axios.get<Catalog>(
        `${process.env.CATALOG_URL}?${qs.stringify(params)}`
      );

      await createManyToManyData([products[0]]);
      await createGames([products[0]]);
      // setImage3();
    } catch (error) {
      console.log('populate', Exception(error));
    }
  },
}));
