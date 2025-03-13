import http from '../utils/http';

/**
 * 用户相关API请求封装
 */
const userAPI = {
  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.MobileNo - 手机号码
   * @param {string} data.Name - 用户名
   * @param {string} data.Password - 密码
   * @returns {Promise} - 请求Promise
   */
  register: (data) => {
    return http.post('/user/register', data);
  },
  
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.MobileNo - 手机号码
   * @param {string} data.Password - 密码
   * @returns {Promise} - 请求Promise
   */
  login: (data) => {
    return http.post('/user/login', data);
  },
  
  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise} - 请求Promise
   */
  getUserInfo: (userId) => {
    return http.get(`/user/${userId}`);
  },
  
  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} data - 更新数据
   * @returns {Promise} - 请求Promise
   */
  updateUserInfo: (userId, data) => {
    return http.put(`/user/${userId}`, data);
  },
  
  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.oldPassword - 旧密码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise} - 请求Promise
   */
  changePassword: (data) => {
    return http.post('/user/change-password', data);
  }
};

export default userAPI;