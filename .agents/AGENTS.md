# GLOBAL QUALITY CONTRACT & DESIGN SYSTEM RULES

Every module in this codebase MUST adhere strictly to the following quality contract:

## 1. Global Layout Standard
- All admin pages MUST use the shared `Sidebar` and `Header` components.
- Outer main content wrapper MUST use dynamic left padding:
  ```tsx
  <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
  ```
- Sidebar expansion (`256px` / `md:pl-64`) and collapse (`80px` / `md:pl-20`) MUST stay 100% synchronized with the `sidebarOpen` state variable.
- No content or navigation bar may ever appear underneath the fixed sidebar.
- Layout offset and spacing rules MUST be identical across Desktop, Tablet, and Mobile viewports.

## 2. Global Theme Synchronization (Light & Dark Themes)
- Both Light Theme and Dark Theme MUST be supported simultaneously across all components.
- Never allow theme mismatch (e.g. Dark Sidebar with Light Content or Light Sidebar with Dark Content).
- Always use standard Tailwind CSS semantic color tokens:
  - `bg-background` for page background
  - `bg-card` for cards, tables, and modal containers
  - `bg-secondary` for inputs, dropdowns, hover states, and pills
  - `text-foreground` for primary text
  - `text-muted-foreground` for subheadings, captions, and secondary text
  - `border-border` for borders and dividers
  - `bg-primary` & `text-primary-foreground` for brand buttons and active tabs
- Do NOT hardcode custom dark slate or light hex colors that break when theme toggles.

## 3. Empty State & Loading State Standards
- Every list or data view MUST handle loading (`<RefreshCw className="animate-spin" />`) and empty state conditions.
- When no data or filtered items match, display a clean, contextual `<EmptyState>` component with icon, title, description, and action button.

## 4. Build & Pre-commit Verification Contract
- ALWAYS run `npm run build` locally in `frontend/` before declaring a task complete or committing.
- Do NOT commit, push, or deploy if TypeScript errors or duplicate object property errors occur.
