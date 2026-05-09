<template>
  <div class="landing-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📚</div>
          <div class="logo-text">
            <span class="logo-title">剑桥英语能力测评</span>
            <span class="logo-subtitle">Cambridge English Assessment</span>
          </div>
        </div>
        <button class="contact-btn" @click="scrollToContact">联系我们</button>
      </div>
    </header>

    <!-- Hero区域 -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🎯 新用户首测优惠</div>
        <h1 class="hero-title">发现孩子的<br/>英语天赋</h1>
        <p class="hero-desc">
          15分钟AI智能测评 · CEFR国际标准定级<br/>
          专业报告+个性化学习方案
        </p>
        <div class="hero-price">
          <span class="price-original">原价 ¥59.9</span>
          <span class="price-current">首测仅需 ¥9.9</span>
        </div>
        <button class="hero-btn" @click="startAssessment">
          立即测评
        </button>
        <p class="hero-note">已有 <strong>10,000+</strong> 学员完成测评</p>
      </div>
      <div class="hero-visual">
        <div class="hero-card">
          <div class="card-level">A1</div>
          <div class="card-title">听力</div>
          <div class="card-score">85分</div>
        </div>
        <div class="hero-card">
          <div class="card-level">A2</div>
          <div class="card-title">口语</div>
          <div class="card-score">72分</div>
        </div>
        <div class="hero-card">
          <div class="card-level">A1+</div>
          <div class="card-title">阅读</div>
          <div class="card-score">90分</div>
        </div>
      </div>
    </section>

    <!-- 功能亮点 -->
    <section class="features">
      <h2 class="section-title">为什么选择我们</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <div class="feature-title">AI智能测评</div>
          <div class="feature-desc">基于CEFR国际标准，精准定位英语水平</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⏱️</div>
          <div class="feature-title">快速便捷</div>
          <div class="feature-desc">仅需15分钟，随时随地完成测评</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-title">专业报告</div>
          <div class="feature-desc">详细分析听说读写四项能力</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <div class="feature-title">学习路径</div>
          <div class="feature-desc">量身定制学习计划，高效提升</div>
        </div>
      </div>
    </section>

    <!-- 课程推荐 -->
    <section class="courses">
      <h2 class="section-title">热门课程推荐</h2>
      <div class="courses-list">
        <div class="course-card" v-for="course in courses" :key="course.id">
          <div class="course-badge">{{ course.level }}</div>
          <div class="course-info">
            <h3 class="course-name">{{ course.name }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <span class="course-time">🕐 {{ course.duration }}</span>
              <span class="course-seats">剩余 {{ course.seats }} 名额</span>
            </div>
          </div>
          <div class="course-action">
            <div class="course-price">¥{{ course.price }}</div>
            <button class="course-btn" @click="showCourseDetail(course)">查看详情</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 师资介绍 -->
    <section class="teachers">
      <h2 class="section-title">优秀师资团队</h2>
      <div class="teachers-grid">
        <div class="teacher-card" v-for="teacher in teachers" :key="teacher.id">
          <div class="teacher-avatar">{{ teacher.name.charAt(0) }}</div>
          <div class="teacher-info">
            <h4 class="teacher-name">{{ teacher.name }}</h4>
            <p class="teacher-title">{{ teacher.title }}</p>
            <p class="teacher-exp">{{ teacher.experience }}年教学经验</p>
          </div>
        </div>
      </div>
      <button class="add-wechat-btn" @click="showWechat">添加课程顾问</button>
    </section>

    <!-- 家长好评 -->
    <section class="reviews">
      <h2 class="section-title">家长真实评价</h2>
      <div class="reviews-carousel">
        <div class="review-card" v-for="review in reviews" :key="review.id">
          <div class="review-stars">⭐⭐⭐⭐⭐</div>
          <p class="review-content">{{ review.content }}</p>
          <div class="review-author">—— {{ review.author }}</div>
        </div>
      </div>
    </section>

    <!-- CTA区域 -->
    <section class="cta">
      <div class="cta-content">
        <h2 class="cta-title">立即开始孩子的英语之旅</h2>
        <p class="cta-desc">完成测评，获取专属学习方案</p>
        <button class="cta-btn" @click="startAssessment">
          免费预约测评
        </button>
      </div>
    </section>

    <!-- 联系我们 -->
    <section class="contact" id="contact">
      <h2 class="section-title">联系我们</h2>
      <div class="contact-cards">
        <div class="contact-card" @click="makeCall">
          <div class="contact-icon">📞</div>
          <div class="contact-label">客服热线</div>
          <div class="contact-value">400-888-9999</div>
        </div>
        <div class="contact-card" @click="openMap">
          <div class="contact-icon">📍</div>
          <div class="contact-label">机构地址</div>
          <div class="contact-value">点击导航</div>
        </div>
        <div class="contact-card" @click="showWechat">
          <div class="contact-icon">💬</div>
          <div class="contact-label">微信客服</div>
          <div class="contact-value">添加好友</div>
        </div>
      </div>
      
      <div class="business-hours">
        <span class="hours-icon">🕐</span>
        <span>营业时间：周一至周日 09:00 - 21:00</span>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <p>© 2024 剑桥英语能力测评中心 版权所有</p>
      <p>京ICP备12345678号</p>
    </footer>

    <!-- 浮动按钮 -->
    <div class="float-buttons">
      <button class="float-btn" @click="makeCall">📞</button>
      <button class="float-btn" @click="scrollToTop">↑</button>
    </div>

    <!-- 微信弹窗 -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <button class="modal-close" @click="showModal = false">✕</button>
        <div class="modal-body">
          <template v-if="modalType === 'wechat'">
            <div class="qr-placeholder">
              <div class="qr-code">二维码</div>
              <p>长按识别二维码</p>
            </div>
            <p class="wechat-id">微信号：CambridgeEnglish</p>
          </template>
          <template v-else-if="modalType === 'course'">
            <h3>{{ selectedCourse?.name }}</h3>
            <p>{{ selectedCourse?.fullDesc }}</p>
            <button class="modal-btn" @click="startAssessment">立即报名</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showModal = ref(false)
const modalType = ref('')
const selectedCourse = ref(null)

const courses = ref([
  {
    id: 1,
    name: 'KET冲刺班',
    level: 'KET',
    description: '剑桥英语KET考前冲刺课程',
    fullDesc: '专为备考KET的学生设计，包含8次全真模拟+专项训练+考试技巧课',
    duration: '8周',
    seats: 12,
    price: 1999
  },
  {
    id: 2,
    name: 'PET强化班',
    level: 'PET',
    description: '剑桥英语PET能力提升课程',
    fullDesc: '针对PET考试进行强化训练，全面提升听说读写能力',
    duration: '10周',
    seats: 8,
    price: 2499
  },
  {
    id: 3,
    name: '自然拼读启蒙',
    level: 'Pre-A1',
    description: '适合5-7岁零基础学员',
    fullDesc: '通过自然拼读法，帮助孩子建立英语语音意识',
    duration: '6周',
    seats: 15,
    price: 999
  }
])

const teachers = ref([
  {
    id: 1,
    name: 'Sarah老师',
    title: '资深英语外教',
    experience: 8
  },
  {
    id: 2,
    name: '张老师',
    title: 'KET/PET主讲教师',
    experience: 5
  },
  {
    id: 3,
    name: 'Lisa老师',
    title: '少儿英语专家',
    experience: 6
  }
])

const reviews = ref([
  {
    id: 1,
    content: '孩子3个月过了KET，感谢老师的专业指导！Sarah老师非常耐心，孩子很喜欢上课。',
    author: '张妈妈'
  },
  {
    id: 2,
    content: '测评报告非常详细，让我们清楚了解了孩子的英语水平和需要提升的地方。',
    author: '李爸爸'
  },
  {
    id: 3,
    content: '报了PET冲刺班，老师讲课很有方法，孩子进步明显，已经在准备考试了！',
    author: '王妈妈'
  }
])

const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const startAssessment = () => {
  // 跳转到小程序或注册页面
  alert('即将跳转到测评页面，请稍候...')
}

const showCourseDetail = (course) => {
  modalType.value = 'course'
  selectedCourse.value = course
  showModal.value = true
}

const showWechat = () => {
  modalType.value = 'wechat'
  showModal.value = true
}

const makeCall = () => {
  window.location.href = 'tel:4008889999'
}

const openMap = () => {
  window.open('https://maps.apple.com/?q=中关村大街1号')
}

onMounted(() => {
  // 页面加载完成
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF7F0 0%, #FFFFFF 100%);
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: 12px 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #2D3436;
}

.logo-subtitle {
  font-size: 10px;
  color: #6C63FF;
}

.contact-btn {
  background: #6C63FF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}

/* Hero */
.hero {
  padding: 100px 20px 60px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FF6B35, #FF8B5C);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 42px;
  font-weight: 800;
  color: #2D3436;
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero-desc {
  font-size: 16px;
  color: #636E72;
  line-height: 1.8;
  margin-bottom: 20px;
}

.hero-price {
  margin-bottom: 20px;
}

.price-original {
  text-decoration: line-through;
  color: #999;
  margin-right: 12px;
}

.price-current {
  font-size: 24px;
  font-weight: 700;
  color: #FF6B35;
}

.hero-btn {
  background: linear-gradient(135deg, #6C63FF, #896BFF);
  color: white;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.hero-note {
  font-size: 13px;
  color: #636E72;
}

.hero-note strong {
  color: #6C63FF;
}

.hero-visual {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.hero-card {
  background: white;
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(108, 99, 255, 0.1);
  min-width: 100px;
}

.card-level {
  font-size: 24px;
  font-weight: 800;
  color: #6C63FF;
  margin-bottom: 8px;
}

.card-title {
  font-size: 12px;
  color: #636E72;
  margin-bottom: 4px;
}

.card-score {
  font-size: 18px;
  font-weight: 700;
  color: #2D3436;
}

/* Features */
.features {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #2D3436;
  text-align: center;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 30px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: #636E72;
  line-height: 1.6;
}

/* Courses */
.courses {
  padding: 60px 20px;
  background: #FAFAFA;
}

.courses-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.course-badge {
  background: linear-gradient(135deg, #6C63FF, #896BFF);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.course-info {
  flex: 1;
}

.course-name {
  font-size: 18px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 6px;
}

.course-desc {
  font-size: 14px;
  color: #636E72;
  margin-bottom: 8px;
}

.course-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.course-action {
  text-align: right;
}

.course-price {
  font-size: 20px;
  font-weight: 700;
  color: #FF6B35;
  margin-bottom: 8px;
}

.course-btn {
  background: transparent;
  border: 1px solid #6C63FF;
  color: #6C63FF;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

/* Teachers */
.teachers {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.teacher-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.teacher-avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #6C63FF, #896BFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: 600;
}

.teacher-name {
  font-size: 16px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 4px;
}

.teacher-title {
  font-size: 13px;
  color: #6C63FF;
  margin-bottom: 2px;
}

.teacher-exp {
  font-size: 12px;
  color: #999;
}

.add-wechat-btn {
  display: block;
  margin: 0 auto;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
}

/* Reviews */
.reviews {
  padding: 60px 20px;
  background: #FAFAFA;
}

.reviews-carousel {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.review-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.review-stars {
  color: #FFB800;
  font-size: 14px;
  margin-bottom: 12px;
}

.review-content {
  font-size: 14px;
  color: #2D3436;
  line-height: 1.7;
  margin-bottom: 16px;
}

.review-author {
  font-size: 13px;
  color: #999;
  text-align: right;
}

/* CTA */
.cta {
  padding: 80px 20px;
  background: linear-gradient(135deg, #6C63FF, #896BFF);
  text-align: center;
}

.cta-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.cta-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.cta-btn {
  background: white;
  color: #6C63FF;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

/* Contact */
.contact {
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.contact-card {
  background: white;
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.contact-card:hover {
  transform: translateY(-4px);
}

.contact-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.contact-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
}

.contact-value {
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
}

.business-hours {
  text-align: center;
  font-size: 14px;
  color: #636E72;
}

.hours-icon {
  margin-right: 8px;
}

/* Footer */
.footer {
  background: #2D3436;
  padding: 30px 20px;
  text-align: center;
}

.footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-bottom: 8px;
}

/* Float Buttons */
.float-buttons {
  position: fixed;
  bottom: 30px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.float-btn {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #6C63FF;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 30px;
  max-width: 360px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  text-align: center;
}

.qr-placeholder {
  margin-bottom: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: #F0F0F3;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.wechat-id {
  font-size: 14px;
  color: #636E72;
}

.modal-btn {
  background: #6C63FF;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-visual {
    margin-top: 30px;
  }
  
  .features-grid,
  .teachers-grid,
  .reviews-carousel,
  .contact-cards {
    grid-template-columns: 1fr;
  }
  
  .course-card {
    flex-direction: column;
    text-align: center;
  }
  
  .course-action {
    text-align: center;
  }
}
</style>
