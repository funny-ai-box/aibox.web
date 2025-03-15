import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Tooltip, 
  Modal, 
  Empty,
  Spin
} from 'antd';
import {
  ReloadOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  DotChartOutlined
} from '@ant-design/icons';

// 导入自定义可视化组件和工具函数
import { VisualizationRenderer } from './ChartComponents';
import { buildVisualization } from '../utils/visualizationUtils';

/**
 * SQL执行结果组件
 * 根据SQL执行结果渲染对应的图表或表格
 */
const SqlExecutionResultComponent = ({ 
  sqlExecution, 
  onRefresh, 
  onSave,
  refreshing = false
}) => {
  // 如果没有SQL执行结果
  if (!sqlExecution) {
    return <Empty description="无执行结果" />;
  }

  // 如果没有数据
  if (!sqlExecution.dataJson) {
    return <Empty description="无数据可显示" />;
  }

  // 解析可视化配置和数据
  const visualizationConfig = buildVisualization(sqlExecution);
  const { type, config, data } = visualizationConfig;
  
  // 根据图表类型选择图标
  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <LineChartOutlined />;
      case 'bar':
        return <BarChartOutlined />;
      case 'pie':
        return <PieChartOutlined />;
      case 'scatter':
        return <DotChartOutlined />;
      case 'table':
      default:
        return <TableOutlined />;
    }
  };

  // 获取图表类型名称
  const getChartTypeName = () => {
    switch (type) {
      case 'line':
        return '折线图';
      case 'bar':
        return '柱状图';
      case 'pie':
        return '饼图';
      case 'scatter':
        return '散点图';
      case 'table':
      default:
        return '数据表';
    }
  };

  // 获取图表标题
  const getChartTitle = () => {
    // 从多个可能的位置获取标题
    return config.title || 
           (sqlExecution.visualization?.title) || 
           '查询结果';
  };

  // 显示SQL语句模态框
  const showSqlModal = () => {
    Modal.info({
      title: 'SQL语句',
      content: (
        <div>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-all', 
            backgroundColor: '#f5f5f5', 
            padding: '10px',
            borderRadius: '4px' 
          }}>
            {sqlExecution.sqlStatement}
          </pre>
        </div>
      ),
      width: 600,
    });
  };

  // 渲染顶部操作栏
  const renderActions = () => (
    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Space>
        <Button 
          size="small" 
          icon={<ReloadOutlined />}
          onClick={() => onRefresh && onRefresh(sqlExecution.id)}
          loading={refreshing}
        >
          刷新数据
        </Button>
        
        <Tooltip title="查看SQL">
          <Button
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={showSqlModal}
          >
            查看SQL
          </Button>
        </Tooltip>
      </Space>
      
      <Space>
        <span>{getChartTypeName()}</span>
        <Button
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          onClick={() => onSave && onSave(sqlExecution)}
        >
          保存到仪表板
        </Button>
      </Space>
    </div>
  );

  // 渲染加载中状态
  if (sqlExecution.executionStatus === 0) {
    return (
      <div>
        {renderActions()}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
          <div style={{ marginTop: '16px' }}>正在执行SQL查询...</div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (sqlExecution.executionStatus === 2 || sqlExecution.errorMessage) {
    return (
      <div>
        {renderActions()}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ffccc7', 
          borderRadius: '4px', 
          backgroundColor: '#fff2f0' 
        }}>
          <h4>执行错误</h4>
          <p>{sqlExecution.errorMessage || '查询执行失败'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderActions()}
      
      <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
        <VisualizationRenderer 
          data={data}
          type={type}
          config={config}
          loading={refreshing}
        />
      </div>
      
      {/* 显示执行信息 */}
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', textAlign: 'right' }}>
        执行时间: {sqlExecution.executionTime} | 
        执行耗时: {sqlExecution.executionDuration}ms | 
        返回行数: {sqlExecution.rowCount}
      </div>
    </div>
  );
};

export default SqlExecutionResultComponent;