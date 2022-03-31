import {
  Alert,
  Button,
  Checkbox,
  Col,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { BranchProductStatus, Content, FormError } from 'components';
import { Box } from 'components/elements';
import { Form, Formik } from 'formik';
import {
  clientTypes,
  deliveryTypes,
  GENERIC_ERROR_MESSAGE,
} from 'globals/variables';
import {
  useBranches,
  useBranchProducts,
  useClients,
  useUnitTypes,
} from 'hooks';
import { flatten } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PreordersService } from 'services';
import * as Yup from 'yup';
import '../styles.scss';

const tabs = {
  ALL: 'ALL',
  SELECTED: 'SELECTED',
};

const CreatePreorder = () => {
  // STATES
  const [isLoading, setLoading] = useState(false);

  // CUSTOM HOOKS
  const navigate = useNavigate();
  const { isFetching: isBranchesFetching, data: branches } = useBranches();
  const { isFetching: isSuppliersFetching, data: suppliers } = useClients({
    params: { type: clientTypes.SUPPLIER },
  });

  const formDetails = {
    defaultValues: {
      branchId: null,
      deliveryType: null,
      supplierName: null,
      supplierAddress: null,
      supplierLandline: null,
      supplierPhone: null,
      supplierDescription: null,
      preorderProducts: [],
    },
    schema: Yup.object().shape({
      branchId: Yup.string().required().label('Branch').nullable(),
      deliveryType: Yup.string().required().label('Delivery Type').nullable(),
      supplierName: Yup.string().required().label('Supplier Name').nullable(),
      supplierAddress: Yup.string()
        .required()
        .label('Supplier Address')
        .nullable(),
      supplierLandline: Yup.string().label('Supplier Telephone').nullable(),
      supplierPhone: Yup.string().label('Supplier Phone').nullable(),
      supplierDescription: Yup.string()
        .label('Supplier Description')
        .nullable(),
      preorderProducts: Yup.array().of(
        Yup.object().shape({
          productId: Yup.number().required(),
          productName: Yup.string().required(),
          productStatus: Yup.string().required(),
          productPrices: Yup.array().of(
            Yup.object().shape({
              branchProductId: Yup.number().required().label('Product'),
              unitTypeId: Yup.number().required(),
              quantity: Yup.number()
                .required()
                .min(0, 'Must not be negative')
                .label('Quantity'),
            })
          ),
        })
      ),
    }),
  };

  // METHODS
  const handleSuccess = (preorderId) => {
    Modal.success({
      title: 'Success',
      content: `Preorder is successfully created.`,
      keyboard: false,
      okText: 'View Preorder',
      onOk: () => {
        navigate(`/preorders/${preorderId}`);
      },
    });
  };

  return (
    <Content title="Create Preorder">
      <Spin spinning={isBranchesFetching || isSuppliersFetching}>
        <Formik
          initialValues={formDetails.defaultValues}
          validationSchema={formDetails.schema}
          onSubmit={async (values, { setFieldError }) => {
            setLoading(true);

            if (values.preorderProducts.length > 0) {
              try {
                const supplier = suppliers.find(
                  ({ name }) => name === values.supplierName
                );

                const preorderProducts = flatten(
                  values.preorderProducts.map((preorderProduct) =>
                    preorderProduct.productPrices
                      .filter((productPrice) => productPrice.quantity > 0)
                      .map((productPrice) => ({
                        branch_product_id: productPrice.branchProductId,
                        quantity: productPrice.quantity,
                      }))
                  )
                );

                if (preorderProducts.length > 0) {
                  const { data } = await PreordersService.create({
                    body: {
                      branch_id: values.branchId,
                      delivery_type: values.deliveryType,
                      supplier: {
                        id: supplier?.id,
                        name: values.supplierName,
                        description: values.supplierDescription,
                        address: values.supplierAddress,
                        landline: values.supplierLandline,
                        phone: values.supplierPhone,
                      },
                      preorder_products: preorderProducts,
                    },
                  });

                  handleSuccess(data.id);
                } else {
                  message.error('Please add quantity to products first');
                }
              } catch (e) {
                console.error(e);
                setFieldError('response', GENERIC_ERROR_MESSAGE);
              }
            } else {
              message.error('Please add a product first');
            }

            setLoading(false);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form style={{ width: '100%' }}>
              <Spin spinning={isLoading}>
                <PreorderDetails
                  branches={branches}
                  suppliers={suppliers}
                  values={values}
                  onSetFieldValue={setFieldValue}
                />

                {values.branchId !== null && (
                  <Box>
                    <Tabs defaultActiveKey={tabs.ALL} size="large" type="card">
                      <Tabs.TabPane key={tabs.ALL} tab="All">
                        <ProductsAll
                          values={values}
                          onSetFieldValue={setFieldValue}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        key={tabs.SELECTED}
                        tab={`Selected Products (${values.preorderProducts.length})`}
                      >
                        <ProductsSelected
                          values={values}
                          onSetFieldValue={setFieldValue}
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Box>
                )}

                <Box>
                  <Row justify="end">
                    <Col>
                      <Button htmlType="submit" size="large" type="primary">
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Box>
              </Spin>
            </Form>
          )}
        </Formik>
      </Spin>
    </Content>
  );
};

