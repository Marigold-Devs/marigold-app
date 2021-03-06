import axios from 'axios';

export const BASE_URL = '/branches/';

const BranchesService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),

  create: ({ body }) => axios.post(`${BASE_URL}`, body),

  edit: ({ id, body }) => axios.patch(`${BASE_URL}${id}/`, body),

  delete: (id) => axios.delete(`${BASE_URL}${id}/`),
};

export default BranchesService;
