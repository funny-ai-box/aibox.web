/**
 * 更新版本的可视化数据解析工具函数
 * 适配返回的真实API数据结构
 */

/**
 * 解析可视化配置，提取图表类型和字段映射
 * @param {Object} sqlExecution - API返回的SQL执行结果对象
 * @returns {Object} 解析后的图表配置和数据
 */
export const parseVisualization = (sqlExecution) => {
      // 默认返回结果
      const result = {
        type: 'table',  // 默认为表格
        config: {},     // 配置对象
        data: []        // 数据数组
      };
      
      if (!sqlExecution) {
        return result;
      }
      
      // 解析数据JSON
      try {
        if (sqlExecution.dataJson) {
          result.data = JSON.parse(sqlExecution.dataJson);
        }
      } catch (error) {
        console.error('解析数据JSON失败:', error);
        return result;
      }
      
      // 如果没有可视化配置或数据为空，返回默认表格
      if (!sqlExecution.visualization || !result.data || !result.data.length) {
        return result;
      }
      
      // 从visualization字段获取图表类型
      const visualization = sqlExecution.visualization;
      
      // 设置图表类型
      if (visualization.visualizationType) {
        result.type = visualization.visualizationType.toLowerCase();
      }
      
      // 解析图表配置
      try {
        if (visualization.chartConfig) {
          const chartConfig = JSON.parse(visualization.chartConfig);
          
          // 检查是否有明确的配置格式
          if (chartConfig.dataFormat) {
            // 处理饼图的特殊配置
            if (result.type === 'pie') {
              result.config = {
                nameField: chartConfig.dataFormat.series?.name || 'name',
                valueField: chartConfig.dataFormat.series?.value || 'value',
                title: chartConfig.config?.title?.text || '数据可视化'
              };
            }
            // 处理折线图和柱状图的配置
            else if (result.type === 'line' || result.type === 'bar') {
              result.config = {
                xField: chartConfig.dataFormat.xAxis || 'category',
                yField: chartConfig.dataFormat.series?.value || 'value',
                seriesField: chartConfig.dataFormat.series?.group,
                title: chartConfig.config?.title?.text || '数据可视化'
              };
            }
            // 处理散点图的配置
            else if (result.type === 'scatter') {
              result.config = {
                xField: chartConfig.dataFormat.xAxis || 'x',
                yField: chartConfig.dataFormat.yAxis || 'y',
                sizeField: chartConfig.dataFormat.series?.size,
                colorField: chartConfig.dataFormat.series?.group,
                title: chartConfig.config?.title?.text || '数据可视化'
              };
            }
          } else {
            // 配置不明确时进行智能推断
            result.config.title = chartConfig.config?.title?.text || '数据可视化';
            autoInferFields(result);
          }
        } else {
          // 没有配置时进行智能推断
          autoInferFields(result);
        }
      } catch (error) {
        console.error('解析图表配置失败:', error);
        // 出错时进行智能推断
        autoInferFields(result);
      }
      
      return result;
    };
    
    /**
     * 自动推断各类图表所需字段
     * @param {Object} result - 包含data和config的结果对象
     */
    function autoInferFields(result) {
      // 如果没有数据，直接返回
      if (!result.data || !result.data.length) return;
      
      const firstRow = result.data[0];
      const keys = Object.keys(firstRow);
      
      // 根据图表类型推断所需字段
      switch (result.type) {
        case 'pie':
          // 饼图寻找表示名称和值的字段
          // 常见的名称字段： name, category, label, title, type
          const nameField = keys.find(k => 
            ['name', 'category', 'label', 'title', 'type'].includes(k.toLowerCase())
          ) || keys.find(k => typeof firstRow[k] === 'string');
          
          // 常见的值字段： value, count, amount, sum, total
          const valueField = keys.find(k => 
            ['value', 'count', 'amount', 'sum', 'total'].includes(k.toLowerCase())
          ) || keys.find(k => typeof firstRow[k] === 'number');
          
          if (nameField && valueField) {
            result.config.nameField = nameField;
            result.config.valueField = valueField;
          }
          break;
          
        case 'line':
        case 'bar':
          // 折线图或柱状图推断分类和数值字段
          const categoryField = keys.find(k => 
            ['category', 'name', 'date', 'time', 'month', 'year', 'quarter', 'day'].includes(k.toLowerCase())
          ) || keys.find(k => typeof firstRow[k] === 'string');
          
          const numericField = keys.find(k => 
            ['value', 'count', 'amount', 'sum', 'total'].includes(k.toLowerCase())
          ) || keys.find(k => typeof firstRow[k] === 'number');
          
          if (categoryField && numericField) {
            result.config.xField = categoryField;
            result.config.yField = numericField;
            
            // 检查是否有可能的系列字段
            const possibleSeriesField = keys.find(k => 
              k !== categoryField && 
              k !== numericField && 
              typeof firstRow[k] === 'string'
            );
            
            if (possibleSeriesField) {
              result.config.seriesField = possibleSeriesField;
            }
          }
          break;
          
        case 'scatter':
          // 散点图需要x和y坐标
          const xFieldCandidates = ['x', 'xaxis', 'xcol', 'x_val'];
          const yFieldCandidates = ['y', 'yaxis', 'ycol', 'y_val'];
          
          let xField = keys.find(k => xFieldCandidates.includes(k.toLowerCase()));
          let yField = keys.find(k => yFieldCandidates.includes(k.toLowerCase()));
          
          // 如果没有明确的x/y字段，使用前两个数值字段
          if (!xField || !yField) {
            const numericFields = keys.filter(k => typeof firstRow[k] === 'number');
            if (numericFields.length >= 2) {
              xField = numericFields[0];
              yField = numericFields[1];
            }
          }
          
          if (xField && yField) {
            result.config.xField = xField;
            result.config.yField = yField;
            
            // 寻找可能的大小字段
            const sizeField = keys.find(k => 
              ['size', 'weight', 'radius'].includes(k.toLowerCase()) ||
              (typeof firstRow[k] === 'number' && k !== xField && k !== yField)
            );
            
            if (sizeField) {
              result.config.sizeField = sizeField;
            }
            
            // 寻找可能的分组字段
            const colorField = keys.find(k => 
              ['group', 'category', 'type', 'class'].includes(k.toLowerCase()) ||
              (typeof firstRow[k] === 'string')
            );
            
            if (colorField) {
              result.config.colorField = colorField;
            }
          }
          break;
          
        case 'table':
        default:
          // 表格不需要特殊处理，直接使用所有字段
          result.config.columns = keys.map(key => ({
            title: key,
            dataIndex: key,
            key
          }));
          break;
      }
    }
    
    /**
     * 构建可视化配置
     * @param {Object} sqlExecution - SQL执行结果对象
     * @returns {Object} 包含图表类型、配置和数据的对象
     */
    export const buildVisualization = (sqlExecution) => {
      if (!sqlExecution) {
        return {
          type: 'table',
          config: {},
          data: []
        };
      }
      
      return parseVisualization(sqlExecution);
    };