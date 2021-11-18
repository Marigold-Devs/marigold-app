import { Button, Col, Input, Row, Select, Table, Typography, Tag } from 'antd';
import { productStatuses } from 'globals/variables';
import { useBranchProducts, useCustomParams } from 'hooks';
import { flatten } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import './styles.scss';

const BranchProducts = ({ unitTypes }) => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isBranchProductsFetching,
    data: { total, products },
  } = useBranchProducts({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      branchId: searchParams.get('branchId'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    },
  });

  // METHODS
  useEffect(() => {
    const tableData = products.map((product) => {
      const data = {
        key: product.id,
        name: (
          <Button
            className="BranchProducts_productName"
            type="link"
            onClick={() => {
              navigate(`/products?search=${product.name}`);
            }}
          >
            {product.name}
          </Button>
        ),
        // eslint-disable-next-line no-use-before-define
        status: renderProductStatus(product.status),
      };

      product.product_prices.forEach((productPrice) => {
        data[String(productPrice.unit_type_id)] = productPrice.balance;
      });

      return data;
    });

    setDataSource(tableData);
  }, [products]);

  const getColumns = useCallback(() => {
    const unitTypesId = flatten(
      products?.map((product) =>
        product.product_prices.map((productPrice) => productPrice.unit_type_id)
      )
    );
    const filteredUnitTypes = unitTypes.filter((unitType) =>
      unitTypesId.includes(unitType.id)
    );

    return [
      { title: 'Name', dataIndex: 'name', width: 150, fixed: 'left' },
      ...filteredUnitTypes.map((unitType) => ({
        title: unitType.name,
        dataIndex: String(unitType.id),
      })),
      { title: 'Status', dataIndex: 'status', width: 150, fixed: 'right' },
    ];
  }, [products, unitTypes]);

  const renderProductStatus = (status) => {
    let component = null;

    switch (status) {
      case productStatuses.AVAILABLE:
        component = <Tag color="green">Available</Tag>;
        break;
      case productStatuses.REORDER:
        component = <Tag color="orange">Reorder</Tag>;
        break;
      case productStatuses.OUT_OF_STOCK:
        component = <Tag color="red">Out of Stock</Tag>;
        break;
      default:
        break;
    }

    return component;
  };

  return (
    <>
      <Filter />

      <Table
        columns={getColumns()}
        dataSource={dataSource}
        loading={isBranchProductsFetching}
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
          disabled: products.length === 0,
          position: ['bottomCenter'],
          pageSizeOptions: ['10', '20', '50'],
        }}
        rowKey="key"
        scroll={{ x: 800 }}
      />
    </>
  );
};

const Filter = () => {
  const [searchParams] = useSearchParams();
  const { setSearchParams } = useCustomParams();

  const onSearch = useDebouncedCallback((value) => {
    setSearchParams({ search: value });
  }, 500);

  return (
    <Row className="Products_filter" gutter={[15, 15]}>
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
            setSearchParams({ status: value });
          }}
        >
          <Select.Option value={productStatuses.AVAILABLE}>
            Available
          </Select.Option>
          <Select.Option value={productStatuses.REORDER}>Reorder</Select.Option>
          <Select.Option value={productStatuses.OUT_OF_STOCK}>
            Out of Stock
          </Select.Option>
        </Select>
      </Col>
    </Row>
  );
};

BranchProducts.propTypes = {
  unitTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
};

export default BranchProducts;