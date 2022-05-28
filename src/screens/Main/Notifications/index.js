import { Spin, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useBranches, useCustomParams } from 'hooks';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BranchProducts from './BranchProducts';

const Notifications = () => {
  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();
  const { isFetching: isFetchingBranches, data: branches } = useBranches();

  // METHODS
  useEffect(() => {
    if (!searchParams.has('branchId') && branches.length > 0) {
      setSearchParams({ branchId: branches?.[0]?.id });
    }
  }, [branches, searchParams]);

  const handleTabClick = (branchId) => {
    setSearchParams({ branchId });
  };

  return (
    <Content title="Notifications">
      <Box>
        <Spin spinning={isFetchingBranches}>
          <Tabs
            activeKey={searchParams.get('branchId')}
            type="card"
            onTabClick={handleTabClick}
          >
            {branches.map(({ name, id }) => (
              <Tabs.TabPane key={id} tab={name}>
                <BranchProducts />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Spin>
      </Box>
    </Content>
  );
};

export default Notifications;
