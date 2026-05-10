import { Screen } from '@/components/Screen';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CefrPage() {
  const router = useRouter();

  const levels = [
    { name: 'Pre-A1', description: '入门级', color: '#E8F5E9', level: 'A0' },
    { name: 'A1', description: '初级', color: '#C8E6C9', level: 'A1' },
    { name: 'A2', description: '初中级', color: '#FFF9C4', level: 'A2' },
    { name: 'B1', description: '中级', color: '#FFE0B2', level: 'B1' },
    { name: 'B2', description: '中高级', color: '#FFCCBC', level: 'B2' },
    { name: 'C1', description: '高级', color: '#D1C4E9', level: 'C1' },
    { name: 'C2', description: '精通级', color: '#F8BBD0', level: 'C2' },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>CEFR 等级说明</Text>
        <Text style={styles.subtitle}>
          欧洲语言共同参考框架 (Common European Framework of Reference)
        </Text>

        {levels.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => router.push('/ket-practice')}
          >
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.levelName}>{item.name}</Text>
              <Text style={styles.levelDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/test/entry')}
        >
          <Text style={styles.buttonText}>开始测试</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardContent: { flex: 1 },
  levelName: { fontSize: 18, fontWeight: '600', color: '#333' },
  levelDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
