# DutchSplit - Requirements Document

> A privacy-first, peer-to-peer expense sharing app. Better than Splitwise.

## Project Philosophy

| Principle | Description |
|-----------|-------------|
| **Privacy First** | All data processing happens on-device. No cloud APIs for sensitive data. |
| **Always Free** | No paid tiers, no premium features. Open source forever. |
| **Offline First** | Works without internet. Syncs when peers connect. |
| **User Owns Data** | No central server stores user data. P2P sync only. |

---

## Core Features

### 1. Receipt Scanning (On-Device OCR)

**Description:** Users photograph receipts; OCR extracts data locally.

**Extracted Data:**
- Merchant name
- Date
- Line items (name + price)
- Subtotal, tax, tip
- Currency (auto-detect)

**Technical Approach:**
- Library: Tesseract.js (browser-based, WASM)
- Processing: 100% on-device
- Storage: Receipt images are NOT stored after extraction (privacy)

**User Flow:**
1. User taps "Scan Receipt"
2. Camera opens / file picker
3. OCR processes image locally
4. Extracted data shown for confirmation/editing
5. User assigns items to group members
6. Expense created with line-item splits

---

### 2. Smart Splits

**Split Modes:**

| Mode | Description | Use Case |
|------|-------------|----------|
| Equal | Divide equally among selected members | Pizza night |
| By Item | Each person selects their items | Restaurant bill |
| Percentage | Custom % per person (must total 100%) | Rent by room size |
| Shares | Ratio-based (e.g., 2:1:1) | Flexible splitting |
| Exact | Specific amounts per person | Pre-calculated splits |
| Exclude | Split among all except selected members | "I didn't eat" |

**Smart Suggestions (Local ML/Rules):**
- Pattern recognition: "Last 3 expenses at this merchant used equal split"
- Category defaults: User-defined rules (e.g., "Groceries = always equal")
- Template detection: "Monthly expense from 'Landlord' = apply rent template"
- Member profiles: "Alex is vegetarian" → auto-exclude meat items

**Technical Approach:**
- Rule-based engine for patterns
- TensorFlow.js (optional) for local ML suggestions
- All learning data stays on-device

---

### 3. Multi-Currency Support

**Features:**
- Set home currency per user
- Set default currency per group
- Auto-convert when displaying balances
- Store original currency + exchange rate at expense time

**Exchange Rate Source:**
- Primary: Frankfurter API (free, open source, ECB data)
- Fallback: exchangerate.host (free, no API key)
- Update frequency: Daily
- Offline: Cache last-known rates locally

**Settlement Options:**
- Settle in original currency
- Settle in user's home currency
- Manual rate override (for cash exchanges)

**Edge Cases:**
- Rate fluctuation between expense and settlement: Lock rate at expense time
- Different members with different home currencies: Show converted amounts

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | SvelteKit | Fast, small bundle, SSR + SPA |
| UI | Tailwind CSS + Skeleton UI | Accessible, themeable |
| Local Database | IndexedDB via Dexie.js | Large storage, fast queries |
| P2P Sync | Yjs + y-webrtc + y-indexeddb | CRDT-based, conflict-free |
| OCR | Tesseract.js | On-device, privacy-preserving |
| PWA | Workbox | Offline support, installable |
| Hosting | Cloudflare Pages | Free, global CDN |
| Signaling | y-webrtc-signaling (self-hosted) | Peer discovery only |

### P2P Sync Architecture

```
┌─────────────┐                    ┌─────────────┐
│   User A    │                    │   User B    │
│  (browser)  │                    │  (browser)  │
├─────────────┤                    ├─────────────┤
│ IndexedDB   │◄──── WebRTC ──────►│ IndexedDB   │
│ + Yjs Doc   │   (encrypted)      │ + Yjs Doc   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
              ┌───────────────┐
              │   Signaling   │  ← Only for peer discovery
              │    Server     │  ← No user data passes through
              └───────────────┘
```

**Sync Behavior:**
- Changes saved to IndexedDB immediately (offline-first)
- When peers connect via WebRTC, Yjs syncs automatically
- CRDTs ensure conflict-free merging
- No central server stores expense data

### Group Joining Flow

```
1. Creator generates group:
   → Random group ID + encryption key
   → Key never sent to any server

2. Invite link format:
   dutchsplit.app/join/{groupId}#key={encryptionKey}
   (Fragment after # is not sent to server)

3. Invitee opens link:
   → Extracts key from URL fragment
   → Connects to creator via WebRTC (if online)
   → Receives encrypted group data
   → Decrypts locally with key

4. Ongoing sync:
   → All members can sync P2P
   → Works with any subset of members online
```

---

## Data Model

