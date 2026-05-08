import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { reportApi } from '@/utils/reportApi';
import { Screen } from '@/components/Screen';

export default function ReportDetailScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const { reportId } = useSafeSearchParams<{ reportId: string }>();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportDetail();
  }, [reportId]);

  const loadReportDetail = async () => {
    try {
      const data = await reportApi.getReportDetail(token, reportId!);
      setReport(data.report);
    } catch (error) {
      console.error('Load report detail error:', error);
      Alert.alert('错误', '加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `我在英语能力测评中获得${report?.overallScore}分，剑桥等级${report?.cambridgeLevel}！快来和我一起学习英语吧！`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#2196F3';
    if (score >= 55) return '#FF9800';
    return '#F44336';
  };

  const getSkillLabel = (skill: string) => {
    const labels: Record<string, string> = {
      listening: '听力',
      reading: '阅读',
      writing: '写作',
      speaking: '口语',
    };
    return labels[skill] || skill;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading || !report) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  const skillScores = [
    { name: 'listening', score: report.listeningScore, label: '听力' },
    { name: 'reading', score: report.readingScore, label: '阅读' },
    { name: 'writing', score: report.writingScore, label: '写作' },
    { name: 'speaking', score: report.speakingScore, label: '口语' },
  ];

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[getLevelColor(report.cambridgeLevel), `${getLevelColor(report.cambridgeLevel)}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>剑桥英语能力等级</Text>
            <Text style={styles.heroLevel}>{report.cambridgeLevel}</Text>
            <View style={styles.heroScoreContainer}>
              <Text style={styles.heroScore}>{report.overallScore}</Text>
              <Text style={styles.heroScoreLabel}>综合得分</Text>
            </View>
            <Text style={styles.heroDate}>{formatDate(report.createdAt)}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Skill Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分项得分</Text>
            <View style={styles.skillsContainer}>
              {skillScores.map((skill) => (
                <View key={skill.name} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillLabel}>{skill.label}</Text>
                    <Text
                      style={[
                        styles.skillScore,
                        { color: getScoreColor(skill.score) },
                      ]}
                    >
                      {skill.score}%
                    </Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View
                      style={[
                        styles.skillFill,
                        {
                          width: `${skill.score}%`,
                          backgroundColor: getScoreColor(skill.score),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Strengths */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>优势领域</Text>
              <View style={styles.strengthBadge}>
                <Text style={styles.strengthBadgeText}>💪</Text>
              </View>
            </View>
            <View style={styles.listCard}>
              {report.strengths.map((strength: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listBullet}>
                    <Text style={styles.listBulletText}>✓</Text>
                  </View>
                  <Text style={styles.listText}>{strength}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weaknesses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>提升空间</Text>
              <View style={styles.improveBadge}>
                <Text style={styles.improveBadgeText}>📈</Text>
              </View>
            </View>
            <View style={styles.listCard}>
              {report.weaknesses.map((weakness: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listBulletWeak}>
                    <Text style={styles.listBulletTextWeak}>→</Text>
                  </View>
                  <Text style={styles.listText}>{weakness}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>学习建议</Text>
            <View style={styles.recommendationsContainer}>
              {report.recommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recCard}>
                  <View style={styles.recNumber}>
                    <Text style={styles.recNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Text style={styles.shareIcon}>📤</Text>
              <Text style={styles.shareButtonText}>分享报告</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.retestButton}
              onPress={() => router.push('/assessment-start')}
            >
              <LinearGradient
                colors={['#6C63FF', '#896BFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.retestGradient}
              >
                <Text style={styles.retestButtonText}>再次测评</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Suggested Courses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>推荐课程</Text>
              <TouchableOpacity onPress={() => router.push('/courses')}>
                <Text style={styles.sectionMore}>查看全部</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.courseCard}
              onPress={() => router.push('/courses-detail', { courseId: report.cambridgeLevel + '-course' })}
            >
              <View style={styles.courseContent}>
                <View
                  style={[
                    styles.courseLevel,
                    { backgroundColor: `${getLevelColor(report.cambridgeLevel)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.courseLevelText,
                      { color: getLevelColor(report.cambridgeLevel) },
                    ]}
                  >
                    {report.cambridgeLevel}
                  </Text>
                </View>
                <Text style={styles.courseTitle}>
                  {report.cambridgeLevel} 级别系统课程
                </Text>
                <Text style={styles.courseDesc}>
                  专为{report.cambridgeLevel}级别学员设计，系统提升英语能力
                </Text>
              </View>
              <View style={styles.courseArrow}>
                <Text style={styles.courseArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
  },
  heroGradient: {
    paddingTop: 100,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  heroLevel: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  heroScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  heroScore: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroScoreLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  heroDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    padding: 20,
  },
  section: {
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
  strengthBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76,175,80,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthBadgeText: {
    fontSize: 14,
  },
  improveBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,152,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  improveBadgeText: {
    fontSize: 14,
  },
  skillsContainer: {
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
  skillCard: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  skillScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  skillBar: {
    height: 10,
    backgroundColor: '#E8E8EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 5,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listBulletText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  listBulletWeak: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,152,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listBulletTextWeak: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9800',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  recNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  shareIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  retestButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  retestGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  retestButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  courseContent: {
    flex: 1,
  },
  courseLevel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  courseLevelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: '#636E72',
  },
  courseArrow: {
    marginLeft: 12,
  },
  courseArrowText: {
    fontSize: 20,
    color: '#B2BEC3',
  },
  bottomPadding: {
    height: 120,
  },
});
