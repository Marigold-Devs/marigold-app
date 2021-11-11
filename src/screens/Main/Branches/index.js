import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Popconfirm, Row, Space, Table } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useBranches } from 'hooks';
import React, { useEffect, useState } from 'react';
import { BranchesService } from 'services';
import { CreateEditBranchModal } from './components/CreateEditBranchModal';
import './styles.scss';

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Actions', dataIndex: 'actions' },
];

const Branches = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);
  const [createEditBranchModalVisible, setCreateEditBranchModalVisible] =
    useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  // CUSTOM HOOKS
  const { isFetching, data: branches, refetch } = useBranches({});

  // EFFECTS
  const onCreate = () => {
    setSelectedBranch(null);
    setCreateEditBranchModalVisible(true);
  };

  const onEdit = (branch) => {
    setSelectedBranch(branch);
    setCreateEditBranchModalVisible(true);
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
    const formattedBranches = branches.map((branch) => ({
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
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    }));

    setDataSource(formattedBranches);
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

        {createEditBranchModalVisible && (
          <CreateEditBranchModal
            branch={selectedBranch}
            onClose={() => {
              setSelectedBranch(null);
              setCreateEditBranchModalVisible(false);
            }}
            onSuccess={refetch}
          />
        )}
      </Box>
    </Content>
  );
};

export default Branches;
