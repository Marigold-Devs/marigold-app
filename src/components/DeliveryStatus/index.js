import { Tag } from 'antd';
import { deliveryStatuses } from 'globals/variables';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const DeliveryStatus = ({ status }) => {
  const render = useCallback(() => {
    let component = null;

    switch (status) {
      case deliveryStatuses.PENDING:
        component = <Tag color="orange">Pending</Tag>;
        break;
      case deliveryStatuses.DELIVERED:
        component = <Tag color="green">Delivered</Tag>;
        break;
      case deliveryStatuses.CANCELLED:
        component = <Tag color="red">Cancelled</Tag>;
        break;
      default:
        break;
    }

    return component;
  }, [status]);

  return render();
};

DeliveryStatus.propTypes = {
  status: PropTypes.oneOf([
    deliveryStatuses.PENDING,
    deliveryStatuses.DELIVERED,
    deliveryStatuses.CANCELLED,
  ]),
};

export default DeliveryStatus;
