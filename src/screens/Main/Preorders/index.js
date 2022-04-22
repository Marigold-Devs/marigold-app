import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Table,
  Typography,
} from 'antd';
import { Content, PreorderStatus } from 'components';
import { Box } from 'components/elements';
import { formatDateTime } from 'globals/functions';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  preorderStatuses,
} from 'globals/variables';
import { usePreorders } from 'hooks';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce/lib';
import './styles.scss';

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Supplier', dataIndex: 'supplier' },
  { title: 'Date Created', dataIndex: 'dateCreated' },
  { title: 'Date Fulfilled', dataIndex: 'dateFulfilled' },
  { title: 'Status', dataIndex: 'status', align: 'center' },
  { title: 'Actions', dataIndex: 'actions' },
];

const Preorders = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isFetching: isPreordersFetching,
    data: { total, preorders },
  } = usePreorders({
    params: {
      dateCreated: searchParams.get('dateCreated'),
      dateFulfilled: searchParams.get('dateFulfilled'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    },
  });

  // METHODS
  useEffect(() => {
    const data = preorders.map((preorder) => ({
      key: preorder.id,
      id: preorder.id,
      supplier: preorder.supplier.name,
      dateCreated: formatDateTime(preorder.datetime_created),
      dateFulfilled: formatDateTime(preorder.datetime_fulfilled),
      status: <PreorderStatus status={preorder.status} />,
      actions: (
        <Button
          type="primary"
          ghost
          onClick={() => {
            navigate(`/preorders/${preorder.id}`);
          }}
        >
          View
        </Button>
      ),
    }));

    setDataSource(data);
  }, [preorders]);

  return (
    <Content className="Preorders" title="Preorders">
      <Box>
        <div className="mb-4 d-flex justify-end">
          <Button
            size="large"
            type="primary"
            onClick={() => {
              navigate('create');
            }}
          >
            <PlusOutlined /> Create Preorder
          </Button>
        </div>

        <Filter />

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isPreordersFetching}
          pagination={{
            current: searchParams.get('page') || DEFAULT_PAGE,
            total,
            pageSize: searchParams.get('pageSize') || DEFAULT_PAGE_SIZE,
            onChange: (page, newPageSize) => {
              setSearchParams({
                ...Object.fromEntries(searchParams),
                page,
                pageSize: newPageSize,
              });
            },
            disabled: preorders.length === 0,
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
  const [searchParams, setSearchParams] = useSearchParams();

  const onSearch = useDebouncedCallback((value) => {
    setSearchParams({ ...Object.fromEntries(searchParams), search: value });
  }, 500);

  return (
    <Row className="mb-4" gutter={[16, 16]}>
      <Col lg={12} span={24}>
        <Typography.Text strong>Search</Typography.Text>
        <Input
          defaultValue={searchParams.get('search')}
          allowClear
          onChange={(event) => onSearch(event.target.value.trim())}
        />
      </Col>

      <Col lg={12} span={24}>
        <Typography.Text strong>Status</Typography.Text>
        <Select
          style={{ width: '100%' }}
          value={searchParams.get('status')}
          allowClear
          onChange={(value) => {
            setSearchParams({
              ...Object.fromEntries(searchParams),
              status: value || '',
            });
          }}
        >
          <Select.Option value={preorderStatuses.APPROVED}>
            Approved
          </Select.Option>
          <Select.Option value={preorderStatuses.PENDING}>
            Pending
          </Select.Option>
          <Select.Option value={preorderStatuses.DELIVERED}>
            Delivered
          </Select.Option>
          <Select.Option value={preorderStatuses.CANCELLED}>
            Cancelled
          </Select.Option>
        </Select>
      </Col>

      <Col lg={12} span={24}>
        <Typography.Text strong>Date Created</Typography.Text>
        <DatePicker
          className="w-100"
          defaultValue={
            searchParams.get('dateCreated')
              ? moment(searchParams.get('dateCreated'))
              : null
          }
          allowClear
          onChange={(date, dateString) => {
            setSearchParams({
              ...Object.fromEntries(searchParams),
              dateCreated: dateString,
            });
          }}
        />
      </Col>

      <Col lg={12} span={24}>
        <Typography.Text strong>Date Fulfilled</Typography.Text>
        <DatePicker
          className="w-100"
          defaultValue={
            searchParams.get('dateFulfilled')
              ? moment(searchParams.get('dateFulfilled'))
              : null
          }
          allowClear
          onChange={(date, dateString) => {
            setSearchParams({
              ...Object.fromEntries(searchParams),
              dateFulfilled: dateString,
            });
          }}
        />
      </Col>
    </Row>
  );
};

export default Preorders;
