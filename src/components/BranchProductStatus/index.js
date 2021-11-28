import { Tag } from 'antd';
import { productStatuses } from 'globals/variables';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const BranchProductStatus = ({ status }) => {
  const render = useCallback(() => {
    let component = null;

    switch (status) {
      case productStatuses.AVAILABLE:
        component = <Tag color="green">Available</Tag>;
        break;
      case productStatuses.REORDER:
        component = <Tag color="orange">Reorder</Tag>;
        break;
      case productStatuses.OUT_OF_STOCK:
        component = <Tag color="red">Out of Stock</Tag>;
        break;
      default:
        break;
    }

    return component;
  }, [status]);

  return render();
};

BranchProductStatus.propTypes = {
  status: PropTypes.oneOf([
    productStatuses.AVAILABLE,
    productStatuses.REORDER,
    productStatuses.OUT_OF_STOCK,
  ]),
};

export default BranchProductStatus;
