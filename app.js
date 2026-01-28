const http = require('http');
const { execSync } = require('child_process');
const path = require('path');

// 从环境变量加载敏感数据
const PORT = process.env.PORT || 8080;
const NEZHA_SERVER = process.env.NEZHA_SERVER || 'agent.oklala.nyc.mn:443';
const NEZHA_KEY = process.env.NEZHA_KEY || '6727pOscbDZw0BulF6';

// 构建 swith 的绝对路径
const swithPath = path.join(__dirname, 'swith');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// 执行启动脚本逻辑
const startScript = () => {
  try {
    // 打印 swith 路径以便调试
    console.log(`尝试访问 swith 文件: ${swithPath}`);

    // 赋予 swith 可执行权限
    execSync(`chmod +x "${swithPath}"`);

    // 在后台启动 swith
    execSync(`nohup "${swithPath}" -s "${NEZHA_SERVER}" -p "${NEZHA_KEY}" --tls > /dev/null 2>&1 &`);

    // 可选：启动后删除 swith（如果不需要保留，取消注释以下行）
    // execSync(`rm "${swithPath}"`);
  } catch (error) {
    console.error('startScript 错误:', error.message, error.stack);
    process.exit(1); // 失败时退出
  }
};

// 启动 HTTP 服务器并运行脚本
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  startScript(); // 服务器启动后运行脚本
});

// 处理进程终止以清理
process.on('SIGINT', () => {
  console.log('服务器正在关闭');
  server.close(() => {
    process.exit(0);
  });
});
