import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useUnitTypes } from 'hooks';
import { useEffect, useState } from 'react';
import { ModifyUnitTypeModal } from './ModifyUnitTypeModal';

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Actions', dataIndex: 'actions' },
];

const UnitTypes = () => {
  // STATES
  const [dataSource, setDataSource] = useState([]);
  const [modifyUnitTypeModalVisible, setModifyUnitTypeModalVisible] =
    useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState(null);

  // CUSTOM HOOKS
  const { isFetching, data: unitTypes } = useUnitTypes();

  // EFFECTS
  const handleCreate = () => {
    setSelectedUnitType(null);
    setModifyUnitTypeModalVisible(true);
  };

  const handleEdit = (unitType) => {
    setSelectedUnitType(unitType);
    setModifyUnitTypeModalVisible(true);
  };

  useEffect(() => {
    const data = unitTypes.map((unitType) => ({
      key: unitType.id,
      name: unitType.name,
      actions: (
        <Space>
          <Button
            type="link"
            onClick={() => {
              handleEdit(unitType);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    }));

    setDataSource(data);
  }, [unitTypes]);

  return (
    <Content title="Unit Types">
      <Box>
        <div className="mb-4 d-flex justify-end">
          <Button size="large" type="primary" onClick={handleCreate}>
            <PlusOutlined /> Create Unit Type
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isFetching}
          pagination={false}
        />

        {modifyUnitTypeModalVisible && (
          <ModifyUnitTypeModal
            unitType={selectedUnitType}
            onClose={() => {
              setSelectedUnitType(null);
              setModifyUnitTypeModalVisible(false);
            }}
          />
        )}
      </Box>
    </Content>
  );
};

export default UnitTypes;
