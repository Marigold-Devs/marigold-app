import { Button, Input, message, Modal, Table } from 'antd';
import { FormError } from 'components';
import { Form, Formik } from 'formik';
import { GENERIC_ERROR_MESSAGE } from 'globals/variables';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PreorderTransactionsService } from 'services';
import * as Yup from 'yup';

export const CreateTransactionModal = ({
  preorder,
  preorderProducts,
  columns,
  onSuccess,
  onClose,
}) => {
  // STATES
  const [isLoading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [formValues, setFormValues] = useState([]);

  const refFormik = useRef();

  // METHODS
  useEffect(() => {
    const initialFormValues = [];
    let count = 0;

    setDataSource(
      Object.keys(preorderProducts).map((key) => {
        const preorderProductData = {
          key,
          name: key,
        };

        preorderProducts[key].forEach((preorderProduct) => {
          const unitTypeId =
            preorderProduct.branch_product.product_price.unit_type;

          const fieldQuantityKey = `${count}.quantity`;
          preorderProductData[String(unitTypeId)] = (
            <>
              <Input
                style={{ textAlign: 'center' }}
                type="number"
                onChange={(e) => {
                  refFormik.current.setFieldValue(
                    fieldQuantityKey,
                    Number(e.target.value)
                  );
                }}
              />
              <FormError name={fieldQuantityKey} />
            </>
          );

          initialFormValues.push({
            preorderProductId: preorderProduct.id,
            quantity: '',
          });

          count++;
        });

        return preorderProductData;
      })
    );

    setFormValues(initialFormValues);
  }, [preorderProducts]);

  const getFormDetails = useCallback(
    () => ({
      defaultValues: formValues,
      schema: Yup.array().of(
        Yup.object().shape({
          preorderProductId: Yup.number().required(),
          quantity: Yup.number().required('Required'),
        })
      ),
    }),
    [formValues]
  );

  return (
    <Modal
      footer={[
        <Button
          key="btnCancel"
          disabled={isLoading}
          size="large"
          onClick={onClose}
        >
          Cancel
        </Button>,
        <Button
          key="btnSubmit"
          loading={isLoading}
          size="large"
          type="primary"
          onClick={() => {
            refFormik.current.submitForm();
          }}
        >
          Submit
        </Button>,
      ]}
      title="[Create] Preorder Transaction"
      width={800}
      centered
      closable
      visible
      onCancel={onClose}
    >
      <Formik
        initialValues={getFormDetails().defaultValues}
        innerRef={refFormik}
        validationSchema={getFormDetails().schema}
        enableReinitialize
        onSubmit={async (values) => {
          setLoading(true);

          try {
            await PreorderTransactionsService.create({
              body: {
                preorder_id: preorder.id,
                preorder_transaction_products: values.map(
                  (preorderProduct) => ({
                    preorder_product_id: preorderProduct.preorderProductId,
                    quantity: preorderProduct.quantity,
                  })
                ),
              },
            });

            onSuccess();
            onClose();
          } catch (e) {
            message.error(GENERIC_ERROR_MESSAGE);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Form>
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={isLoading}
            pagination={false}
            rowKey="key"
            scroll={{ x: 600 }}
          />
        </Form>
      </Formik>
    </Modal>
  );
};

CreateTransactionModal.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      dataIndex: PropTypes.string,
    })
  ),
  preorder: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  preorderProducts: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
