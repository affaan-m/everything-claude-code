---
name: ui-demo
description: 使用Playwright录制精美的UI演示视频。当用户要求创建Web应用程序的演示、演练、屏幕录制或教程视频时使用。生成WebM格式的视频，包含可见光标、自然节奏和专业感。
origin: ECC
---

# UI 演示视频录制器

使用 Playwright 的视频录制功能，结合注入的光标覆盖层、自然的节奏和叙事流程，录制精美的 Web 应用程序演示视频。

## 使用时机

* 用户要求“演示视频”、“屏幕录制”、“操作演示”或“教程”
* 用户希望直观地展示某个功能或工作流程
* 用户需要用于文档、入职培训或向利益相关者展示的视频

## 三阶段流程

每个演示都需经过三个阶段：**探索 -> 排练 -> 录制**。切勿跳过阶段直接录制。

***

## 阶段 1：探索

在编写任何脚本之前，先浏览目标页面以了解实际内容。

### 原因

你无法为未曾见过的东西编写脚本。字段可能是 `<input>` 而非 `<textarea>`，下拉框可能是自定义组件而非 `<select>`，评论框可能支持 `@mentions` 或 `#tags`。错误的假设会导致录制无声地失败。

### 方法

导航到流程中的每个页面，并转储其交互元素：

```javascript
// Run this for each page in the flow BEFORE writing the demo script
const fields = await page.evaluate(() => {
  const els = [];
  document.querySelectorAll('input, select, textarea, button, [contenteditable]').forEach(el => {
    if (el.offsetParent !== null) {
      els.push({
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        text: el.textContent?.trim().substring(0, 40) || '',
        contentEditable: el.contentEditable === 'true',
        role: el.getAttribute('role') || '',
      });
    }
  });
  return els;
});
console.log(JSON.stringify(fields, null, 2));
```

### 需要关注的内容

* **表单字段**：它们是 `<select>`、`<input>`、自定义下拉框还是组合框？
* **选择选项**：转储选项值和文本。占位符通常带有 `value="0"` 或 `value=""`，看起来非空。使用 `Array.from(el.options).map(o => ({ value: o.value, text: o.text }))`。跳过文本包含“Select”或值为 `"0"` 的选项。
* **富文本**：评论框是否支持 `@mentions`、`#tags`、Markdown 或表情符号？检查占位符文本。
* **必填字段**：哪些字段会阻止表单提交？检查标签中的 `required`、`*`，并尝试提交空表单以查看验证错误。
* **动态内容**：是否在其他字段填写后出现新字段？
* **按钮标签**：确切的文本，例如 `"Submit"`、`"Submit Request"` 或 `"Send"`。
* **表格列标题**：对于基于表格的模态框，将每个 `input[type="number"]` 映射到其列标题，而不是假设所有数字输入都表示相同的内容。

### 输出

每个页面的字段映射，用于在脚本中编写正确的选择器。示例：

```text
/purchase-requests/new:
  - 预算代码: <select> (页面首个选择框，4个选项)
  - 期望交付日期: <input type="date">
  - 背景说明: <textarea> (非输入框)
  - BOM表格: 内联可编辑单元格，采用 span.cursor-pointer -> input 模式
  - 提交: <button> text="提交"

/purchase-requests/N (详情页):
  - 评论: <input placeholder="输入消息..."> 支持 @用户 和 #PR 标签
  - 发送: <button> text="发送" (输入框有内容前禁用)
```

***

## 阶段 2：排练

在不录制的情况下运行所有步骤。验证每个选择器都能正确解析。

### 原因

选择器无声失败是演示录制失败的主要原因。排练可以在浪费录制时间之前发现这些问题。

### 方法

使用 `ensureVisible`，这是一个会记录日志并大声报错的包装器：

```javascript
async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const msg = `REHEARSAL FAIL: "${label}" not found - selector: ${typeof locator === 'string' ? locator : '(locator object)'}`;
    console.error(msg);
    const found = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input, select, textarea, a'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName}[${el.type || ''}] "${el.textContent?.trim().substring(0, 30)}"`)
        .join('\n  ');
    });
    console.error('  Visible elements:\n  ' + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}
```

### 排练脚本结构

```javascript
const steps = [
  { label: 'Login email field', selector: '#email' },
  { label: 'Login submit', selector: 'button[type="submit"]' },
  { label: 'New Request button', selector: 'button:has-text("New Request")' },
  { label: 'Budget Code select', selector: 'select' },
  { label: 'Delivery date', selector: 'input[type="date"]:visible' },
  { label: 'Description field', selector: 'textarea:visible' },
  { label: 'Add Item button', selector: 'button:has-text("Add Item")' },
  { label: 'Submit button', selector: 'button:has-text("Submit")' },
];

