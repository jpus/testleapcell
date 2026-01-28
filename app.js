const express = require("express");
const app = express();
const net = require('net');
const os = require('os');
const process = require('process');
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { execSync } = require('child_process');
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/status", (req, res) => {
  try {
    const processInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      env: Object.keys(process.env).length
    };

    const systemInfo = {
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus().length,
      networkInterfaces: os.networkInterfaces()
    };

    const children = [];

    const output = `
系统进程状态（纯 Node.js 实现）：
=====================================
当前 Node.js 进程信息：
- PID: ${processInfo.pid}
- Node.js 版本: ${processInfo.nodeVersion}
- 运行平台: ${processInfo.platform} (${processInfo.arch})
- 进程运行时间: ${Math.floor(processInfo.uptime)} 秒
- 内存使用:
  • RSS: ${(processInfo.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
  • 堆总计: ${(processInfo.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
  • 堆使用: ${(processInfo.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
  • 外部: ${(processInfo.memoryUsage.external / 1024 / 1024).toFixed(2)} MB
  • 数组缓冲区: ${(processInfo.memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB
- CPU 使用: ${(processInfo.cpuUsage.user / 1000000).toFixed(2)} 秒 (用户) / ${(processInfo.cpuUsage.system / 1000000).toFixed(2)} 秒 (系统)
- 环境变量数量: ${processInfo.env}

系统信息：
- 主机名: ${systemInfo.hostname}
- 系统类型: ${systemInfo.type} ${systemInfo.release}
- 系统负载 (1, 5, 15分钟): ${systemInfo.loadavg.map(l => l.toFixed(2)).join(', ')}
- 内存: ${(systemInfo.freemem / 1024 / 1024 / 1024).toFixed(2)} GB 可用 / ${(systemInfo.totalmem / 1024 / 1024 / 1024).toFixed(2)} GB 总计 (${((systemInfo.freemem / systemInfo.totalmem) * 100).toFixed(1)}% 可用)
- CPU 核心数: ${systemInfo.cpus}
- 系统运行时间: ${Math.floor(os.uptime() / 3600)} 小时 ${Math.floor((os.uptime() % 3600) / 60)} 分钟

网络接口：
${Object.entries(systemInfo.networkInterfaces).map(([name, interfaces]) => {
  return `  ${name}:\n${interfaces.map(intf => `    • ${intf.address} (${intf.family}) ${intf.internal ? '内网' : '外网'}`).join('\n')}`;
}).join('\n')}

=====================================`;
    
    res.type("html").send("<pre>" + output + "</pre>");
  } catch (err) {
    res.status(500).type("html").send("<pre>获取进程状态失败：\n" + err.message + "</pre>");
  }
});

app.get("/killall", (req, res) => {
  try {
    const username = os.userInfo().username;
    console.warn(`警告：尝试终止用户 ${username} 的所有进程`);

    const currentPid = process.pid;
    const parentPid = process.ppid;
    
    console.warn(`当前进程 PID: ${currentPid}, 父进程 PID: ${parentPid}`);

    const output = `
纯 Node.js 终止进程功能有限制：
=====================================
当前用户: ${username}
当前进程 PID: ${currentPid}
父进程 PID: ${parentPid}

由于安全限制，纯 Node.js 无法终止：
1. 其他用户的进程
2. 系统进程
3. 其他独立进程

已执行的操作：
1. 已发送退出信号给当前 Node.js 进程
2. 正在清理资源...

警告：服务器将在 3 秒后关闭！
=====================================`;
    
    res.type("html").send("<pre>" + output + "</pre>");

    setTimeout(() => {
      console.warn(`用户 ${username} 的 Node.js 进程 ${currentPid} 正在退出`);

      if (typeof cleanup === 'function') {
        cleanup();
      }

      if (server && typeof server.close === 'function') {
        server.close(() => {
          console.log('HTTP 服务器已关闭');
          process.exit(0);
        });

        setTimeout(() => {
          console.warn('强制退出进程');
          process.exit(0);
        }, 5000);
      } else {
        process.exit(0);
      }
    }, 3000);
    
  } catch (err) {
    console.error(`终止进程失败: ${err.message}`);
    res.status(500).send(`终止进程失败: ${err.message}`);
  }
});

    const server = app.listen(PORT, () => {
        console.log(`http server is running on port:${PORT}!`);
    });