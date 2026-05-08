import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { reportApi } from '@/utils/reportApi';
import { courseApi } from '@/utils/courseApi';
import { Screen } from '@/components/Screen';

export default function AssessmentResultScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const { score, reportId } = useSafeSearchParams<{ score: string; reportId: string }>();
  
  const [report, setReport] = useState<any>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    if (!token || !reportId) {
      setLoading(false);
      return;
    }

    try {
      const data = await reportApi.getReportDetail(token, reportId);
      setReport(data.report);
      setRecommendedCourses(data.recommendedCourses || []);
    } catch (error) {
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return ['#4CAF50', '#8BC34A'];
    if (score >= 70) return ['#2196F3', '#03A9F4'];
    if (score >= 55) return ['#FF9800', '#FFB74D'];
    return ['#F44336', '#EF5350'];
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    return 'D';
  };

  const scoreNum = parseInt(score || '0');

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Result Header */}
        <View style={styles.header}>
          <Text style={styles.congratsText}>🎉 测评完成！</Text>
          <Text style={styles.subtitle}>
            恭喜你完成了英语能力测评
          </Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={getScoreColor(scoreNum)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreContent}>
              <View style={styles.scoreMain}>
                <Text style={styles.scoreNumber}>{scoreNum}</Text>
                <Text style={styles.scoreUnit}>分</Text>
              </View>
              <View style={styles.scoreGrade}>
                <Text style={styles.gradeLabel}>等级</Text>
                <Text style={styles.gradeValue}>{getScoreGrade(scoreNum)}</Text>
              </View>
            </View>
            
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>剑桥等级</Text>
              <Text style={styles.levelValue}>{report?.cambridgeLevel || '待定'}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Skills Breakdown */}
        {report && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>能力分析</Text>
            
            <View style={styles.skillsGrid}>
              {[
                { name: '听力', nameEn: 'Listening', score: report.listeningScore, color: '#2196F3' },
                { name: '阅读', nameEn: 'Reading', score: report.readingScore, color: '#4CAF50' },
                { name: '写作', nameEn: 'Writing', score: report.writingScore, color: '#FF9800' },
                { name: '口语', nameEn: 'Speaking', score: report.speakingScore, color: '#9C27B0' },
              ].map((skill) => (
                <View key={skill.name} style={styles.skillCard}>
                  <View style={[styles.skillHeader, { backgroundColor: `${skill.color}20` }]}>
                    <Text style={[styles.skillName, { color: skill.color }]}>{skill.name}</Text>
                    <Text style={styles.skillScore}>{skill.score}%</Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View
                      style={[
                        styles.skillBarFill,
                        { width: `${skill.score}%`, backgroundColor: skill.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Strengths & Weaknesses */}
        {report && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>详细分析</Text>
            
            <View style={styles.analysisCard}>
              <View style={styles.analysisRow}>
                <View style={[styles.analysisIcon, { backgroundColor: 'rgba(76,175,80,0.15)' }]}>
                  <Text style={styles.analysisEmoji}>💪</Text>
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisTitle}>优势领域</Text>
                  {report.strengths?.slice(0, 2).map((item: string, index: number) => (
                    <Text key={index} style={styles.analysisText}>• {item}</Text>
                  ))}
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.analysisRow}>
                <View style={[styles.analysisIcon, { backgroundColor: 'rgba(255,152,0,0.15)' }]}>
                  <Text style={styles.analysisEmoji}>📚</Text>
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisTitle}>待提升领域</Text>
                  {report.weaknesses?.slice(0, 2).map((item: string, index: number) => (
                    <Text key={index} style={styles.analysisText}>• {item}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {report && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>学习建议</Text>
            
            <View style={styles.recommendCard}>
              {report.nextSteps?.map((step: string, index: number) => (
                <View key={index} style={styles.recommendItem}>
                  <View style={styles.recommendNumber}>
                    <Text style={styles.recommendNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.recommendText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>推荐课程</Text>
              <TouchableOpacity onPress={() => router.push('/courses')}>
                <Text style={styles.sectionMore}>查看全部</Text>
              </TouchableOpacity>
            </View>
            
            {recommendedCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push('/courses-detail', { courseId: course.id })}
              >
                <View style={styles.courseContent}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.courseMeta}>
                    <Text style={styles.courseLevel}>{course.cambridgeLevel}</Text>
                    <Text style={styles.courseDot}>•</Text>
                    <Text style={styles.courseDuration}>{course.duration}周</Text>
                  </View>
                </View>
                <View style={styles.coursePrice}>
                  <Text style={styles.priceText}>¥{course.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>返回首页</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/courses')}
          >
            <Text style={styles.secondaryButtonText}>浏览课程</Text>
          </TouchableOpacity>
        </View>

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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 8,
  },
  scoreCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 24,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreUnit: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    marginLeft: 4,
  },
  scoreGrade: {
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  gradeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  levelInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  levelLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  levelValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  sectionMore: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
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
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700',
  },
  skillScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  skillBar: {
    height: 6,
    backgroundColor: '#E8E8EB',
  },
  skillBarFill: {
    height: '100%',
  },
  analysisCard: {
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
  analysisRow: {
    flexDirection: 'row',
  },
  analysisIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analysisEmoji: {
    fontSize: 24,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F3',
    marginVertical: 16,
  },
  recommendCard: {
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
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  recommendText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  courseContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseLevel: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },
  courseDot: {
    fontSize: 12,
    color: '#B2BEC3',
    marginHorizontal: 6,
  },
  courseDuration: {
    fontSize: 12,
    color: '#636E72',
  },
  coursePrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,101,132,0.1)',
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6584',
  },
  actions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  bottomPadding: {
    height: 120,
  },
});