let allOk = true;
for (const step of steps) {
  if (!await ensureVisible(page, step.selector, step.label)) {
    allOk = false;
  }
}
if (!allOk) {
  console.error('REHEARSAL FAILED - fix selectors before recording');
  process.exit(1);
}
console.log('REHEARSAL PASSED - all selectors verified');
```

### 当排练失败时

1. 阅读可见元素转储。
2. 找到正确的选择器。
3. 更新脚本。
4. 重新运行排练。
5. 只有当每个选择器都通过时，才继续下一步。

***

## 阶段 3：录制

只有在探索和排练都通过后，才能开始创建录制。

### 录制原则

#### 1. 叙事流程

将视频规划成一个故事。遵循用户指定的顺序，或使用以下默认流程：

* **入口**：登录或导航到起点
* **上下文**：平移周围环境，让观众了解所处位置
* **动作**：执行主要工作流程步骤
* **变化**：展示次要功能，如设置、主题或本地化
* **结果**：展示结果、确认信息或新状态

#### 2. 节奏

* 登录后：`4s`
* 导航后：`3s`
* 点击按钮后：`2s`
* 主要步骤之间：`1.5-2s`
* 最终操作后：`3s`
* 输入延迟：每个字符 `25-40ms`

#### 3. 光标覆盖层

注入一个跟随鼠标移动的 SVG 箭头光标：

```javascript
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}
```

每次页面导航后调用 `injectCursor(page)`，因为覆盖层在导航时会被销毁。

#### 4. 鼠标移动

切勿让光标瞬间移动。在点击前先移动到目标位置：

```javascript
async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped - "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(400);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}
```

每次调用都应包含一个描述性的 `label` 以便调试。

#### 5. 输入

可见地输入，而非瞬间填充：

```javascript
async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped - "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
  return true;
}
```

#### 6. 滚动

使用平滑滚动而非跳跃：

```javascript
await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
await page.waitForTimeout(1500);
```

#### 7. 仪表板平移

当展示仪表板或概览页面时，将光标移动到关键元素上：

```javascript
async function panElements(page, selector, maxCount = 6) {
  const elements = await page.locator(selector).all();
  for (let i = 0; i < Math.min(elements.length, maxCount); i++) {
    try {
      const box = await elements[i].boundingBox();
      if (box && box.y < 700) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.warn(`WARNING: panElements skipped element ${i} (selector: "${selector}"): ${e.message}`);
    }
  }
}
```

#### 8. 字幕

在视口底部注入一个字幕栏：

```javascript
async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}
```

每次导航后，与 `injectCursor(page)` 一起调用 `injectSubtitleBar(page)`。

使用模式：

```javascript
await showSubtitle(page, 'Step 1 - Logging in');
await showSubtitle(page, 'Step 2 - Dashboard overview');
await showSubtitle(page, '');
```

指导原则：

* 保持字幕文本简短，最好在 60 个字符以内。
* 使用 `Step N - Action` 格式以保持一致性。
* 在 UI 本身足以说明情况的长暂停期间，清除字幕。

## 脚本模板

```javascript
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_NAME = 'demo-FEATURE.webm';
const REHEARSAL = process.argv.includes('--rehearse');

// Paste injectCursor, injectSubtitleBar, showSubtitle, moveAndClick,
// typeSlowly, ensureVisible, and panElements here.

(async () => {
  const browser = await chromium.launch({ headless: true });

  if (REHEARSAL) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    // Navigate through the flow and run ensureVisible for each selector.
    await browser.close();
    return;
  }

  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await injectCursor(page);
    await injectSubtitleBar(page);

    await showSubtitle(page, 'Step 1 - Logging in');
    // login actions

    await page.goto(`${BASE_URL}/dashboard`);
    await injectCursor(page);
    await injectSubtitleBar(page);
    await showSubtitle(page, 'Step 2 - Dashboard overview');
    // pan dashboard

    await showSubtitle(page, 'Step 3 - Main workflow');
    // action sequence

    await showSubtitle(page, 'Step 4 - Result');
    // final reveal
    await showSubtitle(page, '');
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
})();
```

用法：

```bash
# Phase 2: Rehearse
node demo-script.cjs --rehearse

# Phase 3: Record
node demo-script.cjs
```

## 录制前检查清单

* \[ ] 探索阶段已完成
* \[ ] 排练通过，所有选择器正常
* \[ ] 已启用无头模式
* \[ ] 分辨率设置为 `1280x720`
* \[ ] 每次导航后重新注入光标和字幕覆盖层
* \[ ] 在主要过渡处使用了 `showSubtitle(page, 'Step N - ...')`
* \[ ] 所有点击都使用了带有描述性标签的 `moveAndClick`
* \[ ] 可见输入使用了 `typeSlowly`
* \[ ] 没有静默捕获；辅助函数会记录警告
* \[ ] 内容展示使用了平滑滚动
* \[ ] 关键暂停对人类观众可见
* \[ ] 流程符合请求的故事顺序
* \[ ] 脚本反映了阶段 1 中探索到的实际 UI

## 常见陷阱

1. 导航后光标消失 - 重新注入它。
2. 视频太快 - 添加暂停。
3. 光标是圆点而非箭头 - 使用 SVG 覆盖层。
4. 光标瞬间移动 - 点击前先移动。
5. 选择下拉框看起来不对 - 先展示移动，再选择选项。
6. 模态框感觉突兀 - 在确认前添加一个阅读暂停。
7. 视频文件路径随机 - 将其复制到一个稳定的输出名称。
8. 选择器失败被忽略 - 切勿使用静默捕获块。
9. 字段类型是假设的 - 先进行探索。
10. 功能是假设的 - 在编写脚本前检查实际 UI。
11. 占位符选择值看起来像真的 - 注意 `"0"` 和 `"Select..."`。
12. 弹窗创建了单独的视频 - 显式捕获弹窗页面，如果需要，稍后合并。
