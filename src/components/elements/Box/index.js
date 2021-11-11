import cn from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import './styles.scss';

const Box = ({ children, className }) => (
  <div className={cn('Box', className)}>{children}</div>
);

Box.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Box;
