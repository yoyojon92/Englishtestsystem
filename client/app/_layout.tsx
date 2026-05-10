import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  return (
    <Provider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        {/* Tab 导航 */}
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        
        {/* 核心测试链路 */}
        <Stack.Screen name="test/entry" options={{ title: "英语水平测试" }} />
        <Stack.Screen name="test/playing" options={{ title: "答题中", headerShown: false }} />
        <Stack.Screen name="test/report" options={{ title: "测试报告", headerShown: false }} />
        
        {/* 分享与报告 */}
        <Stack.Screen name="share" options={{ title: "分享给好友" }} />
        <Stack.Screen name="cefr" options={{ title: "CEFR 评估" }} />
        
        {/* 管理后台 */}
        <Stack.Screen name="admin/index" options={{ title: "管理后台" }} />
        
        {/* 预留页面（暂不使用） */}
        {/* 
        <Stack.Screen name="auth" options={{ title: "登录" }} />
        <Stack.Screen name="free-courses" options={{ title: "免费课程" }} />
        <Stack.Screen name="achievements" options={{ title: "我的成就" }} />
        <Stack.Screen name="ket-practice" options={{ title: "KET 练习" }} />
        <Stack.Screen name="quick-test" options={{ title: "快速测试" }} />
        */}
      </Stack>
      <Toast />
    </Provider>
  );
}
