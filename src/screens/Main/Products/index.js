import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  message,
  Popconfirm,
  Radio,
  Row,
  Space,
  Table,
  Typography,
} from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { formatInPeso } from 'globals/functions';
import { GENERIC_ERROR_MESSAGE, priceTypes } from 'globals/variables';
import { useCustomParams, useProducts, useUnitTypes } from 'hooks';
import { flatten } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ProductsService } from 'services';
import { useDebouncedCallback } from 'use-debounce';
import './styles.scss';
import ViewProductModal from './ViewProductModal';

const Products = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);
  const [selectedPriceType, setSelectedPriceType] = useState(
    priceTypes.DELIVERY
  );
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CUSTOM HOOKS
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams } = useCustomParams();

  const {
    isFetching: isProductsFetching,
    data: { count, products },
    refetch: refetchProducts,
  } = useProducts({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
    },
  });
  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();

  // METHODS
  const deleteProduct = (productId) => {
    setIsDeleting(true);
    ProductsService.delete(productId)
      .then(() => {
        refetchProducts();
      })
      .catch(() => {
        message.error(GENERIC_ERROR_MESSAGE);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  useEffect(() => {
    const tableData = products.map((product) => {
      const data = {
        key: product.id,
        name: (
          <Button
            type="link"
            onClick={() => {
              setSelectedProduct(product);
            }}
          >
            {product.name}
          </Button>
        ),
        unitCost: formatInPeso(product.unit_cost),
        actions: (
          <Space size="small">
            <Button
              type="link"
              onClick={() => {
                navigate(`/products/${product.id}`);
              }}
            >
              Edit
            </Button>
            <Popconfirm
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              okText="Delete"
              placement="topLeft"
              title={`Are you sure you want to delete ${product.name}?`}
              onConfirm={() => {
                deleteProduct(product.id);
              }}
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      };

      product.product_prices.forEach((productPrice) => {
        data[String(productPrice.unit_type_id)] = formatInPeso(
          productPrice[`price_${selectedPriceType}`]
        );
      });

      return data;
    });

    setDataSource(tableData);
  }, [products, selectedPriceType]);

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
      { title: 'Unit Cost', dataIndex: 'unitCost' },
      ...filteredUnitTypes.map((unitType) => ({
        title: unitType.name,
        dataIndex: String(unitType.id),
      })),
      { title: 'Actions', dataIndex: 'actions' },
    ];
  }, [products, unitTypes]);

  return (
    <Content className="Products" title="Products">
      <Box>
        <Row className="Products_createRow" justify="end">
          <Col>
            <Button
              size="large"
              type="primary"
              onClick={() => {
                navigate('create');
              }}
            >
              <PlusOutlined /> Create Product
            </Button>
          </Col>
        </Row>

        <Filter onSetPriceType={setSelectedPriceType} />

        <Table
          columns={getColumns()}
          dataSource={dataSource}
          loading={isProductsFetching || isUnitTypesFetching || isDeleting}
          pagination={{
            current: searchParams.get('page') || 1,
            total: count,
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
      </Box>

      {selectedProduct && (
        <ViewProductModal
          product={selectedProduct}
          unitTypes={unitTypes}
          onClose={() => {
            setSelectedProduct(null);
          }}
        />
      )}
    </Content>
  );
};

const Filter = ({ onSetPriceType }) => {
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
        <Typography.Text strong>Price Type</Typography.Text>
        <Radio.Group
          defaultValue={priceTypes.DELIVERY}
          options={[
            { label: 'Delivery', value: priceTypes.DELIVERY },
            { label: 'Market', value: priceTypes.MARKET },
            { label: 'Pickup', value: priceTypes.PICKUP },
            { label: 'Special', value: priceTypes.SPECIAL },
          ]}
          optionType="button"
          style={{ width: '100%' }}
          onChange={(e) => {
            onSetPriceType(e.target.value);
          }}
        />
      </Col>
    </Row>
  );
};

Filter.propTypes = {
  onSetPriceType: PropTypes.func.isRequired,
};

export default Products;
