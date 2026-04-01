

# Fix Transfer Quote Calculation

## Problem
The "Get Quote" button silently returns €0 because:
1. If no matrix route matches, it falls back to the formula path
2. The formula path calls Photon (geocoding) and OSRM (distance) APIs — both can fail silently
3. All errors are caught and swallowed, returning price: 0 with no debugging info
4. The Photon geocoder may not resolve location names like "Marrakech Airport" reliably

## Plan

### 1. Add console logging to pricing engine
Add `console.log` statements at each step in `calculateTransferPrice()` so we can see exactly where it fails (geocoding? OSRM? config values?).

### 2. Improve geocoding reliability
When geocoding locations, append the agency's country to the search query (e.g., "Marrakech Airport, Morocco") to improve Photon results. The country parameter is already passed but not used.

### 3. Show meaningful error states to the user
Instead of showing "Price unavailable" generically, display specific messages:
- "Could not locate [origin]" if geocoding fails
- "Could not calculate route distance" if OSRM fails
- "Formula not configured" if base fee and per-km rate are both 0

### 4. Add a loading/debug toast
Show a toast or inline status during calculation so the user knows what's happening (Geocoding... → Calculating distance... → Computing price...).

### Files to modify
- **`src/lib/transfer-pricing.ts`** — Add country to geocoding query, add console logs, return error details in the quote object
- **`src/components/storefront/TransferBookingForm.tsx`** — Display specific error messages based on failure reason

### Technical detail
Extend `TransferQuote` with an optional `error` field:
```ts
export interface TransferQuote {
  // ...existing fields
  error?: 'no_formula' | 'geocode_origin' | 'geocode_destination' | 'no_route' | 'osrm_failed';
}
```

The `geocodePlace` function will be updated to actually use the country parameter:
```ts
let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(name + (country ? ', ' + country : ''))}&limit=1`;
```

