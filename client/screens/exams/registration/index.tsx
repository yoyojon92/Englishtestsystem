import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { getRegistrations, type ExamRegistration } from '@/utils/examApi';
import { useAuth } from '@/contexts/AuthContext';

const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  'PENDING': { label: '待提交', color: '#FF9800', bgColor: '#FFF3E0' },
  'SUBMITTED': { label: '已提交', color: '#2196F3', bgColor: '#E3F2FD' },
  'UNDER_REVIEW': { label: '审核中', color: '#9C27B0', bgColor: '#F3E5F5' },
  'REGISTRATION_SUCCESS': { label: '报名成功', color: '#4CAF50', bgColor: '#E8F5E9' },
  'REGISTRATION_FAILED': { label: '报名失败', color: '#F44336', bgColor: '#FFEBEE' },
  'TICKET_AVAILABLE': { label: '已出准考证', color: '#00BCD4', bgColor: '#E0F7FA' },
  'EXAM_COMPLETED': { label: '考试完成', color: '#607D8B', bgColor: '#ECEFF1' },
  'RESULT_RELEASED': { label: '成绩已出', color: '#673AB7', bgColor: '#EDE7F6' }
};

const examTypeNames: Record<string, string> = {
  'YLE_PRE_A1': 'Pre-A1 Starters',
  'YLE_A1': 'A1 Movers',
  'YLE_A2': 'A2 Flyers',
  'A2_KEY': 'A2 Key (KET)',
  'B1_PRE': 'B1 Preliminary (PET)',
  'B2_FIRST': 'B2 First (FCE)'
};

export default function ExamRegistrationScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRegistrations = async () => {
    if (!user?.currentChild?.childId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getRegistrations(user.currentChild.childId);
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
  }, [user?.currentChild?.childId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRegistrations();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getStatusInfo = (status: string) => statusMap[status] || { label: status, color: '#666', bgColor: '#f5f5f5' };

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
            {/* Quick Actions */}
            <View className="flex-row mb-4">
              <TouchableOpacity
                className="flex-1 bg-[#6C63FF] rounded-xl p-4 mr-2 items-center"
                onPress={() => router.push('/exams')}
              >
                <Text className="text-2xl mb-1">📝</Text>
                <Text className="text-white font-medium text-sm">新报名</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white rounded-xl p-4 ml-2 items-center shadow-sm"
                onPress={() => router.push('/exams/mock')}
              >
                <Text className="text-2xl mb-1">📋</Text>
                <Text className="text-gray-700 font-medium text-sm">模拟考试</Text>
              </TouchableOpacity>
            </View>

            {/* Registrations List */}
            <Text className="text-base font-bold text-gray-800 mb-3">报名记录</Text>
            
            {registrations.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl mb-4">📋</Text>
                <Text className="text-gray-500 font-medium">暂无报名记录</Text>
                <Text className="text-gray-400 text-sm mt-1 mb-4">
                  选择考试场次开始报名
                </Text>
                <TouchableOpacity
                  className="bg-[#6C63FF] px-6 py-3 rounded-xl"
                  onPress={() => router.push('/exams')}
                >
                  <Text className="text-white font-medium">去报名</Text>
                </TouchableOpacity>
              </View>
            ) : (
              registrations.map((reg) => {
                const statusInfo = getStatusInfo(reg.status);
                
                return (
                  <View key={reg.registrationId} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="font-bold text-gray-800">
                        {examTypeNames[reg.examType] || reg.examType}
                      </Text>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusInfo.bgColor }}>
                        <Text className="text-xs font-medium" style={{ color: statusInfo.color }}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Text className="text-gray-500 text-sm mr-2">📍</Text>
                      <Text className="text-gray-600 text-sm flex-1">{reg.sessionInfo?.centerName}</Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Text className="text-gray-500 text-sm mr-2">📅</Text>
                      <Text className="text-gray-600 text-sm">
                        考试日期：{reg.sessionInfo?.examDates?.[0] ? formatDate(reg.sessionInfo.examDates[0]) : '待定'}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                      <View>
                        <Text className="text-xs text-gray-400">服务类型</Text>
                        <Text className="text-sm text-gray-700">
                          {reg.serviceType === 'VIP' ? 'VIP代报名' : '基础代报名'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-gray-400">服务费</Text>
                        <Text className="text-sm font-medium text-[#6C63FF]">¥{reg.serviceFee}</Text>
                      </View>
                    </View>

                    {/* Status Actions */}
                    <View className="flex-row mt-3">
                      {reg.status === 'REGISTRATION_SUCCESS' && (
                        <TouchableOpacity
                          className="flex-1 bg-[#00BCD4] rounded-xl p-3 mr-2 items-center"
                        >
                          <Text className="text-white font-medium text-sm">下载准考证</Text>
                        </TouchableOpacity>
                      )}
                      {reg.status === 'RESULT_RELEASED' && (
                        <TouchableOpacity
                          className="flex-1 bg-[#673AB7] rounded-xl p-3 mr-2 items-center"
                        >
                          <Text className="text-white font-medium text-sm">查看成绩</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        className="flex-1 bg-gray-100 rounded-xl p-3 ml-2 items-center"
                      >
                        <Text className="text-gray-600 font-medium text-sm">详情</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Service Info */}
            <View className="bg-gradient-to-r from-[#6C63FF] to-[#FF6584] rounded-2xl p-5">
              <Text className="text-white font-bold text-base mb-2">代报名服务</Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-white/80 text-sm">基础服务</Text>
                <Text className="text-white font-bold ml-auto">¥99/次</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-white/80 text-sm">VIP服务</Text>
                <Text className="text-white font-bold ml-auto">¥199/次</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">团报优惠（3人+）</Text>
                <Text className="text-white font-bold ml-auto">¥79/人</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
