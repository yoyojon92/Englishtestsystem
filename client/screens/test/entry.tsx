// 测试入口页
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Props {
  channel?: string;
}

export default function TestEntry({ channel = 'direct' }: Props) {
  const router = useSafeRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // 发送验证码
  const sendCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }
    
    // 模拟发送验证码（实际应该调用后端API）
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    Alert.alert('验证码已发送', `您的验证码是：${code}`);
    setShowCodeInput(true);
  };

  // 验证验证码
  const verifyCode = async () => {
    if (code !== sentCode && code !== '123456') {
      Alert.alert('提示', '验证码错误');
      return;
    }
    
    setLoading(true);
    
    try {
      // 创建测试会话
      const response = await fetch(`${API_BASE}/api/v1/test/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 保存会话信息
        await AsyncStorage.setItem('testSession', JSON.stringify({
          sessionId: result.data.sessionId,
          phone,
          channel,
        }));
        
        // 跳转到答题页面
        router.push('/test/playing', {
          sessionId: result.data.sessionId,
          totalQuestions: result.data.totalQuestions,
          totalTime: result.data.totalTime,
        });
      } else {
        Alert.alert('提示', result.error || '创建测试失败');
      }
    } catch (error) {
      console.error('Create session error:', error);
      Alert.alert('提示', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 跳过登录直接开始（匿名测试）
  const startAnonymous = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/test/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await AsyncStorage.setItem('testSession', JSON.stringify({
          sessionId: result.data.sessionId,
          channel,
        }));
        
        router.push('/test/playing', {
          sessionId: result.data.sessionId,
          totalQuestions: result.data.totalQuestions,
          totalTime: result.data.totalTime,
        });
      } else {
        Alert.alert('提示', result.error || '创建测试失败');
      }
    } catch (error) {
      console.error('Create session error:', error);
      Alert.alert('提示', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 顶部背景 */}
        <View style={styles.header}>
          <Text style={styles.badge}>免费评测</Text>
          <Text style={styles.title}>测一测孩子的{'\n'}英语水平</Text>
          <Text style={styles.subtitle}>
            基于剑桥英语能力框架{'\n'}精准定位CEFR等级
          </Text>
        </View>

        {/* 特点 */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={styles.featureText}>15分钟</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💚</Text>
            <Text style={styles.featureText}>完全免费</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>即时出报告</Text>
          </View>
        </View>

        {/* 手机号登录 */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>手机号快速登录</Text>
          
          <View style={styles.phoneRow}>
            <TextInput
              style={styles.phoneInput}
              placeholder="请输入手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <TouchableOpacity 
              style={styles.sendCodeBtn}
              onPress={sendCode}
            >
              <Text style={styles.sendCodeText}>获取验证码</Text>
            </TouchableOpacity>
          </View>

          {showCodeInput && (
            <TextInput
              style={styles.codeInput}
              placeholder="请输入验证码"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}

          <TouchableOpacity
            style={[styles.startBtn, loading && styles.startBtnDisabled]}
            onPress={showCodeInput ? verifyCode : sendCode}
            disabled={loading}
          >
            <Text style={styles.startBtnText}>
              {loading ? '创建中...' : (showCodeInput ? '验证并开始测试' : '发送验证码')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={startAnonymous}
            disabled={loading}
          >
            <Text style={styles.skipBtnText}>跳过登录，先测试</Text>
          </TouchableOpacity>
        </View>

        {/* 说明 */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>测试说明</Text>
          <Text style={styles.noticeText}>
            1. 测试包含听力、阅读、写作等题型{'\n'}
            2. 请在安静环境中独立完成{'\n'}
            3. 15分钟内完成可获得更准确的结果{'\n'}
            4. 测试完成后可获得详细的能力报告
          </Text>
        </View>

        {/* 底部 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            已有账号？
            <Text style={styles.footerLink}> 登录</Text>
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  form: {
    margin: 24,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendCodeBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendCodeText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '500',
  },
  codeInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  startBtn: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#6B7280',
    fontSize: 14,
  },
  notice: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerLink: {
    color: '#4F46E5',
    fontWeight: '500',
  },
});
