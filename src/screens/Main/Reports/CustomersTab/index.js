import { Table } from 'antd';
import { RankIcon } from 'components';
import { formatInPeso } from 'globals/functions';
import { useCustomParams, useReportsCustomers } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const columns = [
  { title: 'Rank', dataIndex: 'rank' },
  { title: 'Name', dataIndex: 'name' },
  { title: 'Total Purchase', dataIndex: 'total_purchase' },
];

const CustomersTab = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isReportsFetching,
    data: { total, customers },
  } = useReportsCustomers({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    },
  });

  // METHODS
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 10;
    const rankStart = (Number(page) - 1) * Number(pageSize);

    const data = customers.map((customer, index) => {
      const rank = rankStart + index + 1;

      return {
        key: customer.id,
        rank: (
          <>
            <RankIcon rank={rank} /> <span>{rank}</span>
          </>
        ),
        name: customer.name,
        total_purchase: formatInPeso(customer.total_purchase),
      };
    });

    setDataSource(data);
  }, [customers]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={isReportsFetching}
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
        disabled: customers.length === 0,
        position: ['bottomCenter'],
        pageSizeOptions: ['10', '20', '50'],
      }}
      rowKey="key"
      scroll={{ x: 800 }}
    />
  );
};

export default CustomersTab;
