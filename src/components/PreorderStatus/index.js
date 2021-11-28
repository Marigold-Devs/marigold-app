import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { preorderStatuses } from 'globals/variables';
import { Tag } from 'antd';

const PreorderStatus = ({ status }) => {
  const render = useCallback(() => {
    let component = null;

    switch (status) {
      case preorderStatuses.APPROVED:
        component = <Tag color="blue">Approved</Tag>;
        break;
      case preorderStatuses.PENDING:
        component = <Tag color="orange">Pending</Tag>;
        break;
      case preorderStatuses.DELIVERED:
        component = <Tag color="green">Delivered</Tag>;
        break;
      case preorderStatuses.CANCELLED:
        component = <Tag color="red">Cancelled</Tag>;
        break;
      default:
        break;
    }

    return component;
  }, [status]);

  return render();
};

PreorderStatus.propTypes = {
  status: PropTypes.oneOf([
    preorderStatuses.APPROVED,
    preorderStatuses.PENDING,
    preorderStatuses.DELIVERED,
    preorderStatuses.CANCELLED,
  ]),
};

export default PreorderStatus;
