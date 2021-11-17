import { Button, Input, Modal, Typography } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import { GENERIC_ERROR_MESSAGE } from 'globals/variables';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { BranchesService } from 'services';
import * as Yup from 'yup';

export const ModifyBranchModal = ({ branch, onSuccess, onClose }) => {
  const [isLoading, setLoading] = useState(false);

  const refFormik = useRef();

  const getFormDetails = useCallback(
    () => ({
      defaultValues: {
        id: branch?.id,
        name: branch?.name || '',
      },
      schema: Yup.object().shape({
        name: Yup.string().required().label('Name'),
      }),
    }),
    [branch]
  );

  return (
    <Modal
      footer={[
        <Button disabled={isLoading} size="large" onClick={onClose}>
          Cancel
        </Button>,
        <Button
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
      title={branch ? '[Edit] Branch' : '[Create] Branch'}
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
        onSubmit={async (values, { setFieldError }) => {
          setLoading(true);

          try {
            const fn = values.id
              ? BranchesService.edit
              : BranchesService.create;
            await fn({ id: values.id, body: values });

            onSuccess();
            onClose();
          } catch (e) {
            setFieldError('name', GENERIC_ERROR_MESSAGE);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
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
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

ModifyBranchModal.propTypes = {
  branch: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
