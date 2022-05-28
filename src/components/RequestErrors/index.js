import { Space } from 'antd';
import cn from 'classnames';
import { FieldError } from 'components/elements';
import PropTypes from 'prop-types';
import React from 'react';
import './style.scss';

const RequestErrors = ({ className, errors }) => (
  <Space className={cn('RequestErrors', className)} direction="vertical">
    {errors?.map((message, index) => (
      <FieldError key={index}>{message}</FieldError>
    ))}
  </Space>
);

RequestErrors.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};

export default RequestErrors;
