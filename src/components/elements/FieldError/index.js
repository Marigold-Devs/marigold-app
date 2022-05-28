import { CloseCircleOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import PropTypes from 'prop-types';
import * as React from 'react';

const FieldError = ({ children }) => (
  <Space align="center" className="my-1">
    <Typography.Text type="danger">
      <CloseCircleOutlined />
    </Typography.Text>
    <Typography.Text type="danger">{children}</Typography.Text>
  </Space>
);

FieldError.propTypes = {
  children: PropTypes.node,
};

export default FieldError;
