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
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  GENERIC_ERROR_MESSAGE,
  priceTypes,
  SEARCH_DEBOUNCE_MS,
} from 'globals/variables';
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

  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();
  const {
    isFetching: isProductsFetching,
    data: { total, products },
    refetch: refetchProducts,
  } = useProducts({
    params: {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
    },
  });

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
            className="pa-0"
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
              type="primary"
              ghost
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
              <Button type="primary" danger ghost>
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
      { title: 'Name', dataIndex: 'name', width: 250, fixed: 'left' },
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
        <div className="mb-4 d-flex justify-end">
          <Button
            size="large"
            type="primary"
            onClick={() => {
              navigate('create');
            }}
          >
            <PlusOutlined /> Create Product
          </Button>
        </div>

        <Filter onSetPriceType={setSelectedPriceType} />

        <Table
          columns={getColumns()}
          dataSource={dataSource}
          loading={isProductsFetching || isUnitTypesFetching || isDeleting}
          pagination={{
            current: Number(searchParams.get('page')) || DEFAULT_PAGE,
            total,
            pageSize: Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
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
          scroll={{ x: 1500 }}
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

  const handleSearch = useDebouncedCallback((value) => {
    setSearchParams({ search: value });
  }, SEARCH_DEBOUNCE_MS);

  return (
    <Row className="mb-4" gutter={[16, 16]}>
      <Col lg={12} span={24}>
        <Typography.Text strong>Search</Typography.Text>
        <Input
          defaultValue={searchParams.get('search')}
          allowClear
          onChange={(event) => handleSearch(event.target.value.trim())}
        />
      </Col>
      <Col lg={12} span={24}>
        <Typography.Text strong>Price Type</Typography.Text>
        <Radio.Group
          className="w-100"
          defaultValue={priceTypes.DELIVERY}
          options={[
            { label: 'Delivery', value: priceTypes.DELIVERY },
            { label: 'Market', value: priceTypes.MARKET },
            { label: 'Pickup', value: priceTypes.PICKUP },
            { label: 'Special', value: priceTypes.SPECIAL },
          ]}
          optionType="button"
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
