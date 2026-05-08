/**
 * 家长端消息通知页面
 * screens/notifications/index.tsx
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';

// 通知类型图标映射
const TYPE_ICONS: Record<string, string> = {
  'assessment_complete': '📊',
  'exam_reminder': '📝',
  'course_update': '📚',
  'report_ready': '🎯',
  'system': '🔔',
  'payment': '💰',
};

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'assessment_complete',
      title: '测评报告已生成',
      content: '小明的能力测评报告已完成，点击查看详细分析和建议',
      isRead: false,
      createdAt: '2024-01-15 14:30',
    },
    {
      id: '2',
      type: 'exam_reminder',
      title: 'KET 考试提醒',
      content: '距离 KET 考试还有 14 天，请确认准考证已下载',
      isRead: false,
      createdAt: '2024-01-15 09:00',
    },
    {
      id: '3',
      type: 'report_ready',
      title: '课后评估报告',
      content: '李老师的课后评估报告已生成，综合表现优秀',
      isRead: true,
      createdAt: '2024-01-14 18:45',
    },
    {
      id: '4',
      type: 'course_update',
      title: '新课程已上线',
      content: 'KET 冲刺班新课程已上线，早鸟价优惠中',
      isRead: true,
      createdAt: '2024-01-13 10:00',
    },
    {
      id: '5',
      type: 'payment',
      title: '支付成功',
      content: '您的 KET 冲刺包购买成功，共 8 次模拟考试',
      isRead: true,
      createdAt: '2024-01-12 15:30',
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: 调用 API 获取通知列表
    // const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/notifications`);
    // const data = await response.json();
    // setNotifications(data);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    // TODO: 调用 API 标记已读
    // await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/notifications/${id}/read`, { method: 'PUT' });
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // TODO: 调用 API 全部标记已读
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return timeStr.substring(5, 10);
  };

  return (
    <Screen>
      {/* 头部 */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-900">消息中心</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text className="text-sm text-indigo-600">全部已读</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 筛选标签 */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full ${
              filter === 'all' ? 'bg-indigo-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm ${
              filter === 'all' ? 'text-white' : 'text-gray-600'
            }`}>
              全部 {notifications.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full ${
              filter === 'unread' ? 'bg-indigo-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm ${
              filter === 'unread' ? 'text-white' : 'text-gray-600'
            }`}>
              未读 {unreadCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 通知列表 */}
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-4">🔔</Text>
            <Text className="text-gray-500">暂无消息</Text>
          </View>
        ) : (
          filteredNotifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleMarkAsRead(notification.id)}
              className={`mx-4 mt-3 p-4 bg-white rounded-2xl shadow-sm ${
                notification.isRead ? 'opacity-70' : ''
              }`}
            >
              <View className="flex-row">
                {/* 图标 */}
                <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                  <Text className="text-xl">{TYPE_ICONS[notification.type] || '📢'}</Text>
                </View>

                {/* 内容 */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`font-semibold ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && (
                      <View className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </View>
                  <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
                    {notification.content}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}
