/**
 * 分享生成器页面
 * 分享测试链接给用户
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { generateShareLink, getSourceList } from '@/utils/share';

interface Props {
  onShare?: (url: string) => void;
}

export default function ShareGenerator({ onShare }: Props) {
  const [testId] = useState('quick_test_v1');
  const [source, setSource] = useState('wechat');
  const [refId] = useState('parent_' + Date.now());
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sourceList = getSourceList();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateShareLink({
        testId,
        source,
        refId,
        level: 'auto',
        channel: 'default',
        entryPoint: 'share_page',
      });
      setGeneratedUrl(result.share_url);
      if (onShare) {
        onShare(result.share_url);
      }
    } catch (error) {
      Alert.alert('错误', '生成分享链接失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedUrl) {
      // 在实际应用中，这里会复制到剪贴板
      Alert.alert('已复制', '分享链接已复制到剪贴板');
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>分享测试给好友</Text>
        <Text style={styles.subtitle}>
          生成专属链接，好友点击即可开始测试
        </Text>

        {/* 来源选择 */}
        <View style={styles.section}>
          <Text style={styles.label}>分享到</Text>
          <View style={styles.sourceGrid}>
            {sourceList.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.sourceItem,
                  source === item.value && styles.sourceItemActive,
                ]}
                onPress={() => setSource(item.value)}
              >
                <Text
                  style={[
                    styles.sourceText,
                    source === item.value && styles.sourceTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 分享按钮 */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '生成中...' : '生成分享链接'}
          </Text>
        </TouchableOpacity>

        {/* 生成的链接 */}
        {generatedUrl && (
          <View style={styles.resultSection}>
            <Text style={styles.label}>分享链接</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} numberOfLines={2}>
                {generatedUrl}
              </Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <Text style={styles.actionText}>复制链接</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => {
                  // 实际应用中调用分享API
                  Alert.alert('分享', '请在微信中粘贴链接分享');
                }}
              >
                <Text style={[styles.actionText, styles.actionTextPrimary]}>
                  分享给好友
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 提示信息 */}
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>分享说明</Text>
          <Text style={styles.tipsText}>
            1. 好友点击链接后会自动记录来源渠道{'\n'}
            2. 完成测试后可追踪转化效果{'\n'}
            3. 每个链接有效期为7天
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sourceItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceItemActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sourceText: {
    fontSize: 14,
    color: '#64748B',
  },
  sourceTextActive: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  urlBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  urlText: {
    fontSize: 12,
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  actionButtonPrimary: {
    backgroundColor: '#10B981',
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  actionTextPrimary: {
    color: '#FFFFFF',
  },
  tips: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 22,
  },
});
