import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  level: string;
  ageRange: string;
  duration: number;
  lessonCount: number;
  progress?: number;
  isCompleted?: boolean;
  isFavorite?: boolean;
  tags: string[];
  instructor: string;
  rating: number;
  studentCount: number;
}

const categories = ['全部', '自然拼读', '口语对话', '阅读理解', '语法基础', '词汇拓展'];
const levels = ['全部', '零基础', 'A1', 'A2', 'B1'];

export default function FreeCourseList() {
  const router = useSafeRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== '全部') params.append('category', selectedCategory);
      if (selectedLevel !== '全部') params.append('level', selectedLevel);
      if (searchQuery) params.append('keyword', searchQuery);

      const response = await fetch(`${API_BASE}/api/v1/free-courses?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedLevel, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleCoursePress = (course: Course) => {
    router.push('/free-courses/detail', { courseId: course.id });
  };

  const handleContinue = (course: Course) => {
    router.push('/free-courses/learn', { courseId: course.id });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '自然拼读':
        return 'spell-check';
      case '口语对话':
        return 'comments';
      case '阅读理解':
        return 'book-reader';
      case '语法基础':
        return 'tasks';
      case '词汇拓展':
        return 'sort-alpha-down';
      default:
        return 'graduation-cap';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '零基础':
        return '#10B981';
      case 'A1':
        return '#3B82F6';
      case 'A2':
        return '#8B5CF6';
      case 'B1':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
      onPress={() => handleCoursePress(course)}
      activeOpacity={0.8}
    >
      {/* 封面图 */}
      <View className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 relative">
        <View className="absolute inset-0 bg-black/20" />
        <View className="absolute top-3 left-3 flex-row gap-2">
          <View className="bg-white/90 px-2 py-1 rounded-full flex-row items-center gap-1">
            <FontAwesome5 name={getCategoryIcon(course.category)} size={12} color="#6C63FF" />
            <Text className="text-xs text-indigo-600 font-medium">{course.category}</Text>
          </View>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: getLevelColor(course.level) }}
          >
            <Text className="text-xs text-white font-medium">{course.level}</Text>
          </View>
        </View>
        {course.progress !== undefined && course.progress > 0 && (
          <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <View
              className="h-full bg-green-400"
              style={{ width: `${course.progress}%` }}
            />
          </View>
        )}
        {course.isCompleted && (
          <View className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-full">
            <Text className="text-xs text-white font-medium">已完成</Text>
          </View>
        )}
      </View>

      {/* 内容 */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>
          {course.title}
        </Text>
        <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        {/* 元信息 */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">{course.duration}分钟</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="play-circle" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">{course.lessonCount}课时</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="people" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">{course.studentCount}</Text>
            </View>
          </View>
        </View>

        {/* 底部 */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-xs font-bold text-indigo-600">
                {course.instructor.charAt(0)}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">{course.instructor}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-sm text-gray-600">{course.rating}</Text>
          </View>
        </View>

        {/* 继续学习按钮 */}
        {course.progress !== undefined && course.progress > 0 && (
          <TouchableOpacity
            className="mt-3 bg-indigo-500 py-3 rounded-xl items-center"
            onPress={() => handleContinue(course)}
          >
            <Text className="text-white font-semibold">
              {course.progress >= 100 ? '重新学习' : '继续学习'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* 头部 */}
      <View className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white mb-4">免费课程</Text>
        {/* 搜索框 */}
        <View className="bg-white/20 rounded-xl px-4 py-3 flex-row items-center gap-2">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 text-white placeholder-white/70"
            placeholder="搜索课程..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 筛选标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white py-3 px-4 border-b border-gray-100"
      >
        <View className="flex-row gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat ? 'bg-indigo-500' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 级别筛选 */}
      <View className="bg-white px-4 py-2 flex-row items-center gap-2">
        <Text className="text-sm text-gray-500">难度：</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {levels.map((level) => (
              <TouchableOpacity
                key={level}
                className={`px-3 py-1 rounded-lg ${
                  selectedLevel === level ? 'bg-purple-100' : 'bg-gray-50'
                }`}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedLevel === level ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 课程列表 */}
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {courses.map(renderCourseCard)}
        </View>
      </ScrollView>
    </Screen>
  );
}
