import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Divider,
  List,
  Avatar,
  Tag,
  Progress,
  Modal,
  Spin,
  message,
  Result,
  Popconfirm
} from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  UserOutlined,
  RobotOutlined,
  SoundOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text, Paragraph } = Typography;

/**
 * 面试实时会话页面
 */
const InterviewSession = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 从location中获取传递的数据
  const initialScenarioInfo = location.state?.scenarioInfo;
  const initialSessionInfo = location.state?.sessionInfo;
  const initialQuestions = location.state?.questions || [];
  
  const [scenarioInfo, setScenarioInfo] = useState(initialScenarioInfo);
  const [sessionInfo, setSessionInfo] = useState(initialSessionInfo);
  const [questions, setQuestions] = useState(initialQuestions);
  
  const [loading, setLoading] = useState(!initialSessionInfo);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interactions, setInteractions] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]); // 存储所有消息按时间顺序
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [interviewerResponse, setInterviewerResponse] = useState(''); // 面试官增量回复
  const [candidateAudioText, setCandidateAudioText] = useState(''); // 应聘者语音文本

  const [endingSession, setEndingSession] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('connecting'); // connecting, ready, speaking, listening, ended, error
  const [micEnabled, setMicEnabled] = useState(true);
  
  // 用于累积消息部分
  const [currentTranscript, setCurrentTranscript] = useState('');
  const pendingFunctionCallArgsRef = useRef({});

  // WebRTC相关引用
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioElementRef = useRef(new Audio());
  const functionCallbacksRef = useRef({});
  const rtcInitializingRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;
  const messageEndRef = useRef(null);

  // 设置WebRTC连接
  const setupRtcConnection = async (token = null) => {
    try {
      // 防止重复初始化
      if (rtcInitializingRef.current) {
        console.log('WebRTC connection setup already in progress, skipping...');
        return;
      }
      
      if (connectionAttemptsRef.current >= maxConnectionAttempts) {
        console.error(`已达到最大连接尝试次数 (${maxConnectionAttempts})`);
        message.error('连接失败，请刷新页面重试');
        setSessionStatus('error');
        return;
      }
      
      connectionAttemptsRef.current += 1;
      rtcInitializingRef.current = true;
      
      // 先获取麦克风权限 - 这样可以在创建连接前确认是否有权限
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        
        // 存储媒体流以供后续使用
        mediaStreamRef.current = mediaStream;
      } catch (error) {
        console.error('获取麦克风访问失败:', error);
        message.error('无法访问麦克风，请确保已授予麦克风权限');
        setSessionStatus('error');
        rtcInitializingRef.current = false;
        return;
      }
      
      // 清理任何现有连接
      cleanupResources(false); // 保留刚获取的媒体流
      
      // 使用传入的token或状态中的token
      const sessionToken = token || sessionInfo?.token;
      
      if (!sessionToken) {
        throw new Error('缺少会话令牌');
      }
      
      console.log('开始设置RTC连接，使用令牌:', sessionToken);
      
      // 1. 创建RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      peerConnectionRef.current = peerConnection;
      
      // 2. 设置远程音频处理 - 接收AI面试官的声音
      audioElementRef.current.autoplay = true;
      peerConnection.ontrack = (event) => {
        console.log('收到远程音轨:', event);
        audioElementRef.current.srcObject = event.streams[0];
      };

      // 3. 添加本地音频轨道到对等连接
      if (mediaStream && mediaStream.getAudioTracks().length > 0) {
        mediaStream.getAudioTracks().forEach(track => {
          // 确保对等连接未关闭
          if (peerConnection.signalingState !== 'closed') {
            console.log('添加本地音轨到连接');
            peerConnection.addTrack(track, mediaStream);
          } else {
            console.warn('无法添加音轨: 对等连接已关闭');
          }
        });
      } else {
        console.warn('没有可用的音频轨道');
      }
      
      // 4. 连接状态变化处理
      peerConnection.onconnectionstatechange = () => {
        console.log('连接状态:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          console.log('WebRTC连接已建立!');
        } else if (peerConnection.connectionState === 'failed' ||
            peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'closed') {
          if (sessionStatus !== 'ended' && !endingSession) {
            setSessionStatus('error');
            message.error('面试连接已断开');
          }
        }
      };

      // 5. 创建数据通道
      console.log('创建数据通道');
      const dataChannel = peerConnection.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;
      
      // 设置数据通道事件处理
      dataChannel.onopen = () => {
        console.log('数据通道已打开');
        // 连接成功后更新状态
        setSessionStatus('ready');
        
        // 如果有当前问题，短暂延迟后询问
        if (currentQuestion) {
          setTimeout(() => {
            askCurrentQuestion();
          }, 1000);
        }
      };
      
      dataChannel.onclose = () => {
        console.log('数据通道已关闭');
        if (sessionStatus !== 'ended' && !endingSession) {
          setSessionStatus('error');
          message.error('面试连接已断开');
        }
      };
      
      dataChannel.onerror = (error) => {
        console.error('数据通道错误:', error);
        if (sessionStatus !== 'ended') {
          setSessionStatus('error');
          message.error('面试连接出错');
        }
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          processRealtimeMessage(message);
        } catch (error) {
          console.error('处理消息失败:', error);
        }
      };
      
      // 6. 创建offer
      console.log('创建offer');
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // 7. 发送offer到服务器并获取answer
        const baseUrl = 'https://api.openai.com/v1/realtime';  // 请替换为您的实际API端点
        const model = 'gpt-4o-realtime-preview';  // 请替换为您使用的模型
        
        console.log('发送offer到服务器');
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
          method: 'POST',
          body: offer.sdp,
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/sdp'
          }
        });
        
        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text();
          throw new Error(`WebRTC连接失败: ${sdpResponse.status} ${errorText}`);
        }
        
        // 8. 设置远程描述
        const answer = {
          type: 'answer',
          sdp: await sdpResponse.text()
        };
        
        console.log('设置远程描述');
        await peerConnection.setRemoteDescription(answer);
        
        // 注册function callbacks
        registerFunctionCallbacks();
        
      } catch (error) {
        console.error('创建或处理WebRTC offer失败:', error);
        throw error;
      }
      
      rtcInitializingRef.current = false;
      
    } catch (error) {
      console.error('设置WebRTC连接失败:', error);
      message.error('设置面试连接失败: ' + error.message);
      setSessionStatus('error');
      rtcInitializingRef.current = false;
      
      // 如果连接失败且尝试次数未超过限制，则尝试重新连接
      if (connectionAttemptsRef.current < maxConnectionAttempts) {
        console.log(`连接失败，${maxConnectionAttempts - connectionAttemptsRef.current}秒后尝试重新连接...`);
        setTimeout(() => {
          rtcInitializingRef.current = false;
          setupRtcConnection(token);
        }, 1000);
      }
    }
  };
  
  // 处理实时消息 - 更新后的函数，简化处理用户和面试官消息
  // 处理实时消息 - 更新面试官和用户消息处理
