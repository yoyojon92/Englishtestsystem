import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentApi } from '@/utils/assessmentApi';
import { Screen } from '@/components/Screen';

interface Level {
  code: string;
  name: string;
  age: string;
  description: string;
  examType: string;
}

export default function AssessmentStartScreen() {
  const router = useSafeRouter();
  const { token } = useAuth();
  const params = useSafeSearchParams<{ level?: string }>();
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>(params.level || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      const data = await assessmentApi.getAssessmentLevels();
      setLevels(data.levels || []);
      if (params.level) {
        setSelectedLevel(params.level);
      }
    } catch (error) {
      console.error('Load levels error:', error);
    }
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string[]> = {
      'Pre-A1': ['#4CAF50', '#8BC34A'],
      'A1': ['#2196F3', '#03A9F4'],
      'A2': ['#9C27B0', '#E91E63'],
      'B1': ['#FF9800', '#FF5722'],
      'B2': ['#F44336', '#E91E63'],
    };
    return colors[level] || ['#6C63FF', '#896BFF'];
  };

  const handleStartAssessment = async () => {
    if (!selectedLevel) {
      Alert.alert('提示', '请先选择适合的级别');
      return;
    }

    if (!token) {
      router.replace('/auth');
      return;
    }

    setLoading(true);
    try {
      const data = await assessmentApi.startAssessment(token, {
        type: 'initial',
        cambridgeLevel: selectedLevel,
      });
      
      router.push('/assessment-quiz', { assessmentId: data.assessment.id });
    } catch (error: any) {
      Alert.alert('错误', error.message || '启动测评失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>英语能力测评</Text>
          <Text style={styles.subtitle}>选择适合孩子的级别开始测评</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#6C63FF', '#896BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoGradient}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>⏱️</Text>
                <Text style={styles.infoText}>约15分钟</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>📝</Text>
                <Text style={styles.infoText}>10道题目</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <Text style={styles.infoText}>立即出报告</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Level Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择测评级别</Text>
          <Text style={styles.sectionSubtitle}>根据孩子的年龄或在校年级选择</Text>
          
          <View style={styles.levelsGrid}>
            {levels.map((level) => {
              const isSelected = selectedLevel === level.code;
              const colors = getLevelColor(level.code);
              
              return (
                <TouchableOpacity
                  key={level.code}
                  style={[
                    styles.levelCard,
                    isSelected && styles.levelCardSelected,
                  ]}
                  onPress={() => setSelectedLevel(level.code)}
                >
                  <LinearGradient
                    colors={isSelected ? colors : ['#F0F0F3', '#F0F0F3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.levelGradient}
                  >
                    <Text
                      style={[
                        styles.levelCode,
                        { color: isSelected ? '#FFFFFF' : '#2D3436' },
                      ]}
                    >
                      {level.code}
                    </Text>
                    <Text
                      style={[
                        styles.levelName,
                        { color: isSelected ? 'rgba(255,255,255,0.9)' : '#636E72' },
                      ]}
                    >
                      {level.name.replace('Cambridge ', '')}
                    </Text>
                    <Text
                      style={[
                        styles.levelAge,
                        { color: isSelected ? 'rgba(255,255,255,0.7)' : '#B2BEC3' },
                      ]}
                    >
                      {level.age}岁
                    </Text>
                  </LinearGradient>
                  
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Level Details */}
        {selectedLevel && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              {levels.find(l => l.code === selectedLevel)?.name}
            </Text>
            <Text style={styles.detailDesc}>
              {levels.find(l => l.code === selectedLevel)?.description}
            </Text>
            <View style={styles.examInfo}>
              <Text style={styles.examLabel}>对应考试</Text>
              <Text style={styles.examValue}>
                {levels.find(l => l.code === selectedLevel)?.examType}
              </Text>
            </View>
          </View>
        )}

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartAssessment}
            disabled={!selectedLevel || loading}
          >
            <LinearGradient
              colors={
                selectedLevel && !loading
                  ? ['#6C63FF', '#896BFF']
                  : ['#B2BEC3', '#B2BEC3']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? '准备中...' : '开始测评'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            测评结果仅供参考，正式定级以剑桥官方考试为准
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoGradient: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 16,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  levelCardSelected: {
    ...Platform.select({
      ios: {
        shadowColor: '#6C63FF',
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  levelGradient: {
    padding: 16,
    alignItems: 'center',
  },
  levelCode: {
    fontSize: 24,
    fontWeight: '800',
  },
  levelName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  levelAge: {
    fontSize: 11,
    marginTop: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  detailCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  detailDesc: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
    marginBottom: 12,
  },
  examInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examLabel: {
    fontSize: 13,
    color: '#B2BEC3',
    marginRight: 8,
  },
  examValue: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  startButton: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 9999,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomPadding: {
    height: 120,
  },
});
