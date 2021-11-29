import axios from 'axios';

export const BASE_URL = '/notifications/';

const NotificationsService = {
  list: ({ params }) => axios.get(`${BASE_URL}`, { params }),

  count: () => axios.get(`${BASE_URL}count/`),
};

export default NotificationsService;
