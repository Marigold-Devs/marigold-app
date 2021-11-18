import axios from 'axios';

export const BASE_URL = '/branch-products/';

const BranchProducts = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),
};

export default BranchProducts;
