import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { confirmRegistration, getRegistrationDetail } from '@/utils/examApi';

export default function RegistrationSuccessScreen() {
  const router = useSafeRouter();
  const { sessionId, examName } = useSafeSearchParams<{ sessionId: string; examName: string }>();
  const [status, setStatus] = useState<'confirming' | 'success' | 'failed'>('confirming');
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    const processRegistration = async () => {
      // 模拟支付和确认流程
      try {
        // 等待状态更新
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const data = await confirmRegistration(sessionId);
        setRegistration(data);
        
        // 再等待状态流转
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setStatus('success');
      } catch (error) {
        console.error('Registration failed:', error);
        setStatus('failed');
      }
    };

    if (sessionId) {
      processRegistration();
    }
  }, [sessionId]);

  const handleGoHome = () => {
    router.replace('/(tabs)/index');
  };

  const handleViewDetails = () => {
    if (registration) {
      router.push('/exams/registration');
    }
  };

  return (
    <Screen>
      <View className="flex-1 bg-white items-center justify-center p-6">
        {status === 'confirming' && (
          <View className="items-center">
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text className="text-xl font-bold text-gray-800 mt-6">正在提交报名...</Text>
            <Text className="text-gray-500 mt-2 text-center">
              请稍候，我们正在为你处理报名信息
            </Text>
            <View className="mt-8 w-64">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Text className="text-green-600">✓</Text>
                </View>
                <Text className="text-gray-600">信息提交完成</Text>
              </View>
              <View className="flex-row items-center mb-3">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${status !== 'confirming' ? 'bg-green-100' : 'bg-[#6C63FF]/20'}`}>
                  <Text className={status !== 'confirming' ? 'text-green-600' : 'text-[#6C63FF]'}>✓</Text>
                </View>
                <Text className="text-gray-600">报名审核中</Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${status === 'success' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={status === 'success' ? 'text-green-600' : 'text-gray-400'}>✓</Text>
                </View>
                <Text className="text-gray-600">报名成功</Text>
              </View>
            </View>
          </View>
        )}

        {status === 'success' && (
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
              <Text className="text-5xl">🎉</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">报名成功！</Text>
            <Text className="text-gray-500 mt-2 text-center">
              {examName}
            </Text>
            
            <View className="mt-8 p-4 bg-gray-50 rounded-xl w-full">
              <Text className="text-sm text-gray-500 mb-3">温馨提示</Text>
              <View className="space-y-2">
                <View className="flex-row items-start">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600 flex-1">请留意短信通知，我们会及时推送报名状态更新</Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600 flex-1">考前一周可下载准考证</Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-gray-400 mr-2">•</Text>
                  <Text className="text-sm text-gray-600 flex-1">考试前我们会发送考前注意事项</Text>
                </View>
              </View>
            </View>

            <View className="mt-8 space-y-3 w-full">
              <View 
                className="p-4 rounded-xl bg-[#6C63FF]"
                onTouchEnd={handleGoHome}
              >
                <Text className="text-white font-bold text-center">返回首页</Text>
              </View>
              <View 
                className="p-4 rounded-xl bg-gray-100"
                onTouchEnd={handleViewDetails}
              >
                <Text className="text-gray-700 font-bold text-center">查看报名详情</Text>
              </View>
            </View>
          </View>
        )}

        {status === 'failed' && (
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-6">
              <Text className="text-5xl">😔</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">报名遇到问题</Text>
            <Text className="text-gray-500 mt-2 text-center">
              请稍后重试或联系客服
            </Text>
            
            <View className="mt-8 space-y-3 w-full">
              <View 
                className="p-4 rounded-xl bg-[#6C63FF]"
                onTouchEnd={handleGoHome}
              >
                <Text className="text-white font-bold text-center">返回首页</Text>
              </View>
              <View 
                className="p-4 rounded-xl bg-gray-100"
                onTouchEnd={() => router.back()}
              >
                <Text className="text-gray-700 font-bold text-center">重新报名</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
