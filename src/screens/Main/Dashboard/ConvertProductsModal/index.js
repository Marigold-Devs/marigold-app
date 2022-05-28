import {
  Alert,
  Button,
  Col,
  Divider,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import { BranchProductStatus, RequestErrors } from 'components';
import { FieldError } from 'components/elements';
import { ErrorMessage, Formik } from 'formik';
import { convertIntoArray } from 'globals/functions';
import { productStatuses, SEARCH_DEBOUNCE_MS } from 'globals/variables';
import { useBranches, useBranchProducts } from 'hooks';
import { useBranchProductConvert } from 'hooks/useBranchProducts';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import * as Yup from 'yup';

export const ConvertProductsModal = ({ branchId, onSuccess, onClose }) => {
  // STATES
  const [productSearch, setProductSearch] = useState('');
  const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);

  // REFS
  const refFormik = useRef();

  // CUSTOM HOOKS
  const { isFetching: isFetchingBranches, data: branches } = useBranches();
  const {
    isFetching: isFetchingBranchProducts,
    data: { products },
  } = useBranchProducts({
    params: {
      branchId,
      search: productSearch,
    },
  });
  const {
    mutateAsync: convertProduct,
    isLoading: isConverting,
    error: convertProductError,
  } = useBranchProductConvert();

  // METHODS
  const getFormDetails = useCallback(
    () => ({
      defaultValues: {
        branchId,
        productId: null,
        fromBranchProductId: null,
        fromQuantity: null,
        toBranchProductId: null,
        toQuantity: null,
      },
      schema: Yup.object().shape({
        branchId: Yup.number().required().label('Branch'),
        productId: Yup.number().nullable().required().label('Product'),
        fromBranchProductId: Yup.number()
          .nullable()
          .required()
          .label('Product Unit'),
        fromQuantity: Yup.number()
          .nullable()
          .max(selectedBranchProduct?.balance || 0)
          .required()
          .label('Quantity'),
        toBranchProductId: Yup.number()
          .nullable()
          .required()
          .label('Product Unit'),
        toQuantity: Yup.number().nullable().min(1).required().label('Quantity'),
      }),
    }),
    [branchId, selectedBranchProduct?.balance]
  );

  const handleSearch = useDebouncedCallback((value) => {
    setProductSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  return (
    <Modal
      footer={[
        <Button
          key="btnCancel"
          disabled={isFetchingBranches || isFetchingBranchProducts}
          size="large"
          onClick={onClose}
        >
          Cancel
        </Button>,
        <Button
          key="btnSubmit"
          disabled={isFetchingBranches || isFetchingBranchProducts}
          loading={isConverting}
          size="large"
          type="primary"
          onClick={() => {
            refFormik.current.submitForm();
          }}
        >
          Submit
        </Button>,
      ]}
      title="Convert Products"
      width={800}
      centered
      closable
      visible
      onCancel={onClose}
    >
      <RequestErrors
        className="mb-3"
        errors={convertIntoArray(convertProductError?.errors)}
      />

      <Formik
        initialValues={getFormDetails().defaultValues}
        innerRef={refFormik}
        validationSchema={getFormDetails().schema}
        enableReinitialize
        onSubmit={async (values) => {
          await convertProduct(values);
          onSuccess();
        }}
      >
        {({ values, setFieldValue }) => (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Typography.Text strong>Name</Typography.Text>
                <Select className="w-100" value={values.branchId}>
                  {branches?.map((branch) => (
                    <Select.Option key={branch.id} value={branch.id}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
                <ErrorMessage
                  name="branchId"
                  render={(error) => (
                    <Typography.Text type="danger">{error}</Typography.Text>
                  )}
                />
              </Col>
              <Col span={24}>
                <Typography.Text strong>Product</Typography.Text>
                <Select
                  className="w-100"
                  defaultActiveFirstOption={false}
                  filterOption={false}
                  notFoundContent={
                    isFetchingBranchProducts ? <Spin size="small" /> : null
                  }
                  value={values.productId}
                  showSearch
                  onChange={(value) => {
                    setFieldValue('productId', value);

                    // NOTE: We need to set the product in form to be used on the inputs fields below
                    const product = products.find(({ id }) => id === value);
                    setFieldValue('product', product);

                    // NOTE: We need to clear the current inputted data to prevent the form from being submitted
                    setFieldValue('fromBranchProductId', null);
                    setFieldValue('fromQuantity', null);
                    setFieldValue('toBranchProductId', null);
                    setFieldValue('toQuantity', null);
                  }}
                  onSearch={handleSearch}
                >
                  {products.map((product) => (
                    <Select.Option key={product.id} value={product.id}>
                      <span className="mr-3">{product.name}</span>
                      <BranchProductStatus status={product.status} />
                    </Select.Option>
                  ))}
                </Select>
                <ErrorMessage component={FieldError} name="productId" />
                {values?.product?.status === productStatuses.OUT_OF_STOCK && (
                  <Alert
                    className="mt-2"
                    message="This product is out of stock."
                    type="error"
                    showIcon
                  />
                )}
              </Col>
            </Row>

            <Row className="mt-4" gutter={[16, 16]}>
              <Col span={12}>
                <Divider>FROM</Divider>

                <div>
                  <Typography.Text strong>Product Unit</Typography.Text>
                  <Select
                    className="w-100"
                    disabled={
                      values?.product?.status === productStatuses.OUT_OF_STOCK
                    }
                    value={values.fromBranchProductId}
                    onChange={(value) => {
                      setFieldValue('fromBranchProductId', value);

                      // NOTE: We need to set the product in form to be used on the inputs fields below
                      const branchProduct =
                        values?.product?.product_prices.find(
                          ({ id }) => id === value
                        );

                      setSelectedBranchProduct(branchProduct);
                      setFieldValue('fromQuantity', null);
                      setFieldValue('toBranchProductId', null);
                      setFieldValue('toQuantity', null);
                    }}
                  >
                    {values?.product?.product_prices?.map((productPrice) => (
                      <Select.Option
                        key={productPrice.id}
                        value={productPrice.branch_product_id}
                      >
                        {productPrice.unit_type.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <ErrorMessage
                    component={FieldError}
                    name="fromBranchProductId"
                  />
                </div>

                <div className="mt-4">
                  <Typography.Text strong>Quantity</Typography.Text>
                  <Input
                    disabled={
                      values?.product?.status === productStatuses.OUT_OF_STOCK
                    }
                    type="number"
                    value={values.fromQuantity}
                    onChange={(e) => {
                      setFieldValue('fromQuantity', e.target.value);
                    }}
                  />
                  <ErrorMessage component={FieldError} name="fromQuantity" />
                </div>
              </Col>

              <Col span={12}>
                <Divider>TO</Divider>

                <div>
                  <Typography.Text strong>Product Unit</Typography.Text>
                  <Select
                    className="w-100"
                    disabled={
                      values?.product?.status === productStatuses.OUT_OF_STOCK
                    }
                    value={values.toBranchProductId}
                    onChange={(value) => {
                      setFieldValue('toBranchProductId', value);
                    }}
                  >
                    {values?.product?.product_prices?.map((productPrice) => (
                      <Select.Option
                        key={productPrice.id}
                        disabled={
                          values.fromBranchProductId === productPrice.id
                        }
                        value={productPrice.branch_product_id}
                      >
                        {productPrice.unit_type.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <ErrorMessage
                    component={FieldError}
                    name="toBranchProductId"
                  />
                </div>

                <div className="mt-4">
                  <Typography.Text strong>Quantity</Typography.Text>
                  <Input
                    disabled={
                      values?.product?.status === productStatuses.OUT_OF_STOCK
                    }
                    type="number"
                    value={values.toQuantity}
                    onChange={(e) => {
                      setFieldValue('toQuantity', e.target.value);
                    }}
                  />
                  <ErrorMessage component={FieldError} name="toQuantity" />
                </div>
              </Col>
            </Row>
          </>
        )}
      </Formik>
    </Modal>
  );
};

ConvertProductsModal.propTypes = {
  branchId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
