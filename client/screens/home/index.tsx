import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentApi } from '@/utils/assessmentApi';
import { courseApi } from '@/utils/courseApi';
import { reportApi } from '@/utils/reportApi';
import { Screen } from '@/components/Screen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useSafeRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!token) return;
    
    try {
      // Load assessment levels
      const levelsData = await assessmentApi.getAssessmentLevels();
      setLevels(levelsData.levels || []);
      
      // Load latest report
      try {
        const reportData = await reportApi.getLatestReport(token);
        setLatestReport(reportData.report);
        setRecommendedCourses(reportData.recommendedCourses || []);
      } catch (e) {
        console.log('No report yet');
      }
    } catch (error) {
      console.error('Load home data error:', error);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string[]> = {
      'Pre-A1': ['#4CAF50', '#8BC34A'],
      'A1': ['#2196F3', '#03A9F4'],
      'A2': ['#9C27B0', '#E91E63'],
      'B1': ['#FF9800', '#FF5722'],
      'B2': ['#F44336', '#E91E63'],
    };
    return colors[level] || ['#6C63FF', '#896BFF'];
  };

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>你好，{user?.name || '家长'}</Text>
            <Text style={styles.subtitle}>今天想学什么呢？</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/assessment-start')}
          >
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🎯</Text>
              </View>
              <Text style={styles.actionTitle}>能力测评</Text>
              <Text style={styles.actionDesc}>了解英语水平</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/courses')}
          >
            <View style={styles.actionSecondary}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,101,132,0.15)' }]}>
                <Text style={styles.actionEmoji}>📚</Text>
              </View>
              <Text style={styles.actionTitleSecondary}>精选课程</Text>
              <Text style={styles.actionDescSecondary}>系统学习</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/reports')}
          >
            <View style={styles.actionSecondary}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,184,148,0.15)' }]}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionTitleSecondary}>学习报告</Text>
              <Text style={styles.actionDescSecondary}>查看进度</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/exams')}
          >
            <View style={styles.actionSecondary}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,152,0,0.15)' }]}>
                <Text style={styles.actionEmoji}>🏆</Text>
              </View>
              <Text style={styles.actionTitleSecondary}>剑桥考试</Text>
              <Text style={styles.actionDescSecondary}>报名通道</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/free-courses')}
          >
            <View style={styles.actionSecondary}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(14,165,233,0.15)' }]}>
                <Text style={styles.actionEmoji}>🎓</Text>
              </View>
              <Text style={styles.actionTitleSecondary}>免费课程</Text>
              <Text style={styles.actionDescSecondary}>学习更多</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Latest Report Summary */}
        {latestReport ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>最新测评报告</Text>
              <TouchableOpacity onPress={() => router.push('/reports')}>
                <Text style={styles.sectionMore}>查看全部</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.reportCard}
              onPress={() => router.push('/reports-detail', { reportId: latestReport.id })}
            >
              <LinearGradient
                colors={getLevelColor(latestReport.cambridgeLevel)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.reportGradient}
              >
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportLevel}>{latestReport.cambridgeLevel}</Text>
                    <Text style={styles.reportLevelName}>剑桥等级</Text>
                  </View>
                  <View style={styles.reportScore}>
                    <Text style={styles.reportScoreNum}>{latestReport.overallScore}</Text>
                    <Text style={styles.reportScoreText}>综合得分</Text>
                  </View>
                </View>
                
                <View style={styles.reportSkills}>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillLabel}>听力</Text>
                    <Text style={styles.skillValue}>{latestReport.listeningScore}%</Text>
                  </View>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillLabel}>阅读</Text>
                    <Text style={styles.skillValue}>{latestReport.readingScore}%</Text>
                  </View>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillLabel}>写作</Text>
                    <Text style={styles.skillValue}>{latestReport.writingScore}%</Text>
                  </View>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillLabel}>口语</Text>
                    <Text style={styles.skillValue}>{latestReport.speakingScore}%</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>开始你的测评</Text>
            </View>
            
            <TouchableOpacity
              style={styles.startAssessmentCard}
              onPress={() => router.push('/assessment-start')}
            >
              <LinearGradient
                colors={['#6C63FF', '#896BFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}
              >
                <View style={styles.startContent}>
                  <Text style={styles.startTitle}>完成英语能力测评</Text>
                  <Text style={styles.startDesc}>
                    只需15分钟，了解孩子的真实英语水平
                  </Text>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>立即测评</Text>
                  </View>
                </View>
                <Text style={styles.startEmoji}>🎯</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Cambridge Levels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>剑桥等级体系</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>了解更多</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelsContainer}
          >
            {levels.map((level, index) => (
              <TouchableOpacity
                key={level.code}
                style={styles.levelCard}
                onPress={() => router.push('/assessment/start', { level: level.code })}
              >
                <LinearGradient
                  colors={getLevelColor(level.code)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.levelGradient}
                >
                  <Text style={styles.levelCode}>{level.code}</Text>
                  <Text style={styles.levelName}>{level.name.split(' ')[1]?.replace(/[()]/g, '')}</Text>
                  <Text style={styles.levelAge}>年龄 {level.age}</Text>
                </LinearGradient>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelDesc} numberOfLines={2}>{level.description}</Text>
                  <Text style={styles.levelExam}>{level.examType}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>推荐课程</Text>
              <TouchableOpacity onPress={() => router.push('/courses')}>
                <Text style={styles.sectionMore}>查看全部</Text>
              </TouchableOpacity>
            </View>
            
            {recommendedCourses.slice(0, 2).map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push('/courses/detail', { courseId: course.id })}
              >
                <Image
                  source={{ uri: course.coverImage }}
                  style={styles.courseImage}
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <View style={styles.courseMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(course.cambridgeLevel)[0]}20` }]}>
                      <Text style={[styles.levelBadgeText, { color: getLevelColor(course.cambridgeLevel)[0] }]}>
                        {course.cambridgeLevel}
                      </Text>
                    </View>
                    <Text style={styles.coursePrice}>¥{course.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    flex: 1,
  },
  actionGradient: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  actionTitleSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  actionDescSecondary: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  reportCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reportGradient: {
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  reportLevel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reportLevelName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  reportScore: {
    alignItems: 'flex-end',
  },
  reportScoreNum: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reportScoreText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  reportSkills: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillItem: {
    alignItems: 'center',
  },
  skillLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  skillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  startAssessmentCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    flex: 1,
  },
  startTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  startDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  startEmoji: {
    fontSize: 48,
    marginLeft: 16,
  },
  levelsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  levelCard: {
    width: width * 0.4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  levelGradient: {
    padding: 16,
    alignItems: 'center',
  },
  levelCode: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  levelAge: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  levelInfo: {
    padding: 12,
  },
  levelDesc: {
    fontSize: 12,
    color: '#636E72',
    lineHeight: 18,
  },
  levelExam: {
    fontSize: 11,
    color: '#6C63FF',
    marginTop: 8,
    fontWeight: '600',
  },
  courseCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6584',
  },
  bottomPadding: {
    height: 120,
  },
});
