# Tralaí Cliste — Claude Code Context

## Project Overview
Tralaí Cliste is a React Native Expo app for Irish community grocery price comparison.
Built with TypeScript, Expo Router, and Supabase.
Organisation: Cliste CLG | Domains: tralaicliste.ie, tralai.ie, clisteclg.ie

## Tech Stack
- React Native (Expo SDK 54)
- Expo Router (file-based navigation)
- Supabase (PostgreSQL database + Auth + Edge Functions)
- TypeScript
- react-native-svg (for SVG components)
- react-native-safe-area-context (for SafeAreaView)
- expo-google-fonts/inter (Inter font — install if not present)

## Project Structure
app/
  (tabs)/
	index.tsx            ← Main scan screen
	basket.tsx           ← Shopping basket
	settings.tsx         ← Settings screen
  login.tsx              ← Login screen
  _layout.tsx            ← Root layout (AuthProvider + BasketProvider)
components/
  ui/                    ← Reusable primitive components ONLY
	Button.tsx
	Card.tsx
	StoreBadge.tsx
	EmptyState.tsx
	SectionTitle.tsx
	AppAlert.tsx
  PriceList.tsx
  ProductCard.tsx
  ProductSummary.tsx
  StoreSelector.tsx
  OfflineBanner.tsx
  TralaiTrolleyIcon.tsx
hooks/
  useProductLookup.ts    ← barcode → product fetch, cache, Open Food Facts
  usePriceSubmission.ts  ← price form, validation, submit, offline queue
  usePriceActions.ts     ← confirm and flag votes
  useDealCalculator.ts   ← pure deal functions, no React dependencies
  usePrices.ts           ← orchestrator, re-exports above
  useBasket.tsx          ← orchestrator, imports useDealCalculator
  useAuth.tsx            ← Google Sign-In + Supabase auth
  useNetwork.tsx         ← Online/offline detection
  useProductCache.tsx    ← SQLite local caching
  useTheme.ts            ← Dark/light mode colours
  useUserPreferences.tsx ← Club card toggles and display settings

services/
  supabase.ts            ← Supabase client
  productService.ts      ← Open Food Facts API + Supabase product lookup
  priceService.ts        ← Supabase price operations
constants/
  theme.ts               ← Full design system
  stores.ts              ← STORES array

types/
  index.ts               ← Shared TypeScript types including DealInput

## Architecture Rules (CRITICAL)
- Hooks call services; services have no React dependencies
- Screen files contain only hook calls and a return statement — no inline business logic
- `useDealCalculator.ts` contains pure functions only — no state, no hooks, no side effects
- `usePrices.ts` and `useBasket.tsx` are orchestrators only — they wire focused hooks together
- Do NOT reintroduce AI scan without a server-side Edge Function handling the API key
- `handleAddToBasket` lives in `usePriceSubmission` for now — known mixed concern, do not move until DealInput is built

## Key Types (always import from types/index.ts)
- `DealInput` — shared type for all deal data across manual submission and future AI scan:
  `deal_type`, `deal_price`, `deal_qty`, `deal_for_qty`, `deal_group_id`, `is_mixed`
- `BasketItem`, `MixedDealGroup`, `DealPriceInfo` — live in `hooks/useDealCalculator.ts`,
  re-exported from `useBasket.tsx` for backwards compatibility
- Never redefine these types locally — always import from source

## Design System — ALWAYS USE THESE, NEVER HARDCODE
- `useTheme()` from @/hooks/useTheme → returns { colors, isDark }
- `Typography` from @/constants/theme → font sizes and weights
- `Spacing` from @/constants/theme → padding and margin values
- `Radii` from @/constants/theme → border radius values
- `TouchTargets` from @/constants/theme → min button height (56dp)
- Font family: Inter (expo-google-fonts)

## Colour Tokens (always via useTheme, never hardcoded)
Light: background=#F8F9FA, surface=#FFFFFF, primaryGreen=#0B5D3B,
       greenLight=#DCEFDE, accentPurple=#5C3DBA, error=#D64545,
       textPrimary=#1A1C1E, textSecondary=#6B7280, border=#E5E7EB,
       errorBg=#FFF0F0, errorBorder=#F5C6C6, accentGold=#F2B705

Dark:  background=#0F1113, surface=#161A1D, primaryGreen=#0B5D3B,
       greenLight=#1F7A4D, accentPurple=#5C3DBA, error=#D64545,
       textPrimary=#F8F9FA, textSecondary=#A1A7AC, border=#2A2D31,
       errorBg=#2A1515, errorBorder=#3D1F1F, accentGold=#F2B705

## Store Badge Colours (hardcoded per store — brand colours)
- Tesco:         #003DA5
- Dunnes Stores: #E31837
- SuperValu:     #E2231A
- Lidl:          #0050AA
- Aldi:          #00005B
- Default:       colors.primaryGreen

