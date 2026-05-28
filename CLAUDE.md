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
- expo-google-fonts/inter (Inter font)

## Project Structure
```
app/
  (tabs)/
    index.tsx          ← Main scan screen
    basket.tsx         ← Shopping basket
    settings.tsx       ← Settings screen
  login.tsx            ← Login screen
  _layout.tsx          ← Root layout (AuthProvider + BasketProvider)
components/
  ui/                  ← Reusable primitive components ONLY
    Button.tsx         ← All button variants
    Card.tsx           ← Card container variants
    StoreBadge.tsx     ← Coloured store name pill
    EmptyState.tsx     ← Empty screen state
    SectionTitle.tsx   ← Section headings
  PriceList.tsx        ← Price comparison list
  ProductCard.tsx      ← Product display + submission
  StoreSelector.tsx    ← Store selection buttons
  OfflineBanner.tsx    ← Offline warning banner
  TralaiTrolleyIcon.tsx ← SVG logo component
hooks/
  useAuth.tsx          ← Google Sign-In + Supabase auth
  useBasket.tsx        ← Basket state management
  useNetwork.tsx       ← Online/offline detection
  useProductCache.tsx  ← SQLite local caching
  usePrices.tsx        ← Price fetching + voting logic
  useTheme.ts          ← Dark/light mode colours
services/
  supabase.ts          ← Supabase client
  productService.ts    ← Open Food Facts API
  priceService.ts      ← Supabase price operations
  aiService.ts         ← Claude API price scanning
constants/
  theme.ts             ← Full design system (Colors, Typography, Spacing, Radii)
  stores.ts            ← STORES array
types/
  index.ts             ← Shared TypeScript types
```

## Design System
Always use these — never hardcode values:
- `useTheme()` from @/hooks/useTheme for all colours
- `Typography` from @/constants/theme for font sizes/weights
- `Spacing` from @/constants/theme for padding/margin
- `Radii` from @/constants/theme for border radius
- `TouchTargets` from @/constants/theme for minimum button heights (56dp)
- Font family: Inter (expo-google-fonts)

## Colour Palette (from theme.ts)
Light: background=#F8F9FA, surface=#FFFFFF, primaryGreen=#0B5D3B,
       greenLight=#DCEFDE, accentPurple=#5C3DBA, error=#D64545,
       textPrimary=#1A1C1E, textSecondary=#6B7280, border=#E5E7EB

Dark:  background=#0F1113, surface=#161A1D, primaryGreen=#0B5D3B,
       greenLight=#1F7A4D, accentPurple=#5C3DBA, error=#D64545,
       textPrimary=#F8F9FA, textSecondary=#A1A7AC, border=#2A2D31

## Reusable UI Components (always use these)
Never create inline styles for buttons, cards or badges.
Always use components from components/ui/:
- Button — variants: primary, secondary, danger, purple, ghost
- Card — variants: default, highlight, danger
- StoreBadge — coloured pill per store name
- EmptyState — centred empty screen state
- SectionTitle — consistent section headings

## Store Badge Colours
- Tesco:         #003DA5 (blue)
- Dunnes Stores: #E31837 (red)
- SuperValu:     #E2231A (orange-red)
- Lidl:          #0050AA (dark blue)
- Aldi:          #00005B (navy)
- Default:       primaryGreen (#0B5D3B)

## File Hygiene Rules (CRITICAL — always do this first)
Before making ANY changes to the project:
1. Scan the entire project for files that don't belong
2. Identify and list any of the following:
   - .tsx/.ts files in the root directory (not in app/, components/, 
     hooks/, services/, constants/, types/)
   - Duplicate screen or component files
   - Test, demo or placeholder files not part of the app
   - Files from previous failed integration attempts
   - Components that duplicate existing ones
   - theme/ folder (duplicate of constants/theme.ts)
   - ThemeProvider.tsx (duplicate of useTheme.ts)
   - BottomNav.tsx (Expo Router handles navigation)
   - PriceRow.tsx (duplicate of PriceList.tsx)
   - .code-workspace files
3. Show the complete list of files to be removed
4. WAIT for explicit user confirmation before deleting anything
5. Only proceed after the user says yes

## Code Standards
- AGPL-3.0 licence header in EVERY new file (2026 copyright)
- process.env.EXPO_PUBLIC_* for ALL API keys — never hardcode
- TypeScript strict typing throughout
- useCallback on all handler functions passed to child components
- No inline style objects in JSX — always use StyleSheet.create()
- SafeAreaView ONLY from react-native-safe-area-context

## Authentication Model
- useAuth() provides: user, isGuest, isLoading, signInWithGoogle,
  continueAsGuest, signOut
- Guest users: view prices, use basket — CANNOT submit prices
- Signed-in users: full access
- Features for signed-in only: price submission, recent scans,
  shopping lists (Phase 2), family sharing (Phase 2)

## Key Features Already Built
- Barcode scanning (expo-camera)
- Open Food Facts product lookup with offline caching
- Community price submission to Supabase with validation
- AI price tag scanning (Claude API vision) — model: claude-sonnet-4-6
- Deal detection (3 for €5, Buy 2 get 1 free, 3 for 2)
- Shopping basket with correct deal totals
- Offline caching (expo-sqlite) + queued submissions
- Price validation (min/max, outlier warning)
- Community voting (👍 confirm / 🚩 flag, auto-hide after 3 flags)
- Deduplication by store+price, sorted by price→confirms→flags→recency
- 30-day price freshness filter
- Guest mode + Google Sign-In (needs development build to test)
- Dark/light mode (automatic system detection via useColorScheme)

## Navigation Structure
```
app/
  login.tsx              ← shown when not authenticated and not guest
  (tabs)/
    index.tsx   (Scan)   ← tab 1
    basket.tsx  (Basket) ← tab 2
    settings.tsx (Settings) ← tab 3
```

## Absolute Rules (never break these)
- NEVER use SafeAreaView from react-native
- NEVER hardcode colours — always useTheme()
- NEVER hardcode spacing — always Spacing constants
- NEVER hardcode font sizes — always Typography constants
- NEVER create a new component if an existing one can be extended
- NEVER add a new file without checking if one already exists
- ALWAYS check components/ui/ before creating anything new
- ALWAYS test the app compiles after each change
- ALWAYS add AGPL-3.0 header with 2026 copyright to new files
- ALWAYS use Inter font family
- ALWAYS clean up stray files before starting work (see File Hygiene)

## Environment Variables (.env — never commit to Git)
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=