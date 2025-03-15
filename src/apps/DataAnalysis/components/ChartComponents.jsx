import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Table, Empty, Spin } from 'antd';

/**
 * 基础图表组件 - 处理ECharts初始化和配置
 */
export const BaseChart = ({ option, loading, style = {}, className = '' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 设置选项
      if (option) {
        chartInstance.current.setOption(option, true);
      }
    }

    // 窗口大小变化时重新调整图表大小
    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [option]);

  return (
    <div className={`chart-container ${className}`} style={{ position: 'relative', width: '100%', height: '400px', ...style }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Spin />
        </div>
      )}
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

/**
 * 折线图组件
 */
export const LineChart = ({ data, loading, xField, yField, seriesField, title, style = {} }) => {
  // 如果没有数据或必要字段，显示空状态
  if (!data || !data.length || !xField || !yField) {
    return <Empty description="无法显示图表：缺少数据或必要配置" />;
  }

  // 准备数据
  const xAxisData = [...new Set(data.map(item => item[xField]))];
  
  // 处理系列数据
  const series = [];
  if (seriesField) {
    // 多系列折线图
    const seriesNames = [...new Set(data.map(item => item[seriesField]))];
    
    seriesNames.forEach(name => {
      const seriesData = [];
      xAxisData.forEach(x => {
        const item = data.find(d => d[xField] === x && d[seriesField] === name);
        seriesData.push(item ? item[yField] : null);
      });
      
      series.push({
        name,
        type: 'line',
        data: seriesData,
        smooth: true
      });
    });
  } else {
    // 单系列折线图
    const seriesData = xAxisData.map(x => {
      const item = data.find(d => d[xField] === x);
      return item ? item[yField] : null;
    });
    
    series.push({
      type: 'line',
      data: seriesData,
      smooth: true
    });
  }

  // 配置项
  const option = {
    title: title ? { text: title } : undefined,
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series
  };

  return <BaseChart option={option} loading={loading} style={style} />;
};

/**
 * 柱状图组件
 */
export const BarChart = ({ data, loading, xField, yField, seriesField, title, style = {} }) => {
  // 如果没有数据或必要字段，显示空状态
  if (!data || !data.length || !xField || !yField) {
    return <Empty description="无法显示图表：缺少数据或必要配置" />;
  }

  // 准备数据
  const xAxisData = [...new Set(data.map(item => item[xField]))];
  
  // 处理系列数据
  const series = [];
  if (seriesField) {
    // 多系列柱状图
    const seriesNames = [...new Set(data.map(item => item[seriesField]))];
    
    seriesNames.forEach(name => {
      const seriesData = [];
      xAxisData.forEach(x => {
        const item = data.find(d => d[xField] === x && d[seriesField] === name);
        seriesData.push(item ? item[yField] : null);
      });
      
      series.push({
        name,
        type: 'bar',
        data: seriesData
      });
    });
  } else {
    // 单系列柱状图
    const seriesData = xAxisData.map(x => {
      const item = data.find(d => d[xField] === x);
      return item ? item[yField] : null;
    });
    
    series.push({
      type: 'bar',
      data: seriesData
    });
  }

  // 配置项
  const option = {
    title: title ? { text: title } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: xAxisData.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series
  };

  return <BaseChart option={option} loading={loading} style={style} />;
};

/**
 * 饼图组件
 */
