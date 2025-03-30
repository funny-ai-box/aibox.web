import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Tabs,
  Table,
  Statistic,
  Divider,
  Row,
  Col,
  Empty,
  Spin,
  message,
  List,
  Tag,
  Breadcrumb,
  Select,
  DatePicker,
  Tooltip,
  Rate,
  Drawer
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TableOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

/**
 * 问卷统计页面
 */
const SurveyStatsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [responseDetail, setResponseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // 初始化加载
  useEffect(() => {
    if (taskId) {
      fetchSurveyDetail();
      fetchResponses();
    }
  }, [taskId, pagination.current, pagination.pageSize]);
  
  // 获取问卷详情
  const fetchSurveyDetail = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setSurveyData(response.data);
      } else {
        message.error(response.message || '获取问卷详情失败');
      }
    } catch (error) {
      message.error('获取问卷详情失败');
      console.error('获取问卷详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取回答列表
  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getResponseList(
        taskId,
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setResponseData(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取问卷回答列表失败');
      }
    } catch (error) {
      message.error('获取问卷回答列表失败');
      console.error('获取问卷回答列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取回答详情
  const fetchResponseDetail = async (responseId) => {
    try {
      setLoadingDetail(true);
      
      const response = await surveyAPI.getResponseDetail(responseId);
      
      if (response.code === 200) {
        setResponseDetail(response.data);
        setDrawerVisible(true);
      } else {
        message.error(response.message || '获取回答详情失败');
      }
    } catch (error) {
      message.error('获取回答详情失败');
      console.error('获取回答详情失败:', error);
    } finally {
      setLoadingDetail(false);
    }
  };
  
  // 返回列表
  const goBack = () => {
    navigate('/survey');
  };
  
  // 导出数据（模拟功能）
  const exportData = (type) => {
    message.success(`正在导出${type === 'excel' ? 'Excel' : 'CSV'}数据`);
    // 实际项目中应该调用后端API进行导出
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 渲染概览内容
  const renderOverview = () => {
    if (!surveyData) {
      return <Empty description="暂无数据" />;
    }
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总回答数"
                value={pagination.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="问卷状态"
                value={surveyData.statusName}
                valueStyle={{ 
                  color: surveyData.status === 1 ? '#52c41a' : 
                         surveyData.status === 2 ? '#faad14' : '#d9d9d9' 
                }}
                prefix={surveyData.status === 1 ? <Tag color="success">开放中</Tag> : 
                       surveyData.status === 2 ? <Tag color="warning">已关闭</Tag> : 
                       <Tag>草稿</Tag>}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="创建时间"
                value={formatDate(surveyData.createDate).split(' ')[0]}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Card title="问卷结构" style={{ marginBottom: '16px' }}>
          <Paragraph>问卷标题: {surveyData.name}</Paragraph>
          {surveyData.description && <Paragraph>问卷描述: {surveyData.description}</Paragraph>}
          
          <Divider orientation="left">标签页与字段</Divider>
          
          {surveyData.tabs?.map(tab => (
            <div key={tab.id} style={{ marginBottom: '16px' }}>
              <Title level={5}>{tab.name}</Title>
              <List
                bordered
                dataSource={tab.fields}
                renderItem={field => (
                  <List.Item>
                    <Space>
                      <Text strong>{field.name}</Text>
                      <Tag color="blue">{field.type}</Tag>
                      {field.isRequired && <Tag color="red">必填</Tag>}
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          ))}
        </Card>
        
        <Card title="最近回答">
          <Table
            rowKey="id"
            dataSource={responseData.slice(0, 5)}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 80
              },
              {
                title: 'IP地址',
                dataIndex: 'respondentIp',
                key: 'respondentIp'
              },
              {
                title: '提交时间',
                dataIndex: 'submitDate',
                key: 'submitDate',
                render: (text) => formatDate(text)
              },
              {
                title: '操作',
                key: 'action',
                width: 120,
                render: (_, record) => (
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => fetchResponseDetail(record.id)}
                  >
                    查看
                  </Button>
                )
              }
            ]}
            pagination={false}
          />
          
          {responseData.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="link" onClick={() => setActiveTab('responses')}>
                查看全部回答
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  };
  
  // 渲染回答列表标签页
  const renderResponses = () => {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80
      },
      {
        title: 'IP地址',
        dataIndex: 'respondentIp',
        key: 'respondentIp'
      },
      {
        title: '提交时间',
        dataIndex: 'submitDate',
        key: 'submitDate',
        render: (text) => formatDate(text),
        sorter: (a, b) => new Date(a.submitDate) - new Date(b.submitDate),
        defaultSortOrder: 'descend'
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => fetchResponseDetail(record.id)}
          >
            查看
          </Button>
        )
      }
    ];
    
    return (
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<BarChartOutlined />}>
              筛选
            </Button>
          </Space>
          
          <Space>
            <Tooltip title="导出Excel">
              <Button icon={<FileExcelOutlined />} onClick={() => exportData('excel')}>
                导出Excel
              </Button>
            </Tooltip>
            <Tooltip title="导出CSV">
              <Button icon={<FileTextOutlined />} onClick={() => exportData('csv')}>
                导出CSV
              </Button>
            </Tooltip>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={responseData}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize
              });
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>
    );
  };
  
  // 渲染字段值
  const renderFieldValue = (field) => {
    const { fieldType, value } = field;
    
    // 根据类型渲染不同格式的值
    switch (fieldType) {
      case 'Radio':
      case 'Select':
        // 在实际应用中，可能需要根据选项配置查找显示文本
        return value;
        
      case 'Checkbox':
        // 多选框显示为多个标签
        return (
          <Space wrap>
            {value.split(',').map((val, index) => (
              <Tag key={index}>{val}</Tag>
            ))}
          </Space>
        );
        
      case 'Rating':
        // 评分显示为星级
        return <Rate disabled value={parseInt(value)} />;
        
      case 'ImageUpload':
        // 图片上传显示图片链接或预览图
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            查看图片
          </a>
        ) : '无图片';
        
      case 'Date':
      case 'Time':
      case 'DateTime':
        // 时间类型格式化显示
        return value;
        
      default:
        // 其他类型直接显示值
        return value || '(空)';
    }
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/survey">问卷列表</Link> },
          { title: '问卷统计' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>{surveyData?.name || '问卷统计'}</Title>
          
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
            >
              返回列表
            </Button>
          </Space>
        </div>
      </Card>
      
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                概览
              </span>
            }
            key="overview"
          >
            {renderOverview()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <TableOutlined />
                回答列表
              </span>
            }
            key="responses"
          >
            {renderResponses()}
          </TabPane>
        </Tabs>
      </Spin>
      
      {/* 侧滑抽屉展示回答详情 */}
      <Drawer
        title={responseDetail ? `回答详情 #${responseDetail.id}` : '回答详情'}
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Button 
            icon={<CloseOutlined />} 
            onClick={() => setDrawerVisible(false)}
            type="text"
          />
        }
      >
        <Spin spinning={loadingDetail}>
          {responseDetail ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary">提交时间: {formatDate(responseDetail.submitDate)}</Text>
                <br />
                <Text type="secondary">IP: {responseDetail.respondentIp}</Text>
              </div>
              
              <Divider />
              
              <List
                itemLayout="vertical"
                dataSource={responseDetail.fieldValues || []}
                renderItem={item => (
                  <List.Item>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>{item.fieldName}</Text>
                    </div>
                    <div>{renderFieldValue(item)}</div>
                  </List.Item>
                )}
              />
            </Space>
          ) : (
            <Empty description="暂无数据" />
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default SurveyStatsPage;