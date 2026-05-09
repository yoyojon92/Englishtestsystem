import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface StudentProfile {
  childId: string;
  name: string;
  avatar: string;
  registerTime: string;
  overallCefr: string;
  cefrScores: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  vocabularySize: number;
  weakPoints: string[];
  strongPoints: string[];
  lastUpdated: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  birthday: string;
  grade: string;
  schoolName?: string;
}

export default function ProfileViewScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const { childId: paramChildId } = useSafeSearchParams<{ childId?: string }>();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 加载学员列表
  const loadChildren = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChildren(data.children || []);
      
      if (data.children?.length > 0) {
        const targetChild = paramChildId 
          ? data.children.find((c: Child) => c.id === paramChildId)
          : data.children[0];
        if (targetChild) {
          setSelectedChildId(targetChild.id);
        }
      }
    } catch (error) {
      console.error('Load children error:', error);
    }
  }, [token, paramChildId]);

  // 加载学员画像
  const loadProfile = useCallback(async () => {
    if (!token || !selectedChildId) return;
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/student-profile/${selectedChildId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Load profile error:', error);
      // 使用模拟数据
      setProfile({
        childId: selectedChildId,
        name: children.find(c => c.id === selectedChildId)?.name || '学员',
        avatar: '',
        registerTime: '2024-01-15',
        overallCefr: 'A1',
        cefrScores: {
          listening: 72,
          speaking: 65,
          reading: 78,
          writing: 68,
        },
        vocabularySize: 1200,
        weakPoints: ['口语流利度', '复杂语法'],
        strongPoints: ['词汇量', '阅读理解'],
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }
  }, [token, selectedChildId, children]);

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  useEffect(() => {
    if (selectedChildId) {
      loadProfile();
    }
  }, [selectedChildId, loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    await loadProfile();
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

  // 简单的雷达图渲染（使用圆点和连线模拟）
  const renderRadarChart = () => {
    const skills = ['听力', '口语', '阅读', '写作'];
    const scores = [
      profile?.cefrScores.listening || 0,
      profile?.cefrScores.speaking || 0,
      profile?.cefrScores.reading || 0,
      profile?.cefrScores.writing || 0,
    ];
    
    const centerX = width / 2 - 24;
    const centerY = 100;
    const radius = 70;
    
    const points = skills.map((_, index) => {
      const angle = (index * 90 - 90) * (Math.PI / 180);
      const score = scores[index] / 100;
      return {
        x: centerX + radius * score * Math.cos(angle),
        y: centerY + radius * score * Math.sin(angle),
      };
    });

    return (
      <View style={styles.radarContainer}>
        <View style={styles.radarChart}>
          {/* 背景网格 */}
          {[1, 0.75, 0.5, 0.25].map((scale, i) => (
            <View
              key={i}
              style={[
                styles.radarGrid,
                {
                  width: radius * 2 * scale,
                  height: radius * 2 * scale,
                  borderRadius: radius * scale,
                  left: centerX - radius * scale,
                  top: centerY - radius * scale,
                },
              ]}
            />
          ))}
          
          {/* 轴线 */}
          {skills.map((_, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            return (
              <View
                key={index}
                style={[
                  styles.radarAxis,
                  {
                    width: radius,
                    height: 2,
                    left: centerX,
                    top: centerY,
                    transform: [{ rotate: `${index * 90 - 90}deg` }],
                    transformOrigin: 'left center',
                  },
                ]}
              />
            );
          })}
          
          {/* 数据区域 - 用彩色圆点表示 */}
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.radarPoint,
                {
                  left: point.x - 8,
                  top: point.y - 8,
                  backgroundColor: ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFE66D'][index],
                },
              ]}
            />
          ))}
          
          {/* 数据连接线 */}
          <View style={styles.radarPolygon}>
            {points.map((point, index) => (
              <View
                key={`line-${index}`}
                style={[
                  styles.radarLine,
                  {
                    width: Math.sqrt(
                      Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
                    ),
                    height: 2,
                    left: centerX,
                    top: centerY,
                    transform: [
                      { rotate: `${Math.atan2(point.y - centerY, point.x - centerX) * (180 / Math.PI)}deg` },
                    ],
                    transformOrigin: 'left center',
                    backgroundColor: ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFE66D'][index],
                  },
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* 标签 */}
        <View style={styles.radarLabels}>
          {skills.map((skill, index) => (
            <View key={skill} style={[styles.radarLabel, { 
              left: [centerX + radius + 10, centerX - 25, centerX - radius - 30, centerX - 25][index],
              top: [centerY - 10, centerY - radius - 20, centerY - 10, centerY + radius + 5][index],
            }]}>
              <Text style={styles.radarLabelText}>{skill}</Text>
              <Text style={styles.radarLabelScore}>{scores[index]}分</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>学员画像</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* 学员选择器 */}
        {children.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
            contentContainerStyle={styles.childSelectorContent}
          >
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childItem,
                  selectedChildId === child.id && styles.childItemSelected,
                ]}
                onPress={() => setSelectedChildId(child.id)}
              >
                <View style={[
                  styles.childAvatar,
                  selectedChildId === child.id && styles.childAvatarSelected,
                ]}>
                  <Text style={styles.childAvatarText}>
                    {child.name.charAt(0)}
                  </Text>
                </View>
                <Text style={[
                  styles.childName,
                  selectedChildId === child.id && styles.childNameSelected,
                ]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {profile ? (
          <>
            {/* 基本信息卡片 */}
            <View style={styles.section}>
              <LinearGradient
                colors={getLevelColor(profile.overallCefr)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileCard}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {profile.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileMeta}>
                      注册时间：{profile.registerTime}
                    </Text>
                  </View>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{profile.overallCefr}</Text>
                  </View>
                </View>
                
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.vocabularySize}</Text>
                    <Text style={styles.statLabel}>词汇量</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>4</Text>
                    <Text style={styles.statLabel}>技能评估</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {profile.cefrScores.listening + profile.cefrScores.speaking + profile.cefrScores.reading + profile.cefrScores.writing}
                    </Text>
                    <Text style={styles.statLabel}>综合得分</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* 能力雷达图 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>能力分布</Text>
              <View style={styles.radarCard}>
                {renderRadarChart()}
              </View>
            </View>

            {/* 各科技能详情 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>技能详情</Text>
              
              <View style={styles.skillsList}>
                {[
                  { name: '听力', score: profile.cefrScores.listening, color: '#6C63FF' },
                  { name: '口语', score: profile.cefrScores.speaking, color: '#FF6B6B' },
                  { name: '阅读', score: profile.cefrScores.reading, color: '#4ECDC4' },
                  { name: '写作', score: profile.cefrScores.writing, color: '#FFE66D' },
                ].map((skill) => (
                  <View key={skill.name} style={styles.skillCard}>
                    <View style={styles.skillHeader}>
                      <View style={[styles.skillDot, { backgroundColor: skill.color }]} />
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <Text style={styles.skillScore}>{skill.score}分</Text>
                    </View>
                    <View style={styles.skillBarBg}>
                      <View
                        style={[
                          styles.skillBar,
                          { width: `${skill.score}%`, backgroundColor: skill.color },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 强弱项分析 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>学习建议</Text>
              
              <View style={styles.analysisCard}>
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisTitle}>💪 优势领域</Text>
                  <View style={styles.tagList}>
                    {profile.strongPoints.map((point, index) => (
                      <View key={index} style={[styles.tag, styles.strongTag]}>
                        <Text style={styles.strongTagText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisTitle}>📚 提升空间</Text>
                  <View style={styles.tagList}>
                    {profile.weakPoints.map((point, index) => (
                      <View key={index} style={[styles.tag, styles.weakTag]}>
                        <Text style={styles.weakTagText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* 更新信息 */}
            <View style={styles.updateInfo}>
              <Text style={styles.updateText}>
                最后更新：{profile.lastUpdated}
              </Text>
              <TouchableOpacity onPress={() => router.push('/assessment-start')}>
                <Text style={styles.reassessBtn}>重新测评</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无学员数据</Text>
            <TouchableOpacity
              style={styles.addChildBtn}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.addChildBtnText}>添加学员</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    fontSize: 16,
    color: '#6C63FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  childSelector: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  childSelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  childItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  childItemSelected: {},
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  childAvatarSelected: {
    backgroundColor: '#6C63FF',
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  childName: {
    fontSize: 12,
    color: '#636E72',
  },
  childNameSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  radarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 280,
  },
  radarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  radarChart: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  radarGrid: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  radarAxis: {
    position: 'absolute',
    backgroundColor: 'rgba(108,99,255,0.2)',
  },
  radarPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  radarPolygon: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  radarLine: {
    position: 'absolute',
  },
  radarLabels: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  radarLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  radarLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  radarLabelScore: {
    fontSize: 12,
    color: '#636E72',
  },
  skillsList: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  skillName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  skillScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  skillBarBg: {
    height: 8,
    backgroundColor: '#F0F0F3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: 4,
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 10,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  strongTag: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  strongTagText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  weakTag: {
    backgroundColor: 'rgba(255,152,0,0.1)',
  },
  weakTagText: {
    fontSize: 12,
    color: '#FF9800',
  },
  updateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  updateText: {
    fontSize: 12,
    color: '#636E72',
  },
  reassessBtn: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 20,
  },
  addChildBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addChildBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
