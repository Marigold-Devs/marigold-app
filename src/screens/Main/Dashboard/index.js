import { SwapOutlined } from '@ant-design/icons';
import { Button, message, Spin, Tabs } from 'antd';
import { Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import { convertIntoArray } from 'globals/functions';
import { useBranches, useCustomParams, useUnitTypes } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import BranchProducts from './BranchProducts';
import { ConvertProductsModal } from './ConvertProductsModal';

const Dashboard = () => {
  // STATES
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // CUSTOM HOOKS
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();
  const {
    isFetching: isFetchingBranches,
    data: branches,
    error: branchesErrors,
  } = useBranches();
  const {
    isFetching: isFetchingUnitTypes,
    data: unitTypes,
    error: unitTypesErrors,
  } = useUnitTypes();

  // METHODS
  useEffect(() => {
    if (!searchParams.has('branchId') && branches.length > 0) {
      setSearchParams({ branchId: branches?.[0]?.id });
    }
  }, [branches, searchParams]);

  const handleTabClick = (branchId) => {
    setSearchParams({ branchId });
  };

  const handleConvertClick = () => {
    if (searchParams.get('branchId')) {
      setSelectedBranchId(Number(searchParams.get('branchId')));
    } else {
      message.error(
        'Please select a branch first before converting product quantities.'
      );
    }
  };

  return (
    <Content title="Dashboard">
      <Box>
        <Spin spinning={isFetchingBranches || isFetchingUnitTypes}>
          <RequestErrors
            className="mb-3"
            errors={[
              ...convertIntoArray(branchesErrors, 'Branches'),
              ...convertIntoArray(unitTypesErrors, 'Unit Types'),
            ]}
          />

          <Tabs
            activeKey={searchParams.get('branchId')}
            tabBarExtraContent={
              branches?.length > 0 ? (
                <Button
                  size="large"
                  type="primary"
                  onClick={handleConvertClick}
                >
                  <SwapOutlined /> Create Branch
                </Button>
              ) : null
            }
            type="card"
            onTabClick={handleTabClick}
          >
            {branches.map(({ name, id }) => (
              <Tabs.TabPane key={id} tab={name}>
                <BranchProducts unitTypes={unitTypes} />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Spin>

        {selectedBranchId && (
          <ConvertProductsModal
            branchId={selectedBranchId}
            onClose={() => {
              setSelectedBranchId(null);
            }}
            onSuccess={() => {
              setSelectedBranchId(null);

              queryClient.invalidateQueries('useBranchProducts');
              message.success('Successfully converted products.');
            }}
          />
        )}
      </Box>
    </Content>
  );
};

export default Dashboard;