// 处理实时消息 - 更新面试官和用户消息处理
// 处理实时消息 - 更新面试官和用户消息处理
const processRealtimeMessage = (message) => {
  try {
    if (!message || !message.type) return;
    
    // 调试信息 - 始终显示所有收到的消息类型及详情，有助于调试
    console.log('从数据通道收到消息:', message.type, JSON.stringify(message, null, 2));
    
    switch (message.type) {
      // 用户语音转录完成
      case 'conversation.item.input_audio_transcription.completed':
        console.log('用户语音转录完成');
        console.log(`用户语音转录: ${message.transcript}`);
        
        if (message.transcript) {
          // 保存用户的语音转录文本
          setCandidateAudioText(message.transcript);
          
          // 添加到消息历史
          setMessageHistory(prevHistory => [
            ...prevHistory,
            {
              id: `transcript-${Date.now()}`,
              type: 'user',
              content: message.transcript,
              timestamp: new Date().toISOString()
            }
          ]);
          
          // 更新当前转录
          setCurrentTranscript(message.transcript);
        }
        break;
      
      // 会话创建事件  
      case 'conversation.item.created':
        // 检查是否是面试官的消息
        if (message.item && message.item.role === 'assistant') {
          if (message.item.content && Array.isArray(message.item.content)) {
            // 处理面试官的文本消息
            message.item.content.forEach(content => {
              if (content.type === 'text' && content.text) {
                setMessageHistory(prevHistory => [
                  ...prevHistory,
                  {
                    id: message.item.id || `assistant-${Date.now()}`,
                    type: 'assistant',
                    content: content.text,
                    timestamp: new Date().toISOString()
                  }
                ]);
                
                // 同时更新面试官的实时显示文本
                setInterviewerResponse(content.text);
              }
            });
          }
        }
        break;
          
      // 用户开始说话
      case 'input_audio_buffer.speech_started':
        console.log('检测到用户开始说话');
        setSessionStatus('listening');
        setIsProcessingResponse(false);
        break;
          
      // 用户停止说话
      case 'input_audio_buffer.speech_stopped':
        console.log('检测到用户停止说话');
        break;
          
      // 面试官开始说话
      case 'response.speech.started':
        console.log('面试官开始说话');
        setSessionStatus('speaking');
        setIsProcessingResponse(true);
        break;
          
      // 面试官停止说话
      case 'response.speech.done':
        console.log('面试官停止说话');
        setIsProcessingResponse(false);
        break;
          
      // 面试官文本响应的增量部分 - 这是关键的部分
      case 'response.text.delta':
        if (message.delta) {
          // 更新AI回复的增量文本
          setInterviewerResponse(prev => prev + message.delta);
        }
        break;
          
      // 面试官文本响应完成
      case 'response.text.done':
        // 处理完整的文本响应
        if (message.text) {
          // 添加AI回复到消息历史
          setMessageHistory(prevHistory => [
            ...prevHistory,
            {
              id: `interviewer-${Date.now()}`,
              type: 'assistant',
              content: message.text,
              timestamp: new Date().toISOString()
            }
          ]);
        }
        // 不要清空增量响应，直到响应完全完成
        break;
        
      // 处理面试官音频转录完成事件
      case 'response.audio_transcript.done':
        console.log('面试官音频转录完成:', message.transcript);
        if (message.transcript) {
          // 添加AI回复到消息历史
          setMessageHistory(prevHistory => [
            ...prevHistory,
            {
              id: `interviewer-transcript-${Date.now()}`,
              type: 'assistant',
              content: message.transcript,
              timestamp: new Date().toISOString()
            }
          ]);
          
          // 更新当前显示的面试官回复
          setInterviewerResponse(message.transcript);
        }
        break;
          
      // 响应完成事件
      case 'response.done':
        console.log('响应完成');
        setIsProcessingResponse(false);
        // 清除面试官增量文本
        setInterviewerResponse(''); 
        break;
          
      // 处理function call相关消息
      case 'response.function_call':
        if (message.function && message.function.name) {
          pendingFunctionCallArgsRef.current[message.function.call_id] = {
            name: message.function.name,
            args: ''
          };
        }
        break;
          
      case 'response.function_call_arguments.delta':
        if (message.call_id && pendingFunctionCallArgsRef.current[message.call_id]) {
          if (message.delta) {
            pendingFunctionCallArgsRef.current[message.call_id].args += message.delta;
          }
        }
        break;
          
      case 'response.function_call_arguments.done':
        if (message.call_id && pendingFunctionCallArgsRef.current[message.call_id]) {
          const { name, args } = pendingFunctionCallArgsRef.current[message.call_id];
          let parameters = {};
          
          try {
            parameters = JSON.parse(args);
          } catch (e) {
            console.error('解析函数参数失败:', e);
          }
          
          // 执行函数回调
          if (name && functionCallbacksRef.current[name]) {
            functionCallbacksRef.current[name](parameters);
          }
          
          // 清理
          delete pendingFunctionCallArgsRef.current[message.call_id];
        }
        break;
      
      // 错误处理
      case 'invalid_request_error':
        console.error('请求错误:', message.message);
        message.error(`请求错误: ${message.message}`);
        break;
          
      // 其他类型的消息可以忽略或简单记录
      default:
        console.log('收到其他类型消息:', message.type);
        break;
    }
  } catch (error) {
    console.error('处理消息失败:', error, message);
  }
};

  // 发送消息到服务器
  const sendToServer = (messageData) => {
    try {
      if (dataChannelRef.current?.readyState === 'open') {
        const messageString = JSON.stringify(messageData);
        dataChannelRef.current.send(messageString);
        return true;
      } else {
        console.error('数据通道未打开，状态:', dataChannelRef.current?.readyState);
        return false;
      }
    } catch (error) {
      console.error('向服务器发送消息失败:', error);
      return false;
    }
  };

  // 注册function callbacks
  const registerFunctionCallbacks = () => {
    functionCallbacksRef.current = {
      saveInteraction: (parameters) => {
        // 面试官问题结束，开始录音（应聘者回答）
        setSessionStatus('listening');
        console.log('AI面试官问题结束，等待应聘者回答');
      },
      endInteraction: (parameters) => {
        // 应聘者回答结束
        setSessionStatus('ready');
        console.log('应聘者回答结束:', parameters);
        
        // 从currentTranscript获取回答
        const answer = parameters.answer || currentTranscript || candidateAudioText || '未能识别回答';
        
        // 将当前交互添加到列表
        if (currentQuestion) {
          const newInteraction = {
            id: Date.now(),
            questionId: currentQuestion.id,
            question: currentQuestion.content,
            answer: answer,
            createDate: new Date().toISOString()
          };
          
          setInteractions(prev => [...prev, newInteraction]);
          
          // 保存交互记录到服务器
          saveInteraction(currentQuestion.content, answer);
          
          // 准备下一个问题
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setCurrentQuestion(questions[nextIndex]);
            
            // 清除当前转录
            setCurrentTranscript('');
            setCandidateAudioText(''); // 清除应聘者语音文本
            
            // 清除面试官增量文本，确保不显示旧文本
            setInterviewerResponse('');
            
            // 短暂延迟后询问下一个问题
            setTimeout(() => {
              askCurrentQuestion();
            }, 2000);
          } else {
            // 所有问题已完成
            message.success('所有面试问题已完成');
            handleEndInterview();
          }
        }
      }
    };
  };

  // 询问当前问题
 // 询问当前问题
