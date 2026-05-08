import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { courseApi } from '@/utils/courseApi';
import { Screen } from '@/components/Screen';

interface Course {
  id: string;
  title: string;
  description: string;
  cambridgeLevel: string;
  targetAge: string;
  duration: number;
  price: number;
  originalPrice?: number;
  coverImage: string;
  tags: string[];
  enrollmentCount: number;
  rating: number;
}

export default function CoursesScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2'];

  const loadCourses = useCallback(async () => {
    try {
      const data = await courseApi.getCourses(token);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Load courses error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchText ||
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesLevel = !selectedLevel || course.cambridgeLevel === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

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

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>精选课程</Text>
          <Text style={styles.subtitle}>系统化学习路径</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索课程..."
              placeholderTextColor="#B2BEC3"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Level Filter */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedLevel && styles.filterChipActive,
              ]}
              onPress={() => setSelectedLevel('')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedLevel && styles.filterChipTextActive,
                ]}
              >
                全部
              </Text>
            </TouchableOpacity>
            {levels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterChip,
                  selectedLevel === level && styles.filterChipActive,
                  selectedLevel === level && { backgroundColor: getLevelColor(level) },
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLevel === level && styles.filterChipTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Course List */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.courseList}>
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push('/courses-detail', { courseId: course.id })}
              >
                <Image
                  source={{ uri: course.coverImage }}
                  style={styles.courseImage}
                />
                <View style={styles.courseContent}>
                  <View style={styles.courseHeader}>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: `${getLevelColor(course.cambridgeLevel)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelBadgeText,
                          { color: getLevelColor(course.cambridgeLevel) },
                        ]}
                      >
                        {course.cambridgeLevel}
                      </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingIcon}>⭐</Text>
                      <Text style={styles.ratingText}>{course.rating}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {course.title}
                  </Text>
                  
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {course.description}
                  </Text>
                  
                  <View style={styles.courseMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>👥</Text>
                      <Text style={styles.metaText}>{course.enrollmentCount}人学习</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏱️</Text>
                      <Text style={styles.metaText}>{course.duration}周</Text>
                    </View>
                  </View>
                  
                  <View style={styles.courseFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>¥{course.price}</Text>
                      {course.originalPrice && (
                        <Text style={styles.originalPrice}>¥{course.originalPrice}</Text>
                      )}
                    </View>
                    <View style={styles.tagsContainer}>
                      {course.tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredCourses.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>暂无相关课程</Text>
              <Text style={styles.emptyText}>试试其他筛选条件</Text>
            </View>
          )}

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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3436',
  },
  clearIcon: {
    fontSize: 16,
    color: '#B2BEC3',
    padding: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636E72',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  courseList: {
    paddingHorizontal: 24,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  courseDesc: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#636E72',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6584',
  },
  originalPrice: {
    fontSize: 14,
    color: '#B2BEC3',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#6C63FF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#636E72',
  },
  bottomPadding: {
    height: 120,
  },
});
