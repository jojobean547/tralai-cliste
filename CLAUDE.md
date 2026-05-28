# Tralaí Cliste — Claude Code Context

## Project Overview
Tralaí Cliste is a React Native Expo app for Irish community grocery price comparison.
Built with TypeScript, Expo Router, Supabase and Anthropic Claude API.
Organisation: Cliste CLG | Domains: tralaicliste.ie, tralai.ie, clisteclg.ie

## Tech Stack
- React Native (Expo SDK 54)
- Expo Router (file-based navigation)
- Supabase (PostgreSQL database + Auth)
- Anthropic Claude API (AI price tag scanning)
- TypeScript
- react-native-svg (for SVG components)
- react-native-safe-area-context (for SafeAreaView)
- expo-google-fonts/inter (Inter font — install if not present)

## Project Structure
```
app/
  (tabs)/
    index.tsx            ← Main scan screen
    basket.tsx           ← Shopping basket
    settings.tsx         ← Settings screen (to be created)
  login.tsx              ← Login screen
  _layout.tsx            ← Root layout (AuthProvider + BasketProvider)
components/
  ui/                    ← Reusable primitive components ONLY
    Button.tsx           ← All button variants
    Card.tsx             ← Card container variants
    StoreBadge.tsx       ← Coloured store name pill
    EmptyState.tsx       ← Empty screen state
    SectionTitle.tsx     ← Section headings
  PriceList.tsx          ← Price comparison list
  ProductCard.tsx        ← Product display + submission
  StoreSelector.tsx      ← Store selection buttons
  OfflineBanner.tsx      ← Offline warning banner
  TralaiTrolleyIcon.tsx  ← SVG logo component (to be created)
hooks/
  useAuth.tsx            ← Google Sign-In + Supabase auth
  useBasket.tsx          ← Basket state management
  useNetwork.tsx         ← Online/offline detection
  useProductCache.tsx    ← SQLite local caching
  usePrices.tsx          ← Price fetching + voting logic
  useTheme.ts            ← Dark/light mode colours
services/
  supabase.ts            ← Supabase client
  productService.ts      ← Open Food Facts API
  priceService.ts        ← Supabase price operations
  aiService.ts           ← Claude API price scanning
constants/
  theme.ts               ← Full design system
  stores.ts              ← STORES array
types/
  index.ts               ← Shared TypeScript types
```

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

## Store Badge Colours (hardcoded per store — these are brand colours)
- Tesco:         #003DA5
- Dunnes Stores: #E31837
- SuperValu:     #E2231A
- Lidl:          #0050AA
- Aldi:          #00005B
- Default:       colors.primaryGreen

## UI Refactoring Rules (CRITICAL)
This project is undergoing a UI refactoring to use reusable components.
Follow these rules strictly:

1. ALWAYS use components/ui/ primitives — never recreate buttons, cards or badges inline
2. ALWAYS use Card from components/ui/Card.tsx for any card-shaped container
3. ALWAYS use Button from components/ui/Button.tsx for any pressable action
4. ALWAYS use StoreBadge from components/ui/StoreBadge.tsx for store names
5. ALWAYS use EmptyState from components/ui/EmptyState.tsx for empty screens
6. ALWAYS use SectionTitle from components/ui/SectionTitle.tsx for section headings
7. NEVER duplicate a component — check components/ui/ before creating anything
8. NEVER use raw TouchableOpacity for buttons — use Button component instead
9. NEVER use raw View for cards — use Card component instead
10. NEVER hardcode store name colours — use StoreBadge component

## Button Variants
- primary:   bg=primaryGreen, white text — main actions (Submit, Sign In, Scan)
- secondary: bg=surface, border, textPrimary — secondary actions (Guest, Cancel)
- danger:    bg=errorBg, error text — destructive actions (Clear Basket, Sign Out)
- purple:    bg=accentPurple, white text — AI actions (Scan Price Tag)
- ghost:     transparent, textSecondary — subtle actions (voting buttons)

## Card Variants
- default:   standard surface card with border
- highlight: green border (use for cheapest price)
- danger:    red tint (use for destructive confirmations)

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
2. List any of the following found:
   - .tsx/.ts files in the root directory
   - Duplicate screen or component files
   - Test, demo or placeholder files
   - Files from failed integration attempts
   - theme/ folder (duplicate of constants/theme.ts)
   - hooks/ThemeProvider.tsx (duplicate of useTheme)
   - components/ui/BottomNav.tsx (Expo Router handles navigation)
   - components/ui/PriceRow.tsx (duplicate of PriceList.tsx)
   - .code-workspace files
   - Any file not in the structure defined above
3. Show complete list and WAIT for explicit user confirmation
4. Only delete after user says yes

## Code Standards
- AGPL-3.0 licence header in EVERY new file (2026 copyright)
- process.env.EXPO_PUBLIC_* for ALL API keys — never hardcode
- TypeScript strict typing — no `any` unless absolutely necessary
- useCallback on handler functions passed to child components
- StyleSheet.create() always — no inline style objects in JSX
- SafeAreaView ONLY from react-native-safe-area-context

## Authentication Model
- useAuth() → { user, isGuest, isLoading, signInWithGoogle, continueAsGuest, signOut }
- Guest: view prices, use basket — CANNOT submit prices
- Signed in: full access including price submission
- Signed-in only features: price submission, recent scans, shopping lists (Phase 2)

## Navigation Structure
```
app/
  login.tsx                ← shown when not authenticated
  (tabs)/
    index.tsx   (Scan)     ← tab 1
    basket.tsx  (Basket)   ← tab 2
    settings.tsx (Settings) ← tab 3 with ⚙️ icon
```

## Features Already Built (do not rebuild)
- Barcode scanning, product lookup, offline caching
- Community price submission with validation
- AI price tag scanning — model: claude-sonnet-4-6
- Deal detection (3 for €5, Buy 2 get 1 free, 3 for 2)
- Shopping basket with correct deal totals
- Community voting (👍 confirm / 🚩 flag)
- Deduplication, 30-day freshness filter
- Guest mode + Google Sign-In setup
- Dark/light mode via useTheme()

## Absolute Rules (never break)
- NEVER SafeAreaView from react-native (use react-native-safe-area-context)
- NEVER hardcode colours, spacing or font sizes
- NEVER create a component if one exists in components/ui/
- NEVER add a file without checking for duplicates first
- NEVER commit .env or API keys
- ALWAYS AGPL-3.0 header on new files
- ALWAYS Inter font family
- ALWAYS clean stray files before starting work
- ALWAYS test app compiles after each change
- ALWAYS stop and wait for confirmation after each phase

## Environment Variables (.env — never commit)
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=