const askCurrentQuestion = () => {
  if (!currentQuestion) {
    console.warn('没有当前问题可问');
    return;
  }
  
  // 更新状态
  setSessionStatus('speaking');
  setIsProcessingResponse(true);
  
  // 将问题添加到消息历史
  const questionId = `question-${Date.now()}`;
  setMessageHistory(prevHistory => [
    ...prevHistory,
    {
      id: questionId,
      type: 'assistant', // 注意：问题是面试官(AI)提出的，所以是assistant类型
      content: currentQuestion.content,
      timestamp: new Date().toISOString(),
      isQuestion: true // 标记为问题
    }
  ]);

  // 发送问题到AI面试官 - 使用 system 消息指定角色信息
  const messageData = {
    type: 'text',
    text: `你是面试官，正在进行一场面试。请询问候选人以下问题：${currentQuestion.content}`,
    role: 'system'
  };

  if (!sendToServer(messageData)) {
    message.error('发送问题失败');
    setSessionStatus('ready');
    setIsProcessingResponse(false);
  }
};
  // 保存交互记录
  const saveInteraction = (question, answer) => {
    if (!sessionId) return;

    interviewAPI.saveInteraction({
      SessionId: sessionId,
      QuestionId: currentQuestion?.id,
      Question: question || currentQuestion?.content || '',
      Answer: answer || '',
      CreateDate: new Date().toISOString()
    }).catch(error => {
      console.error('保存交互记录失败:', error);
    });
  };

  // 结束面试
  const handleEndInterview = async () => {
    try {
      setEndingSession(true);
      
      // 发送结束信号到服务器
      if (dataChannelRef.current?.readyState === 'open') {
        sendToServer({ type: 'session.end' });
      }
      
      // 更新会话状态为已结束
      if (sessionId) {
        await interviewAPI.endSession(sessionId);
        setSessionStatus('ended');
        setSessionEnded(true);
        message.success('面试已结束');
        
        // 导航到结果页面或显示结果
        navigate(`/interview/session-result/${sessionId}`, {
          state: {
            scenarioInfo,
            sessionInfo,
            interactions
          }
        });
      }
    } catch (error) {
      console.error('结束面试失败:', error);
      message.error('结束面试时出错: ' + error.message);
    } finally {
      setEndingSession(false);
      cleanupResources();
    }
  };

  // 确认结束面试
  const confirmEndInterview = () => {
    Modal.confirm({
      title: '确定要结束面试吗?',
      content: '结束后将无法继续当前面试',
      okText: '结束面试',
      cancelText: '取消',
      onOk: handleEndInterview
    });
  };

  // 清理资源
  const cleanupResources = (cleanMedia = true) => {
    try {
      // 关闭数据通道
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
      
      // 关闭对等连接
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // 停止媒体流
      if (cleanMedia && mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      // 停止音频播放
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      }
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  };

  // 切换麦克风状态
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newState = !micEnabled;
        audioTracks[0].enabled = newState;
        setMicEnabled(newState);
        message.info(newState ? '麦克风已开启' : '麦克风已静音');
      }
    }
  };

  // 初始化会话数据
  const initSessionData = async () => {
    try {
      setLoading(true);
      
      if (!sessionId) {
        throw new Error('缺少会话ID');
      }
      
      // 如果location.state中没有数据，则从API获取
      if (!initialSessionInfo) {
        const sessionData = await interviewAPI.getSessionDetail(sessionId);
        
        if (sessionData.code === 200) {
          setSessionInfo(sessionData.data);
          setScenarioInfo(sessionData.data.scenario);
          
          // 获取问题列表
          const questionsData = await interviewAPI.getQuestionsList(
            sessionData.data.scenarioId, 
            sessionData.data.jobPositionId
          );
          
          if (questionsData.code === 200) {
            setQuestions(questionsData.data.items || []);
          }
          
          // 设置当前问题
          if (questionsData.data.items && questionsData.data.items.length > 0) {
            setCurrentQuestion(questionsData.data.items[0]);
          }
        } else {
          throw new Error(sessionData.message || '获取会话数据失败');
        }
      } else {
        // 如果有初始问题数据，设置当前问题
        if (initialQuestions.length > 0) {
          setCurrentQuestion(initialQuestions[0]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('初始化会话数据失败:', error);
      message.error('加载面试数据失败: ' + error.message);
      setLoading(false);
      setSessionStatus('error');
    }
  };

  // 组件挂载时初始化
  useEffect(() => {
    initSessionData();
    
    // 组件卸载时清理
    return () => {
      cleanupResources();
    };
  }, [sessionId]);

  // 当sessionInfo或token变化时建立连接
  useEffect(() => {
    if (sessionInfo?.token && !peerConnectionRef.current) {
      setupRtcConnection(sessionInfo.token);
    }
  }, [sessionInfo?.token]);

  // 自动滚动到底部
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistory, interviewerResponse]);

  // 渲染状态指示器
  const renderStatusIndicator = () => {
    switch (sessionStatus) {
      case 'connecting':
        return (
          <Tag icon={<LoadingOutlined />} color="processing">
            连接中...
          </Tag>
        );
      case 'ready':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            准备就绪
          </Tag>
        );
      case 'speaking':
        return (
          <Tag icon={<SoundOutlined />} color="gold">
            面试官说话中
          </Tag>
        );
      case 'listening':
        return (
          <Tag icon={<UserOutlined />} color="blue">
            等待您的回答
          </Tag>
        );
      case 'ended':
        return (
          <Tag icon={<CheckCircleOutlined />} color="default">
            面试已结束
          </Tag>
        );
      case 'error':
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            连接错误
          </Tag>
        );
      default:
        return null;
    }
  };

  // 渲染消息项
  const renderMessageItem = (message) => {
    const isUser = message.type === 'user';
    const isAssistant = message.type === 'assistant';
    
    // 确保我们始终有正确的类型
    const actualType = isUser ? 'user' : 'assistant';
    
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          marginBottom: 16,
          alignItems: 'flex-start'
        }}
      >
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{
            backgroundColor: isUser ? '#1890ff' : '#722ed1',
            marginLeft: isUser ? 12 : 0,
            marginRight: isUser ? 0 : 12
          }}
        />
        <div
          style={{
            maxWidth: '70%',
            borderRadius: 4,
            padding: '8px 12px',
            backgroundColor: isUser ? '#e6f7ff' : '#f9f0ff',
            border: isUser ? '1px solid #91d5ff' : '1px solid #d3adf7'
          }}
        >
          {message.isQuestion && (
            <Tag color="blue" style={{ marginBottom: 4 }}>问题</Tag>
          )}
          <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {actualType === 'user' ? '您' : '面试官'} · {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
        </div>
      </div>
    );
  };

  // 渲染面试官实时响应
  // 渲染面试官实时响应
