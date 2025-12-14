# 🛠️ Accordion Sidebar - Developer Guide

## 📁 Files Modified

```
frontend/src/components/
├── ToolsPanel.tsx         ✏️ MODIFIED - Complete rewrite to accordion
├── ToolsPanel.css         ✏️ MODIFIED - New accordion styles
├── Layout.tsx             ✏️ MODIFIED - Simplified sidebar integration
├── AskAnythingBox.tsx     ✏️ MODIFIED - Removed redundant header
└── AskAnythingBox.css     ✏️ MODIFIED - Updated for accordion
```

---

## 🏗️ Architecture

### Component Hierarchy
```
Layout
└── ToolsPanel (Right Sidebar)
    ├── Accordion Header (🛠️ AI Tools)
    └── Accordion Container
        ├── Summary Tool Section
        │   └── SummaryTool Component
        ├── Glossary Section
        │   └── GlossaryPanel Component
        ├── Explanation Section
        │   └── Custom explanation UI
        ├── Evidence Tracker Section
        │   └── EvidenceTracker Component
        ├── Equation Helper Section
        │   └── EquationHelper Component
        ├── Recalculation Section
        │   └── ISACalculator Component
        ├── Unit Converter Section
        │   └── UnitConverterTool Component
        └── Ask Anything Section
            └── AskAnythingBox Component
```

---

## 🔧 How It Works

### 1. State Management

```typescript
// Track which sections are expanded
const [expandedSections, setExpandedSections] = useState<Set<string>>(
  new Set(['summary']) // Summary open by default
);

// Glossary stored locally in ToolsPanel
const [glossary, setGlossary] = useState<Map<string, string>>(
  new Map()
);
```

### 2. Section Configuration

```typescript
const sections: AccordionSection[] = [
  {
    id: 'summary',           // Unique identifier
    title: 'Summary Tool',   // Display name
    icon: '📋',              // Emoji icon
    description: 'Auto summary...' // Subtitle
  },
  // ... more sections
];
```

### 3. Expand/Collapse Logic

```typescript
const toggleSection = (sectionId: string) => {
  setExpandedSections(prev => {
    const newSet = new Set(prev);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);  // Collapse
    } else {
      newSet.add(sectionId);     // Expand
    }
    return newSet;
  });
};
```

### 4. Active Content Indicators

```typescript
const hasActiveContent = (sectionId: string): boolean => {
  switch (sectionId) {
    case 'glossary':
      return glossary.size > 0;
    case 'equation':
      return (reportData?.equations?.length || 0) > 0;
    case 'explanation':
    case 'evidence':
      return selectedText.length > 0;
    default:
      return false;
  }
};
```

### 5. Rendering Sections

```typescript
const renderSectionContent = (sectionId: string) => {
  switch (sectionId) {
    case 'summary':
      return <SummaryTool {...props} />;
    case 'glossary':
      return <GlossaryPanel {...props} />;
    // ... other cases
  }
};
```

---

## 🎨 Styling System

### CSS Classes

```css
.tools-panel              /* Main container */
.tools-header             /* Top header bar */
.accordion-container      /* Scrollable container */
.accordion-section        /* Individual section */
.accordion-header         /* Clickable header */
.accordion-content        /* Content area (shown when expanded) */
.section-icon             /* Emoji icon */
.section-title            /* Section name */
.section-description      /* Subtitle text */
.accordion-arrow          /* ▼ arrow indicator */
.active-indicator         /* Green pulsing dot */
```

### Color Variables (GitHub Dark Theme)

```css
/* Backgrounds */
--bg-primary: #0d1117
--bg-secondary: #161b22
--bg-tertiary: #21262d

/* Borders */
--border-primary: #30363d
--border-secondary: #21262d

/* Text */
--text-primary: #c9d1d9
--text-secondary: #8b949e

/* Accent Colors */
--accent-green: #238636
--accent-green-light: #3fb950
--accent-blue: #58a6ff
```

