import { isNaN, round } from 'lodash';
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

export const numberWithCommas = (x) =>
  x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');

export const formatInPeso = (value, pesoSign = '₱') => {
  const x = Number(value);
  return isNaN(x)
    ? ''
    : `${pesoSign}${numberWithCommas(round(x, 2).toFixed(2))}`;
};
