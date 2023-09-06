/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';

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

async function getByName(name: string, entityService) {
  const item = await strapi.service(entityService).find({
    filters: { name },
  });

  return item.results.length ? item.results[0] : null;
}

async function create(name: string, entityService) {
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

export default factories.createCoreService('api::game.game', () => ({
  async populate(params) {
    const {
      data: { products },
    } = await axios.get(process.env.CATALOG_URL);

    // await getGameInfo('cyberpunk_2077_phantom_liberty');

    products[2].developers.map(async (developer) => {
      await create(developer, 'api::developer.developer');
    });

    products[2].publishers.map(async (publisher) => {
      await create(publisher, 'api::publisher.publisher');
    });

    products[2].genres.map(async ({ name }) => {
      await create(name, 'api::category.category');
    });
  },
}));