```typescript
interface Group {
  id: string;                    // UUID
  name: string;
  defaultCurrency: string;       // ISO 4217 (e.g., "USD")
  members: Map<string, Member>;
  expenses: Map<string, Expense>;
  createdAt: number;             // Unix timestamp
  updatedAt: number;
}

interface Member {
  id: string;                    // UUID
  name: string;
  homeCurrency: string;
}

interface Expense {
  id: string;                    // UUID
  groupId: string;
  paidBy: string;                // Member ID
  amount: number;                // In original currency
  currency: string;
  exchangeRate: number;          // To group's default currency
  description: string;
  category?: string;
  date: number;                  // Unix timestamp
  splits: Map<string, Split>;    // Member ID → Split
  receipt?: ReceiptData;
  createdAt: number;
  updatedAt: number;
}

interface Split {
  memberId: string;
  type: 'equal' | 'percentage' | 'shares' | 'exact';
  value: number;                 // Interpreted based on type
  resolvedAmount: number;        // Calculated absolute amount
}

interface ReceiptData {
  merchant?: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  tip?: number;
  extractedAt: number;
}

interface ReceiptItem {
  name: string;
  price: number;
  assignedTo: string[];          // Member IDs
}
```

---

## User Interface

### Key Screens

1. **Home / Groups List**
   - List of all groups
   - Total balance across groups
   - Quick "Add Expense" button

2. **Group View**
   - Group name + members
   - Expense list (sortable, filterable)
   - Balance summary (who owes whom)
   - "Settle Up" suggestions

3. **Add Expense**
   - Manual entry OR scan receipt
   - Split mode selector
   - Member assignment
   - Currency picker

4. **Receipt Scanner**
   - Camera view / file upload
   - Processing indicator
   - Extracted data review
   - Item-to-member assignment

5. **Settle Up**
   - Simplified debt graph
   - Settlement suggestions
   - Mark as settled

6. **Settings**
   - Home currency
   - Default split mode
   - Export data (JSON/CSV)
   - Delete all data

---

## MVP Phases

### Phase 1: Core Functionality
- [ ] Project setup (SvelteKit + Tailwind + PWA)
- [ ] Local storage with Dexie.js
- [ ] Create group
- [ ] Add members
- [ ] Add expense (manual entry)
- [ ] Equal split only
- [ ] Balance calculation
- [ ] Basic P2P sync (Yjs + y-webrtc)
- [ ] Join group via link

### Phase 2: Smart Features
- [ ] Receipt scanning with Tesseract.js
- [ ] Item-level splits from receipt
- [ ] All split modes (percentage, shares, exact)
- [ ] Multi-currency support
- [ ] Exchange rate fetching + caching

### Phase 3: Intelligence
- [ ] Category auto-detection
- [ ] Split suggestions based on history
- [ ] Recurring expense detection
- [ ] Settlement optimization (minimize transactions)

### Phase 4: Polish
- [ ] Dark mode
- [ ] Data export (JSON, CSV)
- [ ] Expense search and filters
- [ ] Spending insights / charts
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Non-Functional Requirements

### Privacy
- No analytics or tracking
- No third-party scripts
- All OCR on-device
- No server-side data storage
- Encryption keys never leave client

### Performance
- First paint: < 1.5s
- Time to interactive: < 3s
- Lighthouse score: > 90
- Bundle size: < 500KB (excluding Tesseract WASM)

### Offline Support
- Full functionality without internet
- Sync when connection available
- Clear offline/online status indicator

### Browser Support
- Chrome/Edge 90+
- Firefox 90+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Android)

### Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast WCAG AA
- Focus indicators

---

## Open Source

**License:** AGPL-3.0
- Ensures forks remain open source
- Prevents proprietary SaaS copies
- Allows personal and commercial use

**Repository Structure:**
```
dutchsplit/
├── src/
├── static/
├── tests/
├── docs/
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── requirements.md
```

**Contributing Guidelines:**
- Issues for bugs and feature requests
- PRs require tests
- Code review required
- Conventional commits

---

## Future Considerations (Post-MVP)

- Native mobile apps (Capacitor or React Native)
- WebRTC mesh for larger groups
- Relay server option for offline members
- Payment integration (open banking APIs)
- Shared shopping lists
- Budget tracking per category

---

## Glossary

| Term | Definition |
|------|------------|
| CRDT | Conflict-free Replicated Data Type - data structure that can be replicated and merged without conflicts |
| P2P | Peer-to-peer - direct communication between users without central server |
| PWA | Progressive Web App - web app that can be installed and works offline |
| Signaling | Process of discovering and connecting to peers (no user data transmitted) |
| Settlement | Process of paying back debts to reach zero balance |
