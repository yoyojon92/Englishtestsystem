import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const { width } = Dimensions.get('window');

// CEFR 等级颜色
const cefrColors: Record<string, string> = {
  'Pre-A1': '#10B981',
  'A1': '#3B82F6',
  'A2': '#8B5CF6',
  'B1': '#F59E0B',
  'B2': '#EF4444',
};

// 能力维度标签
const abilityLabels = ['听力', '口语', '阅读', '写作', '词汇', '语法'];

// 雷达图顶点位置计算
const getRadarPoints = (values: number[], centerX: number, centerY: number, radius: number) => {
  const points: { x: number; y: number }[] = [];
  const angleStep = (2 * Math.PI) / values.length;
  
  values.forEach((value, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    points.push({
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
    });
  });
  
  return points;
};

// 雷达图组件
const RadarChart = ({ data }: { data: number[] }) => {
  const size = width - 100;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  
  const points = getRadarPoints(data, centerX, centerY, radius);
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  // 背景网格
  const gridLevels = [0.25, 0.5, 0.75, 1];
  
  return (
    <View style={styles.radarContainer}>
      <View style={[styles.radarChart, { width: size, height: size }]}>
        {/* 背景网格 */}
        {gridLevels.map((level, i) => (
          <View
            key={`grid-${i}`}
            style={[
              styles.radarGrid,
              {
                width: radius * 2 * level,
                height: radius * 2 * level,
                borderRadius: radius * level,
                left: centerX - radius * level,
                top: centerY - radius * level,
              },
            ]}
          />
        ))}
        
        {/* 轴线 */}
        {data.map((_, index) => {
          const angleStep = (2 * Math.PI) / data.length;
          const angle = angleStep * index - Math.PI / 2;
          return (
            <View
              key={`axis-${index}`}
              style={[
                styles.radarAxis,
                {
                  width: radius * 2,
                  height: 1,
                  left: centerX - radius,
                  top: centerY,
                  transform: [{ rotate: `${angle * 180 / Math.PI}deg` }],
                },
              ]}
            />
          );
        })}
        
        {/* 数据区域 */}
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
          <View
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: radius,
              borderRightWidth: radius,
              borderBottomWidth: radius,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'rgba(99, 102, 241, 0.3)',
              transform: [{ rotate: '0deg' }],
            }}
          />
        </View>
        
        {/* 数据点 */}
        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[
              styles.radarPoint,
              {
                left: point.x - 6,
                top: point.y - 6,
                backgroundColor: cefrColors['A2'] || '#6C63FF',
              },
            ]}
          />
        ))}
        
        {/* 标签 */}
        {data.map((value, index) => {
          const angleStep = (2 * Math.PI) / data.length;
          const angle = angleStep * index - Math.PI / 2;
          const labelRadius = radius + 25;
          const labelX = centerX + labelRadius * Math.cos(angle);
          const labelY = centerY + labelRadius * Math.sin(angle);
          
          return (
            <Text
              key={`label-${index}`}
              style={[
                styles.radarLabel,
                {
                  left: labelX - 20,
                  top: labelY - 10,
                },
              ]}
            >
              {abilityLabels[index]}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default function StudentProfile() {
  const router = useSafeRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [childId, setChildId] = useState<string>('c1');
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchChildren();
    fetchProfile();
  }, [childId]);

  const fetchChildren = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/student-profile/children`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setChildren(data.data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/student-profile/${childId}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>能力画像</Text>
        </View>

        {/* 学员选择 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childTab, child.id === childId && styles.childTabActive]}
              onPress={() => setChildId(child.id)}
            >
              <Text style={[styles.childTabText, child.id === childId && styles.childTabTextActive]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 基本信息卡片 */}
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name?.charAt(0) || '学'}</Text>
            </View>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.name}>{profile.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>CEFR {profile.currentLevel}</Text>
            </View>
            <Text style={styles.vocabularyText}>
              词汇量：{profile.vocabularySize?.toLocaleString() || 0} 词
            </Text>
          </View>
        </View>

        {/* 能力雷达图 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>能力雷达图</Text>
          <View style={styles.radarWrapper}>
            <RadarChart data={profile.abilityScores || [75, 70, 80, 65, 85, 72]} />
          </View>
          <View style={styles.abilityGrid}>
            {abilityLabels.map((label, index) => (
              <View key={label} style={styles.abilityItem}>
                <View style={styles.abilityLabelRow}>
                  <View
                    style={[
                      styles.abilityDot,
                      { backgroundColor: cefrColors['A2'] || '#6C63FF' },
                    ]}
                  />
                  <Text style={styles.abilityLabel}>{label}</Text>
                </View>
                <Text style={styles.abilityValue}>
                  {profile.abilityScores?.[index] || 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 薄弱项和强项 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>能力分析</Text>
          
          <Text style={styles.sectionLabel}>💪 强项</Text>
          <View style={styles.tagsContainer}>
            {profile.strongPoints?.map((point: string, index: number) => (
              <View key={`strong-${index}`} style={styles.tagStrong}>
                <Text style={styles.tagStrongText}>{point}</Text>
              </View>
            )) || ['词汇积累', '听力理解'].map((point, index) => (
              <View key={`strong-${index}`} style={styles.tagStrong}>
                <Text style={styles.tagStrongText}>{point}</Text>
              </View>
            ))}
          </View>
          
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>📚 需提升</Text>
          <View style={styles.tagsContainer}>
            {profile.weakPoints?.map((point: string, index: number) => (
              <View key={`weak-${index}`} style={styles.tagWeak}>
                <Text style={styles.tagWeakText}>{point}</Text>
              </View>
            )) || ['口语表达', '写作技巧'].map((point, index) => (
              <View key={`weak-${index}`} style={styles.tagWeak}>
                <Text style={styles.tagWeakText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 学习建议 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 学习建议</Text>
          <View style={styles.suggestionsContainer}>
            {profile.suggestions?.map((suggestion: string, index: number) => (
              <View key={`sug-${index}`} style={styles.suggestionItem}>
                <Text style={styles.suggestionNumber}>{index + 1}</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            )) || [
              '建议加强口语练习，每天至少10分钟跟读',
              '可以开始接触简单的写作练习',
              '继续积累词汇，建议使用闪卡APP',
              '多听英语儿歌和动画片提升语感',
            ].map((suggestion, index) => (
              <View key={`sug-${index}`} style={styles.suggestionItem}>
                <Text style={styles.suggestionNumber}>{index + 1}</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 薄弱项练习推荐 */}
        <TouchableOpacity style={styles.practiceButton}>
          <Text style={styles.practiceButtonText}>针对薄弱项练习</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginLeft: 8,
  },
  childSelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  childTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  childTabActive: {
    backgroundColor: '#6C63FF',
  },
  childTabText: {
    fontSize: 14,
    color: '#666',
  },
  childTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  vocabularyText: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  radarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarChart: {
    position: 'relative',
  },
  radarGrid: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  radarAxis: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
  },
  radarPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  radarLabel: {
    position: 'absolute',
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    width: 40,
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  abilityItem: {
    width: '33.33%',
    paddingVertical: 8,
  },
  abilityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  abilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  abilityLabel: {
    fontSize: 13,
    color: '#666',
  },
  abilityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagStrong: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagStrongText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  tagWeak: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagWeakText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  suggestionsContainer: {},
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  practiceButton: {
    marginHorizontal: 16,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  practiceButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
