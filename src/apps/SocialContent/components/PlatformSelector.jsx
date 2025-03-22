import React, { useState, useEffect } from 'react';
import { Radio, Card, Spin, Empty, message, Avatar } from 'antd';
import socialContentAPI from '../../../api/socialContentAPI';

/**
 * 社交平台选择组件
 * @param {Object} props
 * @param {number} props.value - 选中的平台ID
 * @param {function} props.onChange - 选择变更回调
 * @param {boolean} props.loading - 加载状态
 */
const PlatformSelector = ({ value, onChange, loading: externalLoading }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 加载平台列表
  useEffect(() => {
    fetchPlatforms();
  }, []);
  
  // 获取所有社交平台
  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const response = await socialContentAPI.getPlatformList();
      
      if (response.code === 200) {
        setPlatforms(response.data || []);
        
        // 如果有平台数据且未设置初始值，默认选择第一个平台
        if (response.data && response.data.length > 0 && !value) {
          onChange && onChange(response.data[0].id);
        }
      } else {
        message.error(response.message || '获取平台列表失败');
      }
    } catch (error) {
      message.error('获取平台列表失败');
      console.error('获取平台列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理平台选择变更
  const handlePlatformChange = (e) => {
    onChange && onChange(e.target.value);
  };
  
  // 渲染平台项
  const renderPlatformItem = (platform) => {
    return (
      <Radio.Button 
        key={platform.id} 
        value={platform.id}
        style={{ 
          height: '120px', 
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          marginRight: '16px',
          marginBottom: '16px',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        <Avatar 
          src={platform.icon} 
          size={48}
          style={{ marginBottom: '8px' }}
        />
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          marginBottom: '4px',
          textAlign: 'center'
        }}>
          {platform.name}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#8c8c8c',
          textAlign: 'center',
          lineHeight: '1.2',
          height: '30px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {platform.description}
        </div>
      </Radio.Button>
    );
  };
  
  const isLoading = loading || externalLoading;
  
  if (isLoading) {
    return (
      <Card 
        style={{ textAlign: 'center', padding: '20px' }}
        bodyStyle={{ padding: '20px 0' }}
      >
        <Spin tip="加载平台列表..." />
      </Card>
    );
  }
  
  if (!platforms || platforms.length === 0) {
    return (
      <Card>
        <Empty description="暂无可用的社交平台" />
      </Card>
    );
  }
  
  return (
    <Card
      title="选择社交平台"
      bodyStyle={{ padding: '16px' }}
    >
      <Radio.Group 
        value={value} 
        onChange={handlePlatformChange}
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {platforms.map(renderPlatformItem)}
      </Radio.Group>
    </Card>
  );
};

export default PlatformSelector;