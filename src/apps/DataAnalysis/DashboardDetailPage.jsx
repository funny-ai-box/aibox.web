import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Empty,
  Spin,
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

// 导入我们封装的可视化组件和工具
import { VisualizationRenderer } from './components/ChartComponents'; 
import { buildVisualization } from './utils/visualizationUtils';

const { Title, Text } = Typography;

const DashboardDetailPage = () => {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshingComponents, setRefreshingComponents] = useState({});

  // 首次加载时获取仪表盘数据
  useEffect(() => {
    console.log('初始化加载仪表盘数据...');
    fetchDashboardData();
  }, [dashboardId]);

  // 获取仪表盘数据，并在获取完成后自动刷新组件
  const fetchDashboardData = async () => {
    if (!dashboardId) {
      setError("未指定仪表盘ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('开始获取仪表盘数据...');
      const response = await dtaAPI.getBIPageDetail(dashboardId);
      
      if (response.code === 200) {
        console.log('仪表盘数据获取成功，组件数量:', response.data.components?.length || 0);
        
        // 存储获取到的仪表盘数据
        setDashboardData(response.data);
        
        // 准备刷新组件数据
        if (response.data && response.data.components && response.data.components.length > 0) {
          console.log('开始刷新组件数据...');
          
          // 创建需要刷新的组件列表
          const componentsToRefresh = {};
          
          // 开始分别刷新每个组件
          for (const component of response.data.components) {
            if (component.sqlExecutionId) {
              componentsToRefresh[component.sqlExecutionId] = true;
            }
          }
          
          // 更新所有组件的刷新状态
          if (Object.keys(componentsToRefresh).length > 0) {
            setRefreshingComponents(componentsToRefresh);
          }
          
          // 调用刷新接口
          for (const component of response.data.components) {
            if (component.sqlExecutionId) {
              // 为每个组件单独调用刷新接口
              try {
                console.log(`刷新组件 ID: ${component.sqlExecutionId}`);
                await refreshComponentData(component.sqlExecutionId);
              } catch (error) {
                console.error(`组件 ${component.sqlExecutionId} 刷新失败:`, error);
              }
            }
          }
          
          console.log('所有组件刷新完成');
        }
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
  
  // 刷新单个组件数据
  const refreshComponentData = async (sqlExecutionId) => {
    if (!sqlExecutionId) return;
    
    try {
      setRefreshingComponents(prev => ({ ...prev, [sqlExecutionId]: true }));
      
      const response = await dtaAPI.refreshChartData(sqlExecutionId);
      
      if (response.code === 200) {
        console.log(`组件 ID ${sqlExecutionId} 数据刷新成功`);
        
        // 更新组件数据
        setDashboardData(prev => {
          if (!prev || !prev.components) return prev;
          
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
      } else {
        console.error(`组件 ID ${sqlExecutionId} 数据刷新失败:`, response.message);
        message.error(response.message || "刷新数据失败");
      }
    } catch (error) {
      console.error(`组件 ID ${sqlExecutionId} 数据刷新错误:`, error);
    } finally {
      setRefreshingComponents(prev => ({ ...prev, [sqlExecutionId]: false }));
    }
  };
  
  // 全屏查看组件
  const viewFullscreen = (component) => {
    // 解析组件数据
    let parsedData = [];
    try {
      if (component.dataJson) {
        parsedData = JSON.parse(component.dataJson);
      }
    } catch (error) {
      console.error('解析数据失败:', error);
    }
    
    // 获取可视化配置
    const { type, config } = buildVisualization(component);
    
    Modal.info({
      title: component.componentName || "组件详情",
      width: '80%',
      content: (
        <div style={{ height: '500px', padding: '20px 0' }}>
          {parsedData.length > 0 ? (
            <VisualizationRenderer
              data={parsedData}
              type={type}
              config={config}
            />
          ) : (
            <Empty description="无数据可显示" />
          )}
        </div>
      ),
      okText: '关闭',
      maskClosable: true
    });
  };

  // 渲染组件
  const renderComponent = (component) => {
    const { componentName, sqlExecutionId } = component;
    const isRefreshing = refreshingComponents[sqlExecutionId] || false;
    
    // 解析数据
    let parsedData = [];
    try {
      if (component.dataJson) {
        parsedData = JSON.parse(component.dataJson);
      }
    } catch (error) {
      console.error('解析数据失败:', error);
    }
    
    // 如果没有数据
    if (!parsedData || parsedData.length === 0) {
      return (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Empty 
            description={
              isRefreshing ? "正在加载数据..." : "暂无数据"
            } 
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => refreshComponentData(sqlExecutionId)}
            loading={isRefreshing}
            style={{ marginTop: '16px' }}
          >
            刷新数据
          </Button>
        </div>
      );
    }
    
    // 获取可视化配置
    const { type, config } = buildVisualization(component);
    
    return (
      <div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Tooltip title="刷新数据">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshComponentData(sqlExecutionId)}
                loading={isRefreshing}
              />
            </Tooltip>
          </Space>
        </div>
        
        <VisualizationRenderer
          data={parsedData}
          type={type}
          config={config}
          loading={isRefreshing}
        />
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
      const { type } = buildVisualization(component);
      
      if (type === 'table') {
        typeGroups.tables.push(component);
      } else if (type === 'line') {
        typeGroups.lineCharts.push(component);
      } else if (type === 'bar') {
        typeGroups.barCharts.push(component);
      } else if (type === 'pie') {
        typeGroups.pieCharts.push(component);
      } else if (type === 'scatter') {
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
                          const { type } = buildVisualization(component);
                          
                          // 根据图表类型显示对应图标
                          switch(type) {
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