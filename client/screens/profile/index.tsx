import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { Screen } from '@/components/Screen';

export default function ProfileScreen() {
  const router = useSafeRouter();
  const { user, token, logout } = useAuth();
  const [isLoggedIn] = useState(!!token);

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: '🔔', title: '消息通知', subtitle: '查看全部消息', route: '/notifications', badge: 2 },
    { icon: '🧒', title: '学员画像', subtitle: '能力雷达图', route: '/profile/student' },
    { icon: '📚', title: '我的课程', subtitle: '查看已购课程', route: '/progress' },
    { icon: '🎓', title: '免费课程', subtitle: '学习更多内容', route: '/free-courses' },
    { icon: '🏆', title: '我的成就', subtitle: '学习徽章', route: '/achievements' },
    { icon: '📊', title: '测评报告', subtitle: '历次测评记录', route: '/reports' },
    { icon: '⭐', title: '我的收藏', subtitle: '收藏的课程', route: '/courses' },
    { icon: '📝', title: '学习笔记', subtitle: '我的学习笔记', route: '/progress' },
    { icon: '🎯', title: '能力测评', subtitle: '重新进行测评', route: '/assessment/start' },
    { icon: '🤖', title: 'AI 学习', subtitle: 'AI外教和口语练习', route: '/ai' },
    { icon: '⚙️', title: '设置', subtitle: '账号与偏好设置', route: '/settings' },
  ];

  const infoItems = [
    { label: '学习天数', value: '12' },
    { label: '完成课程', value: '3' },
    { label: '累计学习', value: '48h' },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>我的</Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}
            >
              {isLoggedIn ? (
                <>
                  <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {user?.name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      {user?.vipLevel && (
                        <View style={styles.vipBadge}>
                          <Text style={styles.vipBadgeText}>VIP</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.userName}>{user?.name || '学员用户'}</Text>
                      <Text style={styles.userEmail}>{user?.email || ''}</Text>
                      {user?.childName && (
                        <View style={styles.childInfo}>
                          <Text style={styles.childLabel}>学员：</Text>
                          <Text style={styles.childName}>{user.childName}</Text>
                          <Text style={styles.childAge}>({user.childAge}岁)</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => Alert.alert('提示', '个人资料编辑功能开发中')}
                    >
                      <Text style={styles.editButtonText}>编辑</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.statsContainer}>
                    {infoItems.map((item, index) => (
                      <View key={index} style={styles.statItem}>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginEmoji}>👋</Text>
                  <Text style={styles.loginTitle}>欢迎来到英语学习</Text>
                  <Text style={styles.loginSubtitle}>
                    登录后享受完整的学习体验
                  </Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push('/auth')}
                  >
                    <Text style={styles.loginButtonText}>立即登录</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Cambridge Level Card */}
          {isLoggedIn && (
            <View style={styles.levelCard}>
              <View style={styles.levelLeft}>
                <Text style={styles.levelLabel}>当前剑桥等级</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>A1</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.retestButton}
                onPress={() => router.push('/assessment-start')}
              >
                <Text style={styles.retestButtonText}>重新测评</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.route === '/settings') {
                      Alert.alert('提示', '设置页面开发中');
                    } else {
                      router.push(item.route);
                    }
                  }}
                >
                  <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* VIP Banner */}
          {isLoggedIn && (
            <TouchableOpacity
              style={styles.vipBanner}
              onPress={() => Alert.alert('VIP会员', 'VIP功能开发中')}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vipBannerGradient}
              >
                <View style={styles.vipBannerContent}>
                  <View>
                    <Text style={styles.vipBannerTitle}>开通VIP会员</Text>
                    <Text style={styles.vipBannerSubtitle}>
                      解锁全部课程 · 专属学习方案
                    </Text>
                  </View>
                  <View style={styles.vipBannerAction}>
                    <Text style={styles.vipBannerActionText}>立即开通</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          {isLoggedIn && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>退出登录</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>英语能力测评与课程服务系统 v1.0</Text>
            <Text style={styles.footerSubtext}>助力3-15岁英语学习</Text>
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
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vipBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B4513',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  childLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  childName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  childAge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  levelCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 14,
    color: '#636E72',
    marginRight: 12,
  },
  levelBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  retestButton: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retestButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '31%',
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
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#B2BEC3',
    textAlign: 'center',
  },
  vipBanner: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  vipBannerGradient: {
    padding: 16,
  },
  vipBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vipBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vipBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  vipBannerAction: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  vipBannerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9800',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
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
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#D1D9E6',
    marginTop: 4,
  },
  bottomPadding: {
    height: 120,
  },
});
