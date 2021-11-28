import { isNaN, round } from 'lodash';
import moment from 'moment';
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

export const formatDateTime = (datetime) =>
  datetime ? moment(datetime).format('MM/DD/YYYY h:mma') : '';
