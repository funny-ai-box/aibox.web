import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Empty,
  Spin,
  Table,
  Tabs,
  Button,
  Tooltip,
  Space,
  Modal,
  message,
  Tag
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  DotChartOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Title, Text } = Typography;

// 解析JSON字符串，安全方式
const safeJsonParse = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON解析错误:", error);
    return null;
  }
};

const DashboardDetailPage = () => {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dashboardId]);

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    if (!dashboardId) {
      setError("未指定仪表盘ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await dtaAPI.getBIPageDetail(dashboardId);
      
      if (response.code === 200) {
        setDashboardData(response.data);
      } else {
        setError(response.message || "获取仪表盘数据失败");
      }
    } catch (err) {
      setError("获取仪表盘数据时发生错误");
      console.error("获取仪表盘数据时发生错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 解析组件配置
  const parseComponentConfig = (component) => {
    try {
      if (component.componentConfig) {
        return safeJsonParse(component.componentConfig);
      }
    } catch (error) {
      console.error("解析组件配置出错:", error);
    }
    return null;
  };
  
  // 刷新组件数据
  const refreshComponentData = async (sqlExecutionId) => {
    if (!sqlExecutionId) return;
    
    try {
      message.loading("正在刷新数据...");
      const response = await dtaAPI.refreshChartData(sqlExecutionId);
      
      if (response.code === 200) {
        message.success("数据已刷新");
        
        // 更新组件数据
        if (dashboardData && dashboardData.components) {
          setDashboardData(prev => {
            const updatedComponents = prev.components.map(component => {
              if (component.sqlExecutionId === sqlExecutionId) {
                return {
                  ...component,
                  visualization: response.data.visualization,
                  dataJson: response.data.dataJson
                };
              }
              return component;
            });
            
            return {
              ...prev,
              components: updatedComponents
            };
          });
        }
      } else {
        message.error(response.message || "刷新数据失败");
      }
    } catch (error) {
      message.error("刷新数据失败");
      console.error("刷新数据失败:", error);
    }
  };
  
  // 全屏查看组件
  const viewFullscreen = (component) => {
    Modal.info({
      title: component.componentName || "组件详情",
      width: '80%',
      content: (
        <div style={{ height: '500px', padding: '20px 0' }}>
          {renderComponent(component)}
        </div>
      ),
      okText: '关闭',
      maskClosable: true
    });
  };

  // 渲染组件配置信息
  const renderConfigInfo = (component) => {
    // 尝试从组件配置中获取列信息
    const configObj = parseComponentConfig(component);
    
    if (!configObj || !configObj.config) return null;
    
    return (
      <div style={{ marginBottom: '16px', textAlign: 'left' }}>
        {configObj.config.columns && (
          <div style={{ marginBottom: '8px' }}>
            <Text strong>数据列: </Text>
            {configObj.config.columns.map((col, index) => (
              <Tag key={index}>{col}</Tag>
            ))}
          </div>
        )}
        
        {configObj.config.rows && Array.isArray(configObj.config.rows) && configObj.config.rows.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <Text strong>预配置数据行: </Text>
            <Text>{configObj.config.rows.length} 行</Text>
          </div>
        )}
        
        {/* 渲染其他配置属性 */}
        {Object.entries(configObj.config)
          .filter(([key]) => key !== 'columns' && key !== 'rows')
          .map(([key, value]) => (
            <div key={key} style={{ marginTop: '8px' }}>
              <Text strong>{key}: </Text>
              <Text>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</Text>
            </div>
          ))
        }
      </div>
    );
  };

  // 渲染表格
  const renderTable = (data, title, sqlExecutionId) => {
    if (!data || data.length === 0) return <Empty description="暂无数据" />;
    
    // 从第一行数据获取列
    const columns = Object.keys(data[0]).map(key => ({
      title: key,
      dataIndex: key,
      key,
      render: (text) => text === null ? '-' : text.toString()
    }));
    
    return (
      <div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Tooltip title="刷新数据">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshComponentData(sqlExecutionId)}
              />
            </Tooltip>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  };
  
  // 渲染表格（基于组件配置）
  const renderTableFromConfig = (component) => {
    const configObj = parseComponentConfig(component);
    if (!configObj || !configObj.config) {
      return <Empty description="无效的表格配置" />;
    }
    
    const { columns, rows = [] } = configObj.config;
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return <Empty description="无表格列配置" />;
    }
    
    // 创建表格列定义
    const tableColumns = columns.map((col, index) => ({
      title: col,
      dataIndex: col,
      key: index,
      render: (text) => text === null ? '-' : text.toString()
    }));
    
    // 如果有预设的数据行，创建对应的数据源
    const dataSource = rows.map((row, index) => {
      const rowData = {};
      // 确保行数据与列对应
      columns.forEach((col, colIndex) => {
        rowData[col] = row[colIndex] || null;
      });
      return { ...rowData, key: index };
    });
    
    return (
      <div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Tooltip title="刷新数据">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshComponentData(component.sqlExecutionId)}
              />
            </Tooltip>
          </Space>
        </div>
        
        {dataSource.length > 0 ? (
          <Table
            columns={tableColumns}
            dataSource={dataSource}
            pagination={{ pageSize: 5, showSizeChanger: true }}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Empty description={
              <div>
                <div>表格配置包含以下列：</div>
                <div style={{ marginTop: '8px' }}>
                  {columns.map((col, index) => (
                    <Tag key={index}>{col}</Tag>
                  ))}
                </div>
                <div style={{ marginTop: '8px' }}>暂无数据行</div>
              </div>
            } />
          </div>
        )}
      </div>
    );
  };
  
  // 渲染可视化图表
  const renderVisualization = (chartType, chartIcon, data, title, sqlExecutionId, component) => {
    // 如果有visualization字段且包含htmlUrl，则显示iframe
    if (component.visualization && component.visualization.htmlUrl) {
      return (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Tooltip title="刷新数据">
                <Button 
                  size="small" 
                  icon={<ReloadOutlined />}
                  onClick={() => refreshComponentData(sqlExecutionId)}
                />
              </Tooltip>
            </Space>
          </div>
          
          <iframe
            src={`http://106.75.71.65:57460${component.visualization.htmlUrl}`}
            style={{ width: '100%', height: '300px', border: 'none', borderRadius: '4px' }}
            title={title}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      );
    }
    
    // 如果没有可视化URL，则显示简单的数据表示
    return (
      <div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Tooltip title="刷新数据">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshComponentData(sqlExecutionId)}
              />
            </Tooltip>
          </Space>
        </div>
        
        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', borderRadius: '4px' }}>
          {chartIcon === 'pie' && <PieChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />}
          {chartIcon === 'line' && <LineChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />}
          {chartIcon === 'bar' && <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />}
          {chartIcon === 'scatter' && <DotChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />}
          
          <Text strong>{chartType}可视化: {title}</Text>
          
          <div style={{ marginTop: '16px', width: '80%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key, index) => (
                    <th key={index} style={{ border: '1px solid #ddd', padding: '4px 8px', background: '#f0f0f0' }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#888' }}>
                显示前3条数据（共{data.length}条）
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderComponent = (component) => {
    const { componentName, sqlExecutionId } = component;
    
    // 获取组件实际类型
    const config = parseComponentConfig(component);
    const chartType = config?.type || 'table'; // 默认为表格
    
    // 如果组件已经有数据，使用已有数据
    if (component.dataJson) {
      try {
        const data = safeJsonParse(component.dataJson);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // 根据组件类型渲染不同的可视化
          switch (chartType) {
            case 'table':
              return renderTable(data, componentName, sqlExecutionId);
            case 'pie':
              return renderVisualization('饼图', 'pie', data, componentName, sqlExecutionId, component);
            case 'line':
              return renderVisualization('折线图', 'line', data, componentName, sqlExecutionId, component);
            case 'bar':
              return renderVisualization('柱状图', 'bar', data, componentName, sqlExecutionId, component);
            case 'scatter':
              return renderVisualization('散点图', 'scatter', data, componentName, sqlExecutionId, component);
            default:
              return renderTable(data, componentName, sqlExecutionId);
          }
        }
      } catch (err) {
        console.error("解析组件数据出错:", err);
      }
    }
    
    // 如果是表格类型，直接从配置渲染
    if (chartType === 'table') {
      return renderTableFromConfig(component);
    }
    
    // 对于其他图表类型，显示配置信息和刷新按钮
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        {renderConfigInfo(component)}
        <Empty 
          description="暂无图表数据，点击刷新获取数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => refreshComponentData(sqlExecutionId)}
          >
            刷新数据
          </Button>
        </Empty>
      </div>
    );
  };
  
  // 获取各类型组件分组
  const getComponentsByType = () => {
    if (!dashboardData || !dashboardData.components) return {};
    
    const typeGroups = {
      tables: [],
      lineCharts: [],
      barCharts: [],
      pieCharts: [],
      scatterCharts: []
    };
    
    dashboardData.components.forEach(component => {
      // 解析组件配置，获取真正的图表类型
      const config = parseComponentConfig(component);
      const chartType = config?.type || 'table'; // 默认为表格
      
      if (chartType === 'table') {
        typeGroups.tables.push(component);
      } else if (chartType === 'line') {
        typeGroups.lineCharts.push(component);
      } else if (chartType === 'bar') {
        typeGroups.barCharts.push(component);
      } else if (chartType === 'pie') {
        typeGroups.pieCharts.push(component);
      } else if (chartType === 'scatter') {
        typeGroups.scatterCharts.push(component);
      } else {
        // 未知类型默认放入表格组
        typeGroups.tables.push(component);
      }
    });
    
    return typeGroups;
  };
  
  // 渲染仪表盘组件的主视图
  const renderDashboard = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>加载仪表盘数据...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <Empty 
          description={error} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/data-analysis/dashboards')}
          >
            返回仪表盘列表
          </Button>
        </Empty>
      );
    }
    
    if (!dashboardData) {
      return (
        <Empty 
          description="未找到仪表盘数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/data-analysis/dashboards')}
          >
            返回仪表盘列表
          </Button>
        </Empty>
      );
    }
    
    const componentGroups = getComponentsByType();
    
    return (
      <div>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3}>{dashboardData.pageName}</Title>
            {dashboardData.description && (
              <Text type="secondary">{dashboardData.description}</Text>
            )}
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
            >
              刷新仪表盘
            </Button>
            <Button 
              icon={<RollbackOutlined />}
              onClick={() => navigate('/data-analysis/dashboards')}
            >
              返回列表
            </Button>
          </Space>
        </div>
        
        <Tabs defaultActiveKey="all">
          <Tabs.TabPane tab="所有组件" key="all">
            <Row gutter={[16, 16]}>
              {dashboardData.components.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        {(() => {
                          // 解析组件配置，获取真正的图表类型
                          const config = parseComponentConfig(component);
                          const chartType = config?.type || 'table';
                          
                          // 根据图表类型显示对应图标
                          switch(chartType) {
                            case 'table': return <TableOutlined style={{ marginRight: '8px' }} />;
                            case 'pie': return <PieChartOutlined style={{ marginRight: '8px' }} />;
                            case 'line': return <LineChartOutlined style={{ marginRight: '8px' }} />;
                            case 'bar': return <BarChartOutlined style={{ marginRight: '8px' }} />;
                            case 'scatter': return <DotChartOutlined style={{ marginRight: '8px' }} />;
                            default: return <TableOutlined style={{ marginRight: '8px' }} />;
                          }
                        })()}
                        {component.componentName || `组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="表格" key="tables" disabled={componentGroups.tables.length === 0}>
            <Row gutter={[16, 16]}>
              {componentGroups.tables.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        <TableOutlined style={{ marginRight: '8px' }} />
                        {component.componentName || `表格组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="折线图" key="lineCharts" disabled={componentGroups.lineCharts.length === 0}>
            <Row gutter={[16, 16]}>
              {componentGroups.lineCharts.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        <LineChartOutlined style={{ marginRight: '8px' }} />
                        {component.componentName || `折线图组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="柱状图" key="barCharts" disabled={componentGroups.barCharts.length === 0}>
            <Row gutter={[16, 16]}>
              {componentGroups.barCharts.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        <BarChartOutlined style={{ marginRight: '8px' }} />
                        {component.componentName || `柱状图组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="饼图" key="pieCharts" disabled={componentGroups.pieCharts.length === 0}>
            <Row gutter={[16, 16]}>
              {componentGroups.pieCharts.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        <PieChartOutlined style={{ marginRight: '8px' }} />
                        {component.componentName || `饼图组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="散点图" key="scatterCharts" disabled={componentGroups.scatterCharts.length === 0}>
            <Row gutter={[16, 16]}>
              {componentGroups.scatterCharts.map((component, index) => (
                <Col xs={24} lg={12} key={component.id || index}>
                  <Card 
                    title={
                      <div>
                        <DotChartOutlined style={{ marginRight: '8px' }} />
                        {component.componentName || `散点图组件 ${index + 1}`}
                      </div>
                    }
                    extra={
                      <Tooltip title="全屏查看">
                        <Button 
                          size="small" 
                          icon={<FullscreenOutlined />} 
                          onClick={() => viewFullscreen(component)}
                        />
                      </Tooltip>
                    }
                    bordered
                  >
                    {renderComponent(component)}
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default DashboardDetailPage;