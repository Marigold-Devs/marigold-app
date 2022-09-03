import { Button, Input, message, Modal, Typography } from 'antd';
import { RequestErrors } from 'components';
import { ErrorMessage, Form, Formik } from 'formik';
import { convertIntoArray } from 'globals/functions';
import { useUnitTypeCreate, useUnitTypeEdit } from 'hooks/useUnitTypes';
import PropTypes from 'prop-types';
import { useCallback, useRef } from 'react';
import * as Yup from 'yup';

export const ModifyUnitTypeModal = ({ unitType, onClose }) => {
  // CUSTOM HOOKS
  const {
    mutateAsync: createUnitType,
    isLoading: isCreating,
    error: createError,
  } = useUnitTypeCreate();
  const {
    mutateAsync: editUnitType,
    isLoading: isEditing,
    error: editError,
  } = useUnitTypeEdit();

  // REFS
  const refFormik = useRef();

  // METHODS
  const getFormDetails = useCallback(
    () => ({
      defaultValues: {
        id: unitType?.id,
        name: unitType?.name || '',
      },
      schema: Yup.object().shape({
        name: Yup.string().required().label('Name'),
      }),
    }),
    [unitType]
  );

  return (
    <Modal
      footer={[
        <Button
          disabled={isCreating || isEditing}
          size="large"
          onClick={onClose}
        >
          Cancel
        </Button>,
        <Button
          loading={isCreating || isEditing}
          size="large"
          type="primary"
          onClick={async () => {
            await refFormik.current.submitForm();
          }}
        >
          Submit
        </Button>,
      ]}
      title={unitType ? '[Edit] Unit Type' : '[Create] Unit Type'}
      centered
      closable
      visible
      onCancel={onClose}
    >
      <RequestErrors
        errors={[
          ...convertIntoArray(createError?.errors),
          ...convertIntoArray(editError?.errors),
        ]}
        withSpaceBottom
      />

      <Formik
        initialValues={getFormDetails().defaultValues}
        innerRef={refFormik}
        validationSchema={getFormDetails().schema}
        enableReinitialize
        onSubmit={async (formData) => {
          console.log('formData', formData);
          if (unitType) {
            await editUnitType(formData);
            message.success('Discount option was edited successfully');
          } else {
            await createUnitType(formData);
            message.success('Discount option was created successfully');
          }

          onClose();
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

ModifyUnitTypeModal.propTypes = {
  unitType: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
