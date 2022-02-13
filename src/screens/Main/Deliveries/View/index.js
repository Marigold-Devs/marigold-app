import {
  Button,
  Col,
  Descriptions,
  Divider,
  Input,
  message,
  Row,
  Select,
  Spin,
  Table,
  Typography,
} from 'antd';
import { Content, FormError, PaymentStatus, PreorderStatus } from 'components';
import { Box } from 'components/elements';
import { printDeliverySlip } from 'configurePrinter';
import { Form, Formik } from 'formik';
import { formatDateTime } from 'globals/functions';
import {
  deliveryStatuses,
  EMPTY_CHARACTER,
  GENERIC_ERROR_MESSAGE,
  paymentStatuses,
} from 'globals/variables';
import { useDelivery, useUnitTypes } from 'hooks';
import { jsPDF } from 'jspdf';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { DeliveriesService } from 'services';
import * as Yup from 'yup';
import '../styles.scss';

const formDetails = {
  defaultValues: {
    preparedBy: '',
    checkedBy: '',
    pulledOutBy: '',
    deliveredBy: '',
    paymentStatus: '',
  },
  schema: Yup.object().shape({
    preparedBy: Yup.string().label('Prepared By'),
    checkedBy: Yup.string().label('Checked By'),
    pulledOutBy: Yup.string().label('Pulled Out By'),
    deliveredBy: Yup.string().label('Delivered By'),
    paymentStatus: Yup.string().label('Payment Status'),
  }),
};

