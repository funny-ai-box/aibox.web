/**
 * WebSocket服务
 * 处理智能客服实时聊天连接
 */
class WebSocketService {

      _getToken() {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            return JSON.parse(userInfo).accessToken;
          } catch (e) {
            console.error('解析用户信息失败', e);
            return null;
          }
        }
        return null;
      }
      constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = null;
        this.messageCallbacks = [];
        this.statusCallbacks = [];
        this.sessionId = null;
        this.baseUrl = '/ws/customerservice/chat';
      }
    
      /**
       * 连接WebSocket
       * @returns {Promise} 连接状态Promise
       */
      connect() {
        return new Promise((resolve, reject) => {
          if (this.isConnected) {
            resolve();
            return;
          }
    
          try {
            const token = this._getToken();
        
        // 在WebSocket URL中添加token作为查询参数,使用Bearer前缀
        const wsUrl = token ? 
          `${this.baseUrl}?token=${encodeURIComponent(`Bearer ${token}`)}` : 
          this.baseUrl;
        

            this.socket = new WebSocket(wsUrl);
    
            this.socket.onopen = () => {
              console.log('WebSocket connection established');
              this.isConnected = true;
              this.reconnectAttempts = 0;
              this._notifyStatusChange({ connected: true, message: '连接成功' });
              resolve();
            };
    
            this.socket.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log('收到WebSocket消息:', data);
                this._notifyMessageReceived(data);
              } catch (e) {
                console.error('解析WebSocket消息失败:', e);
              }
            };
    
            this.socket.onclose = (event) => {
              console.log('WebSocket connection closed:', event);
              this.isConnected = false;
              this._notifyStatusChange({ connected: false, message: '连接已关闭' });
              this._attemptReconnect();
            };
    
            this.socket.onerror = (error) => {
              console.error('WebSocket error:', error);
              this._notifyStatusChange({ connected: false, message: '连接出错' });
              reject(error);
            };
          } catch (error) {
            console.error('创建WebSocket连接失败:', error);
            this._notifyStatusChange({ connected: false, message: '创建连接失败' });
            reject(error);
          }
        });
      }
    
      /**
       * 尝试重新连接
       * @private
       */
      _attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('最大重连次数已达到，停止重连');
          this._notifyStatusChange({ connected: false, message: '重连失败，请刷新页面' });
          return;
        }
    
        this.reconnectAttempts++;
        console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this._notifyStatusChange({ connected: false, message: `正在重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})` });
    
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connect().catch(() => {
            // 连接失败时，会自动触发onclose，进而再次调用_attemptReconnect
          });
        }, 3000); // 3秒后重连
      }
    
      /**
       * 断开WebSocket连接
       */
      disconnect() {
        if (this.socket && this.isConnected) {
          this.socket.close();
          this.isConnected = false;
          this.sessionId = null;
          clearTimeout(this.reconnectTimeout);
          this._notifyStatusChange({ connected: false, message: '已断开连接' });
        }
      }
    
      /**
       * 加入聊天会话
       * @param {string} sessionId - 会话ID
       * @returns {Promise} - 加入会话结果Promise
       */
      joinSession(sessionId) {
        this.sessionId = sessionId;
        
        return new Promise((resolve, reject) => {
          if (!this.isConnected) {
            reject(new Error('WebSocket未连接'));
            return;
          }
    
          const joinMessage = {
            type: 'join',
            data: {
                  sessionId: Number(sessionId)
            }
          };
    
          this.socket.send(JSON.stringify(joinMessage));
          console.log('已发送加入会话请求:', joinMessage);
          resolve();
        });
      }
    
      /**
       * 离开聊天会话
       * @returns {Promise} - 离开会话结果Promise
       */
      leaveSession() {
        return new Promise((resolve, reject) => {
          if (!this.isConnected || !this.sessionId) {
            reject(new Error('未加入会话或WebSocket未连接'));
            return;
          }
    
          const leaveMessage = {
            type: 'leave',
            sessionId: this.sessionId
          };
    
          this.socket.send(JSON.stringify(leaveMessage));
          console.log('已发送离开会话请求:', leaveMessage);
          this.sessionId = null;
          resolve();
        });
      }
    
      /**
       * 发送文本消息
       * @param {string} message - 消息内容
       * @returns {Promise} - 发送结果Promise
       */
      sendMessage(message) {
        return new Promise((resolve, reject) => {
          if (!this.isConnected || !this.sessionId) {
            reject(new Error('未加入会话或WebSocket未连接'));
            return;
          }
    
          const chatMessage = {
            type: 'message',
            data: {

                  content: message
            }
          };
    
          this.socket.send(JSON.stringify(chatMessage));
          console.log('已发送聊天消息:', chatMessage);
          resolve();
        });
      }
    
      /**
       * 发送图片消息(仅传递URL，实际上传通过HTTP完成)
       * @param {string} imageUrl - 图片URL
       * @returns {Promise} - 发送结果Promise
       */
      sendImageMessage(imageUrl) {
        return new Promise((resolve, reject) => {
          if (!this.isConnected || !this.sessionId) {
            reject(new Error('未加入会话或WebSocket未连接'));
            return;
          }
    
          const imageMessage = {
            type: 'image',
            sessionId: this.sessionId,
            imageUrl: imageUrl
          };
    
          this.socket.send(JSON.stringify(imageMessage));
          console.log('已发送图片消息:', imageMessage);
          resolve();
        });
      }
    
      /**
       * 添加消息回调
       * @param {Function} callback - 回调函数
       */
      onMessage(callback) {
        if (typeof callback === 'function') {
          this.messageCallbacks.push(callback);
        }
      }
    
      /**
       * 添加状态变更回调
       * @param {Function} callback - 回调函数
       */
      onStatusChange(callback) {
        if (typeof callback === 'function') {
          this.statusCallbacks.push(callback);
        }
      }
    
      /**
       * 移除消息回调
       * @param {Function} callback - 回调函数
       */
      removeMessageCallback(callback) {
        this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
      }
    
      /**
       * 移除状态变更回调
       * @param {Function} callback - 回调函数
       */
      removeStatusCallback(callback) {
        this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
      }
    
      /**
       * 通知消息接收
       * @param {Object} message - 接收到的消息
       * @private
       */
      _notifyMessageReceived(message) {
        this.messageCallbacks.forEach(callback => {
          try {
            callback(message);
          } catch (e) {
            console.error('执行消息回调函数出错:', e);
          }
        });
      }
    
      /**
       * 通知状态变更
       * @param {Object} status - 状态信息
       * @private
       */
      _notifyStatusChange(status) {
        this.statusCallbacks.forEach(callback => {
          try {
            callback(status);
          } catch (e) {
            console.error('执行状态回调函数出错:', e);
          }
        });
      }
    }
    
    // 创建WebSocket服务实例
    const webSocketService = new WebSocketService();
    
    export default webSocketService;