const PreorderDetails = ({ branches, suppliers, values, onSetFieldValue }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <Box>
      <Row gutter={[15, 15]}>
        <Col sm={12} xs={24}>
          <Typography.Text strong>Branch Destination</Typography.Text>
          <Select
            style={{ width: '100%' }}
            value={values.branchId}
            onChange={(value) => {
              onSetFieldValue('branchId', value);
            }}
          >
            {branches.map((branch) => (
              <Select.Option key={branch.id} value={branch.id}>
                {branch.name}
              </Select.Option>
            ))}
          </Select>
          <FormError name="branchId" />
        </Col>

        <Col sm={12} xs={24}>
          <Typography.Text strong>Delivery Type</Typography.Text>
          <Select
            style={{ width: '100%' }}
            value={values.deliveryType}
            onChange={(value) => {
              onSetFieldValue('deliveryType', value);
            }}
          >
            <Select.Option
              key={deliveryTypes.DELIVERY}
              value={deliveryTypes.DELIVERY}
            >
              Delivery
            </Select.Option>
            <Select.Option
              key={deliveryTypes.PICKUP}
              value={deliveryTypes.PICKUP}
            >
              Pickup
            </Select.Option>
          </Select>
          <FormError name="deliveryType" />
        </Col>

        <Col span={24}>
          <Divider>Supplier</Divider>
        </Col>

        <Col md={12} xs={24}>
          <Typography.Text strong>Supplier's Name</Typography.Text>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            value={values.supplierName !== null ? [values.supplierName] : []}
            onDeselect={() => {
              onSetFieldValue('supplierName', null);
              onSetFieldValue('supplierAddress', null);
              onSetFieldValue('supplierLandline', null);
              onSetFieldValue('supplierPhone', null);
              onSetFieldValue('supplierDescription', null);
            }}
            onSelect={(value) => {
              const supplierName = value;
              onSetFieldValue('supplierName', supplierName);

              const supplier = suppliers.find(
                ({ name }) => name === supplierName
              );
              onSetFieldValue('supplierAddress', supplier?.address || '');
              onSetFieldValue('supplierLandline', supplier?.landline || '');
              onSetFieldValue('supplierPhone', supplier?.phone || '');
              onSetFieldValue(
                'supplierDescription',
                supplier?.description || ''
              );
            }}
          >
            {suppliers.map((supplier) => (
              <Select.Option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </Select.Option>
            ))}
          </Select>
          <FormError name="supplierName" />
        </Col>

        <Col md={6} sm={24}>
          <Typography.Text strong>Supplier's Phone Number</Typography.Text>
          <Input
            value={values.supplierPhone}
            onChange={(e) => {
              onSetFieldValue('supplierPhone', e.target.value);
            }}
          />
          <FormError name="supplierPhone" />
        </Col>

        <Col md={6} sm={24}>
          <Typography.Text strong>Supplier's Telephone Number</Typography.Text>
          <Input
            value={values.supplierLandline}
            onChange={(e) => {
              onSetFieldValue('supplierLandline', e.target.value);
            }}
          />
          <FormError name="supplierLandline" />
        </Col>

        <Col span={24}>
          <Typography.Text strong>Supplier's Address</Typography.Text>
          <Input
            value={values.supplierAddress}
            onChange={(e) => {
              onSetFieldValue('supplierAddress', e.target.value);
            }}
          />
          <FormError name="supplierAddress" />
        </Col>

        <Col span={24}>
          <Typography.Text strong>Supplier's Description</Typography.Text>

          {isEditingDescription ? (
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 70px)' }}
                value={values.supplierDescription}
                onChange={(e) => {
                  onSetFieldValue('supplierDescription', e.target.value);
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  setIsEditingDescription(false);
                }}
              >
                Save
              </Button>
            </Input.Group>
          ) : (
            <Alert
              action={
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    setIsEditingDescription(true);
                  }}
                >
                  Edit
                </Button>
              }
              description={values.supplierDescription}
              type="info"
              showIcon
            />
          )}

          <FormError name="supplierDescription" />
        </Col>
      </Row>
    </Box>
  );
};

