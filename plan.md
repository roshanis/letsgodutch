# DutchSplit - Implementation Plan

## Overview

Build a privacy-first, P2P expense sharing web app with receipt scanning, smart splits, and multi-currency support.

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- Initialize SvelteKit project with TypeScript
- Configure Tailwind CSS + Skeleton UI
- Set up PWA with Workbox
- Configure ESLint + Prettier
- Initialize Git repository

### 1.2 Local Database Layer
- Set up Dexie.js with IndexedDB
- Define database schema (groups, members, expenses, splits)
- Create CRUD operations for all entities
- Add database migration support

### 1.3 Core Data Types
- Define TypeScript interfaces for all entities
- Create validation utilities
- Build ID generation (UUID v4)
- Implement timestamp utilities

---

## Phase 2: Core UI Components

### 2.1 Layout & Navigation
- App shell with header/nav
- Bottom navigation (mobile)
- Theme configuration (light/dark ready)
- Loading states and skeletons

### 2.2 Group Management UI
- Groups list page (home)
- Create group form
- Group detail view
- Add member form
- Member list component

### 2.3 Expense Management UI
- Expense list component
- Add expense form (manual entry)
- Expense detail view
- Edit expense form
- Delete expense confirmation

### 2.4 Split Interface
- Split mode selector component
- Equal split calculator
- Member selection chips
- Split preview/summary

---

## Phase 3: Balance Calculation Engine

### 3.1 Core Algorithms
- Calculate total per member
- Calculate balances (who owes whom)
- Simplify debts (minimize transactions)
- Handle rounding edge cases

### 3.2 Balance UI
- Balance summary card
- Detailed balance breakdown
- "You owe" / "You are owed" views
- Settlement suggestions list

---

## Phase 4: P2P Sync Layer

### 4.1 Yjs Integration
- Set up Yjs document structure
- Integrate y-indexeddb for persistence
- Map Dexie schema to Yjs types
- Handle Yjs ↔ local DB sync

### 4.2 WebRTC Connection
- Set up y-webrtc provider
- Configure signaling server connection
- Handle connection states (connecting, connected, disconnected)
- Implement reconnection logic

### 4.3 Group Sharing
- Generate invite links with encryption key
- Parse invite links on join
- Key exchange via URL fragment
- Sync group data on join

### 4.4 Conflict Handling
- Test CRDT merge scenarios
- Handle simultaneous edits
- Ensure eventual consistency
- Add sync status indicator

---

## Phase 5: Receipt Scanning

### 5.1 Tesseract.js Setup
- Install and configure Tesseract.js
- Set up WASM worker files
- Configure language packs (English primary)
- Optimize for mobile browsers

### 5.2 Camera/Image Input
- Camera capture component
- File upload fallback
- Image preview and crop
- Image preprocessing (contrast, rotation)

### 5.3 OCR Processing
- Extract text from image
- Parse receipt structure
- Identify line items, totals, tax, tip
- Handle various receipt formats

### 5.4 Receipt Review UI
- Display extracted data
- Edit/correct extracted items
- Assign items to members
- Convert to expense with splits

---

## Phase 6: Advanced Splits

### 6.1 Split Modes Implementation
- Percentage split calculator
- Shares-based split calculator
- Exact amount split
- Exclude members option

### 6.2 Item-Level Splits
- Item assignment interface
- Per-item member selection
- Shared items handling
- Tax/tip distribution logic

### 6.3 Split Templates
- Save split as template
- Apply template to expense
- Template management UI

---

## Phase 7: Multi-Currency

### 7.1 Currency Infrastructure
- Currency list and metadata
- Exchange rate fetching (Frankfurter API)
- Rate caching in IndexedDB
- Offline rate fallback

### 7.2 Currency UI
- Currency picker component
- Amount with currency display
- Conversion preview
- Home currency setting

### 7.3 Multi-Currency Balances
- Store original + converted amounts
- Display in user's home currency
- Settlement currency options

---

## Phase 8: Smart Features

### 8.1 Category System
- Predefined categories
- Auto-categorization by merchant
- Category icons and colors
- Category-based insights

### 8.2 Smart Suggestions
- Track expense patterns
- Suggest split based on history
- Merchant → category learning
- Recent/frequent members

### 8.3 Settlement Optimization
- Debt simplification algorithm
- Minimize number of transactions
- Suggest optimal settlements

---

## Phase 9: Polish & Launch

### 9.1 Offline Experience
- Offline indicator
- Queue offline actions
- Sync status feedback
- Error recovery

### 9.2 Data Management
- Export to JSON
- Export to CSV
- Import data
- Delete all data

### 9.3 Accessibility
- Keyboard navigation
- Screen reader testing
- Focus management
- Color contrast audit

### 9.4 Performance
- Bundle optimization
- Lazy loading
- Image optimization
- Lighthouse audit

### 9.5 Documentation
- README with setup instructions
- Contributing guidelines
- API documentation
- User guide

---

## Architecture Decisions

### Why SvelteKit?
- Small bundle size (critical for PWA)
- Built-in SSR for SEO
- Simple state management
- Great TypeScript support

### Why Yjs over alternatives?
- Battle-tested CRDT implementation
- Active maintenance
- Good IndexedDB integration
- WebRTC provider available

### Why Tesseract.js?
- Runs entirely in browser
- No server needed
- Free and open source
- Reasonable accuracy

### Why Dexie.js?
- Clean IndexedDB wrapper
- TypeScript support
- Migration support
- Works well alongside Yjs

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| WebRTC connection issues | Fallback instructions, retry logic |
| OCR accuracy problems | Manual correction UI, preprocessing |
| Large group sync performance | Test with 10+ members, optimize |
| IndexedDB storage limits | Monitor usage, warn at 80% |
| Browser compatibility | Test matrix, graceful degradation |

---

## Success Metrics

- [ ] Works fully offline
- [ ] Syncs between 2+ browsers
- [ ] Receipt scanning > 80% accuracy
- [ ] Balance calculations always correct
- [ ] Lighthouse PWA score > 90
- [ ] First paint < 1.5s
