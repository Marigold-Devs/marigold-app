import { Tag } from 'antd';
import { paymentStatuses } from 'globals/variables';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const PaymentStatus = ({ status }) => {
  const render = useCallback(() => {
    let component = null;

    switch (status) {
      case paymentStatuses.UNPAID:
        component = <Tag color="orange">Unpaid</Tag>;
        break;
      case paymentStatuses.PAID:
        component = <Tag color="green">Paid</Tag>;
        break;
      default:
        break;
    }

    return component;
  }, [status]);

  return render();
};

PaymentStatus.propTypes = {
  status: PropTypes.oneOf([paymentStatuses.UNPAID, paymentStatuses.PAID]),
};

export default PaymentStatus;