const renderInterviewerResponse = () => {
  if (!interviewerResponse) return null;
  
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: 16,
        alignItems: 'flex-start'
      }}
    >
      <Avatar
        icon={<RobotOutlined />}
        style={{
          backgroundColor: '#722ed1',
          marginRight: 12
        }}
      />
      <div
        style={{
          maxWidth: '70%',
          borderRadius: 4,
          padding: '8px 12px',
          backgroundColor: '#f9f0ff',
          border: '1px solid #d3adf7'
        }}
      >
        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
          {interviewerResponse}
          {isProcessingResponse && (
            <span style={{ 
              display: 'inline-block', 
              width: '2px', 
              height: '16px', 
              backgroundColor: '#722ed1', 
              animation: 'blink 1s infinite', 
              marginLeft: 2,
              verticalAlign: 'middle'
            }}></span>
          )}
        </Paragraph>
        <Text type="secondary" style={{ fontSize: 12 }}>
          面试官 · {isProcessingResponse ? '正在回复...' : '已回复'}
        </Text>
      </div>
    </div>
  );
};

  // 渲染面试问题进度
  const renderQuestionProgress = () => {
    if (!questions.length) return null;
    
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    
    return (
      <div style={{ marginBottom: 16 }}><Text strong>
      问题 {currentQuestionIndex + 1}/{questions.length}
    </Text>
    <Progress percent={progressPercent} showInfo={false} />
  </div>
);
};

