import {
  Alert,
  Button,
  Checkbox,
  Col,
  DatePicker,
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
import { formatDateTimeForServer, formatInPeso } from 'globals/functions';
import {
  clientTypes,
  deliveryTypes,
  GENERIC_ERROR_MESSAGE,
  productStatuses,
} from 'globals/variables';
import {
  useBranches,
  useBranchProducts,
  useClients,
  useUnitTypes,
} from 'hooks';
import { flatten } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DeliveriesService } from 'services';
import * as Yup from 'yup';
import '../styles.scss';

const tabs = {
  ALL: 'ALL',
  SELECTED: 'SELECTED',
};

const getPriceByDeliveryType = (deliveryType, prices) => {
  let price = 0;
  const { priceMarket, priceDelivery, pricePickup } = prices;

  if (deliveryType === deliveryTypes.PICKUP) {
    price = priceMarket;
  } else if (deliveryType === deliveryTypes.DELIVERY) {
    price = priceDelivery;
  } else if (deliveryType === deliveryTypes.MARKET) {
    price = pricePickup;
  }

  return price;
};

const getValidDateTest = (label) =>
  Yup.string()
    .required()
    .nullable()
    .test('is-valid-date', `${label} is not a valid time`, (value) =>
      moment(value).isValid()
    )
    .label(label);

