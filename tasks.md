# DutchSplit - Task List

> Track progress by marking tasks with [x] when complete.

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- [ ] Create SvelteKit project with `npm create svelte@latest`
- [ ] Add TypeScript configuration
- [ ] Install and configure Tailwind CSS
- [ ] Install Skeleton UI component library
- [ ] Configure PWA manifest and service worker
- [ ] Set up Workbox for offline caching
- [ ] Configure ESLint with Svelte plugin
- [ ] Configure Prettier
- [ ] Initialize Git repository
- [ ] Create initial commit

### 1.2 Local Database Layer
- [ ] Install Dexie.js
- [ ] Create `src/lib/db/index.ts` - database initialization
- [ ] Create `src/lib/db/schema.ts` - table definitions
- [ ] Create `src/lib/db/groups.ts` - group CRUD operations
- [ ] Create `src/lib/db/members.ts` - member CRUD operations
- [ ] Create `src/lib/db/expenses.ts` - expense CRUD operations
- [ ] Create `src/lib/db/splits.ts` - split CRUD operations
- [ ] Add database version migration support
- [ ] Write unit tests for database operations

### 1.3 Core Data Types
- [ ] Create `src/lib/types/group.ts`
- [ ] Create `src/lib/types/member.ts`
- [ ] Create `src/lib/types/expense.ts`
- [ ] Create `src/lib/types/split.ts`
- [ ] Create `src/lib/types/receipt.ts`
- [ ] Create `src/lib/utils/uuid.ts` - ID generation
- [ ] Create `src/lib/utils/date.ts` - timestamp utilities
- [ ] Create `src/lib/utils/validation.ts` - input validation

---

## Phase 2: Core UI Components

### 2.1 Layout & Navigation
- [ ] Create `src/routes/+layout.svelte` - app shell
- [ ] Create `src/lib/components/Header.svelte`
- [ ] Create `src/lib/components/BottomNav.svelte`
- [ ] Create `src/lib/components/Loading.svelte`
- [ ] Create `src/lib/components/Skeleton.svelte`
- [ ] Configure theme tokens in Tailwind config
- [ ] Add responsive breakpoints

### 2.2 Group Management UI
- [ ] Create `src/routes/+page.svelte` - groups list (home)
- [ ] Create `src/lib/components/GroupCard.svelte`
- [ ] Create `src/lib/components/CreateGroupModal.svelte`
- [ ] Create `src/routes/group/[id]/+page.svelte` - group detail
- [ ] Create `src/lib/components/AddMemberModal.svelte`
- [ ] Create `src/lib/components/MemberList.svelte`
- [ ] Create `src/lib/components/MemberAvatar.svelte`

### 2.3 Expense Management UI
- [ ] Create `src/lib/components/ExpenseList.svelte`
- [ ] Create `src/lib/components/ExpenseCard.svelte`
- [ ] Create `src/routes/group/[id]/expense/new/+page.svelte`
- [ ] Create `src/lib/components/ExpenseForm.svelte`
- [ ] Create `src/routes/group/[id]/expense/[expenseId]/+page.svelte`
- [ ] Create `src/lib/components/DeleteConfirmModal.svelte`
- [ ] Add expense filtering (by date, category, member)
- [ ] Add expense sorting options

### 2.4 Split Interface
- [ ] Create `src/lib/components/SplitModeSelector.svelte`
- [ ] Create `src/lib/components/MemberChips.svelte`
- [ ] Create `src/lib/components/EqualSplitPreview.svelte`
- [ ] Create `src/lib/components/SplitSummary.svelte`
- [ ] Add keyboard shortcuts for quick split

---

## Phase 3: Balance Calculation Engine

### 3.1 Core Algorithms
- [ ] Create `src/lib/calc/totals.ts` - sum expenses per member
- [ ] Create `src/lib/calc/balances.ts` - calculate who owes whom
- [ ] Create `src/lib/calc/simplify.ts` - minimize transactions
- [ ] Create `src/lib/calc/round.ts` - handle rounding
- [ ] Write comprehensive tests for all calculations
- [ ] Test edge cases (zero amounts, single member, etc.)

### 3.2 Balance UI
- [ ] Create `src/lib/components/BalanceSummary.svelte`
- [ ] Create `src/lib/components/BalanceCard.svelte`
- [ ] Create `src/lib/components/DebtList.svelte`
- [ ] Create `src/lib/components/SettlementSuggestions.svelte`
- [ ] Add "Mark as Settled" functionality
- [ ] Create settlement history view

---

## Phase 4: P2P Sync Layer

### 4.1 Yjs Integration
- [ ] Install yjs, y-indexeddb
- [ ] Create `src/lib/sync/yjs.ts` - Yjs document setup
- [ ] Define Yjs shared types matching schema
- [ ] Create `src/lib/sync/persistence.ts` - y-indexeddb setup
- [ ] Create bidirectional sync: Dexie ↔ Yjs
- [ ] Handle initial data load from Yjs

### 4.2 WebRTC Connection
- [ ] Install y-webrtc
- [ ] Create `src/lib/sync/webrtc.ts` - WebRTC provider
- [ ] Configure signaling server URL
- [ ] Create `src/lib/components/SyncStatus.svelte`
- [ ] Handle connection lifecycle events
- [ ] Implement exponential backoff reconnection

### 4.3 Group Sharing
- [ ] Create `src/lib/sync/invite.ts` - generate invite links
- [ ] Create `src/lib/sync/crypto.ts` - encryption key handling
- [ ] Create `src/routes/join/[groupId]/+page.svelte`
- [ ] Extract encryption key from URL fragment
- [ ] Create join flow UI
- [ ] Test sharing between two browsers

### 4.4 Conflict Handling
- [ ] Test simultaneous edits scenario
- [ ] Verify CRDT merge correctness
- [ ] Add last-updated timestamps
- [ ] Create sync conflict indicator (if needed)
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

**Phase:** 1 - Project Foundation
**Current Task:** 1.1 Project Setup
**Status:** Not Started

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
