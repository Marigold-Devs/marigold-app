import axios from 'axios';

export const BASE_URL = '/branch-products/';

const BranchProducts = {
  list: ({ params }) => axios.get(BASE_URL, { params }),

  convert: ({ body }) => axios.post(`${BASE_URL}convert/`, body),
};

export default BranchProducts;
