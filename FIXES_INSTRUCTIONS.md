# KnodeFlow130126 - Fix Instructions

## Issue 1: Video Not Perfectly Centered (Slightly Left-Aligned)

**Problem:** The `.knode-tile-main` container isn't properly centered.

**File:** `KnodeFlow130126`  
**Location:** Around line 498-504

**Current Code:**
```css
.knode-tile-main {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
```

**Fix:** Add explicit centering:
```css
.knode-tile-main {
  width: 100%;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}
```

---

## Issue 2: Video Wrapper Should Be Bigger (More Responsive)

**Problem:** Video wrapper has a fixed `max-width: 1100px` which may not fill enough of larger screens.

**File:** `KnodeFlow130126`  
**Location:** Around line 498 (`.knode-tile-main`) and line 512 (`.knode-video-wrapper`)

**Fix Option A - Percentage-based width:**
```css
.knode-tile-main {
  width: 90%;
  max-width: 1400px;
  /* ... rest of styles */
}
```

**Fix Option B - Viewport-based:**
```css
.knode-video-wrapper {
  width: 100%;
  max-width: min(1400px, 85vw);
  /* ... rest of styles */
}
```

---

## Issue 3: Duplicate Video Info (Below Video AND in Pill Bar)

**Problem:** Video title appears in both:
1. The floating pill bar (`#headerTitle`)
2. The `.knode-video-info` section below the video

**File:** `KnodeFlow130126`  
**Location:** Around line 5626-5630 in `renderVideoTile()`

**Current Code (in renderVideoTile):**
```html
<!-- Video Info Bar -->
<div class="knode-video-info">
  <span class="knode-video-topic">${data.topic || ''}</span>
  <span class="knode-video-title">${data.title || ''}</span>
  <span class="knode-video-duration">⏱ ${data.duration || ''}</span>
</div>
```

**Fix - Remove the video info bar entirely:**
Delete lines 5625-5630 (the entire `knode-video-info` div).

Or **keep it minimal** (just topic and duration, no title):
```html
<div class="knode-video-info">
  <span class="knode-video-topic">${data.topic || ''}</span>
  <span class="knode-video-duration">⏱ ${data.duration || ''}</span>
</div>
```

---

## Issue 4: Glassmorphism Not Working on Pill Bar (Flat White BG)

**Problem:** `backdrop-filter` may not be working due to browser support or incorrect stacking context.

**File:** `KnodeFlow130126`  
**Location:** Around line 299-318 (`.knode-sticky-header`)

**Current Code:**
```css
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
```

**Fixes to try:**

1. **Ensure parent doesn't have `overflow: hidden`** - backdrop-filter breaks if any ancestor has overflow:hidden

2. **Add isolation:**
```css
.knode-sticky-header {
  isolation: isolate;
  /* ... other styles */
}
```

3. **Use a fallback with pseudo-element:**
```css
.knode-sticky-header {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  /* Remove background from here */
  background: transparent;
  /* ... other styles */
}

.knode-sticky-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: inherit;
  z-index: -1;
}
```

4. **If all else fails, use solid semi-transparent:**
```css
background: rgba(255, 255, 255, 0.92);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
/* Remove backdrop-filter */
```

---

## Issue 5: Tile-Dots / Tile-Nav Not Showing

**Problem:** Tile navigation dots were hidden with `display: none`.

**File:** `KnodeFlow130126`  
**Location:** Around line 424-427

**Current Code:**
```css
/* ==================== TILE NAVIGATION DOTS (Hidden - using floating bar) ==================== */
.knode-tile-nav {
  display: none;
}
```

**Fix - Restore tile navigation:**
```css
/* ==================== TILE NAVIGATION DOTS ==================== */
.knode-tile-nav {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
  background: rgba(255,255,255,0.9);
  padding: 16px 12px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

**Also remove the mobile hide rule** at line ~785:
```css
/* DELETE THIS: */
.knode-tile-nav {
  display: none;
}
```

---

## Issue 6: No CTA on Video Completion

**Problem:** The video overlay with "Let's move on" button exists in HTML but may not be showing.

**File:** `KnodeFlow130126`  
**Location:** 
- CSS for `.knode-video-overlay` around line 529
- HTML in `renderVideoTile()` around line 5616

**Check 1 - Ensure overlay becomes visible:**
The CSS should have:
```css
.knode-video-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}
```

**Check 2 - Ensure JS is adding the class:**
Around line 5643:
```javascript
video.onended = () => {
  if (overlay) overlay.classList.add("visible");
  // ...
};
```

**Check 3 - Ensure nxtBtn click handler exists:**
Around line 5660-5664:
```javascript
if (nxtBtn) {
  nxtBtn.onclick = () => {
    smoothScrollToNextTile();
  };
}
```

**If still not working**, add explicit display:
```css
.knode-video-overlay.visible {
  opacity: 1;
  pointer-events: auto;
  display: flex !important;
}
```

---

## Issue 7: Sticky Nav Behind Webflow Nav Bar

**Problem:** The floating bar `top: 90px` may not account for your actual Webflow nav height.

**File:** `KnodeFlow130126`  
**Location:** Around line 299 (`.knode-sticky-header`)

**Current Code:**
```css
.knode-sticky-header {
  position: fixed;
  top: 90px;
  /* ... */
}
```

**Fix - Adjust top value to match your Webflow nav:**

1. **Inspect your Webflow nav** in DevTools and note its height (e.g., 72px, 80px, 100px)

2. **Update the top value** to be nav height + some padding:
```css
.knode-sticky-header {
  position: fixed;
  top: calc(YOUR_NAV_HEIGHT + 16px); /* e.g., calc(80px + 16px) = 96px */
  /* ... */
}
```

3. **Also update `.knode-tile-container` padding-top** at line ~475:
```css
.knode-tile-container {
  padding-top: calc(YOUR_NAV_HEIGHT + 80px); /* Space for nav + floating bar + breathing room */
}
```

---

## Summary Checklist

| Issue | Line(s) | Action |
|-------|---------|--------|
| 1. Video centering | ~498-504 | Add `align-items: center` to `.knode-tile-main` |
| 2. Video size | ~498, ~512 | Increase `max-width` to 1400px or use `85vw` |
| 3. Duplicate info | ~5625-5630 | Remove `.knode-video-info` from `renderVideoTile()` |
| 4. Glassmorphism | ~299-318 | Add `isolation: isolate` or use pseudo-element |
| 5. Tile nav hidden | ~424-427 | Change `display: none` to `display: flex` with positioning |
| 6. Video CTA | ~529, ~5616, ~5660 | Verify `.visible` class and onclick handler |
| 7. Nav position | ~299, ~475 | Adjust `top` value and `padding-top` to match Webflow nav |
