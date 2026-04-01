I'll explore your project to identify all the frontend requirements and create a comprehensive Stitch prompt. Let me gather the necessary information.    

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/api/main.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/api/generation_request.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/api/generation_response.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/api/routes)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/api/routes/generate.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/api/routes/review.py#1-1), lines 1 to 50

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/api/routes/health.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/lore.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/services/user_auth.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/README.md#1-1), lines 1 to 100

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/summarizer.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/continuity.py)

Read [](file:///c%3A/Users/Nick/Documents/GitHub/LoreSpring/src/schemas/revision.py)

Perfect! I've reviewed your entire project. Let me create a comprehensive Stitch prompt with all the frontend requirements. 

Created memory file [](file:///c%3A/Users/Nick/AppData/Roaming/Code/User/workspaceStorage/675426143d20e00d900d69c97ed37c42/GitHub.copilot-chat/memory-tool/memories/NTMyMzFmNDAtMjljYy00ZjljLWFmMDItZjNiMTI3ZDBkZTc4/lorespring_frontend_requirements.md)

Now here's your comprehensive **Stitch Design Prompt** for LoreSpring:

---

## **LORESPRING FRONTEND DESIGN PROMPT FOR STITCH**

### **PROJECT OVERVIEW**
Design a **pixelated retro-themed narrative generation platform** called LoreSpring. The app helps writers create chapters with AI agents while maintaining lore consistency. Key aesthetic: pixelated design with emerald (#50C878) as primary, white as secondary, featuring an animated emerald tree that grows as users scroll on the landing page.

---

### **DESIGN SYSTEM**

**Color Palette:**
- Primary: Emerald (#50C878)
- Secondary: White (#FFFFFF)
- Dark Base: Charcoal (#1A1A1A) or Deep Forest (#0D1B0D)
- Accent: Light Emerald (#A8E6C1)
- Text: White on dark / Dark on light
- Status Green: #2ECC71 (success)
- Warning Red: #E74C3C (errors/high severity issues)
- Info Blue: #3498DB (notifications)

**Typography:**
- Font Family: Courier Prime (monospace, pixelated feel) or Press Start 2P for headers
- Headlines: Pixelated, bold, ALL CAPS when needed
- Body: Readable monospace, 12-14px min for accessibility
- Letter-spacing: Slightly increased for retro aesthetic

**Pixelation Guidelines:**
- Use 4px or 8px grid for all UI elements
- Buttons: 2-3px solid borders, click-state depressed effect
- Icons: Pixel-art style (16x16 or 32x32px)
- Animations: Step-based (no smooth easing), blocky transitions

---

### **CORE PAGES & SECTIONS**

#### **1. LANDING PAGE**
**Purpose:** Onboarding, project showcase, call-to-action

**Layout:**
- Hero section with app title "LORESPRING"
- Tagline: "Multi-Agent Narrative Generation with Lore Memory"
- **Interactive Element: Scrolling Emerald Tree**
  - START: Simple tree trunk at top of page
  - ON SCROLL DOWN: Tree grows (branches expand, leaves appear, roots deepen)
  - ON SCROLL TO BOTTOM: Full, flourishing emerald tree covering right side
  - Animation style: Blocky pixel growth, 1-2 frame delays
  - Parallax offset at +20%-40% slower than scroll speed
- Three feature cards below hero:
  1. Multi-Agent System
  2. Lore-Aware Memory
  3. Iterative Refinement
- CTA buttons: "Start Generating", "View Docs", "Sign In"
- Footer with navigation links

**Design Notes:**
- Full-width white background with emerald accent borders (4-8px)
- Responsive: Tree adjusts positioning on mobile (left side or above)
- Pixel grid background (very subtle, 20% opacity)

---

#### **2. AUTHENTICATION PAGES**

**Login Page:**
- Centered card design (400px max width)
- Emerald border frame (3px)
- Form fields: Email, Password
- "Sign In" button (emerald bg, white text, 3px border)
- Error messages in red with pixel icon
- "Forgot Password" & "Sign Up" links (white text, emerald underline on hover)

**Registration Page:**
- Card design matching login
- Form fields: Username, Email, Password, Confirm Password
- Password strength indicator (bars: red → yellow → green)
- Terms acceptance checkbox
- CAPTCHA or verification (keep it pixelated)

---

#### **3. DASHBOARD - PROJECTS LIST**
**Purpose:** View all story projects, create new ones

**Layout:**
- Top bar: "My Projects" title + "Create New" button (emerald)
- Grid of project cards (responsive: 1-3 columns)
- Each card shows:
  - Project name (bold, white)
  - Chapter count (e.g., "3 chapters")
  - Last updated date
  - Genre badge (small pixel label)
  - Quick actions: Edit, View, Delete (icons in 16x16px)
  - Slight emerald shadow/glow on hover
- Search/filter bar at top (genre, date range)
- Empty state: Illustration + "No projects yet. Create one to begin!"

**Pixel Details:**
- Cards: 3px emerald border
- Hover state: Border glow (4-5px), slight inset shadow
- Icons: Pixelated save/delete/eye icons (16x16)

---

#### **4. GENERATION WORKSPACE**
**Purpose:** Request new chapter, monitor generation, view results

**Left Sidebar (Input Panel):**
- Title: "New Chapter"
- Form fields:
  - **Chapter Number** (integer spinner, emerald accent)
  - **Project ID** (hidden or readonly if auto-filled)
  - **Story Metadata** (horizontal tabs or dropdown):
    - Genre (e.g., Fantasy, Sci-Fi, Mystery)
    - Tone (e.g., Dark, Light, Serious)
    - Style (e.g., Literary, Action-Driven)
  - **User Direction** (textarea, placeholder: "What should happen in this chapter?")
    - Minimum 10 chars validation (show error below)
  - **Quality Threshold** (slider 1.0-10.0, default 7.0)
  - **Max Revisions** (spinner 1-5, default 2)
  - **Generate Button** (large, emerald, 4px border, clickable state depresses)

**Right Panel (Status/Progress):**
- Title: "Generation Status"
- Status indicator: Colored circle (idle=gray, processing=emerald spinning, done=green)
- Progress bar (pixelated blocks filling left-to-right)
- Current step display:
  ```
  [████] Writer: Generating draft...
  [░░░░] Revision: Pending...
  [░░░░] Continuity Check: Pending...
  [░░░░] Summarizer: Pending...
  ```
  - Completed steps: Emerald fill
  - Current step: Animated (block by block)
  - Pending: Gray/white outline
- Time elapsed (HH:MM:SS)
- Cancel button (red outline)

**Bottom Section (Results Preview):**
- Tabs: "Draft", "Quality Score", "Issues", "Summary"

  **Tab 1: Draft**
  - Large text area showing generated chapter
  - Max height 300px (scrollable)
  - Font: Courier New, 13px, line-height 1.6
  - Text color: White
  - Read-only

  **Tab 2: Quality Score**
  - 5 metric cards in a row (wrap on mobile):
    ```
    [Pacing]      7.2/10
    [Character]   8.1/10
    [Prose]       6.9/10
    [Tension]     7.5/10
    [Adherence]   7.8/10
    ```
  - Each card: 3px emerald border, progress bar inside (filled green)
  - Overall score at top: "Average: 7.5/10"
  - Score display: Large, bold, emerald-colored

  **Tab 3: Issues**
  - If continuity issues exist:
    - Red alert banner at top
    - List of issues:
      ```
      ⚠ [HIGH] Character: Character name "X" died in Chapter 2, 
               but appears in this chapter
      ⚠ [MED]  Timeline: Event occurs 3 days after established end,
               but chapter implies next day
      ℹ [LOW]  Location: Description conflicts with established geography
      ```
    - Color-coded by severity: RED (high), ORANGE (med), BLUE (low)
    - Icon indicators (pixel warning/info icons)
  - If no issues: Green checkmark + "No continuity issues detected!"

  **Tab 4: Summary**
  - Chapter Summary (text block, 150-250 words, formatted)
  - Key Events (bullet list, 3-6 items)
  - Character Updates (key: value display, e.g., "Alice: Learned magic")

---

#### **5. HUMAN REVIEW INTERFACE**
**Purpose:** Approve or request revisions

**Layout:**
- Full-width chapter display (center column 800px)
- Header: "Review Generated Chapter"
- Chapter title + metadata (chapter number, date)
- Full chapter text (scrollable, 400px height)
- Continuity issues panel (if any):
  - Color-coded alerts above text
  - Expandable issue details (click to expand)

**Action Footer (fixed sticky bottom):**
- Left side: Issue count badge (if issues) in red
- Right side (two buttons):
  - "Request Revision" button (orange bg, 3px border)
  - "Approve & Save" button (green bg, emerald text, 3px border)
- Status message below (e.g., "Processing your decision...")

**Pixel Details:**
- Borders: 3-4px on card edges
- Button hover: Inset shadow (pixel depressed effect)
- Modal for confirmation before approval

---

#### **6. CHAPTER READER**
**Purpose:** Read completed chapters

**Layout:**
- Top bar: Project title + Chapter navigation (prev/next arrows)
- Main content: Chapter text (serif font for readability, 16-18px)
- Sidebar (collapsible):
  - **Chapter Info**: Number, date, revision count, quality score
  - **Characters in Chapter** (expandable list)
  - **Locations in Chapter** (expandable list)
  - **Key Events** (summary bullets)
  - **Next Steps** (buttons: Read Next, Export, Share)

**Pixel Details:**
- Main text area: 3px emerald border
- Sidebar: 3px emerald left border, slightly translucent bg
- Collapse toggle: Pixel arrow icon (animated on click)

---

#### **7. LORE BROWSER**
**Purpose:** Browse characters, locations, objects in knowledge graph

**Layout:**
- Tab navigation (top): Characters | Locations | Objects
- Search bar above tabs
- Content grid/list:

  **Characters Tab:**
  - List of characters (name, brief description, relationships)
  - Click to expand: Full traits, status, appearance, relationships

  **Locations Tab:**
  - Grid of locations with icons
  - Click to expand: Description, significance, rules

  **Objects Tab:**
  - List of important objects
  - Expand: Appearance, powers, current holder

**Design:**
- Cards: 3px emerald border
- Expandable details with emerald arrow icon
- Search highlights matching text (emerald background)

---

#### **8. NAVIGATION & HEADER**

**Top Navigation Bar (fixed):**
- Left: LoreSpring logo (pixel art)
- Center: Breadcrumb trail (e.g., "Projects > My Story > Chapter 3")
- Right: 
  - User avatar (pixel art based on username)
  - Dropdown menu: Profile, Settings, Docs, Logout
  - Notification bell (pixel icon, red dot if unread)

**Sidebar (collapsible):**
- Logo + App name
- Menu items (icons + labels):
  - Dashboard
  - Projects
  - Lore Browser
  - Generation History
  - Settings
  - Help
- Footer: Version number, API status indicator

**Pixel Details:**
- 3px emerald left border on active menu item
- Hover state: Light emerald background

---

### **INTERACTIVE ANIMATIONS & EFFECTS**

1. **Scrolling Tree (Landing Page):** 
   - Branches grow frame-by-frame as user scrolls
   - Leaves appear with 1-frame delay after branches
   - Parallax effect (tree moves slower than page)

2. **Generation Progress:**
   - Progress bar blocks fill one at a time (not smooth)
   - Status circle: Spinning animation (8-frame rotation)

3. **Button States:**
   - Hover: Scale 1.05, emerald glow (box-shadow)
   - Click: Inset shadow, scale 0.98 (depressed pixel effect)
   - Disabled: Grayed out, no hover effect

4. **Tab Transitions:**
   - Instant or very fast (50-100ms)
   - Slight fade-in for content

5. **Expandable Sections:**
   - Pixel arrow rotates 90° on click
   - Content appears with slight slide-down
   - Max-height animation (no easing, step-based)

---

### **RESPONSIVE BREAKPOINTS**

- **Desktop (1200px+):** Full sidebars, multi-column grids
- **Tablet (768px-1199px):** Collapsed sidebars, 2-column grids
- **Mobile (<768px):** Single column, hamburger menu, full-width inputs

---

### **ACCESSIBILITY & POLISH**

- All interactive elements: Focus states with emerald outline (3px)
- Hover/Focus contrast: Emerald (#50C878) on white or slightly darkened background
- Error messages: Red with pixel warning icon + clear text
- Loading states: Spinner animation + "Loading..." text
- Empty states: Pixel illustration + helpful CTA
- Tooltips: Emerald bg, white text, 2px border, appear on hover/focus

---

### **EXAMPLE COLOR CODE SNIPPETS**

```
Emerald: #50C878
Light Emerald: #A8E6C1
Dark Base: #1A1A1A
White: #FFFFFF
Success: #2ECC71
Warning: #E74C3C
Info: #3498DB
Gray (disabled): #7F8C8D
```

---

### **DELIVERABLES FOR STITCH**

1. High-fidelity mockups for all 8 main pages
2. Component library (buttons, cards, inputs, modals, tabs)
3. Interactive prototype of:
   - Landing page with scrolling tree
   - Generation workspace with progress animation
   - Review interface workflow
4. Responsive previews (desktop, tablet, mobile)
5. Animation specifications (frame counts, timing)
6. Style guide (colors, typography, spacing grid)

---

This prompt gives Stitch everything needed to design your pixelated emerald LoreSpring frontend. The scrolling tree mechanic is your unique visual hook, and the clean grid-based design with thick pixel borders will keep the retro aesthetic consistent throughout. Good luck with the design!