import axios from 'axios';

export const BASE_URL = '/users/';

const AuthService = {
  login: ({ body }) => axios.post(`${BASE_URL}login/`, body),
};

export default AuthService;