const ProductsAll = ({ values, onSetFieldValue }) => {
  // STATES
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dataSource, setDataSource] = useState([]);

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Status', dataIndex: 'status' },
  ];

  // CUSTOM HOOKS
  const {
    isFetching: isBranchProductsFetching,
    data: { total, products },
  } = useBranchProducts({
    params: {
      page,
      pageSize,
      branchId: values.branchId,
      search,
      status,
    },
  });

  // METHODS
  useEffect(() => {
    setDataSource(
      products.map((product) => {
        const isAlreadyAdded = values.preorderProducts.find(
          (preorderProduct) => preorderProduct.productId === product.id
        );

        return {
          key: product.id,
          name: (
            <Checkbox
              checked={isAlreadyAdded}
              onChange={(e) => {
                const isChecked = e.target.checked;
                let newPreorderProducts = [];

                if (isChecked) {
                  newPreorderProducts = [
                    ...values.preorderProducts,
                    {
                      productId: product.id,
                      productName: product.name,
                      productStatus: product.status,
                      productPrices: product.product_prices.map(
                        (productPrice) => ({
                          branchProductId: productPrice.branch_product_id,
                          unitTypeId: productPrice.unit_type_id,
                          quantity: 0,
                        })
                      ),
                    },
                  ];
                } else {
                  newPreorderProducts = values.preorderProducts.filter(
                    (preorderProduct) =>
                      preorderProduct.productId !== product.id
                  );
                }

                onSetFieldValue('preorderProducts', newPreorderProducts);
              }}
            >
              {product.name}
            </Checkbox>
          ),
          status: <BranchProductStatus status={product.status} />,
        };
      })
    );
  }, [products, values]);

  useEffect(() => {
    setDataSource([]);
    onSetFieldValue('preorderProducts', []);
  }, [values.branchId]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={isBranchProductsFetching}
      pagination={{
        current: page,
        total,
        pageSize,
        onChange: (newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        },
        disabled: isBranchProductsFetching,
        position: ['bottomCenter'],
        pageSizeOptions: ['10', '20', '50'],
      }}
      rowKey="key"
    />
  );
};

