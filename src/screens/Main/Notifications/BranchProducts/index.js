import { Table } from 'antd';
import { BranchProductStatus } from 'components';
import { useCustomParams, useNotifications } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './styles.scss';

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Status', dataIndex: 'status' },
];

const BranchProducts = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isNotificationsFetching,
    data: { total, notifications },
  } = useNotifications({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      branchId: searchParams.get('branchId'),
    },
  });

  // METHODS
  useEffect(() => {
    const data = notifications.map((notification) => ({
      key: notification.id,
      name: `${notification.product.name} (${notification.unit_type.name})`,
      status: <BranchProductStatus status={notification.status} />,
    }));

    setDataSource(data);
  }, [notifications]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={isNotificationsFetching}
      pagination={{
        current: searchParams.get('page') || 1,
        total,
        pageSize: searchParams.get('pageSize') || 10,
        onChange: (page, newPageSize) => {
          setSearchParams({
            page,
            pageSize: newPageSize,
          });
        },
        disabled: notifications.length === 0,
        position: ['bottomCenter'],
        pageSizeOptions: ['10', '20', '50'],
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default BranchProducts;
