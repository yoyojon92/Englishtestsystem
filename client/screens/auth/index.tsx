import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useSafeRouter();
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!phone || !password) {
      Alert.alert('错误', '请输入手机号和密码');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('错误', '请输入姓名');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(phone, password);
        router.replace('/(tabs)');
      } else {
        await register({ phone, password, name, role: 'parent' });
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoContainer}
            >
              <Text style={styles.logoText}>剑桥</Text>
            </LinearGradient>
            <Text style={styles.title}>剑桥英语能力测评</Text>
            <Text style={styles.subtitle}>从零基础到考级通关</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>登录</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>注册</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>姓名</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入姓名"
                      placeholderTextColor="#B2BEC3"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>手机号</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入手机号"
                    placeholderTextColor="#B2BEC3"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>密码</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入密码"
                    placeholderTextColor="#B2BEC3"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#B2BEC3', '#B2BEC3'] : ['#6C63FF', '#896BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '处理中...' : isLogin ? '登录' : '注册'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>忘记密码？</Text>
              </TouchableOpacity>
            </View>

            {/* Demo account hint */}
            <View style={styles.demoHint}>
              <Text style={styles.demoText}>演示账号: 13800138000 / 123456</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>登录即表示同意</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>《用户服务协议》</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>和</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>《隐私政策》</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  formContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636E72',
  },
  tabTextActive: {
    color: '#6C63FF',
  },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 24,
    // iOS shadow
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  input: {
    fontSize: 15,
    color: '#2D3436',
    padding: 0,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 9999,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontSize: 14,
    color: '#6C63FF',
  },
  demoHint: {
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 12,
  },
  demoText: {
    fontSize: 13,
    color: '#6C63FF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
    color: '#636E72',
  },
  linkText: {
    fontSize: 12,
    color: '#6C63FF',
  },
});