export const PieChart = ({ data, loading, nameField, valueField, title, style = {} }) => {
  // 如果没有数据或必要字段，显示空状态
  if (!data || !data.length || !nameField || !valueField) {
    return <Empty description="无法显示图表：缺少数据或必要配置" />;
  }

  // 准备数据
  const seriesData = data.map(item => ({
    name: item[nameField],
    value: item[valueField]
  }));

  // 配置项
  const option = {
    title: title ? { 
      text: title,
      left: 'center' 
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: seriesData.map(item => item.name)
    },
    series: [
      {
        name: title || '数据占比',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return <BaseChart option={option} loading={loading} style={style} />;
};

/**
 * 散点图组件
 */
export const ScatterChart = ({ data, loading, xField, yField, sizeField, colorField, title, style = {} }) => {
  // 如果没有数据或必要字段，显示空状态
  if (!data || !data.length || !xField || !yField) {
    return <Empty description="无法显示图表：缺少数据或必要配置" />;
  }

  // 准备数据
  let seriesData = [];
  
  if (colorField) {
    // 按颜色字段分组
    const groups = {};
    data.forEach(item => {
      const key = item[colorField];
      if (!groups[key]) {
        groups[key] = [];
      }
      
      const point = [item[xField], item[yField]];
      if (sizeField) {
        point.push(item[sizeField]);
      }
      
      groups[key].push(point);
    });
    
    // 为每个组创建一个系列
    Object.keys(groups).forEach(key => {
      seriesData.push({
        name: key,
        type: 'scatter',
        data: groups[key],
        symbolSize: sizeField ? function(params) {
          return params[2] || 10;
        } : 10
      });
    });
  } else {
    // 单系列散点图
    const points = data.map(item => {
      const point = [item[xField], item[yField]];
      if (sizeField) {
        point.push(item[sizeField]);
      }
      return point;
    });
    
    seriesData.push({
      type: 'scatter',
      data: points,
      symbolSize: sizeField ? function(params) {
        return params[2] || 10;
      } : 10
    });
  }

  // 配置项
  const option = {
    title: title ? { text: title } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        let tooltip = `${params.seriesName || ''}`;
        tooltip += `<br/>x: ${params.value[0]}`;
        tooltip += `<br/>y: ${params.value[1]}`;
        if (params.value[2]) {
          tooltip += `<br/>size: ${params.value[2]}`;
        }
        return tooltip;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      scale: true
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    series: seriesData
  };

  return <BaseChart option={option} loading={loading} style={style} />;
};

/**
 * 表格组件
 */
export const DataTable = ({ data, loading, columns, pagination = true, style = {} }) => {
  // 如果没有数据或列定义，显示空状态
  if (!data || !data.length) {
    return <Empty description="无数据可显示" />;
  }

  // 如果没有指定列，则根据数据自动生成
  const tableColumns = columns || Object.keys(data[0]).map(key => ({
    title: key,
    dataIndex: key,
    key: key,
    render: (text) => {
      if (text === null || text === undefined) return '-';
      if (typeof text === 'object') {
        if (text instanceof Date) return text.toLocaleString();
        return JSON.stringify(text);
      }
      return text.toString();
    }
  }));

  return (
    <div style={{ width: '100%', ...style }}>
      <Table
        dataSource={data}
        columns={tableColumns}
        rowKey={(record, index) => index}
        pagination={pagination ? { pageSize: 5, showSizeChanger: true } : false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered
        loading={loading}
      />
    </div>
  );
};

/**
 * 可视化渲染器组件 - 根据类型渲染不同图表
 */
export const VisualizationRenderer = ({ 
  data, 
  type = 'table', 
  config = {}, 
  loading = false, 
  style = {}
}) => {
  if (!data || !data.length) {
    return <Empty description="无数据可显示" />;
  }

  // 根据类型选择合适的组件
  switch (type.toLowerCase()) {
    case 'line':
      return (
        <LineChart 
          data={data} 
          loading={loading}
          xField={config.xField}
          yField={config.yField}
          seriesField={config.seriesField}
          title={config.title}
          style={style}
        />
      );
    case 'bar':
      return (
        <BarChart 
          data={data} 
          loading={loading}
          xField={config.xField}
          yField={config.yField}
          seriesField={config.seriesField}
          title={config.title}
          style={style}
        />
      );
    case 'pie':
      return (
        <PieChart 
          data={data} 
          loading={loading}
          nameField={config.nameField}
          valueField={config.valueField}
          title={config.title}
          style={style}
        />
      );
    case 'scatter':
      return (
        <ScatterChart 
          data={data} 
          loading={loading}
          xField={config.xField}
          yField={config.yField}
          sizeField={config.sizeField}
          colorField={config.colorField}
          title={config.title}
          style={style}
        />
      );
    case 'table':
    default:
      return (
        <DataTable 
          data={data} 
          loading={loading}
          columns={config.columns}
          pagination={config.pagination}
          style={style}
        />
      );
  }
};