const CreateDelivery = () => {
  // STATES
  const [isLoading, setLoading] = useState(false);

  // CUSTOM HOOKS
  const navigate = useNavigate();
  const { isFetching: isBranchesFetching, data: branches } = useBranches();
  const { isFetching: isCustomersFetching, data: customers } = useClients({
    params: { type: clientTypes.CUSTOMER },
  });

  const formDetails = {
    defaultValues: {
      branchId: null,
      deliveryType: null,
      datetimeDelivery: null,
      customerName: null,
      customerAddress: null,
      customerLandline: null,
      customerPhone: null,
      customerDescription: null,
      deliveryProducts: [],
    },
    schema: Yup.object().shape({
      branchId: Yup.string().required().label('Branch').nullable(),
      deliveryType: Yup.string().required().label('Delivery Type').nullable(),
      datetimeDelivery: getValidDateTest('Schedule Of Delivery'),
      customerName: Yup.string().required().label('Customer Name').nullable(),
      customerAddress: Yup.string()
        .required()
        .label('Customer Address')
        .nullable(),
      customerLandline: Yup.string().label('Customer Telephone').nullable(),
      customerPhone: Yup.string().label('Customer Phone').nullable(),
      customerDescription: Yup.string()
        .label('Customer Description')
        .nullable(),
      deliveryProducts: Yup.array().of(
        Yup.object().shape({
          productId: Yup.number().required(),
          productName: Yup.string().required(),
          productStatus: Yup.string().required(),
          productPrices: Yup.array().of(
            Yup.object().shape({
              branchProductId: Yup.number().required().label('Product'),
              unitTypeId: Yup.number().required(),
              price: Yup.number(),
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
  const handleSuccess = (deliveryId) => {
    Modal.success({
      title: 'Success',
      content: `Delivery is successfully created.`,
      keyboard: false,
      okText: 'View Delivery',
      onOk: () => {
        navigate(`/deliveries/${deliveryId}`);
      },
    });
  };

  return (
    <Content title="Create Delivery">
      <Spin spinning={isBranchesFetching || isCustomersFetching}>
        <Formik
          initialValues={formDetails.defaultValues}
          validationSchema={formDetails.schema}
          onSubmit={async (values) => {
            setLoading(true);

            if (values.deliveryProducts.length > 0) {
              try {
                const customer = customers.find(
                  ({ name }) => name === values.customerName
                );

                const deliveryProducts = flatten(
                  values.deliveryProducts.map((deliveryProduct) =>
                    deliveryProduct.productPrices
                      .filter((productPrice) => productPrice.quantity > 0)
                      .map((productPrice) => {
                        const price = getPriceByDeliveryType(
                          values.deliveryType,
                          {
                            priceMarket: productPrice.priceMarket,
                            priceDelivery: productPrice.priceDelivery,
                            pricePickup: productPrice.pricePickup,
                          }
                        );

                        return {
                          branch_product_id: productPrice.branchProductId,
                          quantity: productPrice.quantity,
                          price,
                        };
                      })
                  )
                );

                const { data } = await DeliveriesService.create({
                  body: {
                    branch_id: values.branchId,
                    delivery_type: values.deliveryType,
                    datetime_delivery: formatDateTimeForServer(
                      moment(values.datetimeDelivery)
                    ),
                    customer: {
                      id: customer?.id,
                      name: values.customerName,
                      description: values.customerDescription,
                      address: values.customerAddress,
                      landline:
                        values.customerLandline.length > 0
                          ? values.customerLandline
                          : undefined,
                      phone:
                        values.customerPhone.length > 0
                          ? values.customerPhone
                          : undefined,
                    },
                    delivery_products: deliveryProducts,
                  },
                });

                handleSuccess(data.id);
              } catch (e) {
                console.error(e);
                message.error(GENERIC_ERROR_MESSAGE);
              }
            } else {
              message.error('Please add a product first');
            }

            setLoading(false);
          }}
        >
          {({ values, errors, setFieldValue }) => (
            <Form style={{ width: '100%' }}>
              {console.log('errors', errors)}
              {console.log('values', values)}
              <Spin spinning={isLoading}>
                <DeliveryDetails
                  branches={branches}
                  customers={customers}
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
                        tab={`Selected Products (${values.deliveryProducts.length})`}
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

const DeliveryDetails = ({ branches, customers, values, onSetFieldValue }) => {
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

            <Select.Option
              key={deliveryTypes.MARKET}
              value={deliveryTypes.MARKET}
            >
              Market
            </Select.Option>
          </Select>
          <FormError name="deliveryType" />
        </Col>

        <Col sm={12} xs={24}>
          <Typography.Text strong>Schedule of Delivery</Typography.Text>
          <DatePicker
            allowClear={false}
            format="MMM DD, YYYY hh:mm A"
            showTime={{ format: 'hh:mm A' }}
            style={{ width: '100%' }}
            onOk={(value) => {
              onSetFieldValue('datetimeDelivery', value);
            }}
          />
          <FormError name="datetimeDelivery" />
        </Col>

        <Col span={24}>
          <Divider>Customer</Divider>
        </Col>

        <Col md={12} xs={24}>
          <Typography.Text strong>Customer's Name</Typography.Text>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            value={values.customerName !== null ? [values.customerName] : []}
            onDeselect={() => {
              onSetFieldValue('customerName', null);
              onSetFieldValue('customerAddress', null);
              onSetFieldValue('customerLandline', null);
              onSetFieldValue('customerPhone', null);
              onSetFieldValue('customerDescription', null);
            }}
            onSelect={(value) => {
              const customerName = value;
              onSetFieldValue('customerName', customerName);

              const customer = customers.find(
                ({ name }) => name === customerName
              );
              onSetFieldValue('customerAddress', customer?.address || '');
              onSetFieldValue('customerLandline', customer?.landline || '');
              onSetFieldValue('customerPhone', customer?.phone || '');
              onSetFieldValue(
                'customerDescription',
                customer?.description || ''
              );
            }}
          >
            {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.name}>
                {customer.name}
              </Select.Option>
            ))}
          </Select>
          <FormError name="customerName" />
        </Col>

        <Col md={6} sm={24}>
          <Typography.Text strong>Customer's Phone Number</Typography.Text>
          <Input
            value={values.customerPhone}
            onChange={(e) => {
              onSetFieldValue('customerPhone', e.target.value);
            }}
          />
          <FormError name="customerPhone" />
        </Col>

        <Col md={6} sm={24}>
          <Typography.Text strong>Customer's Telephone Number</Typography.Text>
          <Input
            value={values.customerLandline}
            onChange={(e) => {
              onSetFieldValue('customerLandline', e.target.value);
            }}
          />
          <FormError name="customerLandline" />
        </Col>

        <Col span={24}>
          <Typography.Text strong>Customer's Address</Typography.Text>
          <Input
            value={values.customerAddress}
            onChange={(e) => {
              onSetFieldValue('customerAddress', e.target.value);
            }}
          />
          <FormError name="customerAddress" />
        </Col>

        <Col span={24}>
          <Typography.Text strong>Customer's Description</Typography.Text>

          {isEditingDescription ? (
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 70px)' }}
                value={values.customerDescription}
                onChange={(e) => {
                  onSetFieldValue('customerDescription', e.target.value);
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  setIsEditingDescription(false);
                }}
              >
                Finish
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
              description={values.customerDescription}
              type="info"
              showIcon
            />
          )}

          <FormError name="customerDescription" />
        </Col>
      </Row>
    </Box>
  );
};

const ProductsAll = ({ values, onSetFieldValue }) => {
  // STATES
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    },
  });

  // METHODS
  useEffect(() => {
    setDataSource(
      products.map((product) => {
        const isAlreadyAdded = values.deliveryProducts.find(
          (deliveryProduct) => deliveryProduct.productId === product.id
        );

        return {
          key: product.id,
          name: (
            <Checkbox
              checked={isAlreadyAdded}
              disabled={product.status === productStatuses.OUT_OF_STOCK}
              onChange={(e) => {
                const isChecked = e.target.checked;
                let newDeliveryProducts = [];

                if (isChecked) {
                  newDeliveryProducts = [
                    ...values.deliveryProducts,
                    {
                      productId: product.id,
                      productName: product.name,
                      productStatus: product.status,
                      productPrices: product.product_prices.map(
                        (productPrice) => ({
                          branchProductId: productPrice.branch_product_id,
                          unitTypeId: productPrice.unit_type_id,
                          priceMarket: productPrice.price_market,
                          priceDelivery: productPrice.price_delivery,
                          pricePickup: productPrice.price_pickup,
                          quantity: 0,
                        })
                      ),
                    },
                  ];
                } else {
                  newDeliveryProducts = values.deliveryProducts.filter(
                    (deliveryProduct) =>
                      deliveryProduct.productId !== product.id
                  );
                }

                onSetFieldValue('deliveryProducts', newDeliveryProducts);
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
    onSetFieldValue('deliveryProducts', []);
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
  const [grandTotal, setGrandTotal] = useState(0);

  // CUSTOM HOOKS
  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();

  // METHODS
  useEffect(() => {
    let total = 0;

    setDataSource(
      values.deliveryProducts.map((deliveryProduct, index) => {
        const data = {
          key: deliveryProduct.productId,
          name: (
            <Checkbox
              checked
              onChange={() => {
                onSetFieldValue(
                  'deliveryProducts',
                  values.deliveryProducts.filter(
                    ({ productId }) => productId !== deliveryProduct.productId
                  )
                );
              }}
            >
              {deliveryProduct.productName}
            </Checkbox>
          ),
        };

        let subtotal = 0;
        deliveryProduct.productPrices.forEach(
          (productPrice, productPriceIndex) => {
            const { quantity } = productPrice;
            const price = getPriceByDeliveryType(values.deliveryType, {
              priceMarket: productPrice.priceMarket,
              priceDelivery: productPrice.priceDelivery,
              pricePickup: productPrice.pricePickup,
            });

            subtotal += price * quantity;

            data[String(productPrice.unitTypeId)] = (
              <>
                <Input
                  style={{ textAlign: 'center' }}
                  type="number"
                  onChange={(e) => {
                    onSetFieldValue(
                      `deliveryProducts.${index}.productPrices.${productPriceIndex}.quantity`,
                      Number(e.target.value)
                    );
                  }}
                />
                <FormError
                  name={`deliveryProducts.${index}.productPrices.${productPriceIndex}.quantity`}
                />
              </>
            );
          }
        );
        data.subtotal = formatInPeso(subtotal);

        total += subtotal;

        return data;
      })
    );

    setGrandTotal(total);
  }, [values, unitTypes]);

  const getColumns = useCallback(() => {
    const unitTypesId = flatten(
      values?.deliveryProducts?.map((deliveryProduct) =>
        deliveryProduct.productPrices.map(
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
      { title: 'Subtotal', dataIndex: 'subtotal' },
    ];
  }, [values, unitTypes]);

  return (
    <>
      <Table
        columns={getColumns()}
        dataSource={dataSource}
        loading={isUnitTypesFetching}
        pagination={false}
        rowKey="key"
        scroll={{ x: 800 }}
      />

      <Typography.Title className="CreateDelivery_grandTotal" level={3}>
        Grand Total: {formatInPeso(grandTotal)}
      </Typography.Title>
    </>
  );
};

DeliveryDetails.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  customers: PropTypes.arrayOf(
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
    customerName: PropTypes.string,
    customerAddress: PropTypes.string,
    customerLandline: PropTypes.string,
    customerPhone: PropTypes.string,
    customerDescription: PropTypes.string,
  }),
  onSetFieldValue: PropTypes.func.isRequired,
};

ProductsAll.propTypes = {
  values: PropTypes.shape({
    branchId: PropTypes.number,
    deliveryProducts: PropTypes.arrayOf(
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
    deliveryType: PropTypes.string,
    deliveryProducts: PropTypes.arrayOf(
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

export default CreateDelivery;