### Key Animations

```css
/* Slide down effect */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulsing dot */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🔌 Integration Points

### Props Interface

```typescript
interface ToolsPanelProps {
  reportData: any | null;        // Report content & metadata
  selectedText: string;          // Highlighted text from PDF
  onAddToGlossary?: (            // Callback for glossary
    term: string, 
    definition: string
  ) => void;
}
```

### Usage in Layout

```tsx
<ToolsPanel 
  reportData={reportData} 
  selectedText={selectedText}
  onAddToGlossary={addToGlossary}
/>
```

---

## ➕ Adding a New Section

### Step 1: Add to sections array

```typescript
const sections: AccordionSection[] = [
  // ... existing sections
  {
    id: 'new-tool',
    title: 'New Tool Name',
    icon: '🎯',
    description: 'What this tool does • Feature list'
  }
];
```

### Step 2: Add render case

```typescript
const renderSectionContent = (sectionId: string) => {
  switch (sectionId) {
    // ... existing cases
    case 'new-tool':
      return <NewToolComponent {...props} />;
  }
};
```

### Step 3: (Optional) Add active indicator

```typescript
const hasActiveContent = (sectionId: string): boolean => {
  switch (sectionId) {
    // ... existing cases
    case 'new-tool':
      return someCondition;
  }
};
```

---

## 🧪 Testing Checklist

When modifying accordion:

- [ ] All sections expand/collapse correctly
- [ ] Multiple sections can be open simultaneously
- [ ] Arrow icon rotates 180° when expanded
- [ ] Active indicators show when expected
- [ ] Smooth animations (no jank)
- [ ] Scrolling works properly
- [ ] Content doesn't overflow
- [ ] Hover effects work
- [ ] Components render properly
- [ ] No console errors
- [ ] TypeScript compiles

---

## 🐛 Common Issues & Solutions

### Issue: Section won't expand
**Solution**: Check if `expandedSections.has(section.id)` is working

### Issue: Content not showing
**Solution**: Verify `renderSectionContent()` returns component

### Issue: Animation stutters
**Solution**: Check CSS `transition` and `animation` timing

### Issue: Active indicator not showing
**Solution**: Verify `hasActiveContent()` logic

### Issue: Scrolling doesn't work
**Solution**: Check `overflow-y: auto` on `.accordion-container`

---

## 📚 Best Practices

### 1. Keep sections focused
- Each section = one specific task
- Don't overload with features

### 2. Descriptive titles
- Use action-oriented language
- "Summary Tool" not just "Summary"

### 3. Helpful descriptions
- Explain what the tool does
- Use bullet points for features

### 4. Smart defaults
- Open the most-used section by default
- Consider user's current context

### 5. Performance
- Lazy-load heavy components
- Memoize expensive calculations
- Use React.memo for static sections

---

## 🔄 Future Improvements

### Phase 1: User Preferences
- [ ] Remember expanded sections (localStorage)
- [ ] Collapse all / Expand all buttons
- [ ] Drag-to-reorder sections

### Phase 2: Enhanced UX
- [ ] Keyboard shortcuts (Alt+1, Alt+2, etc.)
- [ ] Search within tools
- [ ] Pin favorite tools to top

### Phase 3: Advanced Features
- [ ] Section-specific settings
- [ ] Custom tool arrangements
- [ ] Tool templates
- [ ] Export/import configurations

---

## 📞 Support

If you encounter issues:

1. Check console for errors
2. Verify props are passing correctly
3. Inspect element styles in DevTools
4. Review this guide for common issues
5. Check component state in React DevTools

---

## 📖 Related Documentation

- `ACCORDION_IMPLEMENTATION.md` - Full implementation details
- `BEFORE_AFTER_COMPARISON.md` - Design rationale
- `ACCORDION_VISUAL_GUIDE.txt` - Visual layout

---

**Happy coding! 🚀**
