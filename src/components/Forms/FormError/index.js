import PropTypes from 'prop-types';
import React from 'react';
import { ErrorMessage } from 'formik';
import { Typography } from 'antd';

const FormError = ({ name }) => (
  <ErrorMessage
    name={name}
    render={(error) => <Typography.Text type="danger">{error}</Typography.Text>}
  />
);

FormError.propTypes = {
  name: PropTypes.string.isRequired,
};

export default FormError;
