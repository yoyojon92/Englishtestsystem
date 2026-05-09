import { FetchClient, Config } from 'coze-coding-dev-sdk';

const PDF_URL = 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%A3%E5%AD%90%E7%BC%96%E7%A8%8B%E6%8C%87%E4%BB%A4-%E6%B5%8B%E8%AF%95%E5%88%86%E4%BA%AB%E4%B8%8E%E8%BD%AC%E5%8C%96.md.pdf&nonce=2dc2df70-28ea-4809-b26c-380a7341d0a6&project_id=7637487394995830811&sign=7fb17e4d6e2d28e9532661b3f98cad9721197d0309836f9cba2b4ff39c7de5cc';

async function main() {
  console.log('=== 获取PDF内容 ===\n');
  
  const config = new Config();
  const client = new FetchClient(config);
  
  try {
    console.log('正在获取PDF内容...');
    const response = await client.fetch(PDF_URL);
    
    console.log(`状态: ${response.status_code === 0 ? '成功' : '失败'}`);
    console.log(`标题: ${response.title || 'N/A'}`);
    console.log(`文件类型: ${response.filetype || 'N/A'}`);
    console.log(`内容条数: ${response.content.length}`);
    console.log('');
    
    // 提取文本内容
    const textContent = response.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
    
    if (textContent) {
      console.log('=== 文本内容 ===');
      console.log(textContent);
    }
    
    // 提取图片
    const images = response.content
      .filter(item => item.type === 'image')
      .map(item => item.image?.display_url);
    
    if (images.length > 0) {
      console.log('\n=== 图片链接 ===');
      images.forEach((url, i) => {
        console.log(`${i + 1}. ${url}`);
      });
    }
    
  } catch (error) {
    console.error('获取PDF失败:', error);
  }
}

main();
