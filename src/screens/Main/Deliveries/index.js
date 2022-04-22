import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select, Table, Typography } from 'antd';
import { Content, DeliveryStatus, PaymentStatus } from 'components';
import { Box } from 'components/elements';
import { formatDateTime } from 'globals/functions';
import { paymentStatuses } from 'globals/variables';
import { useCustomParams, useDeliveries } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import './styles.scss';

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Date Created', dataIndex: 'date_created' },
  { title: 'Schedule of Delivery', dataIndex: 'schedule_of_delivery' },
  { title: 'Date Completed', dataIndex: 'date_completed' },
  { title: 'Payment', dataIndex: 'payment', align: 'center' },
  { title: 'Customer', dataIndex: 'customer' },
  { title: 'Status', dataIndex: 'status', align: 'center' },
  { title: 'Actions', dataIndex: 'actions' },
];

const Deliveries = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isDeliveriesFetching,
    data: { total, deliveries },
  } = useDeliveries({
    params: {
      paymentStatus: searchParams.get('paymentStatus'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    },
  });

  // METHODS
  useEffect(() => {
    const tableData = deliveries.map((delivery) => {
      const data = {
        key: delivery.id,
        id: delivery.id,
        date_created: formatDateTime(delivery.datetime_created),
        schedule_of_delivery: formatDateTime(delivery.datetime_delivery),
        date_completed: formatDateTime(delivery.datetime_completed),
        payment: <PaymentStatus status={delivery?.payment_status} />,
        customer: delivery?.customer?.name,
        status: <DeliveryStatus status={delivery.status} />,
        actions: <Link to={`/deliveries/${delivery.id}`}>View</Link>,
      };

      return data;
    });

    setDataSource(tableData);
  }, [deliveries]);

  return (
    <Content className="Deliveries" title="Deliveries">
      <Box>
        <Row
          className="Deliveries_createRow"
          gutter={[16, 16]}
          justify="space-between"
        >
          <Col md={6} sm={12} span={24}>
            <Filter />
          </Col>
          <Col>
            <Button
              size="large"
              type="primary"
              onClick={() => {
                navigate('create');
              }}
            >
              <PlusOutlined /> Create Delivery
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isDeliveriesFetching}
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
            disabled: deliveries.length === 0,
            position: ['bottomCenter'],
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 800 }}
        />
      </Box>
    </Content>
  );
};

const Filter = () => {
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Typography.Text strong>Payment Status</Typography.Text>
        <Select
          style={{ width: '100%' }}
          value={searchParams.get('paymentStatus')}
          allowClear
          onChange={(value) => {
            setSearchParams({ paymentStatus: value });
          }}
        >
          <Select.Option value={paymentStatuses.UNPAID}>Unpaid</Select.Option>
          <Select.Option value={paymentStatuses.PAID}>Paid</Select.Option>
        </Select>
      </Col>
    </Row>
  );
};

export default Deliveries;
