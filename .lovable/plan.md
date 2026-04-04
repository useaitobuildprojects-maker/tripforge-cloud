## Editable Storefront Pages

### New fields in `StorefrontConfig` type:
- **Home**: `home_hero_image` (already has hero_title/subtitle/cta_text)
- **About**: `about_title`, `about_subtitle`, `about_story`, `about_image_url`, `about_values` (array of {title, desc})
- **Contact**: `contact_title`, `contact_subtitle`
- **Fleet**: `fleet_title`, `fleet_subtitle`
- **Services**: `services_title`, `services_subtitle`, per-service custom descriptions

### Implementation:
1. **Extend `StorefrontConfig`** in `src/types/agency.ts` with new fields
2. **Create `PageContentEditor`** component in agency-admin — a new section in settings with tabs for each page (Home, About, Contact, Fleet/Services), each with text inputs and image uploads
3. **Update storefront pages** to read from `cfg` instead of hardcoded text:
   - `StorefrontHome.tsx` — hero image
   - `StorefrontAbout.tsx` — title, story text, about image, values
   - `StorefrontContact.tsx` — title, subtitle
   - `StorefrontFleet.tsx` — title, subtitle
   - `StorefrontServices.tsx` — title, subtitle, per-service descriptions
4. **Add the editor** to `AgencyAdminSettings.tsx`