## UI Rules (CRITICAL)
1. ALWAYS use components/ui/ primitives — never recreate buttons, cards or badges inline
2. ALWAYS use Card for any card-shaped container
3. ALWAYS use Button for any pressable action
4. ALWAYS use StoreBadge for store names
5. ALWAYS use EmptyState for empty screens
6. ALWAYS use SectionTitle for section headings
7. NEVER duplicate a component — check components/ui/ before creating anything
8. NEVER use raw TouchableOpacity for buttons
9. NEVER use raw View for cards
10. NEVER hardcode store name colours

## Button Variants
- primary:   bg=primaryGreen, white text — main actions
- secondary: bg=surface, border, textPrimary — secondary actions
- danger:    bg=errorBg, error text — destructive actions
- ghost:     transparent, textSecondary — subtle actions (voting buttons)

## Card Variants
- default:   standard surface card with border
- highlight: green border (cheapest price)
- danger:    red tint (destructive confirmations)

## PriceList Design (Figma spec)
Each store price entry must be its own Card, NOT a row in a shared card:
- Cheapest entry: Card variant=highlight (green border)
- Other entries: Card variant=default
- Layout: StoreBadge top-left, price top-right, Add button right
- Show "↘ Best Price" below price for cheapest only
- Show "↘ Save €X.XX" if savings calculable
- 👍 🚩 as ghost Button components bottom of card
- No crown emoji — green border signals cheapest
- getDaysAgo as private helper in PriceList.tsx only

## File Hygiene Rules (CRITICAL — do this before ANY other work)
Before making ANY changes:
1. Scan entire project for files that don't belong
2. List any found and WAIT for explicit user confirmation
3. Only delete after user says yes
Files that do not belong:
- .tsx/.ts files in the root directory
- Duplicate screen or component files
- Test, demo or placeholder files
- theme/ folder (duplicate of constants/theme.ts)
- hooks/ThemeProvider.tsx (duplicate of useTheme)
- components/ui/BottomNav.tsx (Expo Router handles navigation)
- components/ui/PriceRow.tsx (duplicate of PriceList.tsx)
- services/aiService.ts (removed — do not recreate without Edge Function)
- .code-workspace files
- Any file not in the structure defined above

## Code Standards
- AGPL-3.0 licence header in EVERY new file (2026 copyright)
- EXPO_PUBLIC_* prefix for ALL environment variables
- TypeScript strict typing — no `any` unless absolutely necessary
- useCallback on handler functions passed to child components
- StyleSheet.create() outside the component function, at the bottom of the file
- SafeAreaView ONLY from react-native-safe-area-context

## Authentication Model
- useAuth() → { user, isGuest, isLoading, signInWithGoogle, continueAsGuest, signOut }
- Guest: view prices, use basket — CANNOT submit prices
- Signed in: full access including price submission

## Navigation Structure
app/
  login.tsx
  (tabs)/
	index.tsx   (Scan)
	basket.tsx  (Basket)
	settings.tsx (Settings)

## Features Built (do not rebuild)
- Barcode scanning, product lookup, offline caching
- Community price submission with validation and offline queue
- Deal detection (3 for €5, Buy 2 get 1 free, 3 for 2)
- Mixed deal basket calculator across different products
- Community voting (👍 confirm / 🚩 flag) with auto-hide on threshold
- Deduplication, 30-day freshness filter
- Guest mode + Google Sign-In
- Dark/light mode via useTheme()
- Club card support (Tesco Clubcard, Real Rewards, Lidl Plus, VALUEclub)
- Display density modes (Standard/Compact) in AsyncStorage

## Not Yet Built (do not stub or partially implement)
- AI price tag scanning — removed pending Edge Function implementation
- DealTypeSelector — manual deal input for price submissions
- Product submission flow for unknown barcodes

## Development Gotchas
- Wiping the Supabase `prices` table does NOT clear AsyncStorage cache.
  Prices will still appear from cache until cleared. Run AsyncStorage.clear()
  manually during testing after wiping the database.
- The scan screen still has a `handleScanPriceTag` no-op stub in `usePrices.ts`
  and an AI scan button in the UI — both are intentional placeholders until
  the Edge Function is ready. Do not remove the stub; do not wire it up.

## Absolute Rules (never break)
- NEVER SafeAreaView from react-native (use react-native-safe-area-context)
- NEVER hardcode colours, spacing or font sizes
- NEVER create a component if one exists in components/ui/
- NEVER add a file without checking for duplicates first
- NEVER commit .env or API keys
- NEVER recreate aiService.ts or any direct Claude API call in the app bundle
- ALWAYS AGPL-3.0 header on new files
- ALWAYS Inter font family
- ALWAYS clean stray files before starting work
- ALWAYS test app compiles after each change
- ALWAYS stop and wait for confirmation after each phase

## Environment Variables (.env — never commit)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=