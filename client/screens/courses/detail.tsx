import React, { useState, useEffect } from 'react';
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
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { courseApi } from '@/utils/courseApi';
import { Screen } from '@/components/Screen';

export default function CourseDetailScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const { courseId } = useSafeSearchParams<{ courseId: string }>();
  
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      const data = await courseApi.getCourseDetail(token, courseId!);
      setCourse(data.course);
      setIsEnrolled(data.isEnrolled);
      setEnrollment(data.enrollment);
    } catch (error) {
      console.error('Load course detail error:', error);
      Alert.alert('错误', '加载课程详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      router.replace('/auth');
      return;
    }

    setEnrolling(true);
    try {
      await courseApi.enrollCourse(token!, courseId!);
      setIsEnrolled(true);
      Alert.alert('成功', '报名成功！开始学习吧！');
      loadCourseDetail();
    } catch (error: any) {
      Alert.alert('错误', error.message || '报名失败');
    } finally {
      setEnrolling(false);
    }
  };

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

  if (loading || !course) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: course.coverImage }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: `${getLevelColor(course.cambridgeLevel)}` },
              ]}
            >
              <Text style={styles.levelBadgeText}>{course.cambridgeLevel}</Text>
            </View>
            <Text style={styles.heroTitle}>{course.title}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>👥</Text>
                <Text style={styles.metaText}>{course.enrollmentCount}人学习</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⭐</Text>
                <Text style={styles.metaText}>{course.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          {/* Price Card */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.price}>¥{course.price}</Text>
              {course.originalPrice && (
                <Text style={styles.originalPrice}>原价 ¥{course.originalPrice}</Text>
              )}
            </View>
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{course.duration}</Text>
                <Text style={styles.statLabel}>周</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{course.lessons}</Text>
                <Text style={styles.statLabel}>课时</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{course.targetAge}</Text>
                <Text style={styles.statLabel}>适龄</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>课程介绍</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>课程特色</Text>
            <View style={styles.featuresGrid}>
              {course.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>
                    {['🎯', '📚', '✍️', '💬'][index % 4]}
                  </Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Syllabus */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>课程大纲</Text>
            {course.syllabus.slice(0, 4).map((lesson: any, index: number) => (
              <View key={index} style={styles.syllabusItem}>
                <View style={styles.syllabusNumber}>
                  <Text style={styles.syllabusNumberText}>{lesson.week}</Text>
                </View>
                <View style={styles.syllabusContent}>
                  <Text style={styles.syllabusTitle}>第{lesson.week}周 · {lesson.title}</Text>
                  <Text style={styles.syllabusTopics}>
                    {lesson.topics.join(' · ')}
                  </Text>
                </View>
              </View>
            ))}
            {course.syllabus.length > 4 && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>
                  查看全部{course.syllabus.length}周课程
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>相关标签</Text>
            <View style={styles.tagsContainer}>
              {course.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert('分享', '分享功能开发中')}
        >
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
        
        {isEnrolled ? (
          <TouchableOpacity
            style={styles.enrolledButton}
            onPress={() => router.push('/progress')}
          >
            <LinearGradient
              colors={['#4CAF50', '#8BC34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enrolledGradient}
            >
              <Text style={styles.enrolledButtonText}>继续学习</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            <LinearGradient
              colors={enrolling ? ['#B2BEC3', '#B2BEC3'] : ['#6C63FF', '#896BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enrollGradient}
            >
              <Text style={styles.enrollButtonText}>
                {enrolling ? '报名中...' : `立即报名 ¥${course.price}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
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
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF6584',
  },
  originalPrice: {
    fontSize: 14,
    color: '#B2BEC3',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8E8EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
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
  featureIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '600',
  },
  syllabusItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  syllabusNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  syllabusNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  syllabusContent: {
    flex: 1,
  },
  syllabusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  syllabusTopics: {
    fontSize: 13,
    color: '#636E72',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#D1D9E6',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
  },
  enrollButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  enrollGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enrolledButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  enrolledGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
  },
  enrolledButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
