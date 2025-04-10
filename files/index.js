const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto'); // 新增加密模块用于生成随机数

// 定义要运行的 GOST 命令 27866为远程服务器本地端口，31000为穿透到本地的端口
const command1 = './gost';
const args1 = ['-L=socks5://[::1]:30000?bind=true'];
const command2 = './gost';
const args2 = ['-L=rtcp://:28210/[::1]:30000', '-F', 'relay+ws://ch.nanning.eu.org:80?path=/de04add9-5c68-8bab-950c-08cd5320df18&host=ch.nanning.eu.org'];

// 使用 spawn 来运行第一个命令
const gostProcess1 = spawn(command1, args1);

// 捕获第一个命令的标准输出并显示
gostProcess1.stdout.on('data', (data) => {
    const log = data.toString().trim();
    if (log && !log.includes('"level":"info"')) {
        console.log(`[GOST 日志] ${log}`);
    }
});

// 捕获第一个命令的标准错误并显示
gostProcess1.stderr.on('data', (data) => {
    const errorLog = data.toString().trim();
    if (errorLog && !errorLog.includes('"level":"info"')) {
        console.error(`[GOST 错误] ${errorLog}`);
    }
});

// 处理第一个命令的进程退出
gostProcess1.on('close', (code) => {
    console.log(`GOST 进程已退出，退出码: ${code}`);
});

// 使用 spawn 来运行第二个命令
const gostProcess2 = spawn(command2, args2);

// 捕获第二个命令的标准输出并显示
gostProcess2.stdout.on('data', (data) => {
    const log = data.toString().trim();
    if (log && !log.includes('"level":"info"')) {
        console.log(`[GOST 日志] ${log}`);
    }
});

// 捕获第二个命令的标准错误并显示
gostProcess2.stderr.on('data', (data) => {
    const errorLog = data.toString().trim();
    if (errorLog && !errorLog.includes('"level":"info"')) {
        console.error(`[GOST 错误] ${errorLog}`);
    }
});

// 处理第二个命令的进程退出
gostProcess2.on('close', (code) => {
    console.log(`GOST 进程已退出，退出码: ${code}`);
});

// #######################
// ### 新增：伪装网页生成函数
// #######################
const generateFakePage = () => {
    const randomToken = crypto.randomBytes(8).toString('hex');
    const beijingTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>系统维护中 - ${randomToken}</title>
            <style>
                .container {
                    width: 60%;
                    margin: 100px auto;
                    padding: 30px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    text-align: center;
                }
                .notice { color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🚧 系统维护公告</h2>
                <p class="notice">${beijingTime} | 会话ID: ${randomToken}</p>
                <p>为提升服务质量，我们正在进行系统升级，预计持续3小时。</p>
                <hr>
                <p>技术支持：<span style="color:#1890ff;">400-${Math.floor(1000 + Math.random() * 9000)}</span></p>
            </div>
        </body>
        </html>
    `;
};

// #######################
// ### 新增：启动伪装网页服务
// #######################
const webServer = http.createServer((req, res) => {
    // 添加请求日志
    console.log(`[Web访问] ${req.method} ${req.url} from ${req.socket.remoteAddress}`);
    
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store' // 禁止缓存
    });
    res.end(generateFakePage());
});

webServer.listen(27866, '0.0.0.0', () => {
    console.log(`[伪装网站] 已在端口 27866 启动，访问 http://localhost:27866 验证`);
});

webServer.on('error', (err) => {
    console.error('[Web服务异常]', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ 端口 27866 已被占用，请更换端口或停止相关进程`);
    }
});

console.log('GOST 已启动，正在运行...');

