import { Layout, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import Sidebar from '../Sidebar';
import './styles.scss';

const Container = ({ loading, loadingText, sidebarItems, children }) => (
  <Layout className="Container">
    <Spin
      size="large"
      spinning={loading}
      tip={loadingText}
      wrapperClassName="Container_spinner"
    >
      <Sidebar items={sidebarItems} />
      {children}
    </Spin>
  </Layout>
);

Container.propTypes = {
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  sidebarItems: PropTypes.any,
  children: PropTypes.node,
};

Container.defaultProps = {
  loading: false,
  loadingText: 'Fetching data...',
};

export default Container;
