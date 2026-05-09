import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');

// 模拟学员数据（实际应从API获取）
const mockProfile = {
  student_id: 'STU001',
  name: '张小明',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
  current_cefr: {
    overall: 'A2',
    reading: 'B1',
    listening: 'A2',
    writing: 'A1',
    speaking: 'A2',
  },
  target_cefr: 'B1',
  estimated_months_to_target: 6,
  weak_points: [
    { area: 'writing', specific: '时态混用', mastery: 0.35, priority: 'high' },
    { area: 'writing', specific: '句型单一', mastery: 0.42, priority: 'medium' },
    { area: 'listening', specific: '连读弱读', mastery: 0.55, priority: 'medium' },
  ],
  strength_points: [
    '价格与优惠表达理解',
    '日常会话听力',
    '词汇记忆能力强',
  ],
  learning_speed: 'moderate',
  recommended_hours_per_week: 4,
  last_diagnosis: '2026-05-09',
  exam_history: [
    { date: '2026-05-09', type: '快速测评', score: 68, cefr: 'A2' },
    { date: '2026-04-15', type: 'KET模拟', score: 72, cefr: 'A2' },
  ],
};

// CEFR 等级颜色
const cefrColors: Record<string, string> = {
  'Pre-A1': '#94A3B8',
  'A1': '#3B82F6',
  'A2': '#22C55E',
  'B1': '#F59E0B',
  'B2': '#EF4444',
  'C1': '#8B5CF6',
  'C2': '#EC4899',
};

// CEFR 雷达图数据点
const skills = ['reading', 'listening', 'writing', 'speaking'];
const skillLabels: Record<string, string> = {
  reading: '阅读',
  listening: '听力',
  writing: '写作',
  speaking: '口语',
};

// 将等级转换为0-100的数值
const cefrToValue = (cefr: string): number => {
  const map: Record<string, number> = {
    'Pre-A1': 20, 'A1': 40, 'A2': 60, 'B1': 75, 'B2': 90, 'C1': 95, 'C2': 100,
  };
  return map[cefr] || 50;
};

