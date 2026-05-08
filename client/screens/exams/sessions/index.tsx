import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { getExamSessions, getExamCities, type ExamSession, type ExamCatalog, getExamDetail } from '@/utils/examApi';

export default function ExamSessionsScreen() {
  const router = useSafeRouter();
  const { examId, examName } = useSafeSearchParams<{ examId: string; examName: string }>();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<'all' | 'paper' | 'computer'>('all');
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamCatalog | null>(null);
  
  // Registration Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    studentName: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    idNumber: '',
    parentName: '',
    parentPhone: '',
    relationship: '家长',
    serviceType: 'basic' as 'basic' | 'vip'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessionsData, citiesData, examData] = await Promise.all([
          getExamSessions(examId),
          getExamCities(),
          getExamDetail(examId)
        ]);
        setSessions(sessionsData);
        setCities(['全部', ...citiesData]);
        setExam(examData);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (examId) {
      loadData();
    }
  }, [examId]);

  const filteredSessions = sessions.filter(session => {
    if (selectedCity !== '全部' && session.city !== selectedCity) return false;
    if (selectedType !== 'all' && session.examType !== selectedType) return false;
    return true;
  });

  const handleRegister = (session: ExamSession) => {
    setSelectedSession(session);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    // In real app, would call API
    setModalVisible(false);
    router.push('/exams/registration/success', { 
      sessionId: selectedSession?.sessionId,
      examName 
    });
  };

  const getDateStatus = (session: ExamSession) => {
    const now = new Date();
    const examDate = new Date(session.examDate);
    const regClose = new Date(session.registrationCloseDate);
    
    if (now < new Date(session.registrationOpenDate)) {
      return { text: '报名未开始', color: '#666', bg: '#F5F5F5' };
    }
    if (regClose < now) {
      return { text: '报名已截止', color: '#C62828', bg: '#FFEBEE' };
    }
    if (session.availableSeats <= 5) {
      return { text: `仅剩${session.availableSeats}席`, color: '#E65100', bg: '#FFF3E0' };
    }
    return { text: '可报名', color: '#2E7D32', bg: '#E8F5E9' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white border-b border-gray-100">
          <View className="flex-row items-center mb-3">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 text-lg">‹</Text>
            </TouchableOpacity>
            <Text className="ml-2 text-gray-800 font-semibold">{examName}</Text>
          </View>
          
          {/* Exam Info */}
          {exam && (
            <View className="flex-row items-center bg-gray-50 rounded-xl p-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-500">考试时间</Text>
                <Text className="font-bold text-gray-800">约 {exam.examStructure.totalDuration} 分钟</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">满分</Text>
                <Text className="font-bold text-gray-800">{exam.examStructure.totalScore} 分</Text>
              </View>
            </View>
          )}
        </View>

        {/* Filters */}
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          {/* City Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {cities.map(city => (
              <TouchableOpacity
                key={city}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCity === city ? 'bg-[#6C63FF]' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedCity(city)}
              >
                <Text className={`text-sm ${selectedCity === city ? 'text-white' : 'text-gray-600'}`}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Type Filter */}
          <View className="flex-row">
            {[
              { key: 'all', label: '全部' },
              { key: 'paper', label: '纸笔考' },
              { key: 'computer', label: '机考' }
            ].map(type => (
              <TouchableOpacity
                key={type.key}
                className={`flex-1 py-2 rounded-lg mr-2 items-center ${
                  selectedType === type.key ? 'bg-[#6C63FF]/10' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedType(type.key as any)}
              >
                <Text className={`text-sm ${selectedType === type.key ? 'text-[#6C63FF] font-medium' : 'text-gray-500'}`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sessions List */}
        <View className="px-4 py-4">
          <Text className="text-sm text-gray-500 mb-3">
            共找到 {filteredSessions.length} 场考试
          </Text>
          
          {filteredSessions.map(session => {
            const status = getDateStatus(session);
            const isAvailable = status.text === '可报名' || status.text.includes('仅剩');
            
            return (
              <View 
                key={session.sessionId}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{session.centerName}</Text>
                    <Text className="text-xs text-gray-500 mt-1">{session.centerAddress}</Text>
                    <Text className="text-xs text-gray-400 mt-1">{session.city}</Text>
                  </View>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: status.bg }}
                  >
                    <Text className="text-xs font-medium" style={{ color: status.color }}>
                      {status.text}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <View className={`px-2 py-0.5 rounded mr-2 ${session.examType === 'paper' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    <Text className={`text-xs ${session.examType === 'paper' ? 'text-blue-600' : 'text-purple-600'}`}>
                      {session.examType === 'paper' ? '纸笔' : '机考'}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-[#6C63FF]">¥{session.fee}</Text>
                </View>
                
                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">考试日期</Text>
                    <Text className="text-sm font-medium text-gray-800">{formatDate(session.examDate)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">报名截止</Text>
                    <Text className="text-sm font-medium text-gray-800">{formatDate(session.registrationCloseDate)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">剩余座位</Text>
                    <Text className="text-sm font-medium text-gray-800">{session.availableSeats}/{session.totalSeats}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  className={`p-3 rounded-xl items-center ${
                    isAvailable ? 'bg-[#6C63FF]' : 'bg-gray-200'
                  }`}
                  disabled={!isAvailable}
                  onPress={() => handleRegister(session)}
                >
                  <Text className={`font-bold ${isAvailable ? 'text-white' : 'text-gray-400'}`}>
                    {isAvailable ? '立即报名' : status.text}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
          
          {filteredSessions.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">📭</Text>
              <Text className="text-gray-500">暂无可用场次</Text>
              <Text className="text-sm text-gray-400 mt-1">请选择其他城市或考试类型</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Registration Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">报名信息</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-400 text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedSession && (
                <View className="bg-gray-50 rounded-xl p-3 mb-4">
                  <Text className="text-sm text-gray-500">{selectedSession.examType === 'paper' ? '纸笔考试' : '机考'}</Text>
                  <Text className="font-medium text-gray-800">{selectedSession.centerName}</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    考试日期：{formatDate(selectedSession.examDate)}
                  </Text>
                  <Text className="font-bold text-[#6C63FF] mt-2">
                    ¥{selectedSession.fee} + 服务费¥{registrationForm.serviceType === 'vip' ? '199' : '99'}
                  </Text>
                </View>
              )}
              
              <Text className="text-sm font-medium text-gray-700 mb-2">考生信息</Text>
              <View className="space-y-3 mb-4">
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="考生姓名"
                  value={registrationForm.studentName}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, studentName: text})}
                />
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-xl items-center ${registrationForm.gender === 'male' ? 'bg-[#6C63FF]' : 'bg-gray-100'}`}
                    onPress={() => setRegistrationForm({...registrationForm, gender: 'male'})}
                  >
                    <Text className={registrationForm.gender === 'male' ? 'text-white' : 'text-gray-600'}>男</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-xl items-center ${registrationForm.gender === 'female' ? 'bg-[#6C63FF]' : 'bg-gray-100'}`}
                    onPress={() => setRegistrationForm({...registrationForm, gender: 'female'})}
                  >
                    <Text className={registrationForm.gender === 'female' ? 'text-white' : 'text-gray-600'}>女</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="出生日期 (如: 2015-06-01)"
                  value={registrationForm.birthDate}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, birthDate: text})}
                />
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="身份证号/护照号"
                  value={registrationForm.idNumber}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, idNumber: text})}
                />
              </View>
              
              <Text className="text-sm font-medium text-gray-700 mb-2">家长信息</Text>
              <View className="space-y-3 mb-4">
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="家长姓名"
                  value={registrationForm.parentName}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, parentName: text})}
                />
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="联系电话"
                  keyboardType="phone-pad"
                  value={registrationForm.parentPhone}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, parentPhone: text})}
                />
              </View>
              
              <Text className="text-sm font-medium text-gray-700 mb-2">服务类型</Text>
              <View className="space-y-3 mb-6">
                <TouchableOpacity 
                  className={`p-4 rounded-xl border-2 ${registrationForm.serviceType === 'basic' ? 'border-[#6C63FF] bg-[#6C63FF]/5' : 'border-gray-200'}`}
                  onPress={() => setRegistrationForm({...registrationForm, serviceType: 'basic'})}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-medium text-gray-800">基础代报名</Text>
                      <Text className="text-sm text-gray-500">¥99 - 代提交+跟踪</Text>
                    </View>
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      registrationForm.serviceType === 'basic' ? 'border-[#6C63FF] bg-[#6C63FF]' : 'border-gray-300'
                    }`}>
                      {registrationForm.serviceType === 'basic' && <Text className="text-white text-xs">✓</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`p-4 rounded-xl border-2 ${registrationForm.serviceType === 'vip' ? 'border-[#FF6584] bg-[#FF6584]/5' : 'border-gray-200'}`}
                  onPress={() => setRegistrationForm({...registrationForm, serviceType: 'vip'})}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <View className="flex-row items-center">
                        <Text className="font-medium text-gray-800">VIP代报名</Text>
                        <View className="ml-2 px-2 py-0.5 rounded-full bg-[#FF6584]">
                          <Text className="text-white text-xs">推荐</Text>
                        </View>
                      </View>
                      <Text className="text-sm text-gray-500">¥199 - 全方位服务</Text>
                    </View>
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      registrationForm.serviceType === 'vip' ? 'border-[#FF6584] bg-[#FF6584]' : 'border-gray-300'
                    }`}>
                      {registrationForm.serviceType === 'vip' && <Text className="text-white text-xs">✓</Text>}
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400 mt-2">
                    含准考证提醒+考点指引+考前注意事项清单
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#FF6584]"
                onPress={handleSubmit}
              >
                <Text className="text-white text-center font-bold">
                  确认报名
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
