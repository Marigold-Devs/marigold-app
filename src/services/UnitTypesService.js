import axios from 'axios';

export const BASE_URL = '/unit-types/';

const UnitTypesService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),
};

export default UnitTypesService;
