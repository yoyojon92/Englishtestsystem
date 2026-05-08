<template>
  <div id="app">
    <!-- 头部信息 -->
    <header class="header">
      <div class="header-content">
        <div class="school-logo">🏫</div>
        <h1 class="school-name">{{ schoolInfo.name }}</h1>
        <p class="school-subtitle">剑桥英语能力测评中心</p>
        <div class="school-contact">
          <span>📍 {{ schoolInfo.address }}</span>
          <span>📞 {{ schoolInfo.phone }}</span>
        </div>
      </div>
    </header>

    <!-- CTA 区域 -->
    <div class="cta-section">
      <div class="cta-title">
        <span class="cta-badge">🎯 限时体验</span>
        <h2 class="cta-main-title">免费英语水平测评</h2>
        <p class="cta-sub-title">15分钟 · AI智能评估 · CEFR国际标准定级</p>
      </div>

      <div class="cta-features">
        <div class="cta-feature">
          <div class="cta-feature-icon">📊</div>
          <div class="cta-feature-text">词汇量测试</div>
        </div>
        <div class="cta-feature">
          <div class="cta-feature-icon">🎧</div>
          <div class="cta-feature-text">听力评估</div>
        </div>
        <div class="cta-feature">
          <div class="cta-feature-icon">🗣️</div>
          <div class="cta-feature-text">口语评测</div>
        </div>
        <div class="cta-feature">
          <div class="cta-feature-icon">📝</div>
          <div class="cta-feature-text">阅读理解</div>
        </div>
      </div>

      <div class="cta-price">
        <span class="price-original">原价 ¥59.9</span>
        <span class="price-current">¥9.9<span class="price-unit">/次</span></span>
      </div>

      <button class="cta-button" @click="handleStartAssessment">
        立即测评
      </button>

      <div class="countdown">
        <span class="countdown-label">优惠倒计时</span>
        <div class="countdown-time">
          <span class="countdown-num">{{ countdown.hours }}</span>
          <span>:</span>
          <span class="countdown-num">{{ countdown.minutes }}</span>
          <span>:</span>
          <span class="countdown-num">{{ countdown.seconds }}</span>
        </div>
      </div>
    </div>

    <!-- 热门课程 -->
    <section class="section">
      <h3 class="section-title">热门课程推荐</h3>
      <div class="course-list">
        <div 
          v-for="course in courses" 
          :key="course.id" 
          class="course-card"
          @click="handleCourseClick(course)"
        >
          <div class="course-icon">{{ course.icon }}</div>
          <div class="course-info">
            <h4 class="course-name">{{ course.name }}</h4>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <span class="course-meta-item">
                <span>🕐</span> {{ course.schedule }}
              </span>
              <span class="course-meta-item">
                <span>👶</span> {{ course.ageRange }}
              </span>
              <span class="course-tag" :style="{ background: course.tagColor + '20', color: course.tagColor }">
                {{ course.level }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 师资介绍 -->
    <section class="section">
      <h3 class="section-title">优秀师资团队</h3>
      <div class="teacher-list">
        <div v-for="teacher in teachers" :key="teacher.id" class="teacher-card">
          <div class="teacher-avatar">{{ teacher.avatar }}</div>
          <div class="teacher-info">
            <h4 class="teacher-name">{{ teacher.name }}</h4>
            <p class="teacher-title">{{ teacher.title }}</p>
            <div class="teacher-tags">
              <span v-for="tag in teacher.tags" :key="tag" class="teacher-tag">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="teacher-action">
            <div class="teacher-btn teacher-btn-primary" @click="handleAddWechat(teacher)">
              添加微信
            </div>
            <div class="teacher-btn teacher-btn-secondary" @click="handleViewTeacher(teacher)">
              查看详情
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 在线咨询 -->
    <div class="consult-section">
      <h3 class="consult-title">
        <span>💬</span> 在线咨询服务
      </h3>
      <p class="consult-desc">
        专业课程顾问为您解答任何问题
      </p>
      <div class="consult-buttons">
        <div class="consult-btn consult-btn-wechat" @click="handleWechatConsult">
          添加企业微信
        </div>
        <div class="consult-btn consult-btn-message" @click="handleMessageConsult">
          在线留言
        </div>
      </div>
    </div>

    <!-- 联系我们 -->
    <section class="section">
      <h3 class="section-title">联系我们</h3>
      <div class="contact-card">
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div class="contact-content">
            <div class="contact-label">联系电话</div>
            <div class="contact-value">{{ schoolInfo.phone }}</div>
          </div>
          <div class="contact-action" @click="handleCall">立即拨打</div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div class="contact-content">
            <div class="contact-label">学校地址</div>
            <div class="contact-value">{{ schoolInfo.address }}</div>
          </div>
          <div class="contact-action" @click="handleNavigate">导航</div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">🕐</div>
          <div class="contact-content">
            <div class="contact-label">营业时间</div>
            <div class="contact-value">周一~周日 9:00-21:00</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">💚</div>
          <div class="contact-content">
            <div class="contact-label">课程顾问</div>
            <div class="contact-value">扫码添加企业微信</div>
          </div>
          <div class="contact-action" @click="handleWechatConsult">添加</div>
        </div>
      </div>
    </section>

    <!-- 家长好评 -->
    <section class="section">
      <h3 class="section-title">家长真实评价</h3>
      <div class="review-card">
        <p class="review-content">
          "孩子在这里学习了3个月，直接通过了KET考试！老师的教学方法非常专业，会根据孩子的水平制定个性化学习计划。强烈推荐给各位家长！"
        </p>
        <div class="review-footer">
          <div class="review-author">
            <div class="review-avatar">张</div>
            <span class="review-name">张妈妈 · 学员家长</span>
          </div>
          <div class="review-rating">★★★★★</div>
        </div>
      </div>
    </section>

    <!-- 底部信息 -->
    <footer class="page-footer">
      <p class="footer-logo">🏫 剑桥英语能力测评中心</p>
      <p class="footer-text">专注3-15岁青少年英语教育 | 助力剑桥考级通关</p>
    </footer>

    <!-- 浮动按钮 -->
    <div class="float-buttons">
      <div class="float-btn float-btn-call" @click="handleCall">
        📞
      </div>
      <div class="float-btn" @click="handleScrollTop">
        ⬆️
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 学校信息
    const schoolInfo = reactive({
      name: '星光剑桥英语',
      phone: '400-888-6666',
      address: '北京市朝阳区建国路88号'
    })

    // 课程列表
    const courses = reactive([
      {
        id: 1,
        name: 'KET 冲刺班',
        description: '针对KET考试的专项冲刺课程，包含全真模拟和真题解析',
        icon: '📝',
        schedule: '每周六 10:00-12:00',
        ageRange: '8-12岁',
        level: 'A2',
        tagColor: '#FF6B35'
      },
      {
        id: 2,
        name: 'PET 强化班',
        description: 'PET考试全面强化训练，听说读写四维提升',
        icon: '🎯',
        schedule: '每周日 14:00-16:00',
        ageRange: '10-15岁',
        level: 'B1',
        tagColor: '#1E88E5'
      },
      {
        id: 3,
        name: '自然拼读启蒙班',
        description: '为零基础学员打造，掌握英语发音规律',
        icon: '🔤',
        schedule: '每周三/周五 16:00-17:30',
        ageRange: '5-7岁',
        level: 'Pre-A1',
        tagColor: '#4CAF50'
      }
    ])

    // 师资列表
    const teachers = reactive([
      {
        id: 1,
        name: 'Sarah 老师',
        avatar: '👩‍🏫',
        title: '剑桥认证培训师 · 8年教学经验',
        tags: ['KET', 'PET', '口语']
      },
      {
        id: 2,
        name: 'Michael 老师',
        avatar: '👨‍🏫',
        title: '雅思8.5分 · 5年教学经验',
        tags: ['写作', '阅读', '留学']
      }
    ])

    // 倒计时
    const countdown = reactive({
      hours: '23',
      minutes: '59',
      seconds: '59'
    })
    let countdownInterval = null

    // 初始化倒计时
    const initCountdown = () => {
      // 设置为24小时倒计时
      const endTime = new Date()
      endTime.setHours(endTime.getHours() + 24)
      
      countdownInterval = setInterval(() => {
        const now = new Date()
        const diff = endTime - now
        
        if (diff > 0) {
          countdown.hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0')
          countdown.minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
          countdown.seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
        }
      }, 1000)
    }

    // 获取渠道参数
    const getChannelParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      return {
        channel: urlParams.get('channel') || 'default',
        school: urlParams.get('school') || 'default',
        teacher: urlParams.get('teacher') || null,
        activity: urlParams.get('activity') || null
      }
    }

    // 事件处理
    const handleStartAssessment = () => {
      const params = getChannelParams()
      // 跳转到测评页面（实际项目中跳转到小程序）
      console.log('开始测评，渠道参数:', params)
      alert('即将跳转到测评页面...\n\n渠道来源: ' + params.channel)
    }

    const handleCourseClick = (course) => {
      console.log('查看课程:', course.name)
      alert('课程详情: ' + course.name + '\n\n可联系顾问获取更多课程信息')
    }

    const handleAddWechat = (teacher) => {
      console.log('添加教师微信:', teacher.name)
      alert('即将展示 ' + teacher.name + ' 的企业微信二维码')
    }

    const handleViewTeacher = (teacher) => {
      console.log('查看教师详情:', teacher.name)
      alert('教师详情: ' + teacher.name + '\n\n' + teacher.title)
    }

    const handleWechatConsult = () => {
      console.log('企业微信咨询')
      alert('即将跳转到企业微信客服页面')
    }

    const handleMessageConsult = () => {
      console.log('在线留言')
      const message = prompt('请输入您的问题：')
      if (message) {
        console.log('用户留言:', message)
        alert('感谢您的留言，我们将在24小时内回复！')
      }
    }

    const handleCall = () => {
      console.log('拨打电话:', schoolInfo.phone)
      // 实际拨打电话
      window.location.href = 'tel:' + schoolInfo.phone.replace(/-/g, '')
    }

    const handleNavigate = () => {
      console.log('导航到:', schoolInfo.address)
      alert('即将打开地图导航到:\n' + schoolInfo.address)
    }

    const handleScrollTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 生命周期
    onMounted(() => {
      initCountdown()
      
      // 记录访问日志（实际项目中发送到服务器）
      const params = getChannelParams()
      console.log('H5落地页访问:', {
        ...params,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      })
    })

    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    })

    return {
      schoolInfo,
      courses,
      teachers,
      countdown,
      handleStartAssessment,
      handleCourseClick,
      handleAddWechat,
      handleViewTeacher,
      handleWechatConsult,
      handleMessageConsult,
      handleCall,
      handleNavigate,
      handleScrollTop
    }
  }
}
</script>

<style scoped>
/* Vue scoped styles */
</style>
