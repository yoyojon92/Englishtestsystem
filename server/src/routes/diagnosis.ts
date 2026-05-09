// 诊断服务路由
import { Router } from 'express';
import { getStudentDiagnosis } from '../db/testSession';

const router = Router();

/**
 * POST /api/v1/diagnosis/run
 * 执行诊断
 */
router.post('/run', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ success: false, message: '缺少 studentId 参数' });
    }
    
    const diagnosisResult = getStudentDiagnosis(studentId);
    
    return res.json({
      success: true,
      data: diagnosisResult
    });
  } catch (error) {
    console.error('诊断失败:', error);
    return res.status(500).json({ success: false, message: '诊断服务异常' });
  }
});

/**
 * GET /api/v1/diagnosis/:studentId
 * 获取学员诊断历史
 */
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const diagnosisResult = getStudentDiagnosis(studentId);
    
    return res.json({
      success: true,
      data: diagnosisResult
    });
  } catch (error) {
    console.error('获取诊断失败:', error);
    return res.status(500).json({ success: false, message: '获取诊断失败' });
  }
});

export default router;
