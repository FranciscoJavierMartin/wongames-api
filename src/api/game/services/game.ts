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

export default factories.createCoreService('api::game.game', () => ({
  async populate(params) {
    const {
      data: { products },
    } = await axios.get(process.env.CATALOG_URL);

    // await getGameInfo('cyberpunk_2077_phantom_liberty');

    products[2].developers.map(async (developer) => {
      await strapi.service('api::developer.developer').create({
        data: {
          name: developer,
          slug: slugify(developer, { strict: true, lower: true }),
        },
      });
    });

    products[2].publishers.map(async (publisher) => {
      await strapi.service('api::publisher.publisher').create({
        data: {
          name: publisher,
          slug: slugify(publisher, { strict: true, lower: true }),
        },
      });
    });
  },
}));
