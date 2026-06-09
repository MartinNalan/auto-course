---
name: auto-course
description: Generic auto-learning engine for online training platforms. Automatically plays course videos, handles sub-section and tab switching, and monitors progress. Adaptable to any platform via JSON config files with CSS selectors. Use when the user needs to complete mandatory online training courses automatically.
compatibility: "Cross-agent: Pi, Claude Code, Codex, Cline, Roo Code. Requires Chrome browser and puppeteer-core (via browser-tools or npm install)."
---

# 通用在线课程自动学习

配置驱动的在线培训课程自动学习引擎。通过 JSON 配置文件适配任意平台。

## 依赖

本 Skill 依赖以下组件，缺失时会引导安装：

| 依赖 | 说明 | 安装命令 |
|------|------|----------|
| **browser-tools** | Chrome CDP 连接能力（puppeteer-core） | `pi install git:github.com/badlogic/pi-skills` |
| **Chrome 浏览器** | 需以远程调试模式启动 | 系统自带或手动安装 |

> 💡 安装本 Skill 后，若缺少 `browser-tools`，Agent 会自动提示安装。

## 跨 Agent 兼容

本 Skill 遵循 [Agent Skills 标准](https://agentskills.io/specification)，目录结构：

```
auto-course/skills/auto-course/
├── SKILL.md          ← 任何 Agent 自动发现此文件
└── auto-learn.js     ← 标准 Node.js 脚本，无 Agent 特定依赖
```

不同 Agent 的安装方式：

| Agent | 安装命令 |
|-------|----------|
| **Pi** | `pi install git:github.com/MartinNalan/auto-course` |
| **Claude Code** | `git clone` → `~/.claude/skills/auto-course` |
| **Codex** | `git clone` → `~/.agents/skills/auto-course` |
| **其他** | 放到 Agent 的 skills 目录即可 |

详细安装见仓库 [README](https://github.com/MartinNalan/auto-course)。

### 前提

Chrome 必须以远程调试模式启动（任何平台都需要）：

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

启动 Chrome 后，手动登录目标网站并打开课程页面。

### 安装

```bash
cd {baseDir}
npm install
```

### 适配新平台（3 步）

**1. 复制模板**
```bash
cp sites/template.json sites/新平台.json
```

**2. 填写选择器（F12 开发者工具）**
```json
{
  "name": "平台名称",
  "courseUrl": "https://example.com/course/xxx",
  "selectors": {
    "leftNav": ".sidebar-item",
    "leftNavActive": "课程",
    "tabList": ".tab-item",
    "courseList": ".course-list-item",
    "courseTitle": ".course-title",
    "courseHours": ".credit-hours",
    "statusDone": "status-completed",
    "statusWatching": "status-learning",
    "videoPageUrl": "play"
  }
}
```

**3. 运行**
```bash
node auto-learn.js sites/新平台.json
```

## 选择器字段说明

| 字段 | 说明 | 如何找 |
|------|------|--------|
| `leftNav` | 左侧导航 CSS 选择器 | 找课程列表的导航菜单 |
| `leftNavActive` | 导航中包含的文字 | 如"课程"、"课件" |
| `tabList` | Tab 切换区选择器 | 页面中的分类标签 |
| `courseList` | 课程卡片列表选择器 | 单个课程项的父容器 |
| `courseTitle` | 标题（相对 course） | 课程名称的元素 |
| `courseHours` | 学时（相对 course，可选） | 学时/时长显示 |
| `statusDone` | 已完成 CSS class | 点开已完成课程看 class |
| `statusWatching` | 学习中 CSS class | 点开进行中课程看 class |
| `videoPageUrl` | 视频页 URL 特征 | 点击课程后地址栏关键词 |

## 工作原理

```
站点配置 JSON ──→ auto-learn.js 引擎
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       连接Chrome   监控视频   自动推进
       (CDP)       (10s检测)  (跨Tab/小结)
```

1. 通过 Chrome DevTools Protocol 连接浏览器
2. 根据选择器定位课程列表、Tab、状态标记
3. 点击未完成课程 → 监控视频播放
4. 视频卡住（暂停/结尾）→ 自动检查并点击下一节
5. 当前模块全部完成 → 自动切换下一模块

## 状态图标

| 图标 | 含义 |
|:--:|------|
| ✅ | 已完成 |
| ▶ | 学习中 |
| ⬜ | 未开始 |

## 注意事项

- ⚠️ 学习期间不要关闭 Chrome 窗口，可最小化
- ⚠️ 不同平台的 CSS class 命名不同，务必 F12 确认
- ⚠️ 页面加载慢可调大 `staleness.checkIntervalMs`
- ⚠️ 若页面无 Tab 结构，`tabList` 可留空