// 简单的雷达图组件
const RadarChart = ({ data }: { data: { skill: string; value: number }[] }) => {
  const size = width * 0.5;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  
  // 计算每个点的位置
  const getPoint = (index: number, value: number) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // 生成背景网格
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <View style={[styles.radarContainer, { width: size, height: size }]}>
      {/* 背景网格 */}
      {gridLevels.map((level, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: maxRadius * 2 * level,
            height: maxRadius * 2 * level,
            borderRadius: maxRadius * level,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            left: center - maxRadius * level,
            top: center - maxRadius * level,
          }}
        />
      ))}

      {/* 蜘蛛网线 */}
      {data.map((_, i) => {
        const point = getPoint(i, 100);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: Math.sqrt(Math.pow(point.x - center, 2) + Math.pow(point.y - center, 2)),
              height: 1,
              backgroundColor: '#E5E7EB',
              left: center,
              top: center,
              transform: [{ rotate: `${(i / data.length) * 360}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}

      {/* 数据区域 */}
      <View style={{ position: 'absolute', width: size, height: size }}>
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderWidth: 2,
            borderColor: '#22C55E',
            borderRadius: maxRadius,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            transform: [{ scale: 0.6 }],
          }}
        />
      </View>

      {/* 数据点和标签 */}
      {data.map((item, i) => {
        const point = getPoint(i, item.value);
        const labelPoint = getPoint(i, 115);
        return (
          <React.Fragment key={i}>
            <View
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: cefrColors[item.skill === 'overall' ? 'A2' : item.skill],
                borderWidth: 2,
                borderColor: '#FFF',
                left: point.x - 6,
                top: point.y - 6,
              }}
            />
            <Text
              style={{
                position: 'absolute',
                fontSize: 12,
                fontWeight: '600',
                color: '#374151',
                left: labelPoint.x - 20,
                top: labelPoint.y - 8,
                width: 40,
                textAlign: 'center',
              }}
            >
              {skillLabels[item.skill] || item.skill}
            </Text>
          </React.Fragment>
        );
      })}
    </View>
  );
};

// 能力条组件
const SkillBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.skillBar}>
    <Text style={styles.skillLabel}>{label}</Text>
    <View style={styles.barContainer}>
      <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.skillValue}>{value}%</Text>
  </View>
);

export default function Profile() {
  const router = useSafeRouter();
  const [profile, setProfile] = useState(mockProfile);
  const [loading, setLoading] = useState(false);

  // 计算雷达图数据
  const radarData = skills.map(skill => ({
    skill,
    value: cefrToValue(profile.current_cefr[skill as keyof typeof profile.current_cefr] || 'A2'),
  }));

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 头部信息 */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name.charAt(0)}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: cefrColors[profile.current_cefr.overall] }]}>
              <Text style={styles.levelText}>{profile.current_cefr.overall}</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.subtitle}>
              目标等级: {profile.target_cefr} · 预计 {profile.estimated_months_to_target} 个月达成
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>学习进度: {profile.learning_speed === 'fast' ? '快速' : profile.learning_speed === 'slow' ? '稳步' : '中等'}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>建议时长: {profile.recommended_hours_per_week}h/周</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 能力雷达图 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>能力分布</Text>
          <View style={styles.radarWrapper}>
            <RadarChart data={radarData} />
          </View>
          <View style={styles.skillsGrid}>
            {skills.map(skill => {
              const value = profile.current_cefr[skill as keyof typeof profile.current_cefr];
              const numValue = cefrToValue(value);
              return (
                <SkillBar
                  key={skill}
                  label={skillLabels[skill]}
                  value={numValue}
                  color={cefrColors[value]}
                />
              );
            })}
          </View>
        </View>

        {/* 薄弱点分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>薄弱点分析</Text>
          {profile.weak_points.map((point, i) => (
            <View key={i} style={styles.weakPointCard}>
              <View style={styles.weakPointHeader}>
                <Text style={styles.weakPointArea}>
                  {point.area === 'writing' ? '📝' : point.area === 'listening' ? '👂' : '📖'}{' '}
                  {point.area === 'writing' ? '写作' : point.area === 'listening' ? '听力' : '阅读'}
                </Text>
                <View style={[styles.priorityBadge, point.priority === 'high' && styles.priorityHigh]}>
                  <Text style={styles.priorityText}>
                    {point.priority === 'high' ? '高优先' : point.priority === 'medium' ? '中优先' : '低'}
                  </Text>
                </View>
              </View>
              <Text style={styles.weakPointSpecific}>{point.specific}</Text>
              <View style={styles.masteryBar}>
                <View style={[styles.masteryFill, { width: `${point.mastery * 100}%` }]} />
              </View>
              <Text style={styles.masteryText}>掌握度: {Math.round(point.mastery * 100)}%</Text>
            </View>
          ))}
        </View>

        {/* 强项展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>能力优势</Text>
          <View style={styles.strengthGrid}>
            {profile.strength_points.map((strength, i) => (
              <View key={i} style={styles.strengthCard}>
                <Text style={styles.strengthIcon}>✨</Text>
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 考试历史 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测评历史</Text>
          {profile.exam_history.map((exam, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyDate}>{exam.date}</Text>
                <Text style={styles.historyType}>{exam.type}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyScore}>{exam.score}分</Text>
                <Text style={[styles.historyCefr, { color: cefrColors[exam.cefr] }]}>{exam.cefr}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/quick-test', {})}
          >
            <Text style={styles.primaryButtonText}>重新测评</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/learning-plan', {})}
          >
            <Text style={styles.secondaryButtonText}>查看学习计划</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  levelBadge: {
    marginTop: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#4B5563',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  radarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  radarContainer: {
    position: 'relative',
  },
  skillsGrid: {
    gap: 12,
  },
  skillBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLabel: {
    width: 50,
    fontSize: 13,
    color: '#4B5563',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillValue: {
    width: 40,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  weakPointCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  weakPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weakPointArea: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  priorityBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  weakPointSpecific: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  masteryBar: {
    height: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 3,
    marginBottom: 4,
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  masteryText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  strengthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  strengthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  strengthIcon: {
    fontSize: 14,
  },
  strengthText: {
    fontSize: 13,
    color: '#166534',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLeft: {},
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyType: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  historyCefr: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  bottomPadding: {
    height: 40,
  },
});
