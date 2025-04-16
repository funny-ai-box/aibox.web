import http from '../utils/http';

/**
 * AI面试相关API请求封装
 */
const interviewAPI = {
  /**
   * 创建面试场景
   * @param {Object} data - 场景数据
   * @returns {Promise} - 请求Promise
   */
  createScenario: (data) => {
    return http.post('/interview/scenarios/create', data);
  },
  
  /**
   * 上传面试场景的文档内容
   * @param {FormData} formData - 包含文件和ID的表单数据
   * @returns {Promise} - 请求Promise
   */
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')).accessToken 
      : null;
    
    try {
      const response = await fetch(`${http.getBaseUrl()}/interview/scenarios/contents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        return Promise.reject(result);
      }
      
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  /**
   * 导入面试场景的文本内容
   * @param {Object} data - 包含场景ID和文本内容的数据
   * @returns {Promise} - 请求Promise
   */
  importText: (data) => {
    return http.post('/interview/scenarios/contents/text', data);
  },
  
  /**
   * 删除面试场景的内容项
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 请求Promise
   */
  deleteContent: (contentId) => {
    return http.post('/interview/scenarios/contents/delete', { Id: contentId });
  },
  
  /**
   * 获取面试场景的文档详情
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 请求Promise
   */
  getContentDetail: (contentId) => {
    return http.post('/interview/scenarios/contents/dtl', { Id: contentId });
  },
  
  /**
   * 获取面试场景详情
   * @param {number} scenarioId - 场景ID
   * @returns {Promise} - 请求Promise
   */
  getScenarioDetail: (scenarioId) => {
    return http.post('/interview/scenarios/detail', { Id: scenarioId });
  },
  
  /**
   * 获取面试场景列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认10
   * @returns {Promise} - 请求Promise
   */
  getScenarioList: (pageIndex = 1, pageSize = 10) => {
    return http.post('/interview/scenarios/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 删除面试场景
   * @param {number} scenarioId - 场景ID
   * @returns {Promise} - 请求Promise
   */
  deleteScenario: (scenarioId) => {
    return http.post('/interview/scenarios/delete', { Id: scenarioId });
  },
  
  /**
   * 开始生成面试题目
   * @param {number} scenarioId - 场景ID
   * @returns {Promise} - 请求Promise
   */
  generateQuestions: (scenarioId) => {
    return http.post('/interview/questions/generate', { Id: scenarioId });
  },
  
  /**
   * 获取场景的题目列表
   * @param {number} scenarioId - 场景ID
   * @param {number} jobPositionId - 职位ID
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getQuestionsList: (scenarioId, jobPositionId, pageIndex = 1, pageSize = 20) => {
    return http.post('/interview/questions/list', {
      ScenarioId: scenarioId,
      JobPositionId: jobPositionId,
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 修改面试题目的内容
   * @param {Object} data - 题目数据
   * @returns {Promise} - 请求Promise
   */
  updateQuestion: (data) => {
    return http.post('/interview/questions/update', data);
  },
  
  /**
   * 创建面试会话
   * @param {Object} data - 会话数据
   * @returns {Promise} - 请求Promise
   */
  createSession: (data) => {
    return http.post('/interview/sessions/create', data);
  },
  
  /**
   * 开始面试
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  startSession: (sessionId) => {
    return http.post('/interview/sessions/start', { SessionId: sessionId ,
      NoiseReduction: "near_field"
    });
  },
  
  /**
   * 结束面试会话
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  endSession: (sessionId) => {
    return http.post('/interview/sessions/end', { SessionId: sessionId });
  },
  
  /**
   * 获取面试会话列表
   * @param {number} pageIndex - 页码，默认1
   * @param {number} pageSize - 每页条数，默认20
   * @returns {Promise} - 请求Promise
   */
  getSessionsList: (pageIndex = 1, pageSize = 20) => {
    return http.post('/interview/sessions/list', {
      PageIndex: pageIndex,
      PageSize: pageSize
    });
  },
  
  /**
   * 获取面试会话详情
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  getSessionDetail: (sessionId) => {
    return http.post('/interview/sessions/detail', { Id: sessionId });
  },
  
  /**
   * 保存交互记录
   * @param {Object} data - 交互数据
   * @returns {Promise} - 请求Promise
   */
  saveInteraction: (data) => {
    return http.post('/interview/interactions/save', data);
  },
  
  /**
   * 开始评估面试
   * @param {number} sessionId - 会话ID
   * @returns {Promise} - 请求Promise
   */
  evaluateSession: (sessionId) => {
    return http.post('/interview/sessions/evaluate', { SessionId: sessionId });
  }
};

export default interviewAPI;