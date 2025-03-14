import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tabs,
  Typography,
  Space,
  Spin,
  Button,
  Empty,
  message,
  Divider,
  Tag,
  Breadcrumb
} from 'antd';
import {
  DatabaseOutlined,
  RollbackOutlined,
  ReloadOutlined,
  TableOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * 数据分析助手 - 文件数据表视图
 * 展示Excel文件中的数据表
 */
const FileViewerPage = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [fileDetail, setFileDetail] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  
  // 初始加载
  useEffect(() => {
    fetchFileDetail();
  }, [fileId]);
  
  // 当文件详情加载完成后，默认加载数据
  useEffect(() => {
    if (fileDetail && fileDetail.tableName) {
      setActiveSheet(fileDetail.tableName);
      fetchSheetData(fileDetail.tableName);
    }
  }, [fileDetail]);
  
  // 获取文件详情
  const fetchFileDetail = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getFileDetail(fileId);
      
      if (response.code === 200) {
        setFileDetail(response.data);
      } else {
        message.error(response.message || '获取文件详情失败');
      }
    } catch (error) {
      message.error('获取文件详情失败');
      console.error('获取文件详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取表数据
  const fetchSheetData = async (sheetName) => {
    try {
      setLoadingTable(true);
      const response = await dtaAPI.getFileData(fileId, sheetName);
      
      if (response.code === 200) {
        // 解析数据
        const data = response.data;
        if (data && data.dataJson) {
          const jsonData = JSON.parse(data.dataJson);
          
          // 构建表格列
          if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            const columns = Object.keys(firstRow).map(key => {
              // 查找列信息以获取更友好的显示名称
              const columnInfo = fileDetail?.columns?.find(col => col.columnName === key);
              
              return {
                title: columnInfo ? columnInfo.originalName : key,
                dataIndex: key,
                key: key,
                // 根据数据类型设置不同的渲染方式
                render: (text) => {
                  if (text === null || text === undefined) return '-';
                  if (typeof text === 'boolean') return text ? 'Yes' : 'No';
                  return text.toString();
                }
              };
            });
            
            setTableColumns(columns);
            setTableData(jsonData);
          } else {
            setTableColumns([]);
            setTableData([]);
          }
        }
      } else {
        message.error(response.message || '获取表数据失败');
      }
    } catch (error) {
      message.error('获取表数据失败');
      console.error('获取表数据失败:', error);
    } finally {
      setLoadingTable(false);
    }
  };
  
  // 开始数据分析
  const startAnalysis = () => {
    navigate(`/data-analysis/analysis?fileId=${fileId}&fileName=${encodeURIComponent(fileDetail?.originalFileName || '')}`);
  };
  
  // 渲染文件基本信息
  const renderFileInfo = () => {
    if (!fileDetail) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Breadcrumb items={[
              { title: <Link to="/data-analysis">我的数据</Link> },
              { title: fileDetail.originalFileName }
            ]} style={{ marginBottom: '16px' }} />
            
            <Title level={4}>{fileDetail.originalFileName}</Title>
            <Space>
              {fileDetail.status === 2 ? (
                <Tag color="success">处理完成</Tag>
              ) : fileDetail.status === 1 ? (
                <Tag color="processing">处理中</Tag>
              ) : fileDetail.status === 0 ? (
                <Tag color="default">待处理</Tag>
              ) : (
                <Tag color="error">处理失败</Tag>
              )}
              <Text type="secondary">上传时间: {new Date(fileDetail.uploadTime).toLocaleString()}</Text>
              <Text type="secondary">行数: {fileDetail.rowCount || 0}</Text>
              <Text type="secondary">列数: {fileDetail.columns?.length || 0}</Text>
            </Space>
          </div>
          
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate('/data-analysis')}
            >
              返回
            </Button>
            <Button
              type="primary"
              icon={<DatabaseOutlined />}
              onClick={startAnalysis}
              disabled={fileDetail.status !== 2}
            >
              数据分析
            </Button>
          </Space>
        </div>
      </Card>
    );
  };
  
  // 渲染数据表
  const renderDataTable = () => {
    if (!fileDetail) {
      return (
        <Empty description="没有找到数据表" />
      );
    }
    
    if (fileDetail.status !== 2) {
      return (
        <Empty description={`文件状态: ${
          fileDetail.status === 0 ? '待处理' : 
          fileDetail.status === 1 ? '处理中' : '处理失败'
        }, 请等待处理完成后查看数据`} />
      );
    }
    
    return (
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Text strong>表格:</Text>
            <Text>{activeSheet}</Text>
            <Divider type="vertical" />
            <Text>行数: {fileDetail.rowCount}</Text>
            <Divider type="vertical" />
            <Text>列数: {fileDetail.columns?.length || 0}</Text>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => activeSheet && fetchSheetData(activeSheet)}
              loading={loadingTable}
              style={{ marginLeft: '16px' }}
            >
              刷新数据
            </Button>
          </Space>
        </div>
        
        <Table
          columns={tableColumns}
          dataSource={tableData}
          rowKey={(record, index) => index}
          loading={loadingTable}
          scroll={{ x: 'max-content' }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条数据`
          }}
          size="small"
          bordered
        />
      </Card>
    );
  };
  
  // 渲染列信息
  const renderColumnInfo = () => {
    if (!fileDetail || !fileDetail.columns || fileDetail.columns.length === 0) {
      return (
        <Empty description="无列信息" />
      );
    }
    
    return (
      <Card title="列信息">
        <Table
          rowKey="id"
          columns={[
            {
              title: '列索引',
              dataIndex: 'columnIndex',
              key: 'columnIndex',
              width: 80,
            },
            {
              title: '列名',
              dataIndex: 'columnName',
              key: 'columnName',
            },
            {
              title: '显示名称',
              dataIndex: 'originalName',
              key: 'originalName',
            },
            {
              title: '描述',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: '数据类型',
              dataIndex: 'dataType',
              key: 'dataType',
              width: 120,
              render: (type) => {
                const typeColors = {
                  'string': 'blue',
                  'integer': 'green',
                  'decimal': 'purple',
                  'datetime': 'orange',
                  'boolean': 'red'
                };
                return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
              }
            }
          ]}
          dataSource={fileDetail.columns}
          pagination={false}
        />
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>正在加载文件信息...</div>
      </div>
    );
  }
  
  if (!fileDetail) {
    return (
      <Empty 
        description="未找到文件信息" 
        style={{ margin: '50px 0' }}
      >
        <Button 
          type="primary" 
          onClick={() => navigate('/data-analysis')}
        >
          返回我的数据
        </Button>
      </Empty>
    );
  }
  
  return (
    <div>
      {renderFileInfo()}
      
      <Tabs defaultActiveKey="data">
        <TabPane tab="数据表" key="data">
          {renderDataTable()}
        </TabPane>
        <TabPane tab="列信息" key="columns">
          {renderColumnInfo()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FileViewerPage;