import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Descriptions,
  Divider,
  message,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { Content, PreorderStatus } from 'components';
import { Box } from 'components/elements';
import { formatDateTime } from 'globals/functions';
import {
  EMPTY_CHARACTER,
  GENERIC_ERROR_MESSAGE,
  preorderStatuses,
} from 'globals/variables';
import { usePreorder, useUnitTypes } from 'hooks';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PreordersService } from 'services';

const Preorders = () => {
  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [unitTypesId, setUnitTypesId] = useState([]);

  // CUSTOM HOOKS
  const params = useParams();

  const { isFetching: isUnitTypesFetching, data: unitTypes } = useUnitTypes();
  const {
    isFetching: isPreorderFetching,
    data: preorder,
    refetch: refetchPreorder,
  } = usePreorder({
    id: params.preorderId,
  });

  // METHODS
  useEffect(() => {
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
    const newUnitTypeIds = [];
    setPreorderProducts(
      Object.keys(data).map((key) => {
        const preorderProductData = {
          key,
          name: key,
        };

        data[key].forEach((preorderProduct) => {
          const unitTypeId =
            preorderProduct.branch_product.product_price.unit_type;

          newUnitTypeIds.push(unitTypeId);

          preorderProductData[String(unitTypeId)] = Number(
            preorderProduct.quantity
          );
        });

        return preorderProductData;
      })
    );

    setUnitTypesId(newUnitTypeIds);
  }, [preorder]);

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

  const updateStatus = async (status) => {
    setIsLoading(true);

    PreordersService.edit({ id: params.preorderId, body: { status } })
      .then(refetchPreorder)
      .catch((e) => {
        console.error(e);
        message.error(GENERIC_ERROR_MESSAGE);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Content className="ViewPreorder" title="Preorder">
      <Spin spinning={isPreorderFetching || isUnitTypesFetching || isLoading}>
        <Box>
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
              {upperFirst(preorder?.delivery_type)}
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

          <Divider />

          <Table
            columns={getColumns()}
            dataSource={preorderProducts}
            pagination={false}
            rowKey="key"
            scroll={{ x: 800 }}
          />

          {preorder?.status === preorderStatuses.PENDING && (
            <>
              <Divider />
              <Row gutter={[25, 12]}>
                <Col sm={12} xs={24}>
                  <Button
                    size="large"
                    block
                    danger
                    onClick={() => {
                      updateStatus(preorderStatuses.CANCELLED);
                    }}
                  >
                    Cancel Preorder
                  </Button>
                </Col>
                <Col sm={12} xs={24}>
                  <Button
                    size="large"
                    type="primary"
                    block
                    onClick={() => {
                      updateStatus(preorderStatuses.APPROVED);
                    }}
                  >
                    Approve Preorder
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Box>

        <Box>
          <Row
            className="ViewPreorder_transaction_createRow"
            justify="space-between"
          >
            <Col>
              <Typography.Title level={4}>Transactions</Typography.Title>
            </Col>
            <Col>
              <Button size="large" type="primary" onClick={() => {}}>
                <PlusOutlined /> Create Transaction
              </Button>
            </Col>
          </Row>
        </Box>
      </Spin>
    </Content>
  );
};

export default Preorders;
