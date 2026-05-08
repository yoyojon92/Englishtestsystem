/**
 * 冲刺包购买页面
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

interface PackageInfo {
  id: string;
  type: 'ket' | 'pet' | 'combo';
  name: string;
  price: number;
  originalPrice: number;
  features: string[];
  mockExamCount: number;
  validDays: number;
  tag?: string;
}

const packages: PackageInfo[] = [
  {
    id: 'ket_basic',
    type: 'ket',
    name: 'KET 冲刺包',
    price: 199,
    originalPrice: 299,
    mockExamCount: 8,
    validDays: 90,
    features: [
      '8次全真模拟考试',
      '薄弱项精准分析',
      '个性化备考建议',
      '考前技巧冲刺课',
      '专属学习群答疑'
    ],
    tag: '最受欢迎'
  },
  {
    id: 'pet_basic',
    type: 'pet',
    name: 'PET 冲刺包',
    price: 249,
    originalPrice: 399,
    mockExamCount: 8,
    validDays: 90,
    features: [
      '8次全真模拟考试',
      '薄弱项精准分析',
      '个性化备考建议',
      '考前技巧冲刺课',
      '专属学习群答疑'
    ],
    tag: 'PET考生首选'
  },
  {
    id: 'combo',
    type: 'combo',
    name: 'KET+PET 联报包',
    price: 399,
    originalPrice: 698,
    mockExamCount: 16,
    validDays: 180,
    features: [
      'KET冲刺包 8次',
      'PET冲刺包 8次',
      '全程备考规划',
      '优先答疑服务',
      '不过重学保障'
    ],
    tag: '限时优惠'
  }
];

export default function CrashCourseOrderScreen() {
  const router = useSafeSearchParams();
  const { examType } = router;
  const [selectedPackage, setSelectedPackage] = useState<string>(
    examType === 'pet' ? 'pet_basic' : examType === 'combo' ? 'combo' : 'ket_basic'
  );
  const [showProtection, setShowProtection] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentPackage = packages.find(p => p.id === selectedPackage)!;
  const protectionPrice = 99;

  // 计算总价
  const totalPrice = currentPackage.price + (showProtection ? protectionPrice : 0);

  // 购买冲刺包
  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // 模拟支付流程
      Alert.alert(
        '确认购买',
        `您将购买 ${currentPackage.name}${showProtection ? ' + 不过重学保障' : ''}\n\n支付金额：¥${totalPrice}`,
        [
          { text: '取消', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: '立即支付',
            onPress: async () => {
              // 模拟支付
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // 跳转到成功页
              router.push('/exams/mock', { 
                packageType: currentPackage.type,
                success: 'true'
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('购买失败', '请稍后重试');
      setLoading(false);
    }
  };

  // 渲染套餐卡片
  const renderPackageCard = (pkg: PackageInfo) => {
    const isSelected = selectedPackage === pkg.id;
    
    return (
      <TouchableOpacity
        key={pkg.id}
        style={[styles.packageCard, isSelected && styles.packageCardSelected]}
        onPress={() => setSelectedPackage(pkg.id)}
      >
        {pkg.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{pkg.tag}</Text>
          </View>
        )}
        
        <View style={styles.packageHeader}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>¥{pkg.price}</Text>
            <Text style={styles.originalPrice}>¥{pkg.originalPrice}</Text>
          </View>
        </View>

        <View style={styles.packageStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pkg.mockExamCount}次</Text>
            <Text style={styles.statLabel}>全真模拟</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pkg.validDays}天</Text>
            <Text style={styles.statLabel}>有效期</Text>
          </View>
        </View>

        <View style={styles.features}>
          {pkg.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen title="购买冲刺包" showBack onBack={() => router.back()}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 套餐选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择套餐</Text>
          {packages.map(renderPackageCard)}
        </View>

        {/* 不过重学保障 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>增值服务</Text>
          <TouchableOpacity
            style={[styles.protectionCard, showProtection && styles.protectionCardSelected]}
            onPress={() => setShowProtection(!showProtection)}
          >
            <View style={styles.protectionLeft}>
              <Text style={styles.protectionTitle}>不过重学保障</Text>
              <Text style={styles.protectionDesc}>
                若本次考试未通过，免费赠送下期冲刺包
              </Text>
            </View>
            <View style={styles.protectionRight}>
              <Text style={styles.protectionPrice}>+¥{protectionPrice}</Text>
              <View style={[styles.checkbox, showProtection && styles.checkboxChecked]}>
                {showProtection && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 价格明细 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>价格明细</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{currentPackage.name}</Text>
              <Text style={styles.priceValue}>¥{currentPackage.price}</Text>
            </View>
            {showProtection && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>不过重学保障</Text>
                <Text style={styles.priceValue}>¥{protectionPrice}</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>应付金额</Text>
              <Text style={styles.totalValue}>¥{totalPrice}</Text>
            </View>
          </View>
        </View>

        {/* 购买须知 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>购买须知</Text>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>1. 冲刺包购买后不支持退款</Text>
            <Text style={styles.noticeText}>2. 模拟考试次数自购买之日起{currentPackage.validDays}天内有效</Text>
            <Text style={styles.noticeText}>3. 考试未通过需提供成绩单申请重学</Text>
            <Text style={styles.noticeText}>4. 重学名额有限，请及时申请</Text>
          </View>
        </View>

        {/* 底部购买栏 */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPrice}>
            <Text style={styles.bottomPriceLabel}>实付金额</Text>
            <Text style={styles.bottomPriceValue}>¥{totalPrice}</Text>
          </View>
          <TouchableOpacity
            style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={loading}
          >
            <Text style={styles.purchaseButtonText}>
              {loading ? '处理中...' : '立即购买'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 12,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative' as const,
  },
  packageCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFFBF8',
  },
  tagBadge: {
    position: 'absolute' as const,
    top: -8,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  packageHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333333',
  },
  priceContainer: {
    alignItems: 'flex-end' as const,
  },
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through' as const,
  },
  packageStats: {
    flexDirection: 'row' as const,
    backgroundColor: '#FFF8F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  features: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  featureIcon: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#666666',
  },
  selectedIndicator: {
    position: 'absolute' as const,
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  selectedIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  protectionCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  protectionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FFF4',
  },
  protectionLeft: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 4,
  },
  protectionDesc: {
    fontSize: 12,
    color: '#666666',
  },
  protectionRight: {
    alignItems: 'flex-end' as const,
    gap: 8,
  },
  protectionPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF6B35',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bottomPrice: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#999999',
  },
  bottomPriceValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  purchaseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#FFB499',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
};
