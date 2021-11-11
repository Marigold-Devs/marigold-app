import { Layout } from 'antd';
import cn from 'classnames';
import { useUI } from 'hooks';
import PropTypes from 'prop-types';
import React from 'react';
import './styles.scss';

export const Content = ({ title, breadcrumb, className, children }) => {
  const { isSidebarCollapsed } = useUI();

  return (
    <Layout
      className={cn('ContentLayout', className, {
        ContentLayout__sidebarCollapsed: isSidebarCollapsed,
      })}
    >
      <Layout.Header className="ContentLayout_header">
        <div>
          <h3 className="ContentLayout_header_title">{title}</h3>

          {breadcrumb}
        </div>
      </Layout.Header>
      <Layout.Content className="ContentLayout_mainContent">
        {children}
      </Layout.Content>
    </Layout>
  );
};

Content.propTypes = {
  title: PropTypes.string,
  breadcrumb: PropTypes.any,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Content;
