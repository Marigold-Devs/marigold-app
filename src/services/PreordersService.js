import axios from 'axios';

export const BASE_URL = '/preorders/';

const PreordersService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),

  retrieve: (id) => axios.get(`${BASE_URL}${id}/`),

  create: ({ body }) => axios.post(`${BASE_URL}`, body),

  edit: ({ id, body }) => axios.patch(`${BASE_URL}${id}/`, body),
};

export default PreordersService;
