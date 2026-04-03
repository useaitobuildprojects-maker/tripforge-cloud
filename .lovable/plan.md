
# City-Specific Transfer Pricing

## Problem
Currently there's one global formula (base fee + per-km × multiplier) for all cities. Real agencies need different rates per city (e.g., Dubai more expensive than Marrakech).

## Plan

### 1. Database: Create `city_pricing` table
- `id`, `agency_id`, `city_name`, `country`, `transfer_base_fee`, `transfer_per_km_rate`, `created_at`
- RLS: agency can manage their own rows

### 2. Update pricing engine (`transfer-pricing.ts`)
- Before calculating, look up if a city-specific rate exists for the origin or destination city
- If found, use that city's base fee & per-km rate instead of the global one
- Fallback to global formula if no city match

### 3. Add City Pricing management UI
- New tab/section in Agency Admin Settings → Service Pricing
- Table showing cities with their base fee and per-km rates
- Add/delete city pricing entries
- Excel import/export support

### 4. Hook: `use-city-pricing.ts`
- CRUD hooks for the `city_pricing` table

### Files to create/modify
- **New migration**: Create `city_pricing` table
- **New**: `src/hooks/use-city-pricing.ts` — CRUD hooks
- **Modify**: `src/lib/transfer-pricing.ts` — Check city rates before global formula
- **Modify**: `src/components/agency-admin/ServicePricingEditor.tsx` — Add city pricing management UI
