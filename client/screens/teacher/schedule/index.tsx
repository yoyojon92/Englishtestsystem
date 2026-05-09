/**
 * 教师课程表
 * Teacher Schedule
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Screen from '@/components/Screen';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ScheduleItem {
  id: string;
  time: string;
  duration: number;
  className: string;
  level: string;
  studentCount: number;
  type: 'normal' | 'mock' | 'assessment';
  status: 'upcoming' | 'ongoing' | 'completed';
}

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function TeacherScheduleScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7);
  const [scheduleData, setScheduleData] = useState<Record<number, ScheduleItem[]>>({});

  const fetchSchedule = useCallback(async () => {
    try {
      const token = 'demo-teacher-token';
      const response = await fetch(`${API_BASE_URL}/api/v1/wecom/teacher/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.code === 0) {
        setScheduleData(result.data);
      }
    } catch (error) {
      console.error('获取课程表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [fetchSchedule])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const getTypeColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'mock': return '#EF4444';
      case 'assessment': return '#F59E0B';
      default: return '#6C63FF';
    }
  };

  const getTypeText = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'mock': return '模拟考';
      case 'assessment': return '测评';
      default: return '正常课';
    }
  };

  const getStatusText = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'ongoing': return '进行中';
      case 'completed': return '已结束';
      default: return '即将开始';
    }
  };

  const todaySchedule = scheduleData[selectedDay] || [];

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Selector */}
        <View style={styles.weekSelector}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index + 1 && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(index + 1)}
            >
              <Text style={[
                styles.dayText,
                selectedDay === index + 1 && styles.dayTextActive,
              ]}>
                {day}
              </Text>
              {selectedDay === index + 1 && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Info */}
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.scheduleCount}>
            共 {todaySchedule.length} 节课
          </Text>
        </View>

        {/* Schedule Timeline */}
        <View style={styles.timeline}>
          {todaySchedule.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="calendar-alt" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>今日无课程安排</Text>
            </View>
          ) : (
            todaySchedule.map((item, index) => (
              <View key={item.id} style={styles.scheduleItem}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.durationText}>{item.duration}分钟</Text>
                </View>

                {/* Timeline Dot */}
                <View style={styles.timelineDot}>
                  <View style={[
                    styles.dot,
                    { backgroundColor: getTypeColor(item.type) }
                  ]} />
                  {index < todaySchedule.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Content Card */}
                <TouchableOpacity 
                  style={[
                    styles.contentCard,
                    item.status === 'ongoing' && styles.contentCardActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                      <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                        {getTypeText(item.type)}
                      </Text>
                    </View>
                    {item.status !== 'completed' && (
                      <Text style={[
                        styles.statusText,
                        { color: item.status === 'ongoing' ? '#10B981' : '#6B7280' }
                      ]}>
                        {getStatusText(item.status)}
                      </Text>
                    )}
                  </View>
                  
                  <Text style={styles.className}>{item.className}</Text>
                  <Text style={styles.levelText}>{item.level}</Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.studentInfo}>
                      <FontAwesome6 name="user-friends" size={14} color="#6B7280" />
                      <Text style={styles.studentCount}>{item.studentCount}人</Text>
                    </View>
                    {item.status === 'upcoming' && (
                      <TouchableOpacity style={styles.startButton}>
                        <Text style={styles.startButtonText}>开始上课</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'ongoing' && (
                      <TouchableOpacity style={styles.reportButton}>
                        <Text style={styles.reportButtonText}>填写报告</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Month Overview */}
        <View style={styles.monthOverview}>
          <Text style={styles.sectionTitle}>本月概览</Text>
          <View style={styles.monthStats}>
            <View style={styles.monthStat}>
              <Text style={styles.monthValue}>24</Text>
              <Text style={styles.monthLabel}>总课时</Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={styles.monthValue}>156</Text>
              <Text style={styles.monthLabel}>授课人次</Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={styles.monthValue}>12</Text>
              <Text style={styles.monthLabel}>模拟考</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  weekSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayButtonActive: {
    backgroundColor: '#6C63FF',
  },
  dayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scheduleCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeline: {
    paddingHorizontal: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  durationText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timelineDot: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentCardActive: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  monthOverview: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  monthStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  monthStat: {
    flex: 1,
    alignItems: 'center',
  },
  monthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C63FF',
  },
  monthLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
