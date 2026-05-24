# Tralaí Cliste — Claude Code Context

## Project Overview
Tralaí Cliste is a React Native Expo app for Irish community grocery price comparison.
Built with TypeScript, Expo Router, Supabase and Anthropic Claude API.

## Tech Stack
- React Native (Expo SDK 54)
- Expo Router (file-based navigation)
- Supabase (PostgreSQL database + Auth)
- Anthropic Claude API (AI price tag scanning)
- TypeScript

## Project Structure
- app/(tabs)/index.tsx — Main scan screen (needs refactoring)
- app/(tabs)/basket.tsx — Shopping basket screen
- app/login.tsx — Login screen
- app/_layout.tsx — Root layout with AuthProvider + BasketProvider
- hooks/useAuth.tsx — Google Sign-In + Supabase auth
- hooks/useBasket.tsx — Basket state management
- hooks/useNetwork.tsx — Online/offline detection
- hooks/useProductCache.tsx — SQLite local caching
- services/supabase.ts — Supabase client

## Refactoring Goal
Split app/(tabs)/index.tsx into:
- types/index.ts — Shared TypeScript types (PriceEntry, Product, PriceSubmission)
- constants/stores.ts — STORES array
- services/productService.ts — Open Food Facts API calls
- services/priceService.ts — Supabase price operations
- services/aiService.ts — Claude API price scanning
- hooks/usePrices.tsx — Price fetching, voting, submission logic
- components/PriceList.tsx — Price comparison list UI
- components/ProductCard.tsx — Product display UI
- components/StoreSelector.tsx — Store selection buttons
- components/OfflineBanner.tsx — Offline warning banner
- app/(tabs)/index.tsx — Clean UI only, uses all above

## Key Features
- Barcode scanning (expo-camera)
- Open Food Facts product lookup
- Community price submission to Supabase
- AI price tag scanning (Claude API vision)
- Deal detection (3 for €5, Buy 2 get 1 free, 3 for 2)
- Shopping basket with deal totals
- Offline caching (expo-sqlite)
- Price validation + community voting (confirm/flag)
- Guest mode + Google Sign-In

## Important Rules
- Keep all existing functionality intact
- Use AGPL-3.0 licence header in each new file
- Use process.env.EXPO_PUBLIC_* for all API keys
- Never hardcode API keys
- Keep TypeScript strict typing
- Test after each file change

## Environment Variables
All in .env file:
- EXPO_PUBLIC_ANTHROPIC_API_KEY
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY