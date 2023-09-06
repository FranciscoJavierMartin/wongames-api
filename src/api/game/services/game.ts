/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';

export default factories.createCoreService('api::game.game', () => ({
  async populate(params) {
    const {
      data: { products },
    } = await axios.get(process.env.STORE_URL);

    console.log(products);
  },
}));
