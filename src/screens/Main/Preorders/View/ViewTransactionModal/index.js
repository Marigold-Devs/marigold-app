import { Button, Descriptions, Divider, Modal, Table } from 'antd';
import { formatDateTime } from 'globals/functions';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

export const ViewTransactionModal = ({
  preorderTransaction,
  unitTypes,
  onClose,
}) => {
  // STATES
  const [unitTypesId, setUnitTypesId] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  // METHODS
  useEffect(() => {
    const data = {};

    // Note: We need to group all preorder products by product so it
    // will be easier to traverse them later on
    preorderTransaction.preorder_transaction_products.forEach(
      (preorderTransactionProduct) => {
        const productName = preorderTransactionProduct.product_name;

        if (data[productName] === undefined) {
          data[productName] = [];
        }

        data[productName].push(preorderTransactionProduct);
      }
    );

    // Note: Convert the object into array
    const newUnitTypeIds = [];
    setDataSource(
      Object.keys(data).map((key) => {
        const preorderTransactionProductData = { key, name: key };

        data[key].forEach((preorderTransactionProduct) => {
          const unitTypeId = preorderTransactionProduct.unit_type_id;
          newUnitTypeIds.push(unitTypeId);

          preorderTransactionProductData[String(unitTypeId)] = Number(
            preorderTransactionProduct.quantity
          );
        });

        return preorderTransactionProductData;
      })
    );

    setUnitTypesId(newUnitTypeIds);
  }, [preorderTransaction]);

  const getColumns = useCallback(() => {
    const filteredUnitTypes = unitTypes.filter((unitType) =>
      unitTypesId.includes(unitType.id)
    );

    return [
      { title: 'Name', dataIndex: 'name' },
      ...filteredUnitTypes.map((unitType) => ({
        title: unitType.name,
        dataIndex: String(unitType.id),
      })),
    ];
  }, [unitTypesId, unitTypes]);

  return (
    <Modal
      footer={[
        <Button key="btnCancel" size="large" onClick={onClose}>
          Close
        </Button>,
      ]}
      title="Preorder Transaction"
      width={800}
      centered
      closable
      visible
      onCancel={onClose}
    >
      <Descriptions
        column={1}
        labelStyle={{ fontWeight: 'bold' }}
        size="small"
        bordered
      >
        <Descriptions.Item label="ID">
          {preorderTransaction.id}
        </Descriptions.Item>
        <Descriptions.Item label="Received By">
          {preorderTransaction.user.first_name}{' '}
          {preorderTransaction.user.last_name}
        </Descriptions.Item>

        <Descriptions.Item label="Date Created">
          {formatDateTime(preorderTransaction.datetime_created)}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Table
        columns={getColumns()}
        dataSource={dataSource}
        pagination={false}
        rowKey="key"
        scroll={{ x: 600 }}
      />
    </Modal>
  );
};

ViewTransactionModal.propTypes = {
  preorderTransaction: PropTypes.shape({
    id: PropTypes.number,
    datetime_created: PropTypes.string,
    user: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
    preorder_transaction_products: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        product_name: PropTypes.string,
        quantity: PropTypes.string,
        unit_type_id: PropTypes.number,
      })
    ),
    dataIndex: PropTypes.string,
  }),
  unitTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};
