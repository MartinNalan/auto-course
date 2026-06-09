# auto-course

通用在线课程自动学习 Skill — 一个 JSON 配置适配所有培训平台。

> 自动完成在线培训平台的视频课程，支持跨 Tab、跨小结自动切换，全程无人值守。

## 一键安装

```bash
pi install git:github.com/MartinNalan/auto-course
```

> 安装后自动获得 `puppeteer-core` 依赖。若提示缺少 `browser-tools`，运行：
> ```bash
> pi install git:github.com/badlogic/pi-skills
> ```

也可以在 pi 对话中直接说：
> "帮我安装 auto-course skill"
> "帮我自动完成在线培训课程"

或手动触发：
```
/skill:auto-course
```

命令行直接运行：
```bash
node skills/auto-course/auto-learn.js sites/你的平台.json
```

## 适配新平台

1. 复制 `skills/auto-course/sites/template.json` → `sites/新平台.json`
2. F12 找到对应 CSS 选择器，填入配置
3. 运行 `node auto-learn.js sites/新平台.json`

详细说明见 `skills/auto-course/SKILL.md`。

## 前提（所有平台通用）

**1. Chrome 远程调试模式：**

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

**2. 依赖：**

| 依赖 | 原因 | 安装 |
|------|------|------|
| `browser-tools` | 提供 puppeteer-core CDP 能力 | `pi install git:github.com/badlogic/pi-skills` |

> 安装 `auto-course` 时 npm 依赖自动安装。`browser-tools` 若缺失，Agent 会提示。

## 目录结构

```
auto-course/
├── package.json              # pi 包清单
├── skills/
│   └── auto-course/
│       ├── SKILL.md          # 技能文档
│       ├── auto-learn.js     # 通用引擎（配置驱动）
│       └── sites/
│           └── template.json # 新站点配置模板
└── README.md
```

## License

MIT
