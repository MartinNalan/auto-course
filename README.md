# auto-course

通用在线课程自动学习 Skill — 一个 JSON 配置适配所有培训平台。

> 遵循 [Agent Skills 标准](https://agentskills.io/specification)，兼容所有主流 AI Coding Agent。
>
> **已测试**: Pi Coding Agent ✅ | Claude Code ✅ | 理论上兼容 Codex、Cline、Roo Code 等

---

## 安装（按你的 Agent 选择）

### 通用方式（任何 Agent，包括 Hermes）

所有遵循 [Agent Skills 标准](https://agentskills.io/specification) 的 Agent 都按同一方式：

```bash
# 1. 克隆到 Agent 的 skills 目录
git clone https://github.com/MartinNalan/auto-course.git ~/.agents/skills/auto-course

# 2. 安装依赖
cd ~/.agents/skills/auto-course && npm install
```

> **Agent 如何发现？** 启动时扫描 `~/.agents/skills/` 下所有目录，找到 `SKILL.md` 即加载。

### 各 Agent 专属命令

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
├── SKILL.md              ← 🎯 任何 Agent 扫描此文件加载技能
├── baomi-course.js        ← 🔥 保密在线专用：下载即用，零配置
├── auto-learn.js          ← 通用引擎（适配其他平台）
├── package.json
├── sites/
│   └── template.json      ← 新站点配置模板
└── README.md
```

## 保密在线专用脚本

如果你只需要刷「2026年度全国保密教育线上培训」：

```bash
git clone https://github.com/MartinNalan/auto-course.git
cd auto-course && npm install
node baomi-course.js
```

> 无需任何 JSON 配置，直接运行。自动完成 3 模块 41 节课。同样的前提：Chrome 需以调试模式启动。

## License

MIT

---

## 如何让任意 Agent（Hermes 等）安装

所有遵循 [Agent Skills](https://agentskills.io) 标准的 Agent 发现机制相同：

```
Agent 启动
  → 扫描 ~/.agents/skills/ 下所有子目录
  → 找到 SKILL.md → 解析 frontmatter（name, description, compatibility）
  → 用户任务匹配 description → 自动加载技能
```

如果你的 Agent 不支持自动安装，只需：

```bash
git clone https://github.com/MartinNalan/auto-course.git ~/.agents/skills/auto-course
cd ~/.agents/skills/auto-course && npm install
```

Agent 下次启动时就会在技能列表里看到 `auto-course`。
