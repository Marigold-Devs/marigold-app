import {
  Alert,
  Button,
  Checkbox,
  Col,
  Descriptions,
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
import {
  BranchProductStatus,
  Content,
  FormError,
  PreorderStatus,
} from 'components';
import { Box } from 'components/elements';
import { Form, Formik } from 'formik';
import { formatDateTime } from 'globals/functions';
import {
  clientTypes,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  deliveryTypes,
  EMPTY_CHARACTER,
  GENERIC_ERROR_MESSAGE,
  productStatuses,
} from 'globals/variables';
import {
  useBranches,
  useBranchProducts,
  useClients,
  usePreorderCreate,
  usePreorderEdit,
  usePreorderRetrieve,
  useProducts,
  useUnitTypes,
} from 'hooks';
import _, { flatten } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDebouncedCallback } from 'use-debounce/lib';
import * as Yup from 'yup';

const tabs = {
  ALL: 'ALL',
  SELECTED: 'SELECTED',
};

// TODO: Add remarks
const ModifyPreorder = () => {
  // STATES
  const [preorderProducts, setPreorderProducts] = useState([]);

  // CUSTOM HOOKS
  const params = useParams();
  const navigate = useNavigate();
  const { isFetching: isPreorderFetching, data: preorder } =
    usePreorderRetrieve({
      id: params.preorderId,
    });
  const { isFetching: isBranchesFetching, data: branches } = useBranches();
  const { isFetching: isSuppliersFetching, data: suppliers } = useClients({
    params: { type: clientTypes.SUPPLIER },
  });
  const {
    isFetching: isProductsFetching,
    data: { products },
  } = useProducts({
    params: {
      ids: preorder?.preorder_products
        ? preorder.preorder_products.map((item) => item.product.id).join(',')
        : null,
    },
    options: {
      enabled: !!preorder,
    },
  });
  const { mutateAsync: createPreorder, isLoading: isCreating } =
    usePreorderCreate();
  const { mutateAsync: editPreorder, isLoading: isEditing } = usePreorderEdit();

  // METHODS
  useEffect(() => {
    if (!preorder || products.length === 0) {
      return;
    }

    const data = {};

    // Note: We need to group all preorder products by product so it
    // will be easier to traverse them later on
    preorder?.preorder_products.forEach((preorderProduct) => {
      const productName =
        preorderProduct.branch_product.product_price.product.name;

      if (data[productName] === undefined) {
        data[productName] = [];
      }

      data[productName].push(preorderProduct);
    });

    // Note: Convert the object into array
    const formattedPreorderProducts = Object.keys(data).map((key) => {
      const preorderProduct = data[key][0];

      // Get the product prices that has quantity
      const productPrices = data[key].map((item) => ({
        id: item.branch_product.product_price.id,
        branchProductId: item.branch_product.id,
        unitTypeId: item.unit_type_id,
        quantity: Number(item.quantity),
      }));

      // Get the other product prices that has empty (for display purposes)
      const productPricesIds = productPrices.map(({ id }) => id);

      const product = products.find(
        ({ id }) => id === preorderProduct.product.id
      );

      if (product) {
        const productPricesAll = product?.product_prices || [];

        let productPricesEmpty = productPricesAll.filter(
          ({ id }) => !productPricesIds.includes(id)
        );

        if (productPricesEmpty.length > 0) {
          productPricesEmpty = productPricesEmpty.forEach((productPrice) => {
            productPrices.push({
              branchProductId: preorderProduct.branch_product.id,
              unitTypeId: productPrice.unit_type_id,
              quantity: 0,
            });
          });
        }
      }

      return {
        productId: preorderProduct.product.id,
        productName: preorderProduct.product.name,
        productStatus: null, // TODO: Add the product status here - need to update backend to include the product status in the response
        productPrices,
        remarks: '',
      };
    });

    setPreorderProducts(formattedPreorderProducts);
  }, [preorder, products]);

  const getFormDetails = useCallback(
    () => ({
      defaultValues: {
        branchId: preorder?.branch?.id,
        deliveryType: null,
        description: null,
        supplierName: null,
        supplierAddress: null,
        supplierLandline: null,
        supplierPhone: null,
        supplierDescription: null,
        preorderProducts,
      },
      schema: Yup.object().shape({
        branchId: Yup.string().required().label('Branch').nullable(),
        // NOTE: We must not check the other details when editing
        ...(preorder
          ? {}
          : {
              deliveryType: Yup.string()
                .required()
                .label('Delivery Type')
                .nullable(),
              description: Yup.string().label('Description').nullable(),
              supplierName: Yup.string()
                .required()
                .label('Supplier Name')
                .nullable(),
              supplierAddress: Yup.string()
                .required()
                .label('Supplier Address')
                .nullable(),
              supplierLandline: Yup.string()
                .label('Supplier Telephone')
                .nullable(),
              supplierPhone: Yup.string().label('Supplier Phone').nullable(),
              supplierDescription: Yup.string()
                .label('Supplier Description')
                .nullable(),
            }),
        preorderProducts: Yup.array().of(
          Yup.object().shape({
            productId: Yup.number().required(),
            productName: Yup.string().required(),
            productStatus: Yup.string().nullable(),
            remarks: Yup.string().nullable(),
            productPrices: Yup.array().of(
              Yup.object().shape({
                branchProductId: Yup.number().required().label('Product'),
                unitTypeId: Yup.number().required(),
                quantity: Yup.number()
                  .required()
                  .min(0, 'Must not be negative')
                  .label('Quantity'),
                remarks: Yup.string().label('Remarks'),
              })
            ),
          })
        ),
      }),
    }),
    [preorder, preorderProducts]
  );

  const handleSuccess = (preorderId) => {
    Modal.success({
      title: 'Success',
      content: 'Preorder is successfully created.',
      keyboard: false,
      okText: 'View Preorder',
      onOk: () => {
        navigate(`/preorders/${preorderId}`);
      },
    });
  };

  return (
    <Content title={preorder ? 'Edit Preorder' : 'Create Preorder'}>
      <Spin
        spinning={
          isPreorderFetching ||
          isBranchesFetching ||
          isSuppliersFetching ||
          isProductsFetching
        }
      >
        <Formik
          initialValues={getFormDetails().defaultValues}
          validationSchema={getFormDetails().schema}
          enableReinitialize
          onSubmit={async (values, { setFieldError }) => {
            if (values.preorderProducts.length > 0) {
              try {
                const supplier = suppliers.find(
                  ({ name }) => name === values.supplierName
                );
                console.log('values.preorderProducts', values.preorderProducts);
                const preorderProductsData = flatten(
                  values.preorderProducts.map((preorderProduct) =>
                    preorderProduct.productPrices
                      .filter((productPrice) => productPrice.quantity > 0)
                      .map((productPrice) => ({
                        branch_product_id: productPrice.branchProductId,
                        quantity: productPrice.quantity,
                        remarks: preorderProduct.remarks,
                      }))
                  )
                );

                if (preorderProductsData.length > 0) {
                  let responseData = null;
                  if (preorder) {
                    const { data } = await editPreorder({
                      id: preorder.id,
                      preorderProducts: preorderProductsData,
                    });
                    responseData = data;
                  } else {
                    const { data } = await createPreorder({
                      branchId: values.branchId,
                      deliveryType: values.deliveryType,
                      description: values.description,
                      supplier: {
                        id: supplier?.id,
                        name: values.supplierName,
                        description: values.supplierDescription,
                        address: values.supplierAddress,
                        landline: values.supplierLandline,
                        phone: values.supplierPhone,
                      },
                      preorderProducts: preorderProductsData,
                    });
                    responseData = data;
                  }

                  handleSuccess(responseData.id);
                } else {
                  message.error('Please add quantity to products first');
                }
              } catch (e) {
                setFieldError('response', GENERIC_ERROR_MESSAGE);
              }
            } else {
              message.error('Please add a product first');
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="w-100">
              <Spin spinning={isCreating || isEditing}>
                <PreorderDetails
                  branches={branches}
                  preorder={preorder}
                  suppliers={suppliers}
                  values={values}
                  onSetFieldValue={setFieldValue}
                />

                {values.branchId !== null && (
                  <Box>
                    <Tabs defaultActiveKey={tabs.ALL} size="large" type="card">
                      <Tabs.TabPane key={tabs.ALL} tab="All">
                        <ProductsAll
                          preorder={preorder}
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

const PreorderDetails = ({
  preorder,
  branches,
  suppliers,
  values,
  onSetFieldValue,
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  return (
    <Box>
      {preorder ? (
        <>
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            labelStyle={{ fontWeight: 'bold' }}
            size="small"
            bordered
          >
            <Descriptions.Item label="ID" span={2}>
              {preorder?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Branch">
              {preorder?.branch?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Type">
              {_.upperFirst(preorder?.delivery_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {preorder?.user?.first_name} {preorder?.user?.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Datetime Created">
              {formatDateTime(preorder?.datetime_created)}
            </Descriptions.Item>
            <Descriptions.Item label="Datetime Fulfilled">
              {formatDateTime(preorder?.datetime_fulfilled)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <PreorderStatus status={preorder?.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <Alert description={preorder.description} type="info" showIcon />
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            labelStyle={{ fontWeight: 'bold' }}
            size="small"
            title="Supplier"
            bordered
          >
            <Descriptions.Item label="Name" span={2}>
              {preorder?.supplier?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {preorder?.supplier?.phone || EMPTY_CHARACTER}
            </Descriptions.Item>
            <Descriptions.Item label="Telephone">
              {preorder?.supplier?.landline || EMPTY_CHARACTER}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {preorder?.supplier?.address}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {preorder?.supplier?.description}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Row gutter={[16, 16]}>
          <Col sm={12} xs={24}>
            <Typography.Text strong>Branch Destination</Typography.Text>
            <Select
              className="w-100"
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
              className="w-100"
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
            <Typography.Text strong>Description</Typography.Text>
            <Input
              value={values.description}
              onChange={(e) => {
                onSetFieldValue('description', e.target.value);
              }}
            />
            <FormError name="description" />
          </Col>

          <Col span={24}>
            <Divider>Supplier</Divider>
          </Col>

          <Col md={12} xs={24}>
            <Typography.Text strong>Supplier's Name</Typography.Text>
            <Select
              className="w-100"
              mode="tags"
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
            <Typography.Text strong>
              Supplier's Telephone Number
            </Typography.Text>
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
      )}
    </Box>
  );
};

const ProductsAll = ({ preorder, values, onSetFieldValue }) => {
  // STATES
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
      branchId: values.branchId,
      page,
      pageSize,
      search,
      status,
    },
    options: {
      enabled: !!values.branchId,
    },
  });

  // METHODS
  useEffect(() => {
    const data = products.map((product) => {
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
                  (preorderProduct) => preorderProduct.productId !== product.id
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
    });

    setDataSource(data);
  }, [products, values]);

  useEffect(() => {
    // NOTE: Only clear the data when creating
    if (!preorder) {
      setDataSource([]);
      onSetFieldValue('preorderProducts', []);
    }
  }, [preorder, values.branchId]);

  const onSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

  return (
    <>
      <Row className="mb-4" gutter={[16, 16]}>
        <Col lg={12} span={24}>
          <Typography.Text strong>Search</Typography.Text>
          <Input
            allowClear
            onChange={(event) => onSearch(event.target.value.trim())}
          />
        </Col>

        <Col lg={12} span={24}>
          <Typography.Text strong>Status</Typography.Text>
          <Select
            className="w-100"
            allowClear
            onChange={(value) => {
              setStatus(value);
            }}
          >
            <Select.Option value={productStatuses.AVAILABLE}>
              Available
            </Select.Option>
            <Select.Option value={productStatuses.REORDER}>
              Reorder
            </Select.Option>
            <Select.Option value={productStatuses.OUT_OF_STOCK}>
              Out of Stock
            </Select.Option>
          </Select>
        </Col>
      </Row>
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
      />
    </>
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
          remarks: (
            <Input
              className="text-center"
              value={preorderProduct.remarks || ''}
              onChange={(e) => {
                onSetFieldValue(
                  `preorderProducts.${index}.remarks`,
                  e.target.value
                );
              }}
            />
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
                  className="text-center"
                  type="number"
                  value={productPrice.quantity || ''}
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
      { title: 'Remarks', dataIndex: 'remarks' },
      { title: 'Status', dataIndex: 'status' },
    ];
  }, [values, unitTypes]);

  return (
    <Table
      columns={getColumns()}
      dataSource={dataSource}
      loading={isUnitTypesFetching}
      pagination={false}
      scroll={{ x: 800 }}
    />
  );
};

PreorderDetails.propTypes = {
  preorder: PropTypes.shape({
    id: PropTypes.number,
    delivery_type: PropTypes.string,
    datetime_created: PropTypes.string,
    datetime_fulfilled: PropTypes.string,
    status: PropTypes.string,
    description: PropTypes.string,
    branch: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    user: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
    supplier: PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
      landline: PropTypes.string,
      address: PropTypes.string,
      description: PropTypes.string,
    }),
  }),
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
    description: PropTypes.string,
    supplierName: PropTypes.string,
    supplierAddress: PropTypes.string,
    supplierLandline: PropTypes.string,
    supplierPhone: PropTypes.string,
    supplierDescription: PropTypes.string,
  }),
  onSetFieldValue: PropTypes.func.isRequired,
};

ProductsAll.propTypes = {
  preorder: PropTypes.shape({
    id: PropTypes.number,
  }),
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

export default ModifyPreorder;
