import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen name="auth" options={{ title: "登录" }} />
        <Stack.Screen name="assessment-start" options={{ title: "能力测评" }} />
        <Stack.Screen name="assessment-quiz" options={{ title: "能力测评" }} />
        <Stack.Screen name="assessment-result" options={{ title: "测评结果" }} />
        <Stack.Screen name="courses-detail" options={{ title: "课程详情" }} />
        <Stack.Screen name="reports-index" options={{ title: "报告列表" }} />
        <Stack.Screen name="reports-detail" options={{ title: "报告详情" }} />
        <Stack.Screen name="exams" options={{ title: "考试中心" }} />
        <Stack.Screen name="exams/detail" options={{ title: "考试详情" }} />
        <Stack.Screen name="exams/sessions" options={{ title: "考试场次" }} />
        <Stack.Screen name="exams/sessions/list" options={{ title: "选择场次" }} />
        <Stack.Screen name="exams/mock" options={{ title: "模拟考试" }} />
        <Stack.Screen name="exams/speaking" options={{ title: "口语考试" }} />
        <Stack.Screen name="exams/registration" options={{ title: "我的报名" }} />
        <Stack.Screen name="exams/registration/success" options={{ title: "报名成功" }} />
        <Stack.Screen name="exams/plans" options={{ title: "备考计划" }} />
        <Stack.Screen name="exams/orders" options={{ title: "我的订单" }} />
        <Stack.Screen name="exams/orders/order" options={{ title: "购买冲刺包" }} />
        <Stack.Screen name="free-courses" options={{ title: "免费课程" }} />
        <Stack.Screen name="free-courses/list" options={{ title: "课程列表" }} />
        <Stack.Screen name="free-courses/detail" options={{ title: "课程详情" }} />
        <Stack.Screen name="free-courses/learn" options={{ title: "学习课程" }} />
        <Stack.Screen name="achievements" options={{ title: "我的成就" }} />
        <Stack.Screen name="notifications" options={{ title: "消息中心" }} />
        <Stack.Screen name="ai" options={{ title: "AI 能力中心" }} />
        <Stack.Screen name="profile/student" options={{ title: "学员画像" }} />
        <Stack.Screen name="profile-view" options={{ title: "学员画像" }} />
        <Stack.Screen name="exam-centers" options={{ title: "考试中心" }} />
        <Stack.Screen name="contact" options={{ title: "联系我们" }} />
        <Stack.Screen name="cefr" options={{ title: "CEFR 评估" }} />
        <Stack.Screen name="prep-plan" options={{ title: "备考计划" }} />
        <Stack.Screen name="payment/index" options={{ title: "支付" }} />
        <Stack.Screen name="payment/success" options={{ title: "支付成功" }} />
        <Stack.Screen name="payment/orders" options={{ title: "我的订单" }} />
        <Stack.Screen name="teacher" options={{ title: "教师工作台" }} />
        <Stack.Screen name="teacher/students" options={{ title: "我的学生" }} />
        <Stack.Screen name="teacher/reports" options={{ title: "课后报告" }} />
        <Stack.Screen name="teacher/schedule" options={{ title: "课程表" }} />
        <Stack.Screen name="teacher/stats" options={{ title: "数据看板" }} />
        <Stack.Screen name="ket-practice" options={{ title: "KET 练习" }} />
        <Stack.Screen name="learning-plan" options={{ title: "学习计划" }} />
        <Stack.Screen name="quick-test" options={{ title: "快速测试" }} />
        <Stack.Screen name="profile-student" options={{ title: "学员画像" }} />
        <Stack.Screen name="test/entry" options={{ title: "英语水平测试" }} />
        <Stack.Screen name="test/playing" options={{ title: "答题中", headerShown: false }} />
        <Stack.Screen name="test/report" options={{ title: "测试报告", headerShown: false }} />
        <Stack.Screen name="share" options={{ title: "分享给好友" }} />
	        <Stack.Screen name="admin" options={{ title: "管理后台" }} />
      </Stack>
      <Toast />
    </Provider>
  );
}
