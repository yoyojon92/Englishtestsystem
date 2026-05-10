import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - 48 - CARD_MARGIN) / 2;

// 功能分组数据
const FEATURE_GROUPS = [
  {
    title: '核心功能',
    items: [
      { icon: '🎯', title: '英语水平测试', subtitle: '15分钟出报告', route: '/test/entry', gradient: ['#4F46E5', '#7C3AED'] },
      { icon: '🏆', title: '剑桥考试', subtitle: 'KET/PET报名', route: '/exams', gradient: ['#FF9800', '#FF5722'] },
      { icon: '📊', title: '学习报告', subtitle: '查看进度', route: '/reports', gradient: ['#0,184,148', '#10B981'] },
    ],
  },
  {
    title: '个人提升',
    items: [
      { icon: '👤', title: '我的画像', subtitle: '能力分析', route: '/profile-student', gradient: ['#22C55E', '#34D399'] },
      { icon: '📋', title: '学习计划', subtitle: '月度规划', route: '/learning-plan', gradient: ['#F59E0B', '#FBBF24'] },
      { icon: '📚', title: '精选课程', subtitle: '系统学习', route: '/courses', gradient: ['#EC4899', '#F472B6'] },
    ],
  },
  {
    title: '练习资源',
    items: [
      { icon: '📝', title: 'KET练习', subtitle: '真题训练', route: '/ket-practice', gradient: ['#8B5CF6', '#A78BFA'] },
      { icon: '🎁', title: '免费资源', subtitle: '学习资料', route: '/free-courses', gradient: ['#6366F1', '#818CF8'] },
      { icon: '📖', title: '能力等级', subtitle: 'CEFR体系', route: '/cefr', gradient: ['#14B8A6', '#2DD4BF'] },
    ],
  },
];

// 底部操作数据
const BOTTOM_ACTIONS = [
  { icon: '🤝', title: '分享邀请', route: '/share' },
  { icon: '📞', title: '联系我们', route: '/contact' },
];

export default function HomeScreen() {
  const router = useSafeRouter();

  const renderCard = (item: typeof FEATURE_GROUPS[0]['items'][0], index: number) => (
    <TouchableOpacity
      key={`${item.route}-${index}`}
      style={styles.card}
      onPress={() => router.push(item.route as any)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderGroup = (group: typeof FEATURE_GROUPS[0], groupIndex: number) => (
    <View key={`group-${groupIndex}`} style={styles.group}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      <View style={styles.grid}>
        {group.items.map((item, index) => renderCard(item, index))}
      </View>
    </View>
  );

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>你好</Text>
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
              <Text style={styles.avatarText}>U</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <TouchableOpacity
          style={styles.heroBanner}
          onPress={() => router.push('/test/entry')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>英语能力诊断</Text>
              <Text style={styles.heroDesc}>15分钟精准定位英语水平</Text>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>立即测试</Text>
              </View>
            </View>
            <Text style={styles.heroEmoji}>🎯</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Feature Groups */}
        {FEATURE_GROUPS.map((group, index) => renderGroup(group, index))}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {BOTTOM_ACTIONS.map((action, index) => (
            <TouchableOpacity
              key={`action-${index}`}
              style={styles.bottomAction}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomActionIcon}>{action.icon}</Text>
              <Text style={styles.bottomActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  heroBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  heroEmoji: {
    fontSize: 48,
    marginLeft: 16,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20 - CARD_MARGIN / 2,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN / 2,
    marginBottom: CARD_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 120,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    marginTop: 8,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: 6,
  },
  bottomActionIcon: {
    fontSize: 16,
  },
  bottomActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  footer: {
    height: 32,
  },
});
