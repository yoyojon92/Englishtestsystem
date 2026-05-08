import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'achievement' | 'exam' | 'special';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement: string;
  reward?: number;
}

export default function Achievements() {
  const router = useSafeRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  const fetchBadges = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/achievements/badges`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setBadges(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBadges();
  };

  const getBadgeIcon = (icon: string, category: string) => {
    const iconMap: Record<string, string> = {
      'book': 'book',
      'fire': 'fire-alt',
      'trophy': 'trophy',
      'star': 'star',
      'crown': 'crown',
      'rocket': 'rocket',
      'medal': 'medal',
      'certificate': 'certificate',
      'target': 'bullseye',
      'clock': 'clock',
      'graduation': 'graduation-cap',
      'award': 'award',
    };
    return iconMap[icon] || 'medal';
  };

  const getBadgeColor = (category: string, isUnlocked: boolean) => {
    if (!isUnlocked) return { bg: '#F3F4F6', icon: '#9CA3AF', border: '#E5E7EB' };
    switch (category) {
      case 'learning':
        return { bg: '#EEF2FF', icon: '#4F46E5', border: '#C7D2FE' };
      case 'achievement':
        return { bg: '#FEF3C7', icon: '#D97706', border: '#FCD34D' };
      case 'exam':
        return { bg: '#D1FAE5', icon: '#059669', border: '#6EE7B7' };
      case 'special':
        return { bg: '#FCE7F3', icon: '#DB2777', border: '#F9A8D4' };
      default:
        return { bg: '#F3F4F6', icon: '#6B7280', border: '#E5E7EB' };
    }
  };

  const filteredBadges = badges.filter((badge) => {
    if (activeTab === 'unlocked') return badge.isUnlocked;
    if (activeTab === 'locked') return !badge.isUnlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;

  const renderBadgeCard = (badge: Badge) => {
    const colors = getBadgeColor(badge.category, badge.isUnlocked);

    return (
      <TouchableOpacity
        key={badge.id}
        className="w-[48%] mb-4"
        onPress={() => setSelectedBadge(badge)}
        activeOpacity={0.8}
      >
        <View
          className="rounded-2xl p-4 items-center"
          style={{
            backgroundColor: colors.bg,
            borderWidth: 2,
            borderColor: colors.border,
            borderStyle: badge.isUnlocked ? 'solid' : 'dashed',
          }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: badge.isUnlocked ? colors.icon + '20' : '#E5E7EB' }}
          >
            {badge.isUnlocked ? (
              <FontAwesome5 name={getBadgeIcon(badge.icon, badge.category) as any} size={32} color={colors.icon} />
            ) : (
              <Ionicons name="lock-closed" size={28} color="#9CA3AF" />
            )}
          </View>
          <Text
            className={`font-bold text-center mb-1 ${badge.isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {badge.name}
          </Text>
          <Text
            className={`text-xs text-center ${badge.isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}
            numberOfLines={2}
          >
            {badge.description}
          </Text>
          {badge.progress !== undefined && !badge.isUnlocked && (
            <View className="mt-2 w-full">
              <View className="h-1.5 bg-white/50 rounded-full">
                <View
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${badge.progress}%` }}
                />
              </View>
              <Text className="text-xs text-gray-500 text-center mt-1">
                {badge.progress}%
              </Text>
            </View>
          )}
          {badge.isUnlocked && badge.unlockedAt && (
            <Text className="text-xs text-gray-400 mt-2">
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {/* 头部 */}
      <View className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">我的成就</Text>
          <View className="w-6" />
        </View>

        {/* 统计卡片 */}
        <View className="bg-white/20 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-3xl font-bold text-white">{unlockedCount}</Text>
              <Text className="text-white/80 text-sm">已获得</Text>
            </View>
            <View className="h-12 w-px bg-white/30" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-white">{totalCount - unlockedCount}</Text>
              <Text className="text-white/80 text-sm">待解锁</Text>
            </View>
            <View className="h-12 w-px bg-white/30" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-white">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </Text>
              <Text className="text-white/80 text-sm">完成率</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab切换 */}
      <View className="bg-white flex-row border-b border-gray-200">
        {(['all', 'unlocked', 'locked'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 items-center ${
              activeTab === tab ? 'border-b-2 border-indigo-500' : ''
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`font-medium ${
                activeTab === tab ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              {tab === 'all' ? '全部' : tab === 'unlocked' ? '已获得' : '待解锁'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 徽章列表 */}
      <ScrollView
        className="flex-1 bg-gray-50 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row flex-wrap justify-between">
          {filteredBadges.map(renderBadgeCard)}
        </View>
      </ScrollView>

      {/* 徽章详情弹窗 */}
      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center p-6"
          activeOpacity={1}
          onPress={() => setSelectedBadge(null)}
        >
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {selectedBadge && (
              <>
                <View
                  className="w-24 h-24 rounded-full items-center justify-center self-center mb-4"
                  style={{
                    backgroundColor: getBadgeColor(selectedBadge.category, selectedBadge.isUnlocked).bg,
                    borderWidth: 3,
                    borderColor: getBadgeColor(selectedBadge.category, selectedBadge.isUnlocked).border,
                  }}
                >
                  {selectedBadge.isUnlocked ? (
                    <FontAwesome5
                      name={getBadgeIcon(selectedBadge.icon, selectedBadge.category) as any}
                      size={40}
                      color={getBadgeColor(selectedBadge.category, true).icon}
                    />
                  ) : (
                    <Ionicons name="lock-closed" size={36} color="#9CA3AF" />
                  )}
                </View>
                <Text className="text-xl font-bold text-center text-gray-900 mb-2">
                  {selectedBadge.name}
                </Text>
                <Text className="text-center text-gray-500 mb-4">
                  {selectedBadge.description}
                </Text>
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-sm text-gray-500 mb-1">获得条件</Text>
                  <Text className="text-gray-700">{selectedBadge.requirement}</Text>
                </View>
                {selectedBadge.reward && (
                  <View className="bg-yellow-50 rounded-xl p-4 mb-4">
                    <View className="flex-row items-center gap-2">
                      <FontAwesome5 name="coins" size={18} color="#D97706" />
                      <Text className="text-amber-700">完成后奖励 {selectedBadge.reward} 积分</Text>
                    </View>
                  </View>
                )}
                {selectedBadge.isUnlocked && selectedBadge.unlockedAt && (
                  <Text className="text-center text-sm text-gray-400">
                    解锁于 {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                  </Text>
                )}
                <TouchableOpacity
                  className="bg-indigo-500 py-3 rounded-xl items-center mt-4"
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text className="text-white font-bold">知道了</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}