const ViewDelivery = () => {
  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [html, setHtml] = useState('');

  // CUSTOM HOOKS
  const params = useParams();

  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();
  const {
    isFetching: isDeliveryFetching,
    data: delivery,
    refetch: refetchDelivery,
  } = useDelivery({
    id: params.deliveryId,
  });

  // METHODS
  useEffect(() => {
    const data = {};

    // Note: We need to group all preorder products by product so it
    // will be easier to traverse them later on
    delivery?.delivery_products.forEach((deliveryProduct) => {
      const productName = deliveryProduct.product.name;

      if (data[productName] === undefined) {
        data[productName] = [];
      }

      data[productName].push(deliveryProduct);
    });

    // Note: Convert the object into array

    setDataSource(
      Object.keys(data).map((key) => {
        const deliveryProducts = data[key];
        const deliveryProductData = {
          key,
          name: key,
        };

        deliveryProducts.forEach((deliveryProduct) => {
          const unitTypeId = String(deliveryProduct.unit_type.id);
          deliveryProductData[unitTypeId] = Number(deliveryProduct.quantity);
        });

        return deliveryProductData;
      })
    );
  }, [delivery]);

  const getColumns = useCallback(() => {
    const unitTypesId =
      delivery?.delivery_products?.map(
        (deliveryProduct) => deliveryProduct.unit_type.id
      ) || [];

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
    ];
  }, [delivery, unitTypes]);

  const onPrint = () => {
    if (delivery) {
      setIsPrinting(true);
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'legal',
        hotfixes: ['px_scaling'],
      });

      const dataHtml = printDeliverySlip(delivery, unitTypes);

      setHtml(dataHtml);

      setTimeout(() => {
        pdf.html(dataHtml, {
          margin: 10,
          filename: `Delivery_${delivery.id}`,
          callback: (instance) => {
            window.open(instance.output('bloburl').toString());
            setIsPrinting(false);
            setHtml('');
          },
        });
      }, 2000);
    } else {
      message.error(GENERIC_ERROR_MESSAGE);
    }
  };

  return (
    <Content className="ViewDelivery" title="Delivery">
      <Spin spinning={isDeliveryFetching || isUnitTypesFetching || isLoading}>
        <Box>
          {delivery?.status !== deliveryStatuses.CANCELLED && (
            <Row className="ViewDelivery_print">
              <Col sm={12} xs={24}>
                <Button
                  loading={isPrinting}
                  size="large"
                  type="primary"
                  ghost
                  onClick={onPrint}
                >
                  Print Delivery
                </Button>
              </Col>
            </Row>
          )}

          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            labelStyle={{ fontWeight: 'bold' }}
            size="small"
            bordered
          >
            <Descriptions.Item label="ID" span={2}>
              {delivery?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Branch">
              {delivery?.branch?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Type">
              {upperFirst(delivery?.delivery_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {delivery?.user?.first_name} {delivery?.user?.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Datetime Created">
              {formatDateTime(delivery?.datetime_created)}
            </Descriptions.Item>
            <Descriptions.Item label="Schedule of Delivery">
              {formatDateTime(delivery?.datetime_fulfilled)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <PreorderStatus status={delivery?.status} />
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            labelStyle={{ fontWeight: 'bold' }}
            size="small"
            title="Customer"
            bordered
          >
            <Descriptions.Item label="Name" span={2}>
              {delivery?.customer?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {delivery?.customer?.phone || EMPTY_CHARACTER}
            </Descriptions.Item>
            <Descriptions.Item label="Telephone">
              {delivery?.customer?.landline || EMPTY_CHARACTER}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {delivery?.customer?.address}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {delivery?.customer?.description}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Table
            columns={getColumns()}
            dataSource={dataSource}
            pagination={false}
            rowKey="key"
            scroll={{ x: 800 }}
          />
        </Box>

        {delivery?.status === deliveryStatuses.DELIVERED && (
          <Box>
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{ fontWeight: 'bold' }}
              size="small"
              title="Delivery"
              bordered
            >
              <Descriptions.Item label="Delivery Completed" span={2}>
                {formatDateTime(delivery?.datetime_completed)}
              </Descriptions.Item>
              <Descriptions.Item label="Prepared By">
                {delivery?.prepared_by || EMPTY_CHARACTER}
              </Descriptions.Item>
              <Descriptions.Item label="Checked By">
                {delivery?.checked_by || EMPTY_CHARACTER}
              </Descriptions.Item>
              <Descriptions.Item label="Pulled Out By">
                {delivery?.pulled_out_by || EMPTY_CHARACTER}
              </Descriptions.Item>
              <Descriptions.Item label="Delivered By">
                {delivery?.delivered_by || EMPTY_CHARACTER}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <PaymentStatus status={delivery?.payment_status} />
              </Descriptions.Item>
            </Descriptions>
          </Box>
        )}

        {delivery?.status === deliveryStatuses.PENDING && (
          <Box>
            <Formik
              initialValues={formDetails.defaultValues}
              validationSchema={formDetails.schema}
              onSubmit={async (values) => {
                setIsLoading(true);

                try {
                  await DeliveriesService.edit({
                    id: params.deliveryId,
                    body: {
                      status: deliveryStatuses.DELIVERED,
                      payment_status: values.paymentStatus,
                      prepared_by: values.preparedBy,
                      checked_by: values.checkedBy,
                      pulled_out_by: values.pulledOutBy,
                      delivered_by: values.deliveredBy,
                    },
                  });

                  refetchDelivery();
                } catch (e) {
                  message.error(GENERIC_ERROR_MESSAGE);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <Row gutter={[24, 24]}>
                    <Col sm={12} xs={24}>
                      <Typography.Text strong>Prepared By</Typography.Text>
                      <Input
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue('preparedBy', e.target.value);
                        }}
                      />
                      <FormError name="preparedBy" />
                    </Col>

                    <Col sm={12} xs={24}>
                      <Typography.Text strong>Checked By</Typography.Text>
                      <Input
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue('checkedBy', e.target.value);
                        }}
                      />
                      <FormError name="checkedBy" />
                    </Col>

                    <Col sm={12} xs={24}>
                      <Typography.Text strong>Pulled Out</Typography.Text>
                      <Input
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue('pulledOutBy', e.target.value);
                        }}
                      />
                      <FormError name="pulledOutBy" />
                    </Col>

                    <Col sm={12} xs={24}>
                      <Typography.Text strong>Delivered By</Typography.Text>
                      <Input
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue('deliveredBy', e.target.value);
                        }}
                      />
                      <FormError name="deliveredBy" />
                    </Col>

                    <Col sm={12} xs={24}>
                      <Typography.Text strong>Payment Status</Typography.Text>
                      <Select
                        style={{ width: '100%' }}
                        value={values.payment_status}
                        allowClear
                        onChange={(value) => {
                          setFieldValue('paymentStatus', value);
                        }}
                      >
                        <Select.Option value={paymentStatuses.UNPAID}>
                          Unpaid
                        </Select.Option>
                        <Select.Option value={paymentStatuses.PAID}>
                          Paid
                        </Select.Option>
                      </Select>
                      <FormError name="paymentStatus" />
                    </Col>
                  </Row>

                  <Row className="ViewDelivery_setAsDelivered" justify="end">
                    <Col>
                      <Button htmlType="submit" size="large" type="primary">
                        Set As Delivered
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </Box>
        )}
      </Spin>

      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </Content>
  );
};

export default ViewDelivery;
