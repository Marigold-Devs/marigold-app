import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Input,
  message,
  Radio,
  Row,
  Select,
  Spin,
  Typography,
  Modal,
} from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import { GENERIC_ERROR_MESSAGE, vatTypes } from 'globals/variables';
import { useProduct, useUnitTypes } from 'hooks';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import * as Yup from 'yup';
import '../styles.scss';
import { ProductsService } from 'services';

const ModifyProduct = () => {
  // STATES
  const [isLoading, setLoading] = useState(false);

  // CUSTOM HOOKS
  const params = useParams();
  const navigate = useNavigate();
  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();
  const { isFetching: isProductFetching, data: product } = useProduct({
    id: params.productId,
  });

  // VARIABLES
  const isCreate = params.productId === undefined;

  // METHODS
  const getFormDetails = useCallback(
    () => ({
      defaultValues: {
        id: product?.id,
        name: product?.name || '',
        unitCost: product?.unit_cost || '',
        vatType: product?.vat_type || '',
        productPrices:
          product?.product_prices.map((productPrice) => ({
            id: productPrice.id,
            priceMarket: Number(productPrice.price_market),
            priceDelivery: Number(productPrice.price_delivery),
            pricePickup: Number(productPrice.price_pickup),
            priceSpecial: Number(productPrice.price_special),
            reorderPoint: Number(productPrice.reorder_point),
            unitType: productPrice.unit_type_id,
          })) || [],
      },
      schema: Yup.object().shape({
        name: Yup.string().required().label('Name'),
        unitCost: Yup.string().required().label('Unit Cost'),
        vatType: Yup.string().required().label('VAT'),
        productPrices: Yup.array().of(
          Yup.object().shape({
            priceMarket: Yup.number()
              .positive('Must be greater than zero')
              .required('Required'),
            priceDelivery: Yup.number()
              .positive('Must be greater than zero')
              .required('Required'),
            pricePickup: Yup.number()
              .positive('Must be greater than zero')
              .required('Required'),
            priceSpecial: Yup.number()
              .positive('Must be greater than zero')
              .required('Required'),
            reorderPoint: Yup.number()
              .positive('Must be greater than zero')
              .required('Required'),
            unitType: Yup.string().required('Required'),
          })
        ),
      }),
    }),
    [product]
  );

  const onAddClick = (values) => [
    ...values.productPrices,
    {
      priceMarket: '',
      priceDelivery: '',
      pricePickup: '',
      priceSpecial: '',
      reorderPoint: '',
      unitType: '',
    },
  ];

  const onRemoveClick = (index, values) =>
    values.productPrices.filter((_, i) => i !== index);

  const handleSuccess = (modifiedProduct) => {
    const action = isCreate ? 'created' : 'updated';

    Modal.success({
      title: 'Success',
      content: `${modifiedProduct.name} is successfully ${action}. Press the button below to go back to the products screen.`,
      keyboard: false,
      okText: 'Proceed',
      onOk: () => {
        navigate('/products');
      },
    });
  };

  return (
    <Content title="Products">
      <Spin spinning={isUnitTypesFetching || isProductFetching || isLoading}>
        <Box>
          <Formik
            initialValues={getFormDetails().defaultValues}
            validationSchema={getFormDetails().schema}
            enableReinitialize
            onSubmit={async (values, { setFieldError }) => {
              setLoading(true);

              if (values.productPrices.length > 0) {
                try {
                  const serviceFn = isCreate
                    ? ProductsService.create
                    : ProductsService.edit;

                  const { data } = await serviceFn({
                    id: values.id,
                    body: {
                      name: values.name,
                      unit_cost: values.unitCost,
                      vat_type: values.vatType,
                      product_prices: values.productPrices.map(
                        (productPrice) => ({
                          id: productPrice.id,
                          unit_type_id: productPrice.unitType,
                          price_market: productPrice.priceMarket,
                          price_delivery: productPrice.priceDelivery,
                          price_pickup: productPrice.pricePickup,
                          price_special: productPrice.priceSpecial,
                          reorder_point: productPrice.reorderPoint,
                        })
                      ),
                    },
                  });

                  handleSuccess(data);
                } catch (e) {
                  console.error(e);
                  setFieldError('response', GENERIC_ERROR_MESSAGE);
                }
              } else {
                message.error('Please add a product price first');
              }

              setLoading(false);
            }}
          >
            {({ values, setFieldValue }) => (
              <Form style={{ width: '100%' }}>
                <ErrorMessage
                  name="response"
                  render={(error) => (
                    <Typography.Text type="danger">{error}</Typography.Text>
                  )}
                />

                <Row gutter={[24, 24]}>
                  <Col lg={12}>
                    <Typography.Text strong>Name</Typography.Text>
                    <Input
                      value={values.name}
                      onChange={(e) => {
                        setFieldValue('name', e.target.value);
                      }}
                    />
                    <ErrorMessage
                      name="name"
                      render={(error) => (
                        <Typography.Text type="danger">{error}</Typography.Text>
                      )}
                    />
                  </Col>
                  <Col lg={12}>
                    <Typography.Text strong>Unit Cost</Typography.Text>
                    <Input
                      prefix="₱"
                      type="number"
                      value={values.unitCost}
                      onChange={(e) => {
                        setFieldValue('unitCost', e.target.value);
                      }}
                    />
                    <ErrorMessage
                      name="unitCost"
                      render={(error) => (
                        <Typography.Text type="danger">{error}</Typography.Text>
                      )}
                    />
                  </Col>
                  <Col lg={12}>
                    <Typography.Text strong>VAT</Typography.Text>
                    <Radio.Group
                      buttonStyle="solid"
                      options={[
                        { label: 'VAT', value: vatTypes.VAT },
                        { label: 'VAT-Exempted', value: vatTypes.VAT_E },
                      ]}
                      optionType="button"
                      style={{ width: '100%' }}
                      value={values.vatType}
                      onChange={(e) => {
                        setFieldValue('vatType', e.target.value);
                      }}
                    />
                    <ErrorMessage
                      name="vatType"
                      render={(error) => (
                        <Typography.Text type="danger">{error}</Typography.Text>
                      )}
                    />
                  </Col>
                </Row>

                <Divider>PRICES</Divider>

                <Row gutter={[16, 32]}>
                  {values.productPrices.map((productPrice, index) => (
                    <Col key={index} span={24}>
                      <ProductPrice
                        index={index}
                        isCreate={isCreate}
                        unitTypes={unitTypes}
                        values={productPrice}
                        onRemoveProductPrice={() => {
                          setFieldValue(
                            'productPrices',
                            onRemoveClick(index, values)
                          );
                        }}
                        onSetFieldValue={setFieldValue}
                      />
                    </Col>
                  ))}

                  <Col span={24}>
                    <Button
                      className="ModifyProduct_btnAddPrice"
                      htmlType="button"
                      size="large"
                      type="primary"
                      ghost
                      onClick={() => {
                        setFieldValue('productPrices', onAddClick(values));
                      }}
                    >
                      <PlusOutlined /> Add Price
                    </Button>
                  </Col>
                </Row>

                <Divider />

                <Row justify="end">
                  <Col>
                    <Button
                      className="ModifyProduct_btnSubmit"
                      htmlType="submit"
                      size="large"
                      type="primary"
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Box>
      </Spin>
    </Content>
  );
};

const ProductPrice = ({
  index,
  isCreate,
  unitTypes,
  values,
  onRemoveProductPrice,
  onSetFieldValue,
}) => (
  <Row gutter={[4, 4]}>
    <Col sm={6} xs={12}>
      <Typography.Text strong>Price (Market)</Typography.Text>
      <Input
        prefix="₱"
        type="number"
        value={values.priceMarket}
        onChange={(e) => {
          onSetFieldValue(`productPrices.${index}.priceMarket`, e.target.value);
        }}
      />
      <ErrorMessage
        name={`productPrices.${index}.priceMarket`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    <Col sm={6} xs={12}>
      <Typography.Text strong>Price (Delivery)</Typography.Text>
      <Input
        prefix="₱"
        type="number"
        value={values.priceDelivery}
        onChange={(e) => {
          onSetFieldValue(
            `productPrices.${index}.priceDelivery`,
            e.target.value
          );
        }}
      />
      <ErrorMessage
        name={`productPrices.${index}.priceDelivery`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    <Col sm={6} xs={12}>
      <Typography.Text strong>Price (Pickup)</Typography.Text>
      <Input
        prefix="₱"
        type="number"
        value={values.pricePickup}
        onChange={(e) => {
          onSetFieldValue(`productPrices.${index}.pricePickup`, e.target.value);
        }}
      />
      <ErrorMessage
        name={`productPrices.${index}.pricePickup`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    <Col sm={6} xs={12}>
      <Typography.Text strong>Price (Special)</Typography.Text>
      <Input
        prefix="₱"
        type="number"
        value={values.priceSpecial}
        onChange={(e) => {
          onSetFieldValue(
            `productPrices.${index}.priceSpecial`,
            e.target.value
          );
        }}
      />
      <ErrorMessage
        name={`productPrices.${index}.priceSpecial`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    <Col sm={6} xs={12}>
      <Typography.Text strong>Reorder Point</Typography.Text>
      <Input
        type="number"
        value={values.reorderPoint}
        onChange={(e) => {
          onSetFieldValue(
            `productPrices.${index}.reorderPoint`,
            e.target.value
          );
        }}
      />
      <ErrorMessage
        name={`productPrices.${index}.reorderPoint`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    <Col sm={6} xs={12}>
      <Typography.Text strong>Unit Type</Typography.Text>
      <Select
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        optionFilterProp="children"
        style={{ width: '100%' }}
        value={values.unitType}
        showSearch
        onChange={(value) => {
          onSetFieldValue(`productPrices.${index}.unitType`, value);
        }}
      >
        {unitTypes.map((unitType) => (
          <Select.Option key={unitType.id} value={unitType.id}>
            {unitType.name}
          </Select.Option>
        ))}
      </Select>
      <ErrorMessage
        name={`productPrices.${index}.unitType`}
        render={(error) => (
          <Typography.Text type="danger">{error}</Typography.Text>
        )}
      />
    </Col>

    {isCreate && (
      <Col sm={12} xs={24}>
        <Row align="middle" justify="center" style={{ height: '100%' }}>
          <Col>
            <Button
              htmlType="button"
              type="dashed"
              danger
              onClick={onRemoveProductPrice}
            >
              <CloseOutlined /> DELETE PRICE
            </Button>
          </Col>
        </Row>
      </Col>
    )}
  </Row>
);

ProductPrice.propTypes = {
  index: PropTypes.number.isRequired,
  isCreate: PropTypes.bool.isRequired,
  unitTypes: PropTypes.array.isRequired,
  values: PropTypes.shape({
    priceMarket: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceDelivery: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pricePickup: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceSpecial: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reorderPoint: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unitType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onRemoveProductPrice: PropTypes.func.isRequired,
  onSetFieldValue: PropTypes.func.isRequired,
};

export default ModifyProduct;
