#!/usr/bin/env node
/**
 * 通用在线课程自动学习引擎
 * 
 * 用法：
 *   node auto-learn.js [site-config.json]
 * 
 * 默认使用 sites/baomi.json
 * 适配其他平台：复制 sites/template.json 修改选择器即可
 */

import puppeteer from "puppeteer-core";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = process.argv[2] || resolve(__dirname, "sites/baomi.json");

if (!existsSync(configPath)) {
  console.error("❌ 配置文件不存在:", configPath);
  console.log("用法: node auto-learn.js [站点配置.json]");
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(configPath, "utf-8"));
const S = cfg.selectors;
const STALE = cfg.staleness || { checkIntervalMs: 10000, stallLimit: 6 };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ====== 页面操作（配置驱动的选择器） ======

async function ensureMainTab(page) {
  if (!S.leftNav || !S.leftNavActive) return;
  try {
    await page.evaluate((sel, active) => {
      for (const el of document.querySelectorAll(sel)) {
        if (el.textContent.includes(active)) { el.click(); break; }
      }
    }, S.leftNav, S.leftNavActive);
  } catch (e) {}
  await sleep(2000);
}

async function switchTab(page, idx) {
  if (!S.tabList) return;
  try {
    await page.evaluate((sel, i) => {
      const tabs = document.querySelectorAll(sel);
      if (tabs[i]) tabs[i].click();
    }, S.tabList, idx);
  } catch (e) {}
  await sleep(2000);
}

async function getCourses(page) {
  try {
    return await page.evaluate((sel, titleSel, hoursSel, doneCls, watchingCls) => {
      return Array.from(document.querySelectorAll(sel)).map(c => ({
        title: titleSel ? (c.querySelector(titleSel)?.textContent?.trim() || "") : "",
        hours: hoursSel ? (c.querySelector(hoursSel)?.textContent?.trim() || "") : "",
        done: c.classList.contains(doneCls),
        watching: c.classList.contains(watchingCls)
      }));
    }, S.courseList, S.courseTitle, S.courseHours, S.statusDone, S.statusWatching);
  } catch (e) { return []; }
}

async function clickFirstNotDone(page) {
  try {
    return await page.evaluate((sel, doneCls, titleSel) => {
      const courses = document.querySelectorAll(sel);
      for (const c of courses) {
        if (!c.classList.contains(doneCls)) {
          c.click();
          return titleSel ? (c.querySelector(titleSel)?.textContent?.trim() || "") : "";
        }
      }
      return null;
    }, S.courseList, S.statusDone, S.courseTitle);
  } catch (e) { return null; }
}

async function getVideoState(page) {
  try {
    return await page.evaluate(() => {
      const v = document.querySelector("video");
      return v ? {
        time: Math.floor(v.currentTime),
        dur: Math.floor(v.duration),
        paused: v.paused,
        ended: v.ended,
        url: location.href
      } : null;
    });
  } catch (e) { return null; }
}

async function getTabNames(page) {
  if (!S.tabList) return ["默认"];
  try {
    return await page.evaluate((sel) =>
      Array.from(document.querySelectorAll(sel)).map(t => t.textContent.trim())
    , S.tabList);
  } catch (e) { return ["默认"]; }
}

async function closeVideoPages(browser) {
  for (const p of await browser.pages()) {
    if (p.url().includes(S.videoPageUrl)) {
      try { await p.close(); } catch (e) {}
    }
  }
}

async function findVideoPage(browser) {
  return (await browser.pages()).find(p => p.url().includes(S.videoPageUrl));
}

async function ensurePlaying(page) {
  try {
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v && v.paused && !v.ended) v.play();
    });
  } catch (e) {}
}

function setupDialogs(page) {
  page.on("dialog", async (d) => { console.log("   🔔 弹窗已关闭"); await d.accept(); });
}

// ====== 主流程 ======

