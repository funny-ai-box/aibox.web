import React from 'react';
import { Card, Space, Button, Typography } from 'antd';
import { 
  FileTextOutlined, 
  LoadingOutlined, 
  CloseCircleOutlined, 
  MessageOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

// 文档列表项组件
const DocumentListItem = ({ document, onView, onDelete, onCreateChat }) => {
  // 根据状态获取图标和状态标签
  const getStatusDisplay = (status) => {
    switch (status) {
      case 0:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <span style={{ color: '#bfbfbf', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '2px', fontSize: '12px' }}>待处理</span>
        };
      case 1:
        return {
          icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
          tag: <span style={{ color: '#1890ff', backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '2px', fontSize: '12px' }}>处理中</span>
        };
      case 2:
        return {
          icon: <FileTextOutlined style={{ color: '#52c41a' }} />,
          tag: <span style={{ color: '#52c41a', backgroundColor: '#f6ffed', padding: '2px 8px', borderRadius: '2px', fontSize: '12px' }}>已完成</span>
        };
      case 3:
        return {
          icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
          tag: <span style={{ color: '#f5222d', backgroundColor: '#fff1f0', padding: '2px 8px', borderRadius: '2px', fontSize: '12px' }}>处理失败</span>
        };
      default:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <span style={{ color: '#bfbfbf', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '2px', fontSize: '12px' }}>未知状态</span>
        };
    }
  };

  // 格式化文件大小
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const { icon, tag } = getStatusDisplay(document.status);
  
  // 处理卡片点击 - 修正了这里的问题
  const handleCardClick = () => {
    onView(document.id);
  };

  return (
    <Card 
      hoverable
      bodyStyle={{ padding: '16px' }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer', marginBottom: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Space align="start">
            {icon}
            <div>
              <Space align="center">
                <Text strong>{document.title}</Text>
                {tag}
              </Space>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Text type="secondary">上传于 {formatDate(document.createDate)}</Text>
                  <Text type="secondary">大小: {formatFileSize(document.fileSize)}</Text>
                </Space>
              </div>
            </div>
          </Space>
        </div>
        <Space>
          <Button 
            type="text" 
            icon={<MessageOutlined />} 
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              onCreateChat(document.id, document.title);
            }}
            disabled={document.status !== 2}
            title={document.status !== 2 ? "文档处理完成后才能开始对话" : "开始对话"}
          />
          <Button 
            type="text" 
            icon={<FileTextOutlined />} 
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              onView(document.id);  // 确保这里正确传递了文档ID
            }}
            title="查看文档详情"
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              onDelete(document.id);  // 确保这里正确传递了文档ID
            }}
            title="删除文档"
          />
        </Space>
      </div>
    </Card>
  );
};

export default DocumentListItem;