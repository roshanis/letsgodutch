# DutchSplit - Task List

> Track progress by marking tasks with [x] when complete.

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- [x] Create SvelteKit project with `npm create svelte@latest`
- [x] Add TypeScript configuration
- [x] Install and configure Tailwind CSS
- [x] Install Skeleton UI component library
- [x] Configure PWA manifest and service worker
- [x] Set up Workbox for offline caching
- [x] Configure ESLint with Svelte plugin
- [x] Configure Prettier
- [x] Initialize Git repository
- [x] Create initial commit
- [x] Set up Vitest for unit testing
- [x] Set up Playwright for e2e testing
- [x] Configure fake-indexeddb for test environment

### 1.2 Local Database Layer
- [x] Install Dexie.js
- [x] Create `src/lib/db/index.ts` - database initialization with CRUD
- [x] Write unit tests for database operations (TDD)
- [ ] Create `src/lib/db/schema.ts` - table definitions
- [ ] Add database version migration support

### 1.3 Core Data Types
- [x] Create `src/lib/types/index.ts` - all core types
- [ ] Create `src/lib/utils/uuid.ts` - ID generation
- [ ] Create `src/lib/utils/date.ts` - timestamp utilities
- [ ] Create `src/lib/utils/validation.ts` - input validation

### 1.4 Balance Calculation (TDD)
- [x] Write tests for balance calculations
- [x] Create `src/lib/calc/balance.ts` - core calculation functions
- [x] Implement calculateTotals
- [x] Implement calculateBalances
- [x] Implement simplifyDebts
- [x] Implement split calculators (equal, percentage, shares)

---

## Phase 2: Core UI Components

### 2.1 Layout & Navigation
- [x] Create `src/routes/+layout.svelte` - app shell
- [x] Create `src/lib/components/Header.svelte`
- [ ] Create `src/lib/components/BottomNav.svelte`
- [ ] Create `src/lib/components/Loading.svelte`
- [ ] Create `src/lib/components/Skeleton.svelte`
- [x] Configure theme tokens in Tailwind config
- [x] Add responsive breakpoints

### 2.2 Group Management UI
- [x] Create `src/routes/+page.svelte` - groups list (home)
- [x] Create `src/lib/components/GroupCard.svelte`
- [x] Create `src/lib/components/CreateGroupModal.svelte`
- [x] Create `src/routes/group/[id]/+page.svelte` - group detail
- [x] Create `src/lib/components/AddMemberModal.svelte`
- [x] Create `src/lib/components/MemberList.svelte`
- [x] Create `src/lib/components/MemberAvatar.svelte`

### 2.3 Expense Management UI
- [x] Create `src/lib/components/ExpenseCard.svelte`
- [x] Create `src/lib/components/ExpenseForm.svelte` (inline in group page)
- [ ] Create `src/routes/group/[id]/expense/[expenseId]/+page.svelte`
- [ ] Create `src/lib/components/DeleteConfirmModal.svelte`
- [ ] Add expense filtering (by date, category, member)
- [ ] Add expense sorting options

### 2.4 Split Interface
- [x] Member selection chips in ExpenseForm
- [x] Equal split preview in ExpenseForm
- [ ] Create `src/lib/components/SplitModeSelector.svelte`
- [ ] Add keyboard shortcuts for quick split

---

## Phase 3: Balance Calculation Engine

### 3.1 Core Algorithms
- [x] Create `src/lib/calc/balance.ts` - all calculation functions
- [x] Implement calculateTotals
- [x] Implement calculateBalances
- [x] Implement simplifyDebts (minimize transactions)
- [x] Handle rounding with remainder distribution
- [x] Write comprehensive tests for all calculations
- [x] Test edge cases (zero amounts, single member, etc.)

### 3.2 Balance UI
- [x] Create `src/lib/components/BalanceSummary.svelte`
- [x] Settlement suggestions in BalanceSummary
- [ ] Add "Mark as Settled" functionality
- [ ] Create settlement history view

---

## Phase 4: P2P Sync Layer

