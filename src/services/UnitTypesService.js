import axios from 'axios';

export const BASE_URL = '/unit-types/';

const UnitTypesService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),

  create: (body) => axios.post(`${BASE_URL}`, body),

  edit: (id, body) => axios.patch(`${BASE_URL}${id}/`, body),
};

export default UnitTypesService;
