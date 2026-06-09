---
name: auto-course
description: Generic auto-learning engine for online training platforms. Automatically plays course videos, handles sub-section and tab switching, and monitors progress. Comes with pre-configured support for baomi.org.cn (中国保密在线). Adapt to new platforms by adding a JSON config file with CSS selectors.
---

# 通用在线课程自动学习

通用的在线培训课程自动学习引擎，适配多种平台。

## 已支持站点

| 站点 | 配置 | 状态 |
|------|------|:--:|
| [baomi.org.cn](https://www.baomi.org.cn) | `sites/baomi.json` | ✅ 已验证 |

## 快速开始

### 前提

Chrome 必须以远程调试模式启动：

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

启动后登录目标网站，打开课程页面。

### 安装

```bash
cd {baseDir}
npm install
```

> 若已安装 `browser-tools` skill，可复用其 `puppeteer-core` 依赖。

### 运行

```bash
# 默认：保密在线培训
node auto-learn.js

# 指定其他站点配置
node auto-learn.js sites/mooc.json
```

## 适配新平台

1. 复制 `sites/template.json` 为新文件
2. F12 打开开发者工具，找到对应 CSS 选择器
3. 填写配置：

```json
{
  "name": "平台名称",
  "domain": "example.com",
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

### 选择器字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `leftNav` | 左侧导航项选择器 | `.leftBar-item` |
| `leftNavActive` | 包含"课程"文字的导航项 | `"课程"` |
| `tabList` | Tab 切换区域 | `.tab-item` |
| `courseList` | 课程卡片列表 | `.course-list .course-item` |
| `courseTitle` | 课程标题（相对于 course 元素） | `.titlename` |
| `courseHours` | 学时显示 | `.num .themeColor` |
| `statusDone` | 已完成状态的 CSS class | `status2` |
| `statusWatching` | 学习中状态的 CSS class | `status1` |
| `videoPageUrl` | 视频页 URL 特征字符串 | `bmVideo` |

## 工作原理

```
┌────────────────────────────────────────────┐
│              站点配置 JSON                  │
│  selectors / URLs / status classes          │
└──────────────────┬─────────────────────────┘
                   ▼
┌────────────────────────────────────────────┐
│             auto-learn.js 引擎              │
│                                            │
│  1. 连接 Chrome (CDP)                      │
│  2. 根据选择器找到课程列表                   │
│  3. 点击未完成课程 → 打开视频页              │
│  4. 每10秒监控视频进度                       │
│  5. 视频卡住 → 检查课程页 → 推进             │
│  6. Tab完成 → 自动切换下一个Tab              │
└────────────────────────────────────────────┘
```

## 状态图标

| 图标 | 含义 |
|:--:|------|
| ✅ | 已学完 |
| ▶ | 学习中 |
| ⬜ | 未开始 |

## 注意事项

- ⚠️ 学习期间不要关闭 Chrome 窗口
- ⚠️ 不同平台的 CSS class 名称不同，务必在 F12 中确认
- ⚠️ 若页面结构复杂（多层嵌套Tab等），可能需要微调引擎代码