### 4.1 Yjs Integration
- [x] Install yjs, y-indexeddb
- [x] Create `src/lib/sync/yjs.ts` - Yjs document setup
- [x] Define Yjs shared types matching schema
- [x] y-indexeddb persistence integration
- [ ] Create bidirectional sync: Dexie ↔ Yjs (partial)
- [ ] Handle initial data load from Yjs

### 4.2 WebRTC Connection
- [x] Install y-webrtc
- [x] WebRTC provider in yjs.ts
- [x] Configure signaling server URLs
- [x] Create `src/lib/components/SyncStatus.svelte`
- [x] Handle connection lifecycle events
- [ ] Implement exponential backoff reconnection

### 4.3 Group Sharing
- [x] Create `src/lib/sync/invite.ts` - generate invite links
- [x] Room key storage in localStorage
- [x] Create `src/routes/join/[groupId]/+page.svelte`
- [x] Extract encryption key from URL fragment
- [x] Create join flow UI
- [x] Create `src/lib/components/ShareGroupModal.svelte`
- [ ] Test sharing between two browsers

### 4.4 Conflict Handling
- [ ] Test simultaneous edits scenario
- [x] CRDT-based merge (built into Yjs)
- [ ] Add sync conflict indicator (if needed)
- [ ] Document sync behavior for users

---

## Phase 5: Receipt Scanning

### 5.1 Tesseract.js Setup
- [ ] Install tesseract.js
- [ ] Copy WASM files to static folder
- [ ] Create `src/lib/ocr/tesseract.ts` - worker setup
- [ ] Configure English language pack
- [ ] Add loading progress indicator
- [ ] Test on mobile browsers

### 5.2 Camera/Image Input
- [ ] Create `src/lib/components/CameraCapture.svelte`
- [ ] Create `src/lib/components/ImageUpload.svelte`
- [ ] Create `src/lib/components/ImagePreview.svelte`
- [ ] Add image cropping (optional)
- [ ] Create `src/lib/ocr/preprocess.ts` - image enhancement

### 5.3 OCR Processing
- [ ] Create `src/lib/ocr/extract.ts` - run OCR
- [ ] Create `src/lib/ocr/parse.ts` - parse receipt text
- [ ] Extract merchant name
- [ ] Extract date
- [ ] Extract line items (name + price)
- [ ] Extract subtotal, tax, tip
- [ ] Handle different receipt formats
- [ ] Add confidence scores

### 5.4 Receipt Review UI
- [ ] Create `src/routes/group/[id]/scan/+page.svelte`
- [ ] Create `src/lib/components/ReceiptReview.svelte`
- [ ] Create `src/lib/components/LineItemEditor.svelte`
- [ ] Create `src/lib/components/ItemAssignment.svelte`
- [ ] Add "Convert to Expense" button
- [ ] Pre-fill expense form from receipt

---

## Phase 6: Advanced Splits

### 6.1 Split Modes Implementation
- [ ] Update `src/lib/calc/splits.ts` - add percentage mode
- [ ] Add shares-based calculation
- [ ] Add exact amount mode
- [ ] Add exclude members option
- [ ] Validate splits total 100% / full amount
- [ ] Write tests for each split mode

### 6.2 Item-Level Splits
- [ ] Create `src/lib/components/ItemSplitView.svelte`
- [ ] Create per-item member assignment UI
- [ ] Handle shared items (split among selected)
- [ ] Calculate tax/tip distribution proportionally
- [ ] Create `src/lib/calc/itemSplits.ts`

### 6.3 Split Templates
- [ ] Create `src/lib/db/templates.ts` - template storage
- [ ] Create `src/lib/components/SaveTemplateModal.svelte`
- [ ] Create `src/lib/components/TemplateSelector.svelte`
- [ ] Add "Apply Template" to expense form
- [ ] Template CRUD operations

---

## Phase 7: Multi-Currency

### 7.1 Currency Infrastructure
- [ ] Create `src/lib/currency/currencies.ts` - currency list
- [ ] Create `src/lib/currency/rates.ts` - rate fetching
- [ ] Create `src/lib/db/rates.ts` - rate caching
- [ ] Set up daily rate refresh
- [ ] Handle offline with cached rates
- [ ] Add rate fetch error handling

