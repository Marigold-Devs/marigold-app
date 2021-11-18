import { Spin, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useBranches, useCustomParams, useUnitTypes } from 'hooks';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BranchProducts from './BranchProducts';

const Dashboard = () => {
  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();
  const { isFetchingBranches, data: branches } = useBranches();
  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();

  // METHODS
  useEffect(() => {
    if (!searchParams.has('branchId') && branches.length > 0) {
      setSearchParams({ branchId: branches?.[0]?.id });
    }
  }, [branches, searchParams]);

  const onTabClick = (branchId) => {
    setSearchParams({ branchId });
  };

  return (
    <Content title="Dashboard">
      <Box>
        <Spin spinning={isFetchingBranches || isUnitTypesFetching}>
          <Tabs
            activeKey={searchParams.get('branchId')}
            type="card"
            onTabClick={onTabClick}
          >
            {branches.map(({ name, id }) => (
              <Tabs.TabPane key={id} tab={name}>
                <BranchProducts unitTypes={unitTypes} />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Spin>
      </Box>
    </Content>
  );
};

export default Dashboard;
