import { Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useCustomParams } from 'hooks';
import React from 'react';
import CustomersTab from './CustomersTab';
import ProductsTab from './ProductsTab';

const Reports = () => {
  // CUSTOM HOOKS
  const { setSearchParams } = useCustomParams();

  // METHODS
  const onTabClick = () => {
    setSearchParams({}, { shouldResetPage: true });
  };

  return (
    <Content title="Reports">
      <Box>
        <Tabs type="card" destroyInactiveTabPane onTabClick={onTabClick}>
          <Tabs.TabPane key="customers" tab="Customers">
            <CustomersTab />
          </Tabs.TabPane>

          <Tabs.TabPane key="products" tab="Products">
            <ProductsTab />
          </Tabs.TabPane>
        </Tabs>
      </Box>
    </Content>
  );
};

export default Reports;
