/**
 * 我的学生列表
 * Teacher Students List
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Screen from '@/components/Screen';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Student {
  id: string;
  name: string;
  avatar: string;
  level: string;
  cefrLevel: string;
  className: string;
  lastActive: string;
  status: 'active' | 'warning' | 'excellent';
}

export default function TeacherStudentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'warning' | 'excellent'>('all');
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = useCallback(async () => {
    try {
      const token = 'demo-teacher-token';
      const response = await fetch(`${API_BASE_URL}/api/v1/wecom/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.code === 0) {
        setStudents(result.data);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [fetchStudents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchQuery) || 
                         student.className.includes(searchQuery);
    if (filter === 'all') return matchesSearch;
    if (filter === 'warning') return matchesSearch && student.status === 'warning';
    if (filter === 'excellent') return matchesSearch && student.status === 'excellent';
    return matchesSearch;
  });

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'warning': return '#F59E0B';
      default: return '#6C63FF';
    }
  };

  const getStatusText = (status: Student['status']) => {
    switch (status) {
      case 'excellent': return '优秀';
      case 'warning': return '需关注';
      default: return '正常';
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/teacher/students/${item.id}`)}
    >
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <View style={styles.studentHeader}>
          <Text style={styles.studentName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.studentDetail}>{item.className}</Text>
        <View style={styles.studentFooter}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>CEFR: {item.cefrLevel}</Text>
          </View>
          <Text style={styles.lastActive}>最近活跃: {item.lastActive}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <FontAwesome6 name="chevron-right" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <FontAwesome6 name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索学生姓名/班级"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'warning', 'excellent'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab === 'all' ? '全部' : tab === 'warning' ? '需关注' : '优秀学员'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>全部学员</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {students.filter(s => s.status === 'warning').length}
            </Text>
            <Text style={styles.statLabel}>需关注</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {students.filter(s => s.status === 'excellent').length}
            </Text>
            <Text style={styles.statLabel}>优秀</Text>
          </View>
        </View>

        {/* Student List */}
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={renderStudent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="users" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>暂无学生</Text>
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
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterTabActive: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  studentDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  studentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  levelBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 12,
  },
  levelText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
