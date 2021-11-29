import axios from 'axios';

export const BASE_URL = '/reports/';

const ProductsService = {
  listTopPayingCustomers: ({ params }) =>
    axios.get(`${BASE_URL}top-customers/`, { params }),

  listTopSellingProducts: ({ params }) =>
    axios.get(`${BASE_URL}top-products/`, { params }),
};

export default ProductsService;
