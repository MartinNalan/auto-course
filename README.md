# pi-auto-course

通用在线课程自动学习 Skill for [Pi Coding Agent](https://github.com/badlogic/pi-coding-agent)。

> 自动完成在线培训平台的视频课程，支持跨 Tab、跨小结自动切换，全程无人值守。

## 已适配平台

| 平台 | 状态 |
|------|:--:|
| [baomi.org.cn](https://www.baomi.org.cn) 中国保密在线 | ✅ |

## 安装

```bash
pi install git:github.com/MartinNalan/auto-course
```

## 使用

在 pi 会话中直接说：
> "帮我自动学习保密在线课程"

或手动触发：
```
/skill:auto-course
```

也可以命令行直接运行：
```bash
node skills/auto-course/auto-learn.js
node skills/auto-course/auto-learn.js sites/other-platform.json
```

## 前提

Chrome 需要以远程调试模式启动：

**Windows:**
```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--remote-debugging-port=9222", "--no-first-run"
```

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 --no-first-run
```

## 适配新平台

1. 复制 `skills/auto-course/sites/template.json` → `sites/新平台.json`
2. F12 找到对应 CSS 选择器，填入配置
3. 运行 `node auto-learn.js sites/新平台.json`

详细说明见 `skills/auto-course/SKILL.md`。

## 目录结构

```
pi-auto-course/
├── package.json
├── skills/
│   └── auto-course/
│       ├── SKILL.md           # 技能文档
│       ├── auto-learn.js      # 通用引擎
│       └── sites/
│           ├── baomi.json      # 保密在线配置
│           └── template.json   # 新站点模板
└── README.md
```

## License

MIT
