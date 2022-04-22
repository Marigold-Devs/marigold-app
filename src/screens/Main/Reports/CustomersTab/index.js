import { Col, DatePicker, Radio, Row, Table, Typography } from 'antd';
import { RankIcon } from 'components';
import { formatInPeso } from 'globals/functions';
import { dateRangeTypes } from 'globals/variables';
import { useCustomParams, useReportsCustomers } from 'hooks';
import moment from 'moment';
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
      dateRange: searchParams.get('dateRange') || dateRangeTypes.DAILY,
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
    <>
      <Filter />

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
        scroll={{ x: 800 }}
      />
    </>
  );
};

const Filter = () => {
  // STATES
  const [dateRangeType, setDateRangeType] = useState(dateRangeTypes.DAILY);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  const dateRange =
    searchParams.get('dateRange')?.toString() || dateRangeTypes.DAILY;

  // METHODS
  useEffect(() => {
    if (
      ![dateRangeTypes.DAILY, dateRangeTypes.MONTHLY].includes(dateRange) &&
      dateRange?.indexOf(',')
    ) {
      setDateRangeType(dateRangeTypes.DATE_RANGE);
    } else {
      setDateRangeType(dateRange);
    }
  }, [dateRange]);

  return (
    <Row className="Products_filter" gutter={[16, 16]}>
      <Col lg={12} span={24}>
        <Typography.Text style={{ width: '100%', display: 'block' }} strong>
          Date Range
        </Typography.Text>
        <Radio.Group
          options={[
            { label: 'Daily', value: dateRangeTypes.DAILY },
            { label: 'Monthly', value: dateRangeTypes.MONTHLY },
            {
              label: 'Select Date Range',
              value: dateRangeTypes.DATE_RANGE,
            },
          ]}
          optionType="button"
          value={dateRangeType}
          onChange={(e) => {
            const { value } = e.target;
            setDateRangeType(value);

            if (value !== dateRangeTypes.DATE_RANGE) {
              setSearchParams({ dateRange: value });
            }
          }}
        />

        {dateRangeType === dateRangeTypes.DATE_RANGE && (
          <DatePicker.RangePicker
            defaultPickerValue={
              dateRange.split(',')?.length === 2
                ? [
                    moment(dateRange.split(',')[0]),
                    moment(dateRange.split(',')[1]),
                  ]
                : undefined
            }
            defaultValue={
              dateRange.split(',')?.length === 2
                ? [
                    moment(dateRange.split(',')[0]),
                    moment(dateRange.split(',')[1]),
                  ]
                : undefined
            }
            format="MM/DD/YY"
            onCalendarChange={(dates, dateStrings) => {
              if (dates?.[0] && dates?.[1]) {
                setSearchParams({ dateRange: dateStrings.join(',') });
              }
            }}
          />
        )}
      </Col>
    </Row>
  );
};

export default CustomersTab;
