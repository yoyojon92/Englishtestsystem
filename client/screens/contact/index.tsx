import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

interface ContactInfo {
  schoolName: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  wechatQrCode?: string;
  businessHours: string;
  latitude?: number;
  longitude?: number;
}

const mockContactInfo: ContactInfo = {
  schoolName: '剑桥英语能力测评中心',
  address: '北京市海淀区中关村大街1号创新大厦A座10层',
  phone: '400-888-9999',
  email: 'service@cambridge-english.cn',
  businessHours: '周一至周日 09:00 - 21:00',
  latitude: 39.9835,
  longitude: 116.3123,
};

export default function ContactScreen() {
  const router = useSafeRouter();
  const [contact, setContact] = useState<ContactInfo>(mockContactInfo);
  const [messageText, setMessageText] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

  // 拨打电话
  const handleCall = useCallback(() => {
    Linking.openURL(`tel:${contact.phone}`);
  }, [contact.phone]);

  // 发送邮件
  const handleEmail = useCallback(() => {
    Linking.openURL(`mailto:${contact.email}`);
  }, [contact.email]);

  // 添加企业微信客服
  const handleAddWechat = useCallback(() => {
    // 在实际应用中，这里会打开企业微信客服或展示二维码
    Alert.alert(
      '添加客服微信',
      '请添加客服微信号：CambridgeEnglish\n\n工作时间：周一至周日 09:00-21:00',
      [
        { text: '复制微信号', onPress: () => {} },
        { text: '关闭', style: 'cancel' },
      ]
    );
  }, []);

  // 导航到地图
  const handleNavigate = useCallback(() => {
    if (contact.latitude && contact.longitude) {
      const { latitude, longitude } = contact;
      const address = encodeURIComponent(contact.address);
      
      if (Platform.OS === 'ios') {
        Linking.openURL(
          `maps://?daddr=${latitude},${longitude}&q=${address}`
        );
      } else {
        Linking.openURL(
          `geo:${latitude},${longitude}?q=${latitude},${longitude}(${address})`
        );
      }
    }
  }, [contact]);

  // 提交留言
  const handleSubmitMessage = useCallback(() => {
    if (!messageText.trim()) {
      Alert.alert('提示', '请输入留言内容');
      return;
    }
    
    // 实际提交到服务器
    Alert.alert('提交成功', '感谢您的留言，我们会尽快回复您！', [
      { text: '确定', onPress: () => {
        setMessageText('');
        setShowMessageInput(false);
      }},
    ]);
  }, [messageText]);

  // 在线客服
  const handleOnlineService = useCallback(() => {
    Alert.alert(
      '在线客服',
      '客服正在接入，请稍候...\n\n您也可以通过以下方式联系我们：\n📞 电话：400-888-9999\n💬 微信：CambridgeEnglish',
      [{ text: '确定' }]
    );
  }, []);

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>联系我们</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* 学校信息卡片 */}
        <View style={styles.schoolCard}>
          <View style={styles.schoolLogo}>
            <Text style={styles.schoolLogoText}>
              {contact.schoolName.charAt(0)}
            </Text>
          </View>
          <Text style={styles.schoolName}>{contact.schoolName}</Text>
          <Text style={styles.schoolDesc}>
            专业英语能力测评与培训服务
          </Text>
        </View>

        {/* 联系方式列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系方式</Text>
          
          {/* 电话 */}
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <View style={[styles.contactIcon, { backgroundColor: 'rgba(76,175,80,0.1)' }]}>
              <Text style={styles.contactIconText}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>客服热线</Text>
              <Text style={styles.contactValue}>{contact.phone}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* 邮箱 */}
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={[styles.contactIcon, { backgroundColor: 'rgba(33,150,243,0.1)' }]}>
              <Text style={styles.contactIconText}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>电子邮箱</Text>
              <Text style={styles.contactValue}>{contact.email}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* 地址 */}
          <TouchableOpacity style={styles.contactItem} onPress={handleNavigate}>
            <View style={[styles.contactIcon, { backgroundColor: 'rgba(255,152,0,0.1)' }]}>
              <Text style={styles.contactIconText}>📍</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>机构地址</Text>
              <Text style={styles.contactValue} numberOfLines={2}>
                {contact.address}
              </Text>
            </View>
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>导航</Text>
            </View>
          </TouchableOpacity>

          {/* 营业时间 */}
          <View style={styles.contactItem}>
            <View style={[styles.contactIcon, { backgroundColor: 'rgba(156,39,176,0.1)' }]}>
              <Text style={styles.contactIconText}>🕐</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>营业时间</Text>
              <Text style={styles.contactValue}>{contact.businessHours}</Text>
            </View>
          </View>
        </View>

        {/* 在线客服 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>在线客服</Text>
          
          <TouchableOpacity style={styles.serviceCard} onPress={handleOnlineService}>
            <View style={styles.serviceLeft}>
              <View style={styles.serviceAvatar}>
                <Text style={styles.serviceAvatarText}>🤖</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>智能客服小助手</Text>
                <Text style={styles.serviceStatus}>在线 · 随时为您服务</Text>
              </View>
            </View>
            <View style={styles.serviceButton}>
              <Text style={styles.serviceButtonText}>立即咨询</Text>
            </View>
          </TouchableOpacity>

          {/* 微信客服 */}
          <TouchableOpacity style={styles.wechatCard} onPress={handleAddWechat}>
            <View style={styles.wechatLeft}>
              <Text style={styles.wechatIcon}>💬</Text>
              <View style={styles.wechatInfo}>
                <Text style={styles.wechatName}>课程顾问微信</Text>
                <Text style={styles.wechatDesc}>添加好友获取更多课程优惠</Text>
              </View>
            </View>
            <View style={styles.wechatButton}>
              <Text style={styles.wechatButtonText}>添加微信</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 留言反馈 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>留言反馈</Text>
          
          {showMessageInput ? (
            <View style={styles.messageCard}>
              <TextInput
                style={styles.messageInput}
                placeholder="请输入您的留言内容..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={messageText}
                onChangeText={setMessageText}
              />
              <View style={styles.messageButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowMessageInput(false);
                    setMessageText('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitMessage}
                >
                  <Text style={styles.submitButtonText}>提交留言</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.leaveMessageCard}
              onPress={() => setShowMessageInput(true)}
            >
              <Text style={styles.leaveMessageIcon}>✉️</Text>
              <Text style={styles.leaveMessageText}>点击此处留言</Text>
              <Text style={styles.leaveMessageArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 二维码 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关注我们</Text>
          
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <View style={styles.qrCode}>
                <Text style={styles.qrText}>二维码</Text>
              </View>
              <Text style={styles.qrLabel}>扫码关注公众号</Text>
            </View>
            <View style={styles.qrDivider} />
            <View style={styles.qrPlaceholder}>
              <View style={styles.qrCode}>
                <Text style={styles.qrText}>二维码</Text>
              </View>
              <Text style={styles.qrLabel}>小程序入口</Text>
            </View>
          </View>
        </View>

        {/* 快捷操作 */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleCall}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.quickActionEmoji}>📞</Text>
              </View>
              <Text style={styles.quickActionText}>一键拨号</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={handleNavigate}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.quickActionEmoji}>🗺️</Text>
              </View>
              <Text style={styles.quickActionText}>地图导航</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={handleOnlineService}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.quickActionEmoji}>💬</Text>
              </View>
              <Text style={styles.quickActionText}>在线咨询</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={handleAddWechat}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.quickActionEmoji}>➕</Text>
              </View>
              <Text style={styles.quickActionText}>加微咨询</Text>
            </TouchableOpacity>
          </View>
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
  schoolCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 12,
  },
  schoolLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  schoolLogoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  schoolName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
  },
  schoolDesc: {
    fontSize: 14,
    color: '#636E72',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#2D3436',
  },
  contactArrow: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  navBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  navBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceAvatarText: {
    fontSize: 24,
  },
  serviceInfo: {},
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  serviceStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  serviceButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  serviceButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  wechatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8E8',
    borderRadius: 12,
    padding: 14,
  },
  wechatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wechatIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  wechatInfo: {},
  wechatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  wechatDesc: {
    fontSize: 11,
    color: '#636E72',
  },
  wechatButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  wechatButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3436',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#636E72',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaveMessageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  leaveMessageIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  leaveMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#636E72',
  },
  leaveMessageArrow: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrPlaceholder: {
    flex: 1,
    alignItems: 'center',
  },
  qrCode: {
    width: 100,
    height: 100,
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrText: {
    fontSize: 12,
    color: '#999',
  },
  qrLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  qrDivider: {
    width: 1,
    height: 100,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 11,
    color: '#636E72',
  },
  bottomPadding: {
    height: 40,
  },
});
