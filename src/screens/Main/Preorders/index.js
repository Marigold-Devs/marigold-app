import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Table } from 'antd';
import { Content, PreorderStatus } from 'components';
import { Box } from 'components/elements';
import { formatDateTime } from 'globals/functions';
import { useCustomParams, usePreorders } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import './styles.scss';

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Date Created', dataIndex: 'date_created' },
  { title: 'Date Fulfilled', dataIndex: 'date_fulfilled' },
  { title: 'Status', dataIndex: 'status', align: 'center' },
  { title: 'Actions', dataIndex: 'actions' },
];

const Preorders = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isPreordersFetching,
    data: { total, preorders },
  } = usePreorders({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    },
  });

  // METHODS
  useEffect(() => {
    const tableData = preorders.map((preorder) => {
      const data = {
        key: preorder.id,
        id: preorder.id,
        date_created: formatDateTime(preorder.datetime_created),
        date_fulfilled: formatDateTime(preorder.datetime_fulfilled),
        status: <PreorderStatus status={preorder.status} />,
        actions: (
          <Button
            type="link"
            onClick={() => {
              navigate(`/preorders/${preorder.id}`);
            }}
          >
            View
          </Button>
        ),
      };

      return data;
    });

    setDataSource(tableData);
  }, [preorders]);

  return (
    <Content className="Preorders" title="Preorders">
      <Box>
        <Row className="Preorders_createRow" justify="end">
          <Col>
            <Button
              size="large"
              type="primary"
              onClick={() => {
                navigate('create');
              }}
            >
              <PlusOutlined /> Create Preorder
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isPreordersFetching}
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
            disabled: preorders.length === 0,
            position: ['bottomCenter'],
            pageSizeOptions: ['10', '20', '50'],
          }}
          rowKey="key"
          scroll={{ x: 800 }}
        />
      </Box>
    </Content>
  );
};

export default Preorders;
