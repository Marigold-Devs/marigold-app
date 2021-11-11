import { Button, Input, Modal, Typography } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { BranchesService } from 'services';
import * as Yup from 'yup';

export const CreateEditBranchModal = ({ branch, onSuccess, onClose }) => {
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
      centered
      closable
      visible
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
      onCancel={onClose}
    >
      <Formik
        enableReinitialize
        initialValues={getFormDetails().defaultValues}
        innerRef={refFormik}
        validationSchema={getFormDetails().schema}
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
            setFieldError(
              'name',
              'An error occurred while processing your data.'
            );
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <Input
              placeholder="Name"
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

CreateEditBranchModal.propTypes = {
  branch: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
