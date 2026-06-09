#!/usr/bin/env node
/**
 * 保密在线培训 - 一键刷课脚本
 * 
 * 2026年度全国保密教育线上培训专用，下载即用，无需配置。
 * 
 * 用法：
 *   1. Chrome 以调试模式启动（见 README）
 *   2. 登录 baomi.org.cn
 *   3. node baomi-course.js
 * 
 * 自动完成：3个模块 / 41节课 / 约5小时
 */

import puppeteer from "puppeteer-core";

const COURSE_URL = "https://www.baomi.org.cn/bmCourseDetail/course?id=312bc914-8e11-421b-b9bc-e900fe1a4e50&docId=56242227&docLibId=-15&pubId=42388&siteId=95";

// ====== 保密在线专用选择器（已验证 2026-06） ======
const S = {
  leftNav: ".leftBar-item",
  leftNavActive: "课程",
  tabList: ".tab-item",
  courseList: ".course-list .course-item",
  courseTitle: ".titlename",
  courseHours: ".num .themeColor",
  statusDone: "status2",      // 已完成
  statusWatching: "status1",   // 学习中
  statusPending: "status0",    // 未开始
  videoPageUrl: "bmVideo"      // 视频页 URL 特征
};

const CHECK_MS = 10000;
const STALL_LIMIT = 6;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("═".repeat(55));
  console.log("  保密在线培训 - 一键刷课");
  console.log("  2026年度全国保密教育线上培训");
  console.log("═".repeat(55) + "\n");

  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: null,
  });
  console.log("✓ 已连接 Chrome\n");

  // 弹窗自动处理
  const onDialog = (page) => page.on("dialog", async d => { await d.accept(); });
  browser.on("targetcreated", async t => { const p = await t.page(); if (p) onDialog(p); });
  for (const p of await browser.pages()) onDialog(p);

  // 课程列表页
  let listPage = (await browser.pages()).find(p => !p.url().includes("bmVideo") && p.url() !== "about:blank");
  if (!listPage) {
    listPage = await browser.newPage();
    await listPage.goto(COURSE_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await sleep(5000);
  }

  // 辅助函数
  const ensureCourseTab = async () => {
    await listPage.evaluate((sel, active) => {
      for (const el of document.querySelectorAll(sel)) {
        if (el.textContent.includes(active)) { el.click(); break; }
      }
    }, S.leftNav, S.leftNavActive);
    await sleep(2000);
  };

  const switchTab = async (idx) => {
    await listPage.evaluate((sel, i) => {
      const tabs = document.querySelectorAll(sel);
      if (tabs[i]) tabs[i].click();
    }, S.tabList, idx);
    await sleep(2000);
  };

  const getCourses = async () => {
    return await listPage.evaluate((sel, tSel, hSel, dCls, wCls) => {
      return Array.from(document.querySelectorAll(sel)).map(c => ({
        title: tSel ? (c.querySelector(tSel)?.textContent?.trim() || "") : "",
        hours: hSel ? (c.querySelector(hSel)?.textContent?.trim() || "") : "",
        done: c.classList.contains(dCls),
        watching: c.classList.contains(wCls)
      }));
    }, S.courseList, S.courseTitle, S.courseHours, S.statusDone, S.statusWatching);
  };

  const clickFirstNotDone = async () => {
    return await listPage.evaluate((sel, dCls, tSel) => {
      for (const c of document.querySelectorAll(sel)) {
        if (!c.classList.contains(dCls)) {
          c.click();
          return tSel ? (c.querySelector(tSel)?.textContent?.trim() || "") : "";
        }
      }
      return null;
    }, S.courseList, S.statusDone, S.courseTitle);
  };

  const closeVideoPages = async () => {
    for (const p of await browser.pages()) {
      if (p.url().includes(S.videoPageUrl)) { try { await p.close(); } catch (e) {} }
    }
  };

  const findVideoPage = async () => {
    return (await browser.pages()).find(p => p.url().includes(S.videoPageUrl));
  };

  // 获取 Tab 名
  await ensureCourseTab();
  const tabNames = await listPage.evaluate((sel) =>
    Array.from(document.querySelectorAll(sel)).map(t => t.textContent.trim())
  , S.tabList);

  console.log(`📋 ${tabNames.length} 个模块`);
  tabNames.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));
  console.log("");

  for (let ti = 0; ti < tabNames.length; ti++) {
    console.log(`\n${"=".repeat(55)}`);
    console.log(`📍 [${ti + 1}/${tabNames.length}] ${tabNames[ti]}`);
    console.log("=".repeat(55));

    await ensureCourseTab();
    await switchTab(ti);
    let courses = await getCourses();

    if (courses.every(c => c.done)) {
      console.log("   ✅ 已全部完成！");
      continue;
    }

    courses.forEach(c => console.log(`   ${c.done ? "✅" : c.watching ? "▶" : "⬜"} ${c.title}${c.hours ? " (" + c.hours + "学时)" : ""}`));

    let lastDoneCount = courses.filter(c => c.done).length;

    while (true) {
      const clicked = await clickFirstNotDone();
      if (!clicked) { console.log("   ✅ 全部完成！"); break; }
      console.log(`   🎬 ${clicked}`);

      await closeVideoPages();
      await sleep(4000);
      let videoPage = await findVideoPage();
      if (!videoPage) { await sleep(3000); videoPage = await findVideoPage(); }
      if (!videoPage) { console.log("   ⚠ 无视频页，跳过"); continue; }
      onDialog(videoPage);

      // 确保播放
      try {
        await videoPage.evaluate(() => {
          const v = document.querySelector("video");
          if (v && v.paused && !v.ended) v.play();
        });
      } catch (e) {}

      let lastProgress = { time: 0, dur: 0 };
      let stallTicks = 0;
      let currentUrl = "";

      console.log("   ⏳ 监控中...");

      while (true) {
        await sleep(CHECK_MS);

        let vs;
        try {
          vs = await videoPage.evaluate(() => {
            const v = document.querySelector("video");
            return v ? { time: Math.floor(v.currentTime), dur: Math.floor(v.duration), paused: v.paused, ended: v.ended, url: location.href } : null;
          });
        } catch (e) { stallTicks++; vs = null; }

        if (!vs || !vs.dur) { stallTicks++; }
        else {
          const pct = vs.dur > 0 ? Math.round(vs.time / vs.dur * 100) : 0;

          if (vs.url !== currentUrl && currentUrl !== "") {
            console.log("\n   📺 自动连播 → 下一节");
            lastProgress = { time: 0, dur: 0 }; stallTicks = 0;
          }
          currentUrl = vs.url;

          const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
          process.stdout.write(`\r   [${bar}] ${pct}% ${vs.time}s/${vs.dur}s `);

          const stalled = Math.abs(vs.time - lastProgress.time) < 1 && vs.dur === lastProgress.dur && !vs.ended;
          if (stalled || vs.paused) stallTicks++; else { stallTicks = 0; }
          lastProgress = { time: vs.time, dur: vs.dur };
        }

        if (stallTicks >= STALL_LIMIT) {
          console.log("\n   🔍 视频停止，检查进度...");
          stallTicks = 0;
          try {
            await listPage.bringToFront(); await sleep(1000);
            await ensureCourseTab(); await switchTab(ti);
            const quickCourses = await getCourses();
            const doneNow = quickCourses.filter(c => c.done).length;
            console.log(`   📊 ${doneNow}/${quickCourses.length} 已完成`);
            if (doneNow === quickCourses.length) {
              console.log("   ✅ 本模块全部完成！");
              await closeVideoPages(); break;
            }
            if (doneNow === lastDoneCount) {
              // 本次检查无进展，但外层循环会重新点击
            }
            lastDoneCount = doneNow;
            await closeVideoPages(); break;
          } catch (e) {
            console.log(`   ⚠ 异常: ${e.message.slice(0, 50)}`);
            try { await closeVideoPages(); } catch (e2) {} break;
          }
        }
      }
    }
  }

  console.log(`\n${"=".repeat(55)}`);
  console.log(`  🎉 保密在线培训 - 全部完成！`);
  console.log("=".repeat(55) + "\n");
  await browser.disconnect();
}

main().catch(err => { console.error("❌ 错误:", err.message); process.exit(1); });
