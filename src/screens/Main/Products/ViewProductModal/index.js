import { Button, Col, Divider, Modal, Row, Typography, Collapse } from 'antd';
import { formatInPeso } from 'globals/functions';
import { upperCase } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

const ViewProductModal = ({ product, unitTypes, onClose }) => (
  <Modal
    className="ViewProductModal Modal__large Modal__hasFooter"
    footer={[<Button onClick={onClose}>Close</Button>]}
    title="View Product"
    centered
    closable
    visible
    onCancel={onClose}
  >
    <Row gutter={[8, 8]}>
      <Col lg={12}>
        <Typography.Text strong>Name: </Typography.Text>
      </Col>
      <Col lg={12}>{product.name}</Col>

      <Col lg={12}>
        <Typography.Text strong>Unit Cost: </Typography.Text>
      </Col>
      <Col lg={12}>{formatInPeso(product.unit_cost)}</Col>

      <Col lg={12}>
        <Typography.Text strong>Vat Type: </Typography.Text>
      </Col>
      <Col lg={12}>{upperCase(product.vat_type)}</Col>
    </Row>

    <Divider />

    <Collapse>
      {product?.product_prices?.map((productPrice) => {
        const unitTypeName =
          unitTypes.find(
            (unitType) => unitType.id === productPrice.unit_type_id
          ).name || '';

        return (
          <Collapse.Panel key={String(productPrice.id)} header={unitTypeName}>
            <Row gutter={[8, 8]}>
              <Col lg={12}>
                <Typography.Text strong>Price Market: </Typography.Text>
              </Col>
              <Col lg={12}>{formatInPeso(productPrice.price_market)}</Col>

              <Col lg={12}>
                <Typography.Text strong>Price Delivery: </Typography.Text>
              </Col>
              <Col lg={12}>{formatInPeso(productPrice.price_delivery)}</Col>

              <Col lg={12}>
                <Typography.Text strong>Price Pickup: </Typography.Text>
              </Col>
              <Col lg={12}>{formatInPeso(productPrice.price_pickup)}</Col>

              <Col lg={12}>
                <Typography.Text strong>Price Special: </Typography.Text>
              </Col>
              <Col lg={12}>{formatInPeso(productPrice.price_special)}</Col>

              <Col lg={12}>
                <Typography.Text strong>Reorder Point: </Typography.Text>
              </Col>
              <Col lg={12}>{productPrice.reorder_point}</Col>
            </Row>
          </Collapse.Panel>
        );
      })}
    </Collapse>
  </Modal>
);

ViewProductModal.propTypes = {
  unitTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  product: PropTypes.shape({
    name: PropTypes.string,
    unit_cost: PropTypes.string,
    vat_type: PropTypes.string,
    product_prices: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        price_delivery: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        price_market: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price_pickup: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price_special: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        reorder_point: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        unit_type_id: PropTypes.number,
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewProductModal;
