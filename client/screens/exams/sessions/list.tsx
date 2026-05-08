import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getRegistrationList, type ExamSession } from '@/utils/examApi';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: '待支付', bg: '#FFF3E0', text: '#E65100' },
  submitted: { label: '已提交', bg: '#E3F2FD', text: '#1565C0' },
  reviewing: { label: '审核中', bg: '#E3F2FD', text: '#1565C0' },
  success: { label: '报名成功', bg: '#E8F5E9', text: '#2E7D32' },
  failed: { label: '报名失败', bg: '#FFEBEE', text: '#C62828' },
  ticket_ready: { label: '可下载准考证', bg: '#F3E5F5', text: '#7B1FA2' },
  completed: { label: '已完成考试', bg: '#F5F5F5', text: '#666' },
  result_ready: { label: '成绩已出', bg: '#E8F5E9', text: '#2E7D32' }
};

export default function RegistrationListScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRegistrations = async () => {
    if (!user?.id) return;
    try {
      const data = await getRegistrationList({ userId: user.id });
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRegistrations();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getNextStep = (registration: any) => {
    switch (registration.status) {
      case 'pending':
        return { label: '立即支付', action: () => {} };
      case 'submitted':
      case 'reviewing':
        return { label: '等待审核', action: null };
      case 'success':
        return { label: '查看详情', action: () => {} };
      case 'ticket_ready':
        return { label: '下载准考证', action: () => {} };
      case 'result_ready':
        return { label: '查看成绩', action: () => router.push('/exams/mock') };
      default:
        return { label: '', action: null };
    }
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 text-lg">‹</Text>
            </TouchableOpacity>
            <Text className="ml-3 text-lg font-bold text-gray-800">我的报名</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
          }
        >
          <View className="p-4">
            {registrations.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-5xl mb-4">📝</Text>
                <Text className="text-gray-600 font-medium">暂无报名记录</Text>
                <Text className="text-gray-400 text-sm mt-2">
                  快去选择考试场次报名吧
                </Text>
                <TouchableOpacity
                  className="mt-6 px-6 py-3 rounded-full bg-[#6C63FF]"
                  onPress={() => router.push('/exams')}
                >
                  <Text className="text-white font-medium">查看考试</Text>
                </TouchableOpacity>
              </View>
            ) : (
              registrations.map((reg) => {
                const status = statusConfig[reg.status] || statusConfig.pending;
                const session = reg.session as ExamSession;
                const nextStep = getNextStep(reg);

                return (
                  <View key={reg.registrationId} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    {/* Status Badge */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View 
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: status.bg }}
                      >
                        <Text className="text-xs font-medium" style={{ color: status.text }}>
                          {status.label}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        报名号：{reg.registrationId.slice(-8).toUpperCase()}
                      </Text>
                    </View>

                    {/* Exam Info */}
                    <View className="mb-3">
                      <Text className="font-bold text-gray-800 text-lg">{reg.exam?.examName}</Text>
                      {session && (
                        <>
                          <View className="flex-row items-center mt-2">
                            <Text className="text-gray-400 mr-2">📍</Text>
                            <Text className="text-sm text-gray-600">{session.centerName}</Text>
                          </View>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-gray-400 mr-2">📅</Text>
                            <Text className="text-sm text-gray-600">考试日期：{formatDate(session.examDate)}</Text>
                          </View>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-gray-400 mr-2">📋</Text>
                            <Text className="text-sm text-gray-600">
                              {session.examType === 'paper' ? '纸笔考试' : '机考'}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Student Info */}
                    <View className="bg-gray-50 rounded-xl p-3 mb-3">
                      <Text className="text-sm text-gray-500 mb-1">考生信息</Text>
                      <Text className="text-gray-800">
                        {reg.studentInfo?.name} · {reg.studentInfo?.gender === 'male' ? '男' : '女'} · {reg.studentInfo?.birthDate}
                      </Text>
                    </View>

                    {/* Fee */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm text-gray-500">服务费</Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm text-gray-500 mr-2">
                          {reg.serviceType === 'vip' ? 'VIP' : '基础'} ¥{reg.serviceFee}
                        </Text>
                        {reg.serviceType === 'vip' && (
                          <View className="px-2 py-0.5 rounded-full bg-[#FF6584]/10">
                            <Text className="text-xs text-[#FF6584]">VIP</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Action */}
                    {nextStep.label && nextStep.action && (
                      <TouchableOpacity
                        className="p-3 rounded-xl bg-[#6C63FF] items-center"
                        onPress={nextStep.action}
                      >
                        <Text className="text-white font-medium">{nextStep.label}</Text>
                      </TouchableOpacity>
                    )}
                    {nextStep.label && !nextStep.action && (
                      <View className="p-3 rounded-xl bg-gray-100 items-center">
                        <Text className="text-gray-400 font-medium">{nextStep.label}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
