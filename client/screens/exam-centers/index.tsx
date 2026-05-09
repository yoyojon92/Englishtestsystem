import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

interface ExamCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  examTypes: string[];
  availableSeats: number;
  rating: number;
}

// 模拟考试中心数据
const mockExamCenters: ExamCenter[] = [
  {
    id: '1',
    name: '北京外国语大学考试中心',
    address: '北京市海淀区西三环北路19号北京外国语大学东院',
    phone: '010-8881-2345',
    city: '北京',
    district: '海淀区',
    latitude: 39.9372,
    longitude: 116.3063,
    examTypes: ['KET', 'PET', 'FCE'],
    availableSeats: 120,
    rating: 4.8,
  },
  {
    id: '2',
    name: '上海外国语大学考点',
    address: '上海市虹口区大连西路550号上海外国语大学',
    phone: '021-6548-5678',
    city: '上海',
    district: '虹口区',
    latitude: 31.2676,
    longitude: 121.4691,
    examTypes: ['KET', 'PET'],
    availableSeats: 80,
    rating: 4.7,
  },
  {
    id: '3',
    name: '广州英国文化协会考试中心',
    address: '广州市天河区天河路385号太古汇一座1102室',
    phone: '020-8888-9012',
    city: '广州',
    district: '天河区',
    latitude: 23.1291,
    longitude: 113.3238,
    examTypes: ['KET', 'PET', 'FCE', 'YLE'],
    availableSeats: 200,
    rating: 4.9,
  },
  {
    id: '4',
    name: '深圳赛格考点',
    address: '深圳市福田区华强北路赛格科技园4栋3楼',
    phone: '0755-8888-3456',
    city: '深圳',
    district: '福田区',
    latitude: 22.5431,
    longitude: 114.0579,
    examTypes: ['KET', 'PET'],
    availableSeats: 60,
    rating: 4.6,
  },
  {
    id: '5',
    name: '成都外国语学院考点',
    address: '成都市武侯区一环路南四段16号',
    phone: '028-8888-7890',
    city: '成都',
    district: '武侯区',
    latitude: 30.5728,
    longitude: 104.0668,
    examTypes: ['KET', 'PET', 'FCE'],
    availableSeats: 100,
    rating: 4.5,
  },
  {
    id: '6',
    name: '杭州浙江外国语学院考点',
    address: '杭州市西湖区文三路140号',
    phone: '0571-8888-2345',
    city: '杭州',
    district: '西湖区',
    latitude: 30.2795,
    longitude: 120.1208,
    examTypes: ['KET', 'PET'],
    availableSeats: 90,
    rating: 4.7,
  },
];

export default function ExamCentersScreen() {
  const router = useSafeRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [selectedExamType, setSelectedExamType] = useState<string>('全部');
  const [centers, setCenters] = useState<ExamCenter[]>(mockExamCenters);
  const [loading, setLoading] = useState(false);

  const cities = ['全部', '北京', '上海', '广州', '深圳', '成都', '杭州'];
  const examTypes = ['全部', 'KET', 'PET', 'FCE', 'YLE'];

  const loadExamCenters = useCallback(async () => {
    setLoading(true);
    try {
      // 实际API调用
      // const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/exam-centers`);
      // const data = await response.json();
      
      // 使用模拟数据（实际项目中替换为真实API）
      setCenters(mockExamCenters);
    } catch (error) {
      console.error('Load exam centers error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExamCenters();
    }, [loadExamCenters])
  );

  // 过滤考试中心
  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name.includes(searchText) ||
      center.address.includes(searchText);
    const matchesCity = selectedCity === '全部' || center.city === selectedCity;
    const matchesType =
      selectedExamType === '全部' ||
      center.examTypes.includes(selectedExamType);
    return matchesSearch && matchesCity && matchesType;
  });

  // 拨打电话
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // 导航到地图
  const handleNavigate = (center: ExamCenter) => {
    const { latitude, longitude, name } = center;
    if (latitude && longitude) {
      // 尝试打开高德地图
      const dUrl = `androidamap://viewMap?sourceApplication=appname&lat=${latitude}&lon=${longitude}&dev=0`;
      // 尝试打开苹果地图
      const aUrl = Platform.OS === 'ios'
        ? `maps://?daddr=${latitude},${longitude}&q=${name}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`;
      
      Linking.canOpenURL(dUrl).then((supported) => {
        if (supported) {
          Linking.openURL(dUrl);
        } else {
          Linking.openURL(aUrl);
        }
      });
    }
  };

  // 渲染考试中心卡片
  const renderCenterCard = ({ item }: { item: ExamCenter }) => (
    <TouchableOpacity
      style={styles.centerCard}
      onPress={() => router.push('/exams/center-detail', { centerId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.centerName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>📍 {item.city}·{item.district}</Text>
        </View>
      </View>

      <Text style={styles.addressText} numberOfLines={2}>
        {item.address}
      </Text>

      <View style={styles.examTypesRow}>
        {item.examTypes.map((type) => (
          <View key={type} style={styles.examTypeBadge}>
            <Text style={styles.examTypeText}>{type}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.seatsInfo}>
          <Text style={styles.seatsLabel}>可报名座位：</Text>
          <Text style={[styles.seatsValue, item.availableSeats < 50 && styles.seatsWarning]}>
            {item.availableSeats}个
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.phone)}
          >
            <Text style={styles.callButtonText}>📞 致电</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigate(item)}
          >
            <Text style={styles.navButtonText}>🗺️ 导航</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>考试中心</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索考试中心名称或地址"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* 城市筛选 */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={cities}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCity === item && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCity(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCity === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 考试类型筛选 */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={examTypes}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  styles.filterChipSmall,
                  selectedExamType === item && styles.filterChipActive,
                ]}
                onPress={() => setSelectedExamType(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedExamType === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 统计信息 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            共找到 {filteredCenters.length} 个考试中心
          </Text>
        </View>

        {/* 考试中心列表 */}
        <FlatList
          data={filteredCenters}
          keyExtractor={(item) => item.id}
          renderItem={renderCenterCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadExamCenters}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>未找到符合条件的考试中心</Text>
            </View>
          }
        />
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3436',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
    marginRight: 10,
  },
  filterChipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#636E72',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statsText: {
    fontSize: 13,
    color: '#636E72',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  centerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginRight: 10,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,193,7,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  locationRow: {
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#636E72',
  },
  addressText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 12,
  },
  examTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  examTypeBadge: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examTypeText: {
    fontSize: 11,
    color: '#6C63FF',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  seatsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  seatsWarning: {
    color: '#FF9800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  callButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  navButton: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  navButtonText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
  },
});
