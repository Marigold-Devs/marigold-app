import axios from 'axios';

export const BASE_URL = '/preorder-transactions/';

const PreorderTransactionsService = {
  create: ({ body }) => axios.post(`${BASE_URL}`, body),
};

export default PreorderTransactionsService;
