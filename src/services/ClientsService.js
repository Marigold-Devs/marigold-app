import axios from 'axios';

export const BASE_URL = '/clients/';

const ClientsService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),
};

export default ClientsService;
