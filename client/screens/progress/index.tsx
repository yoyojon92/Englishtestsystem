import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { progressApi } from '@/utils/progressApi';
import { courseApi } from '@/utils/courseApi';
import { Screen } from '@/components/Screen';

interface LearningProgress {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  currentStreak: number;
  enrolledCourses: Array<{
    id: string;
    courseId: string;
    courseName: string;
    cambridgeLevel: string;
    progress: number;
    currentLesson: number;
    totalLessons: number;
    lastStudyDate: string;
  }>;
}

export default function ProgressScreen() {
  const router = useSafeRouter();
  const { token, user } = useAuth();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [progressData, coursesData] = await Promise.all([
        progressApi.getProgress(token),
        courseApi.getEnrolledCourses(token),
      ]);
      
      setProgress({
        ...progressData,
        enrolledCourses: coursesData.enrolledCourses || [],
      });
    } catch (error) {
      console.error('Load progress error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Pre-A1': '#4CAF50',
      'A1': '#2196F3',
      'A2': '#9C27B0',
      'B1': '#FF9800',
      'B2': '#F44336',
    };
    return colors[level] || '#6C63FF';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '暂无学习记录';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#2196F3';
    if (progress >= 25) return '#FF9800';
    return '#6C63FF';
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>学习进度</Text>
          <Text style={styles.subtitle}>
            {user?.name || '学员'}的学习之旅
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardLarge]}>
                <LinearGradient
                  colors={['#6C63FF', '#896BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Text style={styles.statEmoji}>📚</Text>
                  <Text style={styles.statValue}>
                    {progress?.enrolledCourses.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>在学课程</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statsRight}>
                <View style={[styles.statCard, styles.statCardSmall]}>
                  <LinearGradient
                    colors={['#FF6584', '#FF8A65']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  >
                    <Text style={styles.statEmojiSmall}>🔥</Text>
                    <Text style={styles.statValueSmall}>
                      {progress?.currentStreak || 0}
                    </Text>
                    <Text style={styles.statLabelSmall}>连续学习</Text>
                  </LinearGradient>
                </View>
                
                <View style={[styles.statCard, styles.statCardSmall]}>
                  <LinearGradient
                    colors={['#4CAF50', '#8BC34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  >
                    <Text style={styles.statEmojiSmall}>⏱️</Text>
                    <Text style={styles.statValueSmall}>
                      {progress?.totalHours || 0}
                    </Text>
                    <Text style={styles.statLabelSmall}>学习时长</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </View>

          {/* Learning Streak */}
          <View style={styles.section}>
            <View style={styles.streakCard}>
              <View style={styles.streakLeft}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <View>
                  <Text style={styles.streakValue}>
                    {progress?.currentStreak || 0}天
                  </Text>
                  <Text style={styles.streakLabel}>学习连续天数</Text>
                </View>
              </View>
              <View style={styles.streakDays}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.streakDay,
                      day <= (progress?.currentStreak || 0) % 7 && styles.streakDayActive,
                    ]}
                  >
                    <Text style={styles.streakDayText}>
                      {['一', '二', '三', '四', '五', '六', '日'][day - 1]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Enrolled Courses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>在学课程</Text>
              <TouchableOpacity onPress={() => router.push('/courses')}>
                <Text style={styles.sectionMore}>全部</Text>
              </TouchableOpacity>
            </View>

            {(!progress?.enrolledCourses || progress.enrolledCourses.length === 0) && (
              <View style={styles.emptyCourses}>
                <Text style={styles.emptyEmoji}>📖</Text>
                <Text style={styles.emptyTitle}>还没有在学的课程</Text>
                <Text style={styles.emptyText}>去挑选一门感兴趣的课程吧</Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/courses')}
                >
                  <Text style={styles.exploreButtonText}>探索课程</Text>
                </TouchableOpacity>
              </View>
            )}

            {progress?.enrolledCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push('/courses-detail', { courseId: course.courseId })}
              >
                <View style={styles.courseHeader}>
                  <View>
                    <View style={styles.courseTitleRow}>
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: `${getLevelColor(course.cambridgeLevel)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelBadgeText,
                            { color: getLevelColor(course.cambridgeLevel) },
                          ]}
                        >
                          {course.cambridgeLevel}
                        </Text>
                      </View>
                      <Text style={styles.courseTitle} numberOfLines={1}>
                        {course.courseName}
                      </Text>
                    </View>
                    <Text style={styles.courseInfo}>
                      第{course.currentLesson}/{course.totalLessons}课时 · {formatDate(course.lastStudyDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[getProgressColor(course.progress), `${getProgressColor(course.progress)}CC`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${course.progress}%` }]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: getProgressColor(course.progress) }]}>
                    {course.progress}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>学习工具</Text>
            
            <View style={styles.toolsGrid}>
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push('/assessment-start')}
              >
                <Text style={styles.toolEmoji}>🎯</Text>
                <Text style={styles.toolTitle}>能力测评</Text>
                <Text style={styles.toolDesc}>了解当前水平</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push('/reports')}
              >
                <Text style={styles.toolEmoji}>📊</Text>
                <Text style={styles.toolTitle}>学习报告</Text>
                <Text style={styles.toolDesc}>查看学习数据</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push('/courses')}
              >
                <Text style={styles.toolEmoji}>📚</Text>
                <Text style={styles.toolTitle}>课程中心</Text>
                <Text style={styles.toolDesc}>继续系统学习</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => Alert.alert('提示', '学习社区开发中')}
              >
                <Text style={styles.toolEmoji}>👥</Text>
                <Text style={styles.toolTitle}>学习社区</Text>
                <Text style={styles.toolDesc}>与同学交流</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Screen>
  );
}

// Import Alert at the top level
import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  statCardLarge: {
    flex: 1.2,
  },
  statsRight: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statEmojiSmall: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabelSmall: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  sectionMore: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  streakLabel: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 2,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: {
    backgroundColor: '#FF9800',
  },
  streakDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
  },
  emptyCourses: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  courseHeader: {
    marginBottom: 16,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  courseInfo: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toolEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 12,
    color: '#636E72',
  },
  bottomPadding: {
    height: 120,
  },
});
