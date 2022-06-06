import _ from 'lodash';
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
  return _.isNaN(x)
    ? ''
    : `${pesoSign}${numberWithCommas(_.round(x, 2).toFixed(2))}`;
};

export const formatDateTime = (datetime) =>
  datetime ? moment(datetime).format('MM/DD/YYYY h:mma') : '';

export const formatDateTimeForServer = (datetime) =>
  moment(datetime).format('YYYY-MM-DD HH:mm:ss');

export const convertIntoArray = (errors, prefixMessage = null) => {
  const prefix = prefixMessage ? `${prefixMessage}: ` : '';
  let array = [];

  if (_.isString(errors)) {
    array = [prefix + errors];
  } else if (_.isArray(errors)) {
    array = errors.map((error) => prefix + error);
  }

  return array;
};
