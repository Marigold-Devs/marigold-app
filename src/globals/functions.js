import { userTypes } from './variables';

export const getUserTypeName = (type) => {
  switch (type) {
    case userTypes.MANAGER: {
      return 'Manager';
    }
    case userTypes.PERSONNEL: {
      return 'Personnel';
    }

    default:
      return null;
  }
};
