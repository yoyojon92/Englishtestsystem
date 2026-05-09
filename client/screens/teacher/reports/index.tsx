/**
 * 课后报告管理
 * Post-class Reports Management
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Screen from '@/components/Screen';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Report {
  id: string;
  studentName: string;
  className: string;
  classDate: string;
  status: 'pending' | 'draft' | 'submitted';
  score?: number;
  submittedAt?: string;
}

export default function TeacherReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'draft' | 'submitted'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const token = 'demo-teacher-token';
      const response = await fetch(`${API_BASE_URL}/api/v1/wecom/teacher/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.code === 0) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('获取报告列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const getStatusConfig = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return { color: '#F59E0B', text: '待填写', bg: '#FEF3C7' };
      case 'draft':
        return { color: '#6C63FF', text: '草稿', bg: '#EEF2FF' };
      case 'submitted':
        return { color: '#10B981', text: '已推送', bg: '#D1FAE5' };
    }
  };

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const renderReport = ({ item }: { item: Report }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        style={styles.reportCard}
        activeOpacity={0.7}
        onPress={() => openReportModal(item)}
      >
        <View style={styles.reportHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.studentName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.className}>{item.className}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        <View style={styles.reportBody}>
          <View style={styles.reportItem}>
            <FontAwesome6 name="calendar" size={14} color="#6B7280" />
            <Text style={styles.reportItemText}>{item.classDate}</Text>
          </View>
          {item.score !== undefined && (
            <View style={styles.reportItem}>
              <FontAwesome6 name="star" size={14} color="#F59E0B" />
              <Text style={styles.reportItemText}>综合评分: {item.score}</Text>
            </View>
          )}
        </View>

        <View style={styles.reportFooter}>
          {item.status === 'pending' && (
            <TouchableOpacity style={styles.fillButton}>
              <FontAwesome6 name="edit" size={14} color="#FFFFFF" />
              <Text style={styles.fillButtonText}>填写报告</Text>
            </TouchableOpacity>
          )}
          {item.status === 'draft' && (
            <TouchableOpacity style={styles.submitButton}>
              <FontAwesome6 name="paper-plane" size={14} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>推送家长</Text>
            </TouchableOpacity>
          )}
          {item.status === 'submitted' && (
            <Text style={styles.submittedText}>
              已于 {item.submittedAt} 推送
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'pending', 'draft', 'submitted'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab === 'all' ? '全部' : 
                 tab === 'pending' ? '待填写' : 
                 tab === 'draft' ? '草稿' : '已推送'}
              </Text>
              {tab !== 'all' && (
                <View style={[
                  styles.filterCount,
                  filter === tab && styles.filterCountActive
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    filter === tab && styles.filterCountTextActive
                  ]}>
                    {tab === 'all' ? reports.length : 
                     reports.filter(r => r.status === tab).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Report List */}
        <FlatList
          data={filteredReports}
          keyExtractor={item => item.id}
          renderItem={renderReport}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="clipboard-list" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>暂无报告</Text>
            </View>
          }
        />

        {/* Report Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedReport?.status === 'pending' ? '填写' : '编辑'}课后报告
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <FontAwesome6 name="times" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {selectedReport && (
                  <>
                    {/* Student Info */}
                    <View style={styles.modalStudentInfo}>
                      <View style={styles.modalAvatar}>
                        <Text style={styles.modalAvatarText}>
                          {selectedReport.studentName.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.modalStudentName}>{selectedReport.studentName}</Text>
                        <Text style={styles.modalClassName}>{selectedReport.className}</Text>
                      </View>
                    </View>

                    {/* Score Section */}
                    <Text style={styles.sectionLabel}>综合评分</Text>
                    <View style={styles.scoreRow}>
                      {[1, 2, 3, 4, 5].map(score => (
                        <TouchableOpacity key={score} style={styles.scoreStar}>
                          <FontAwesome6 name="star" size={32} color="#D1D5DB" />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Evaluation Items */}
                    <Text style={styles.sectionLabel}>分项评分</Text>
                    <View style={styles.evaluationGrid}>
                      {['听力', '口语', '阅读', '写作'].map((item, index) => (
                        <View key={index} style={styles.evaluationItem}>
                          <Text style={styles.evaluationLabel}>{item}</Text>
                          <View style={styles.evaluationScore}>
                            <Text style={styles.evaluationValue}>-</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Strengths */}
                    <Text style={styles.sectionLabel}>课堂表现</Text>
                    <View style={styles.tagContainer}>
                      {['积极发言', '发音标准', '注意力集中', '作业完成好'].map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <FontAwesome6 name="check" size={12} color="#10B981" />
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Areas for Improvement */}
                    <Text style={styles.sectionLabel}>需加强</Text>
                    <View style={styles.tagContainer}>
                      {['听力训练', '口语表达', '词汇积累', '语法练习'].map((tag, index) => (
                        <View key={index} style={[styles.tag, styles.tagWarning]}>
                          <FontAwesome6 name="exclamation" size={12} color="#F59E0B" />
                          <Text style={[styles.tagText, { color: '#D97706' }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Personal Comment */}
                    <Text style={styles.sectionLabel}>个性化评语</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="添加您的个性化评语..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                    />
                  </>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.saveDraftButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.saveDraftText}>保存草稿</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pushButton}
                  onPress={() => setModalVisible(false)}
                >
                  <FontAwesome6 name="paper-plane" size={16} color="#FFFFFF" />
                  <Text style={styles.pushButtonText}>推送家长</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
  filterCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterCountText: {
    fontSize: 11,
    color: '#6B7280',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  className: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportBody: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reportItemText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fillButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  submittedText: {
    fontSize: 12,
    color: '#10B981',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalClassName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreStar: {
    padding: 4,
  },
  evaluationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  evaluationItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginRight: '4%',
    marginBottom: 12,
    alignItems: 'center',
  },
  evaluationLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  evaluationScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  evaluationValue: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagWarning: {
    backgroundColor: '#FEF3C7',
  },
  tagText: {
    fontSize: 13,
    color: '#059669',
    marginLeft: 4,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveDraftButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 12,
  },
  saveDraftText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  pushButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
  },
  pushButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});