async function main() {
  console.log("=".repeat(50));
  console.log(`  自动学习 - ${cfg.name}`);
  console.log("=".repeat(50) + "\n");
  console.log(`  配置: ${configPath}\n`);

  const browser = await puppeteer.connect({
    browserURL: `http://localhost:${cfg.chromeFlags?.debugPort || 9222}`,
    defaultViewport: null,
  });
  console.log("✓ 已连接 Chrome\n");

  browser.on("targetcreated", async (target) => {
    const page = await target.page();
    if (page) setupDialogs(page);
  });
  for (const p of await browser.pages()) setupDialogs(p);

  let listPage = (await browser.pages()).find(p =>
    p.url().includes("bmCourseDetail") || (!p.url().includes(S.videoPageUrl) && p.url() !== "about:blank")
  );
  if (!listPage) {
    listPage = await browser.newPage();
    await listPage.goto(cfg.courseUrl, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await sleep(5000);
  }

  await ensureMainTab(listPage);
  const tabNames = await getTabNames(listPage);
  console.log(`📋 ${tabNames.length} 个模块:\n`);
  tabNames.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));

  for (let ti = 0; ti < tabNames.length; ti++) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`📍 [${ti + 1}/${tabNames.length}] ${tabNames[ti]}`);
    console.log("=".repeat(50));

    await ensureMainTab(listPage);
    await switchTab(listPage, ti);
    let courses = await getCourses(listPage);

    if (courses.every(c => c.done)) {
      console.log("   ✅ 已全部完成！");
      continue;
    }

    courses.forEach(c => console.log(`   ${c.done ? "✅" : c.watching ? "▶" : "⬜"} ${c.title}${c.hours ? " (" + c.hours + "学时)" : ""}`));

    while (true) {
      const clicked = await clickFirstNotDone(listPage);
      if (!clicked) { console.log("   ✅ 全部完成！"); break; }
      console.log(`   🎬 ${clicked}`);

      await closeVideoPages(browser);
      await sleep(4000);
      let videoPage = await findVideoPage(browser);
      if (!videoPage) { await sleep(3000); videoPage = await findVideoPage(browser); }
      if (!videoPage) { console.log("   ⚠ 无视频页，跳过"); continue; }
      setupDialogs(videoPage);
      await ensurePlaying(videoPage);

      let lastProgress = { time: 0, dur: 0 };
      let stallTicks = 0;
      let currentUrl = "";
      let lastCheckDone = 0;

      console.log("   ⏳ 监控中...");

      while (true) {
        await sleep(STALE.checkIntervalMs);
        const vs = await getVideoState(videoPage);
        if (!vs || !vs.dur) { stallTicks++; }
        else {
          const pct = vs.dur > 0 ? Math.round(vs.time / vs.dur * 100) : 0;
          if (vs.url !== currentUrl && currentUrl !== "") {
            console.log("\n   📺 自动连播 → 下一节");
            lastProgress = { time: 0, dur: 0 }; stallTicks = 0; lastCheckDone = 0;
          }
          currentUrl = vs.url;
          const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
          process.stdout.write(`\r   [${bar}] ${pct}% ${vs.time}s/${vs.dur}s `);

          const stalled = Math.abs(vs.time - lastProgress.time) < 1 && vs.dur === lastProgress.dur && !vs.ended;
          if (stalled || vs.paused) stallTicks++; else { stallTicks = 0; lastCheckDone = 0; }
          lastProgress = { time: vs.time, dur: vs.dur };
        }

        if (stallTicks >= STALE.stallLimit) {
          console.log("\n   🔍 视频停止，检查进度...");
          stallTicks = 0;
          try {
            await listPage.bringToFront(); await sleep(1000);
            await ensureMainTab(listPage); await switchTab(listPage, ti);
            const quickCourses = await getCourses(listPage);
            const doneNow = quickCourses.filter(c => c.done).length;
            console.log(`   📊 ${doneNow}/${quickCourses.length} 已完成`);
            if (doneNow === quickCourses.length) {
              console.log("   ✅ 本模块全部完成！");
              await closeVideoPages(browser); break;
            }
            lastCheckDone = doneNow;
            await closeVideoPages(browser); break;
          } catch (e) {
            console.log(`   ⚠ 异常: ${e.message.slice(0, 50)}`);
            try { await closeVideoPages(browser); } catch (e2) {} break;
          }
        }
      }
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  🎉 ${cfg.name} - 全部完成！`);
  console.log("=".repeat(50) + "\n");
  await browser.disconnect();
}

main().catch(err => { console.error("❌ 错误:", err.message); process.exit(1); });
