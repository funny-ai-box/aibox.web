import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  Empty,
  message,
  Breadcrumb,
  Tooltip
} from 'antd';
import {
  RollbackOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  LineChartOutlined,
  TableOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Title, Text } = Typography;

/**
 * 数据分析助手 - 仪表板详情页面
 * 展示仪表板中的所有图表组件
 */
const DashboardDetailPage = () => {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [refreshingComponent, setRefreshingComponent] = useState(null);
  
  // 初始加载
  useEffect(() => {
    fetchDashboardDetail();
  }, [dashboardId]);
  
  // 获取仪表板详情
  const fetchDashboardDetail = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getBIPageDetail(dashboardId);
      
      if (response.code === 200) {
        setDashboard(response.data);
      } else {
        message.error(response.message || '获取仪表板详情失败');
      }
    } catch (error) {
      message.error('获取仪表板详情失败');
      console.error('获取仪表板详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 刷新组件数据
  const refreshComponentData = async (sqlExecutionId, componentIndex) => {
    try {
      setRefreshingComponent(componentIndex);
      const response = await dtaAPI.refreshChartData(sqlExecutionId);
      
      if (response.code === 200) {
        // 更新组件数据
        setDashboard(prev => {
          if (!prev || !prev.components) return prev;
          
          const updatedComponents = [...prev.components];
          updatedComponents[componentIndex] = {
            ...updatedComponents[componentIndex],
            visualization: response.data.visualization,
            dataJson: response.data.dataJson
          };
          
          return {
            ...prev,
            components: updatedComponents
          };
        });
        
        message.success('数据已刷新');
      } else {
        message.error(response.message || '刷新数据失败');
      }
    } catch (error) {
      message.error('刷新数据失败');
      console.error('刷新数据失败:', error);
    } finally {
      setRefreshingComponent(null);
    }
  };
  
  // 展开/收起卡片
  const toggleExpandCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };
  
  // 渲染仪表板头部
  const renderHeader = () => {
    if (!dashboard) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Breadcrumb 
              items={[
                { title: <Link to="/data-analysis/dashboards">可视化面板</Link> },
                { title: dashboard.pageName }
              ]} 
              style={{ marginBottom: '16px' }} 
            />
            
            <Title level={4}>{dashboard.pageName}</Title>
            <Text type="secondary">{dashboard.description || '暂无描述'}</Text>
          </div>
          
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate('/data-analysis/dashboards')}
            >
              返回列表
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardDetail}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>
      </Card>
    );
  };
  
  // 渲染仪表板内容
  const renderDashboardContent = () => {
    if (!dashboard) return null;
    
    if (!dashboard.components || dashboard.components.length === 0) {
      return (
        <Card>
          <Empty 
            description="暂无图表组件" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }
    
    return (
      <div>
        {expandedCard !== null ? (
          // 展开模式 - 显示单个组件
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  {dashboard.components[expandedCard].visualization ? (
                    <LineChartOutlined style={{ color: '#1890ff' }} />
                  ) : (
                    <TableOutlined style={{ color: '#52c41a' }} />
                  )}
                  <span>{dashboard.components[expandedCard].title || '未命名组件'}</span>
                </Space>
                
                <Space>
                  <Tooltip title="刷新数据">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => refreshComponentData(
                        dashboard.components[expandedCard].sqlExecutionId,
                        expandedCard
                      )}
                      loading={refreshingComponent === expandedCard}
                      size="small"
                    />
                  </Tooltip>
                  
                  <Tooltip title="退出全屏">
                    <Button
                      icon={<FullscreenExitOutlined />}
                      onClick={() => toggleExpandCard(expandedCard)}
                      size="small"
                    />
                  </Tooltip>
                </Space>
              </div>
            }
          >
            <div style={{ height: 'calc(100vh - 280px)', overflow: 'hidden' }}>
              {dashboard.components[expandedCard].visualization ? (
                <iframe
                  srcDoc={dashboard.components[expandedCard].visualization}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={dashboard.components[expandedCard].title}
                  sandbox="allow-scripts"
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Empty description="无可视化内容" />
                </div>
              )}
            </div>
            
            {dashboard.components[expandedCard].description && (
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">{dashboard.components[expandedCard].description}</Text>
              </div>
            )}
          </Card>
        ) : (
          // 网格模式 - 显示所有组件
          <Row gutter={[16, 16]}>
            {dashboard.components.map((component, index) => (
              <Col xs={24} sm={24} md={12} lg={8} key={index}>
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        {component.visualization ? (
                          <LineChartOutlined style={{ color: '#1890ff' }} />
                        ) : (
                          <TableOutlined style={{ color: '#52c41a' }} />
                        )}
                        <span>{component.title || '未命名组件'}</span>
                      </Space>
                      
                      <Space>
                        <Tooltip title="刷新数据">
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshComponentData(component.sqlExecutionId, index);
                            }}
                            loading={refreshingComponent === index}
                            size="small"
                          />
                        </Tooltip>
                        
                        <Tooltip title="全屏查看">
                          <Button
                            icon={<FullscreenOutlined />}
                            onClick={() => toggleExpandCard(index)}
                            size="small"
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  }
                  style={{ height: '400px', cursor: 'pointer' }}
                  bodyStyle={{ height: 'calc(100% - 58px)', padding: '12px', overflow: 'hidden' }}
                  onClick={() => toggleExpandCard(index)}
                >
                  {component.visualization ? (
                    <iframe
                      srcDoc={component.visualization}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title={component.title}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Empty description="无可视化内容" />
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>正在加载仪表板...</div>
      </div>
    );
  }
  
  if (!dashboard) {
    return (
      <Empty 
        description="未找到仪表板信息" 
        style={{ margin: '50px 0' }}
      >
        <Button 
          type="primary" 
          onClick={() => navigate('/data-analysis/dashboards')}
        >
          返回仪表板列表
        </Button>
      </Empty>
    );
  }
  
  return (
    <div>
      {renderHeader()}
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardDetailPage;