# Task 3.5: 落地页 — 海边蓝调单页站点

**Files:**
- Create: `landing/index.html`
- Create: `landing/styles.css`
- Create: `landing/script.js`
- Modify: `packages/web/src/App.tsx` (no changes needed, landing is independent)

**Interfaces:**
- Consumes: nothing (独立静态站点)
- Produces: 产品落地页，Hero/功能/步骤/CTA/页脚，海边蓝调渐变

**Global Constraints:** Playfair Display + Inter 字体，ocean 配色，中文内容，渐变仅用于 Hero 和底部 CTA

---

### Step 1: `landing/index.html`

Full HTML page with sections: Nav, Hero, Features, Steps, Download/CTA, Footer. See plan document for exact HTML.

Key details:
- Nav: fixed, backdrop-blur, ocean-50/85 bg
- Hero: linear-gradient(175deg, #E0F2FE→#BAE6FD→#7DD3FC→#0EA5E9)
- Features: 4 cards in grid, ocean-50 bg
- Steps: 3-step horizontal flow, ocean-100 bg
- CTA: gradient bg, dual buttons
- Footer: ocean-950 bg

### Step 2: `landing/styles.css`

Full CSS with ocean design tokens, responsive breakpoints, card hover effects, button styles. See plan document.

### Step 3: `landing/script.js`

Smooth scroll, nav background toggle on scroll, IntersectionObserver for feature card reveal animations.

### Step 4: 验证 — 用浏览器打开 `landing/index.html`

### Step 5: Commit `git add -A && git commit -m "feat: add landing page with ocean gradient, features, and CTAs"`
