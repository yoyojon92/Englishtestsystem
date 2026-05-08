import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'practice' | 'quiz';
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  level: string;
  ageRange: string;
  totalDuration: number;
  lessonCount: number;
  progress: number;
  instructor: {
    name: string;
    avatar: string;
    title: string;
    bio: string;
  };
  lessons: Lesson[];
  tags: string[];
  requirements: string[];
}

export default function FreeCourseDetail() {
  const router = useSafeRouter();
  const { courseId } = useSafeSearchParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'info' | 'reviews'>('lessons');

  const fetchCourseDetail = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/free-courses/${courseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const handleStartLearning = () => {
    const firstLesson = course?.lessons.find((l) => !l.isCompleted && !l.isLocked);
    if (firstLesson) {
      router.push('/free-courses/learn', { courseId, lessonId: firstLesson.id });
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.isLocked) return;
    router.push('/free-courses/learn', { courseId, lessonId: lesson.id });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'play-circle';
      case 'practice':
        return 'edit';
      case 'quiz':
        return 'checkbox-marked-circle';
      default:
        return 'document';
    }
  };

  const getLessonColor = (type: string) => {
    switch (type) {
      case 'video':
        return '#3B82F6';
      case 'practice':
        return '#10B981';
      case 'quiz':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  if (!course) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      </Screen>
    );
  }

  const completedCount = course.lessons.filter((l) => l.isCompleted).length;

  return (
    <Screen>
      <ScrollView className="flex-1 bg-white">
        {/* 封面 */}
        <View className="h-56 bg-gradient-to-br from-indigo-400 to-purple-500 relative">
          <View className="absolute inset-0 bg-black/30" />
          <TouchableOpacity
            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="absolute bottom-6 left-4 right-4">
            <Text className="text-2xl font-bold text-white mb-2">{course.title}</Text>
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">{course.category}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">{course.level}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">{course.ageRange}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 进度条 */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">
              学习进度 {completedCount}/{course.lessonCount} 课时
            </Text>
            <Text className="text-sm font-semibold text-indigo-600">
              {course.progress}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${course.progress}%` }}
            />
          </View>
        </View>

        {/* Tab切换 */}
        <View className="flex-row border-b border-gray-200">
          {(['lessons', 'info', 'reviews'] as const).map((tab) => (
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
                {tab === 'lessons' ? '课程目录' : tab === 'info' ? '课程介绍' : '学员评价'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 课程目录 */}
        {activeTab === 'lessons' && (
          <View className="p-4">
            {course.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  lesson.isCompleted
                    ? 'bg-green-50'
                    : lesson.isLocked
                    ? 'bg-gray-100'
                    : 'bg-indigo-50'
                }`}
                onPress={() => handleLessonPress(lesson)}
                disabled={lesson.isLocked}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: getLessonColor(lesson.type) + '20' }}
                >
                  {lesson.isCompleted ? (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  ) : lesson.isLocked ? (
                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                  ) : (
                    <Ionicons name={getLessonIcon(lesson.type) as any} size={20} color={getLessonColor(lesson.type)} />
                  )}
                </View>
                <View className="flex-1 ml-3">
                  <Text
                    className={`font-medium ${
                      lesson.isLocked ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {index + 1}. {lesson.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: getLessonColor(lesson.type) + '20' }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: getLessonColor(lesson.type) }}
                      >
                        {lesson.type === 'video' ? '视频' : lesson.type === 'practice' ? '练习' : '测验'}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">{lesson.duration}分钟</Text>
                  </View>
                </View>
                {!lesson.isLocked && (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 课程介绍 */}
        {activeTab === 'info' && (
          <View className="p-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">课程简介</Text>
            <Text className="text-gray-600 leading-relaxed mb-6">{course.description}</Text>

            <Text className="text-lg font-bold text-gray-900 mb-3">学习目标</Text>
            {course.requirements.map((req, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text className="flex-1 text-gray-600 ml-2">{req}</Text>
              </View>
            ))}

            <View className="mt-6 bg-gray-50 rounded-xl p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">授课教师</Text>
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center">
                  <Text className="text-xl font-bold text-indigo-600">
                    {course.instructor.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-gray-900">{course.instructor.name}</Text>
                  <Text className="text-sm text-indigo-600">{course.instructor.title}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{course.instructor.bio}</Text>
                </View>
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">课程标签</Text>
              <View className="flex-row flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <View key={tag} className="bg-indigo-50 px-3 py-1 rounded-full">
                    <Text className="text-sm text-indigo-600">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 学员评价 */}
        {activeTab === 'reviews' && (
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">学员评价</Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text className="text-indigo-600">写评价</Text>
                <Ionicons name="chevron-forward" size={16} color="#6C63FF" />
              </TouchableOpacity>
            </View>
            <View className="bg-gray-50 rounded-xl p-4 items-center">
              <Text className="text-gray-500">暂无评价</Text>
              <Text className="text-sm text-gray-400 mt-1">成为第一个评价的学员吧</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bg-white border-t border-gray-200 px-4 py-4 pb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border border-gray-200"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium">返回</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-indigo-500 py-4 rounded-xl items-center"
            onPress={handleStartLearning}
          >
            <Text className="text-white font-bold text-lg">
              {course.progress > 0 ? '继续学习' : '开始学习'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
