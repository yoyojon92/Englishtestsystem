// 测试报告页面
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ReportData {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  cefrLevel: string;
  cefrColor: string;
  skills: {
    reading: { score: number; cefr: string; level: string };
    listening: { score: number; cefr: string; level: string };
    writing: { score: number; cefr: string; level: string };
    speaking: { score: number; cefr: string; level: string };
  };
  weakPoints: Array<{
    tag: string;
    mastery: number;
    questionCount: number;
    correctRate: number;
  }>;
  recommendedService: {
    type: string;
    name: string;
    description: string;
  };
}

interface Props {}

export default function TestReport({}: Props) {
  const router = useSafeRouter();
  const params = useSafeSearchParams<any>();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      // 优先使用路由参数中的数据
      if (params.sessionId) {
        const response = await fetch(`${API_BASE}/api/v1/test/report/${params.sessionId}`);
        const result = await response.json();
        
        if (result.success) {
          setReport(result.data);
        } else {
          // 使用传入的参数
          setReport({
            sessionId: params.sessionId,
            totalQuestions: params.totalQuestions || 0,
            correctCount: params.correctCount || 0,
            accuracy: params.accuracy || 0,
            cefrLevel: params.cefrLevel || 'A2',
            cefrColor: params.cefrColor || '#F59E0B',
            skills: params.skills || {
              reading: { score: 0, cefr: 'A2', level: '中等' },
              listening: { score: 0, cefr: 'A1', level: '初级' },
              writing: { score: 0, cefr: 'A1', level: '初级' },
              speaking: { score: 0, cefr: 'A2', level: '中等' },
            },
            weakPoints: params.weakPoints || [],
            recommendedService: params.recommendedService || {
              type: 'offline',
              name: '线下体验课',
              description: '预约专业老师面对面评估',
            },
          });
        }
      }
    } catch (error) {
      console.error('Load report error:', error);
      // 使用传入的参数作为兜底
      setReport({
        sessionId: params.sessionId || '',
        totalQuestions: params.totalQuestions || 0,
        correctCount: params.correctCount || 0,
        accuracy: params.accuracy || 0,
        cefrLevel: params.cefrLevel || 'A2',
        cefrColor: params.cefrColor || '#F59E0B',
        skills: params.skills || {
          reading: { score: 0, cefr: 'A2', level: '中等' },
          listening: { score: 0, cefr: 'A1', level: '初级' },
          writing: { score: 0, cefr: 'A1', level: '初级' },
          speaking: { score: 0, cefr: 'A2', level: '中等' },
        },
        weakPoints: params.weakPoints || [],
        recommendedService: params.recommendedService || {
          type: 'offline',
          name: '线下体验课',
          description: '预约专业老师面对面评估',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // 联系顾问
  const handleContact = () => {
    Alert.alert(
      '预约线下体验课',
      '请留下联系方式，顾问将在24小时内与您联系',
      [
        { text: '稍后再说' },
        { 
          text: '立即预约',
          onPress: () => Linking.openURL('tel:400-888-8888')
        },
      ]
    );
  };

  // 解锁完整报告
  const handleUnlock = () => {
    Alert.alert(
      '解锁完整报告',
      '完整报告包含详细能力分析、学习建议和个性化规划',
      [
        { text: '取消' },
        { 
          text: '立即解锁 ¥99',
          onPress: () => router.push('/payment')
        },
      ]
    );
  };

  // 返回首页
  const handleGoHome = () => {
    router.replace('/');
  };

  // CEFR等级描述
  const cefrDescriptions: Record<string, string> = {
    'B2': '高级水平',
    'B1': '中级水平',
    'A2': '基础水平',
    'A1': '入门水平',
    'Pre-A1': '零基础',
  };

  // CEFR等级建议
  const cefrSuggestions: Record<string, string> = {
    'B2': '可以处理复杂的英语话题，准备FCE考试',
    'B1': '可以进行日常交流，开始KET向PET的过渡',
    'A2': '掌握基础英语，建议系统学习KET课程',
    'A1': '需要加强基础，建议从A1课程开始',
    'Pre-A1': '建议从字母和基础发音开始学习',
  };

  // 技能颜色
  const skillColors: Record<string, string> = {
    reading: '#4F46E5',
    listening: '#059669',
    writing: '#F59E0B',
    speaking: '#EC4899',
  };

  // 技能名称
  const skillNames: Record<string, string> = {
    reading: '阅读',
    listening: '听力',
    writing: '写作',
    speaking: '口语',
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在生成报告...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 顶部结果 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>能力测评报告</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>您的CEFR等级</Text>
            <View style={styles.levelContainer}>
              <Text style={[styles.levelText, { color: report?.cefrColor }]}>
                {report?.cefrLevel}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: report?.cefrColor }]}>
                <Text style={styles.levelBadgeText}>
                  {cefrDescriptions[report?.cefrLevel || 'A2']}
                </Text>
              </View>
            </View>
            
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{report?.totalQuestions}</Text>
                <Text style={styles.scoreLabel}>总题数</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{report?.correctCount}</Text>
                <Text style={styles.scoreLabel}>正确数</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{report?.accuracy}%</Text>
                <Text style={styles.scoreLabel}>正确率</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 能力雷达图（简化为条形图） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>四项能力分析</Text>
          
          <View style={styles.skillsCard}>
            {Object.entries(report?.skills || {}).map(([skill, data]: [string, any]) => (
              <View key={skill} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <View style={styles.skillNameRow}>
                    <View style={[styles.skillDot, { backgroundColor: skillColors[skill] }]} />
                    <Text style={styles.skillName}>{skillNames[skill]}</Text>
                  </View>
                  <View style={styles.skillLevelRow}>
                    <Text style={[styles.skillCEFR, { color: skillColors[skill] }]}>
                      {data.cefr}
                    </Text>
                    <Text style={styles.skillLevel}> · {data.level}</Text>
                  </View>
                </View>
                <View style={styles.skillBar}>
                  <View 
                    style={[
                      styles.skillBarFill, 
                      { 
                        width: `${data.score}%`,
                        backgroundColor: skillColors[skill],
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 薄弱项 */}
        {report?.weakPoints && report.weakPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>薄弱项提示</Text>
            
            <View style={styles.weakCard}>
              {report.weakPoints.map((wp, index) => (
                <View key={index} style={styles.weakItem}>
                  <View style={styles.weakLeft}>
                    <Text style={styles.weakIndex}>{index + 1}</Text>
                  </View>
                  <View style={styles.weakContent}>
                    <Text style={styles.weakTag}>{wp.tag}</Text>
                    <View style={styles.weakProgress}>
                      <View style={[styles.weakProgressFill, { width: `${wp.correctRate}%` }]} />
                    </View>
                    <Text style={styles.weakRate}>正确率 {wp.correctRate}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 等级建议 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习建议</Text>
          <View style={styles.suggestCard}>
            <Text style={styles.suggestText}>
              {cefrSuggestions[report?.cefrLevel || 'A2']}
            </Text>
          </View>
        </View>

        {/* 推荐服务 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推荐服务</Text>
          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>
                {report?.recommendedService?.type === 'offline' ? '🏫' :
                 report?.recommendedService?.type === 'online' ? '💻' : '📚'}
              </Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceName}>{report?.recommendedService?.name}</Text>
              <Text style={styles.serviceDesc}>{report?.recommendedService?.description}</Text>
            </View>
          </View>
        </View>

        {/* CTA按钮 */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={handleContact}>
            <Text style={styles.ctaPrimaryText}>预约线下体验课</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.ctaSecondary} onPress={handleUnlock}>
            <Text style={styles.ctaSecondaryText}>解锁完整报告</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.ctaLink} onPress={handleGoHome}>
            <Text style={styles.ctaLinkText}>返回首页</Text>
          </TouchableOpacity>
        </View>

        {/* 分享 */}
        <View style={styles.shareContainer}>
          <Text style={styles.shareText}>分享给朋友</Text>
          <View style={styles.shareIcons}>
            <TouchableOpacity style={styles.shareIcon}>
              <Text style={styles.shareIconText}>📱</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareIcon}>
              <Text style={styles.shareIconText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  levelBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  skillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  skillItem: {
    gap: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  skillName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  skillLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillCEFR: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillLevel: {
    fontSize: 12,
    color: '#6B7280',
  },
  skillBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  weakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  weakItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weakLeft: {
    marginRight: 12,
  },
  weakIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  weakContent: {
    flex: 1,
  },
  weakTag: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  weakProgress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 4,
  },
  weakProgressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  weakRate: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  suggestText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIconText: {
    fontSize: 24,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  ctaContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    gap: 12,
  },
  ctaPrimary: {
    backgroundColor: '#4F46E5',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ctaSecondary: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  ctaSecondaryText: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '500',
  },
  ctaLink: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  shareContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  shareIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  shareIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconText: {
    fontSize: 20,
  },
});
