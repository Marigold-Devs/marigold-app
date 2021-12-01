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
import { printOrderSlip } from 'configurePrinter';
import { formatDateTime } from 'globals/functions';
import {
  EMPTY_CHARACTER,
  GENERIC_ERROR_MESSAGE,
  preorderStatuses,
} from 'globals/variables';
import { usePreorder, useUnitTypes } from 'hooks';
import { jsPDF } from 'jspdf';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PreordersService } from 'services';
import '../styles.scss';
import { CreateTransactionModal } from './CreateTransactionModal';
import { ViewTransactionModal } from './ViewTransactionModal';

const transactionColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: 'Date Created',
    dataIndex: 'datetime_created',
  },
  {
    title: 'Received By',
    dataIndex: 'received_by',
  },
  {
    title: 'Action',
    dataIndex: 'actions',
  },
];

const ViewPreorder = () => {
  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [preorderProductsObject, setPreorderProductsObject] = useState({});
  const [unitTypesId, setUnitTypesId] = useState([]);
  const [createTransactionModalVisible, setCreateTransactionModalVisible] =
    useState(false);
  const [transactionsDataSource, setTransactionsDataSource] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

    setPreorderProductsObject(data);

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

          preorderProductData[String(unitTypeId)] = `
          ${Number(preorderProduct.fulfilled_quantity)} / ${Number(
            preorderProduct.quantity
          )}`;
        });

        return preorderProductData;
      })
    );

    setUnitTypesId(newUnitTypeIds);
  }, [preorder]);

  useEffect(() => {
    if (preorder?.preorder_transactions) {
      setTransactionsDataSource(
        preorder.preorder_transactions.map((transaction) => ({
          row: transaction.id,
          id: transaction.id,
          datetime_created: formatDateTime(transaction.datetime_created),
          received_by: `${transaction.user.first_name} ${transaction.user.last_name}`,
          actions: (
            <Button
              type="link"
              onClick={() => {
                setSelectedTransaction(transaction);
              }}
            >
              View
            </Button>
          ),
        }))
      );
    }
  }, [preorder]);

  const getPreorderProductColumns = useCallback(() => {
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
  }, [unitTypesId, unitTypes]);

  const onUpdateStatus = (status) => {
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

  const onPrint = () => {
    if (preorder) {
      setIsPrinting(true);
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF('p', 'pt', 'a4');

      pdf.html(printOrderSlip(preorder, unitTypes), {
        x: 10,
        y: 10,
        filename: `Preorder_${preorder.id}`,
        callback: (instance) => {
          window.open(instance.output('bloburl').toString());
          setIsPrinting(false);
        },
      });
    } else {
      message.error(GENERIC_ERROR_MESSAGE);
    }
  };

  return (
    <Content className="ViewPreorder" title="Preorder">
      <Spin spinning={isPreorderFetching || isUnitTypesFetching || isLoading}>
        <Box>
          <Row
            className="ViewPreorder_setPreorderAsComplete"
            gutter={[25, 12]}
            justify="space-between"
          >
            <Col sm={12} xs={24}>
              <Button
                loading={isPrinting}
                size="large"
                type="primary"
                ghost
                onClick={onPrint}
              >
                Print Preorder
              </Button>
            </Col>
            {preorder?.status === preorderStatuses.APPROVED &&
              preorder?.preorder_transactions?.length > 0 && (
                <Col sm={12} xs={24}>
                  <Button
                    className="ViewPreorder_setPreorderAsComplete_button"
                    size="large"
                    type="primary"
                    onClick={() => {
                      onUpdateStatus(preorderStatuses.DELIVERED);
                    }}
                  >
                    Set Preorder As Complete
                  </Button>
                </Col>
              )}
          </Row>

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
            columns={getPreorderProductColumns()}
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
                      onUpdateStatus(preorderStatuses.CANCELLED);
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
                      onUpdateStatus(preorderStatuses.APPROVED);
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
            {preorder?.status === preorderStatuses.APPROVED && (
              <Col>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => {
                    setCreateTransactionModalVisible(true);
                  }}
                >
                  <PlusOutlined /> Create Transaction
                </Button>
              </Col>
            )}
          </Row>

          <Table
            columns={transactionColumns}
            dataSource={transactionsDataSource}
            pagination={false}
            rowKey="key"
            scroll={{ x: 800 }}
          />
        </Box>

        {createTransactionModalVisible && (
          <CreateTransactionModal
            columns={getPreorderProductColumns()}
            preorder={preorder}
            preorderProducts={preorderProductsObject}
            onClose={() => {
              setCreateTransactionModalVisible(false);
            }}
            onSuccess={() => {
              refetchPreorder();
              setCreateTransactionModalVisible(false);
            }}
          />
        )}

        {selectedTransaction && (
          <ViewTransactionModal
            preorderTransaction={selectedTransaction}
            unitTypes={unitTypes}
            onClose={() => {
              setSelectedTransaction(null);
            }}
          />
        )}
      </Spin>
    </Content>
  );
};

export default ViewPreorder;
