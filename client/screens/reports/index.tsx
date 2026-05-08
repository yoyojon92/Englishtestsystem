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
import { reportApi } from '@/utils/reportApi';
import { assessmentApi } from '@/utils/assessmentApi';
import { Screen } from '@/components/Screen';

interface Report {
  id: string;
  assessmentId: string;
  cambridgeLevel: string;
  overallScore: number;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
  assessment?: any;
}

export default function ReportsScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await reportApi.getReports(token);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Load reports error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#2196F3';
    if (score >= 55) return '#FF9800';
    return '#F44336';
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

  const latestReport = reports[0];

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>学习报告</Text>
          <Text style={styles.subtitle}>记录成长每一步</Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Latest Report Summary */}
          {latestReport && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最新报告</Text>
                <TouchableOpacity onPress={() => router.push('/assessment-start')}>
                  <Text style={styles.sectionMore}>新测评</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.latestCard}
                onPress={() => router.push('/reports/detail', { reportId: latestReport.id })}
              >
                <LinearGradient
                  colors={[getLevelColor(latestReport.cambridgeLevel), `${getLevelColor(latestReport.cambridgeLevel)}CC`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.latestGradient}
                >
                  <View style={styles.latestHeader}>
                    <View>
                      <Text style={styles.latestLevel}>{latestReport.cambridgeLevel}</Text>
                      <Text style={styles.latestDate}>{formatDate(latestReport.createdAt)}</Text>
                    </View>
                    <View style={styles.latestScore}>
                      <Text style={styles.latestScoreNum}>{latestReport.overallScore}</Text>
                      <Text style={styles.latestScoreLabel}>综合得分</Text>
                    </View>
                  </View>
                  
                  <View style={styles.skillsOverview}>
                    <View style={styles.skillOverviewItem}>
                      <Text style={styles.skillOverviewLabel}>听力</Text>
                      <View style={styles.skillOverviewBar}>
                        <View
                          style={[
                            styles.skillOverviewFill,
                            { width: `${latestReport.listeningScore}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.skillOverviewValue}>{latestReport.listeningScore}%</Text>
                    </View>
                    <View style={styles.skillOverviewItem}>
                      <Text style={styles.skillOverviewLabel}>阅读</Text>
                      <View style={styles.skillOverviewBar}>
                        <View
                          style={[
                            styles.skillOverviewFill,
                            { width: `${latestReport.readingScore}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.skillOverviewValue}>{latestReport.readingScore}%</Text>
                    </View>
                    <View style={styles.skillOverviewItem}>
                      <Text style={styles.skillOverviewLabel}>写作</Text>
                      <View style={styles.skillOverviewBar}>
                        <View
                          style={[
                            styles.skillOverviewFill,
                            { width: `${latestReport.writingScore}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.skillOverviewValue}>{latestReport.writingScore}%</Text>
                    </View>
                    <View style={styles.skillOverviewItem}>
                      <Text style={styles.skillOverviewLabel}>口语</Text>
                      <View style={styles.skillOverviewBar}>
                        <View
                          style={[
                            styles.skillOverviewFill,
                            { width: `${latestReport.speakingScore}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.skillOverviewValue}>{latestReport.speakingScore}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.latestFooter}>
                    <Text style={styles.latestFooterText}>点击查看完整报告</Text>
                    <Text style={styles.latestFooterArrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* No Reports State */}
          {!loading && reports.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>暂无测评报告</Text>
              <Text style={styles.emptyText}>
                完成英语能力测评后，这里将展示你的学习报告
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push('/assessment-start')}
              >
                <LinearGradient
                  colors={['#6C63FF', '#896BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Text style={styles.startButtonText}>开始测评</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Report History */}
          {reports.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>历史报告</Text>
              
              {reports.slice(1).map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={styles.historyCard}
                  onPress={() => router.push('/reports/detail', { reportId: report.id })}
                >
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyLevelBadge,
                        { backgroundColor: `${getLevelColor(report.cambridgeLevel)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyLevelText,
                          { color: getLevelColor(report.cambridgeLevel) },
                        ]}
                      >
                        {report.cambridgeLevel}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{formatDate(report.createdAt)}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text
                      style={[
                        styles.historyScore,
                        { color: getScoreColor(report.overallScore) },
                      ]}
                    >
                      {report.overallScore}
                    </Text>
                    <Text style={styles.historyScoreLabel}>分</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>快捷入口</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/assessment-start')}
              >
                <LinearGradient
                  colors={['#6C63FF', '#896BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionEmoji}>🎯</Text>
                  <Text style={styles.quickActionTitle}>能力测评</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/courses')}
              >
                <LinearGradient
                  colors={['#FF6584', '#FF8A65']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionEmoji}>📚</Text>
                  <Text style={styles.quickActionTitle}>学习课程</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Screen>
  );
}

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
  latestCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  latestGradient: {
    padding: 20,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  latestLevel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  latestDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  latestScore: {
    alignItems: 'flex-end',
  },
  latestScoreNum: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  latestScoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  skillsOverview: {
    gap: 10,
  },
  skillOverviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillOverviewLabel: {
    width: 40,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  skillOverviewBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  skillOverviewFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  skillOverviewValue: {
    width: 45,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  latestFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  latestFooterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  latestFooterArrow: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startButton: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 9999,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  historyLevelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 13,
    color: '#636E72',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  historyScore: {
    fontSize: 24,
    fontWeight: '800',
  },
  historyScoreLabel: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 120,
  },
});
