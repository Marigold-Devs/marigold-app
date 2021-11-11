import axios from 'axios';

export const BASE_URL = '/tokens/';

const TokensService = {
  acquire: ({ body }) => axios.post(`${BASE_URL}acquire/`, body),
};

export default TokensService;
