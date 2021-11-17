import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Popconfirm, Row, Space, Table } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useBranches } from 'hooks';
import React, { useEffect, useState } from 'react';
import { BranchesService } from 'services';
import { ModifyBranchModal } from './components/ModifyBranchModal';
import './styles.scss';

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Actions', dataIndex: 'actions' },
];

const Branches = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);
  const [modifyBranchModalVisible, setModifyBranchModalVisible] =
    useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  // CUSTOM HOOKS
  const { isFetching, data: branches, refetch } = useBranches({});

  // EFFECTS
  const onCreate = () => {
    setSelectedBranch(null);
    setModifyBranchModalVisible(true);
  };

  const onEdit = (branch) => {
    setSelectedBranch(branch);
    setModifyBranchModalVisible(true);
  };

  const onDelete = (id) => {
    setDeleteConfirmLoading(true);
    BranchesService.delete(id)
      .then(() => {
        refetch();
      })
      .finally(() => {
        setDeleteConfirmLoading(false);
      });
  };

  useEffect(() => {
    const data = branches.map((branch) => ({
      key: branch.id,
      name: branch.name,
      actions: (
        <Space>
          <Button
            type="link"
            onClick={() => {
              onEdit(branch);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            cancelText="No"
            okButtonProps={{ loading: deleteConfirmLoading }}
            okText="Yes"
            placement="top"
            title={`Are you sure you want to delete ${branch.name}?`}
            onConfirm={() => {
              onDelete(branch.id);
            }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    }));

    setDataSource(data);
  }, [branches]);

  return (
    <Content className="Branches" title="Branches">
      <Box>
        <Row className="Branches_createRow" justify="end">
          <Col>
            <Button size="large" type="primary" onClick={onCreate}>
              <PlusOutlined /> Create Branch
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isFetching}
          pagination={false}
          rowKey="key"
        />

        {modifyBranchModalVisible && (
          <ModifyBranchModal
            branch={selectedBranch}
            onClose={() => {
              setSelectedBranch(null);
              setModifyBranchModalVisible(false);
            }}
            onSuccess={refetch}
          />
        )}
      </Box>
    </Content>
  );
};

export default Branches;
