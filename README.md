# auto-course

通用在线课程自动学习工具 — JSON 配置适配所有培训平台。

> 🚀 **不需要 Agent，不需要大模型，不需要 API Key。**  
> 只需要 Node.js + Chrome 浏览器，下载即用。
>
> 🚀 **不需要 Agent，不需要大模型，不需要 API Key。**  
> 只需要 Node.js + Chrome 浏览器，下载即用。

---

## 🖥 独立使用（无需任何 AI 工具）

```bash
# 1. 下载
git clone https://github.com/MartinNalan/auto-course.git
cd auto-course

# 2. 安装依赖（仅一次）
npm install

# 3. 直接运行
node baomi-course.js
```

| 需要 | 说明 |
|------|------|
| **Node.js** | v18+，[nodejs.org](https://nodejs.org) |
| **Chrome** | 任意版本，需调试模式启动（见下方） |

### 适配你自己的平台

```bash
cp sites/template.json sites/my-platform.json
# 编辑 my-platform.json（F12 找选择器）
node auto-learn.js sites/my-platform.json
```

---

## 🤖 搭配 AI Agent 使用（可选）

## 安装（按你的 Agent 选择）

```bash
# Pi Coding Agent
pi install git:github.com/MartinNalan/auto-course
```

```bash
# Claude Code / Codex / 其他
git clone https://github.com/MartinNalan/auto-course.git ~/.agents/skills/auto-course
cd ~/.agents/skills/auto-course && npm install
```

详细说明见 [SKILL.md](SKILL.md)。

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