### 7.2 Currency UI
- [ ] Create `src/lib/components/CurrencyPicker.svelte`
- [ ] Create `src/lib/components/MoneyDisplay.svelte`
- [ ] Create `src/lib/components/ConversionPreview.svelte`
- [ ] Add home currency to user settings
- [ ] Add default currency to group settings

### 7.3 Multi-Currency Balances
- [ ] Update balance calculations for multi-currency
- [ ] Store exchange rate with each expense
- [ ] Display balances in home currency
- [ ] Add currency filter to expense list
- [ ] Settlement currency selection

---

## Phase 8: Smart Features

### 8.1 Category System
- [ ] Create `src/lib/data/categories.ts` - predefined list
- [ ] Add category field to expense form
- [ ] Create `src/lib/components/CategoryPicker.svelte`
- [ ] Create `src/lib/components/CategoryIcon.svelte`
- [ ] Add category filter to expense list

### 8.2 Smart Suggestions
- [ ] Create `src/lib/smart/patterns.ts` - track patterns
- [ ] Suggest category based on merchant name
- [ ] Suggest split mode based on history
- [ ] Show recent/frequent members first
- [ ] Create `src/lib/components/Suggestions.svelte`

### 8.3 Settlement Optimization
- [ ] Implement debt graph simplification
- [ ] Calculate minimum transactions needed
- [ ] Create `src/lib/components/OptimalSettlements.svelte`
- [ ] Add "Settle All" flow

---

## Phase 9: Polish & Launch

### 9.1 Offline Experience
- [ ] Create `src/lib/components/OfflineIndicator.svelte`
- [ ] Queue actions when offline
- [ ] Show pending sync count
- [ ] Handle sync errors gracefully
- [ ] Test airplane mode scenarios

### 9.2 Data Management
- [ ] Create `src/lib/export/json.ts`
- [ ] Create `src/lib/export/csv.ts`
- [ ] Create `src/routes/settings/+page.svelte`
- [ ] Add export buttons to settings
- [ ] Add import functionality
- [ ] Add "Delete All Data" with confirmation

### 9.3 Accessibility
- [ ] Audit with axe-core
- [ ] Add ARIA labels throughout
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Fix color contrast issues
- [ ] Add focus visible styles

### 9.4 Performance
- [ ] Run Lighthouse audit
- [ ] Implement code splitting
- [ ] Lazy load Tesseract.js
- [ ] Optimize images
- [ ] Add resource hints (preconnect, prefetch)
- [ ] Target < 500KB main bundle

### 9.5 Documentation
- [ ] Write README.md with setup instructions
- [ ] Create CONTRIBUTING.md
- [ ] Document architecture in docs/
- [ ] Add inline code comments
- [ ] Create user guide / FAQ

### 9.6 Launch Prep
- [ ] Set up GitHub repository
- [ ] Configure GitHub Actions CI
- [ ] Set up Cloudflare Pages deployment
- [ ] Create demo video/GIF
- [ ] Write launch announcement
- [ ] Submit to Product Hunt (optional)

---

## Current Progress

**Completed Phases:**
- Phase 1: Project Foundation ✅
- Phase 2: Core UI Components ✅ (most tasks)
- Phase 3: Balance Calculation Engine ✅
- Phase 4: P2P Sync Layer ✅ (core functionality)

**Next Up:** Phase 5 - Receipt Scanning

**Status:** MVP functional - can create groups, add members, add expenses, calculate balances, and share groups P2P

---

## Quick Reference

| Phase | Tasks | Est. Complexity |
|-------|-------|-----------------|
| 1. Foundation | 27 | Medium |
| 2. Core UI | 28 | Medium |
| 3. Balance Calc | 12 | Low |
| 4. P2P Sync | 20 | High |
| 5. Receipt Scan | 20 | High |
| 6. Advanced Splits | 14 | Medium |
| 7. Multi-Currency | 14 | Medium |
| 8. Smart Features | 12 | Medium |
| 9. Polish | 26 | Low |
| **Total** | **173** | |