// 渲染面试结束结果
const renderSessionEnded = () => {
return (
  <Result
    status="success"
    title="面试已完成"
    subTitle="感谢您的参与，面试结果将很快生成"
    extra={[
      <Button
        type="primary"
        key="result"
        onClick={() => navigate(`/interview/session-result/${sessionId}`)}
      >
        查看面试结果
      </Button>,
      <Button
        key="return"
        onClick={() => navigate('/interview')}
      >
        返回首页
      </Button>
    ]}
  />
);
};

// 渲染错误状态
const renderErrorState = () => {
return (
  <Result
    status="error"
    title="连接失败"
    subTitle="无法连接到面试服务器，请检查网络连接后重试"
    extra={[
      <Button
        type="primary"
        key="retry"
        onClick={() => setupRtcConnection(sessionInfo?.token)}
      >
        重新连接
      </Button>,
      <Button
        key="return"
        onClick={() => navigate('/interview')}
      >
        返回首页
      </Button>
    ]}
  />
);
};

// 主渲染
if (loading) {
return (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
    <Spin size="large" tip="加载面试数据..." />
  </div>
);
}

if (sessionEnded) {
return renderSessionEnded();
}

if (sessionStatus === 'error') {
return renderErrorState();
}

return (
<div style={{ padding: 24 }}>
  <Card
    title={
      <Space>
        <Title level={4} style={{ margin: 0 }}>
          {scenarioInfo?.name || '面试会话'}
        </Title>
        {renderStatusIndicator()}
      </Space>
    }
    extra={
      <Space>
        <Button
          icon={micEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
          onClick={toggleMic}
        >
          {micEnabled ? '麦克风开启' : '麦克风静音'}
        </Button>
        <Popconfirm
          title="确定要结束面试吗?"
          description="结束后将无法继续当前面试"
          onConfirm={handleEndInterview}
          okText="结束"
          cancelText="取消"
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        >
          <Button
            type="primary"
            danger
            icon={<CloseCircleOutlined />}
            loading={endingSession}
          >
            结束面试
          </Button>
        </Popconfirm>
      </Space>
    }
  >
    {renderQuestionProgress()}
    
    <Divider orientation="left">面试对话</Divider>
    
    <div
      style={{
        height: 'calc(100vh - 400px)',
        overflowY: 'auto',
        padding: '0 16px',
        marginBottom: 16
      }}
    >
      <List
        dataSource={messageHistory}
        renderItem={renderMessageItem}
        locale={{ emptyText: '暂无对话记录' }}
      />
      {interviewerResponse && renderInterviewerResponse()}
      <div ref={messageEndRef} />
    </div>
    
    <Divider orientation="left">当前问题</Divider>
    
    {currentQuestion ? (
      <Card
        type="inner"
        title={`问题 ${currentQuestionIndex + 1}`}
        extra={
          <Tag color="blue">
            {currentQuestion.category || '通用问题'}
          </Tag>
        }
      >
        <Paragraph style={{ fontSize: 16 }}>
          {currentQuestion.content}
        </Paragraph>
      </Card>
    ) : (
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        暂无当前问题
      </Paragraph>
    )}
    
    {sessionStatus === 'listening' && (
      <div style={{ 
        marginTop: 16, 
        padding: '12px 16px', 
        background: '#f6ffed', 
        border: '1px solid #b7eb8f',
        borderRadius: 4
      }}>
        <Space>
          <SoundOutlined style={{ color: '#52c41a' }} />
          <Text strong>正在聆听您的回答...</Text>
        </Space>
        {candidateAudioText && (
          <Paragraph style={{ marginTop: 8, color: '#555' }}>
            当前识别: {candidateAudioText}
          </Paragraph>
        )}
      </div>
    )}
  </Card>
</div>
);
};

export default InterviewSession;