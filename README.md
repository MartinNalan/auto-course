# auto-course

通用在线课程自动学习 Skill — 一个 JSON 配置适配所有培训平台。

> 遵循 [Agent Skills 标准](https://agentskills.io/specification)，兼容所有主流 AI Coding Agent。
>
> **已测试**: Pi Coding Agent ✅ | Claude Code ✅ | 理论上兼容 Codex、Cline、Roo Code 等

---

## 安装（按你的 Agent 选择）

### Pi Coding Agent

```bash
pi install git:github.com/MartinNalan/auto-course
```

### Claude Code

```bash
# 方式一：直接作为 Skill
git clone https://github.com/MartinNalan/auto-course.git ~/.claude/skills/auto-course
cd ~/.claude/skills/auto-course && npm install

# 方式二：添加到 Claude 配置
# ~/.claude/settings.json
{ "skills": ["~/.claude/skills/auto-course"] }
```

### OpenAI Codex / 其他 Agent

```bash
git clone https://github.com/MartinNalan/auto-course.git ~/.agents/skills/auto-course
cd ~/.agents/skills/auto-course && npm install
```

### 通用（任何 Agent）

```bash
# 1. 克隆到任意位置
git clone https://github.com/MartinNalan/auto-course.git
cd auto-course && npm install

# 2. 在 Agent 配置中注册 skills 路径
# 具体方式参考各 Agent 文档，通常支持 ~/.agents/skills/ 目录
```

---

## 依赖

| 依赖 | 原因 | 安装 |
|------|------|------|
| `browser-tools` | 提供 puppeteer-core CDP 能力 | `git clone https://github.com/badlogic/pi-skills.git` |

> 不同 Agent 安装 browser-tools 的命令不同，核心是获取 `puppeteer-core` 依赖。

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