const ProductsSelected = ({ values, onSetFieldValue }) => {
  // STATES
  const [dataSource, setDataSource] = useState([]);

  // CUSTOM HOOKS
  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();

  // METHODS
  useEffect(() => {
    setDataSource(
      values.preorderProducts.map((preorderProduct, index) => {
        const data = {
          key: preorderProduct.productId,
          name: (
            <Checkbox
              checked
              onChange={() => {
                onSetFieldValue(
                  'preorderProducts',
                  values.preorderProducts.filter(
                    ({ productId }) => productId !== preorderProduct.productId
                  )
                );
              }}
            >
              {preorderProduct.productName}
            </Checkbox>
          ),
          status: (
            <BranchProductStatus status={preorderProduct.productStatus} />
          ),
        };

        preorderProduct.productPrices.forEach(
          (productPrice, productPriceIndex) => {
            data[String(productPrice.unitTypeId)] = (
              <>
                <Input
                  style={{ textAlign: 'center' }}
                  type="number"
                  onChange={(e) => {
                    onSetFieldValue(
                      `preorderProducts.${index}.productPrices.${productPriceIndex}.quantity`,
                      Number(e.target.value)
                    );
                  }}
                />
                <FormError
                  name={`preorderProducts.${index}.productPrices.${productPriceIndex}.quantity`}
                />
              </>
            );
          }
        );

        return data;
      })
    );
  }, [values, unitTypes]);

  const getColumns = useCallback(() => {
    const unitTypesId = flatten(
      values?.preorderProducts?.map((preorderProduct) =>
        preorderProduct.productPrices.map(
          (productPrice) => productPrice.unitTypeId
        )
      )
    );
    const filteredUnitTypes = unitTypes.filter((unitType) =>
      unitTypesId.includes(unitType.id)
    );

    return [
      { title: 'Name', dataIndex: 'name' },
      ...filteredUnitTypes.map((unitType) => ({
        title: unitType.name,
        dataIndex: String(unitType.id),
        align: 'center',
      })),
      { title: 'Status', dataIndex: 'status' },
    ];
  }, [values, unitTypes]);

  return (
    <Table
      columns={getColumns()}
      dataSource={dataSource}
      loading={isUnitTypesFetching}
      pagination={false}
      rowKey="key"
    />
  );
};

PreorderDetails.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  suppliers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      address: PropTypes.string,
      description: PropTypes.string,
      landline: PropTypes.string,
      name: PropTypes.string,
      phone: PropTypes.string,
    })
  ).isRequired,
  values: PropTypes.shape({
    branchId: PropTypes.number,
    deliveryType: PropTypes.string,
    supplierName: PropTypes.string,
    supplierAddress: PropTypes.string,
    supplierLandline: PropTypes.string,
    supplierPhone: PropTypes.string,
    supplierDescription: PropTypes.string,
  }),
  onSetFieldValue: PropTypes.func.isRequired,
};

ProductsAll.propTypes = {
  values: PropTypes.shape({
    branchId: PropTypes.number,
    preorderProducts: PropTypes.arrayOf(
      PropTypes.shape({
        productId: PropTypes.number,
        productName: PropTypes.string,
        productStatus: PropTypes.string,
        productPrices: PropTypes.arrayOf(
          PropTypes.shape({
            branchProductId: PropTypes.number,
            unitTypeId: PropTypes.number,
            quantity: PropTypes.number,
          })
        ),
      })
    ),
  }),
  onSetFieldValue: PropTypes.func.isRequired,
};

ProductsSelected.propTypes = {
  values: PropTypes.shape({
    branchId: PropTypes.number,
    preorderProducts: PropTypes.arrayOf(
      PropTypes.shape({
        productId: PropTypes.number,
        productName: PropTypes.string,
        productStatus: PropTypes.string,
        productPrices: PropTypes.arrayOf(
          PropTypes.shape({
            branchProductId: PropTypes.number,
            unitTypeId: PropTypes.number,
            quantity: PropTypes.number,
          })
        ),
      })
    ),
  }),
  onSetFieldValue: PropTypes.func.isRequired,
};

export default CreatePreorder;
