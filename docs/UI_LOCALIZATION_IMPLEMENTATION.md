# Japanese Localization Implementation Details

## Overview

This document provides technical details about the Japanese localization implementation for the Vonage Video React Application. It covers what was implemented, how it works, and how to maintain it.

**Implementation Date**: 2026-07-29  
**Language Added**: Japanese (日本語)  
**Language Code**: ja

---

## Summary of Changes

### Files Created

1. **frontend/src/locales/ja.json**
   - Complete Japanese translation of all UI strings
   - Contains 380+ translation keys
   - File size: ~26 KB
   - Format: Valid JSON with key-value pairs

### Files Modified

1. **frontend/src/locales/index.ts**
   - Added import: `import JA from './ja.json';`
   - Registered Japanese in i18next resources: `ja: { translation: JA }`

2. **frontend/src/env.ts**
   - Updated Lang type: Added `'ja'` to union type
   - Updated langValues array: Added `'ja'` to language options
   - Purpose: Ensures TypeScript type safety for language selection

3. **frontend/src/components/LanguageSelector/LanguageSelector.tsx**
   - Added Japanese option to languageOptions array:
     ```typescript
     { code: 'ja', name: '日本語', flag: 'flag-japan' }
     ```
   - This appears in the language dropdown menu

4. **frontend/src/components/LanguageSelector/LanguageSelector.spec.tsx**
   - Added test case for Japanese language display
   - Test verifies Japanese option renders correctly
   - Test verifies switching to Japanese language works

5. **vcrBuild.env.sh**
   - Updated `I18N_SUPPORTED_LANGUAGES` variable
   - Changed from: `I18N_SUPPORTED_LANGUAGES='en|en-US|es|es-MX|it|de'`
   - Changed to: `I18N_SUPPORTED_LANGUAGES='en|en-US|es|es-MX|it|de|ja'`
   - Purpose: Enable Japanese support in Vonage Cloud Runtime builds

6. **.gitignore**
   - Added entry: `private.key` (line 35)
   - Purpose: Prevent accidental commit of private RSA key files
   - Already covered by pattern: `**/.env`

7. **backend/.env**
   - Updated `VONAGE_PRIVATE_KEY`: Changed from file path to full key content
   - Key content: Full RSA private key in PEM format
   - Set `SESSION_KEY_SECRET`: JWT signing secret key
   - Note: This file is NOT committed to git (in .gitignore)

---

## Architecture & Dependencies

### Translation Framework

**Framework**: i18next + react-i18next

**Key Components:**

1. **i18next**
   - Core internationalization framework
   - Handles language detection and switching
   - Manages translation resource loading

2. **react-i18next**
   - React integration for i18next
   - Provides `useTranslation()` hook
   - Enables component-level translation

3. **i18next-browser-languagedetector**
   - Auto-detects user's browser language
   - Used for initial language selection

### Language Switching Flow

```
User selects Japanese from dropdown
    ↓
LanguageSelector.tsx sends signal
    ↓
i18next receives language change event
    ↓
useTranslation() hook updates in all components
    ↓
Components re-render with ja.json translations
    ↓
UI updates to display Japanese text
```

### Translation Keys Structure

The ja.json file is organized by feature/domain:

```
{
  "archiveList": { ... },          // Archive/recording features
  "advancedSettings": { ... },     // Advanced settings page
  "backgroundEffects": { ... },    // Video effects
  "devices": { ... },              // Device selection
  "chat": { ... },                 // Chat functionality
  "recording": { ... },            // Recording controls
  "participants": { ... },         // Participant list
  "errorMessages": { ... },        // Error messages
  "buttons": { ... },              // Button labels
  "labels": { ... },               // Generic labels
  "dialogs": { ... },              // Dialog messages
  ... (and more)
}
```

---

## Backend Configuration Details

### Private Key Storage

**Initial Issue**: Backend was failing with error:
```
"secretOrPrivateKey must be an asymmetric key when using RS256"
```

**Root Cause**: 
- Environment variable contained file path: `backend/private.key`
- JWT library expects actual key content, not path

**Solution**:
- Changed VONAGE_PRIVATE_KEY to contain full PEM-formatted key content
- Key is now read directly from environment variable
- Removed intermediate file path resolution logic

**Security Note**:
- The backend/.env file is protected by .gitignore
- Private key is never committed to version control
- Each environment has its own .env file with unique credentials

### Session Key Configuration

**Variable**: `SESSION_KEY_SECRET`

**Purpose**: 
- Used for JWT signing/verification
- Provides lightweight session integrity verification
- NOT used for authentication (handled at application level)

**Setting Instructions**:
1. Generate secure random value (32+ characters)
2. Add to backend/.env: `SESSION_KEY_SECRET=<value>`
3. Same secret must be consistent across application lifecycle

**Generation Examples**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Testing Coverage

### Unit Tests

**File**: `frontend/src/components/LanguageSelector/LanguageSelector.spec.tsx`

**Test Cases Added**:

1. **Test**: Display Japanese option
   - Verifies Japanese option appears in dropdown
   - Checks for correct language name "日本語"
   - Validates flag icon association

2. **Test**: Switch to Japanese language
   - Simulates user clicking Japanese option
   - Verifies language change event is triggered
   - Checks that i18next receives language change

3. **Existing Tests**: All existing language tests still pass
   - English (en)
   - German (de)
   - Italian (it)
   - Spanish (es, es-MX)

**Running Tests**:
```bash
# Run all frontend tests
yarn test:frontend

# Run specific test file
yarn test:frontend -- src/components/LanguageSelector/LanguageSelector.spec.tsx

# Run with coverage
yarn test:frontend -- --coverage
```

### Integration Tests

**Status**: Ready for testing via Playwright

**Test Scenarios**:
1. Navigate to app → Verify Japanese option available
2. Select Japanese → Verify all text changes
3. Complete full user flow in Japanese
4. Navigate away and return → Verify language persists

---

## File Structure

```
vonage-video-react-app-ui-localization-jp/
├── frontend/
│   └── src/
│       ├── locales/
│       │   ├── index.ts                           [MODIFIED]
│       │   ├── en.json
│       │   ├── de.json
│       │   ├── it.json
│       │   ├── es.json
│       │   ├── es-MX.json
│       │   └── ja.json                            [NEW]
│       ├── env.ts                                 [MODIFIED]
│       └── components/
│           └── LanguageSelector/
│               ├── LanguageSelector.tsx           [MODIFIED]
│               └── LanguageSelector.spec.tsx      [MODIFIED]
├── backend/
│   ├── .env                                       [MODIFIED]
│   ├── private.key                                [EXISTING]
│   └── helpers/
│       └── config.ts                              [MODIFIED, REVERTED]
├── vcrBuild.env.sh                                [MODIFIED]
├── .gitignore                                     [MODIFIED]
├── docs/
│   ├── UI_LOCALIZATION_CHECKLIST.md               [NEW]
│   ├── CLOUDFLARE_TUNNEL_SETUP.md                 [NEW]
│   ├── UI_LOCALIZATION_VALIDATION_GUIDE.md        [NEW]
│   └── UI_LOCALIZATION_IMPLEMENTATION.md          [THIS FILE]
└── ...
```

---

## Deployment Considerations

### Frontend Deployment

**Vite Build Process**:
```bash
yarn build
```

- Bundles all locale files (en.json, ja.json, etc.)
- Tree-shakes unused code
- Minifies translations
- No additional configuration needed

**Deployment Checklist**:
- [ ] All ja.json keys are syntactically valid JSON
- [ ] No circular dependencies in locale files
- [ ] Language selector component is bundled
- [ ] i18next configuration is preserved
- [ ] .env variables are not committed

### Backend Deployment

**Requirements**:
1. Set environment variables in deployment platform:
   - `VONAGE_APP_ID`
   - `VONAGE_PRIVATE_KEY` (full key content)
   - `SESSION_KEY_SECRET`
   - `VIDEO_SERVICE_PROVIDER=vonage`

2. Ensure .env file is NOT included in deployment
3. Use platform-specific secrets management

**Platform-Specific Examples**:

**Heroku**:
```bash
heroku config:set VONAGE_APP_ID=<value>
heroku config:set VONAGE_PRIVATE_KEY='<value>'
heroku config:set SESSION_KEY_SECRET=<value>
```

**AWS/Azure/GCP**:
- Use respective secrets management services
- Create .env file at runtime from secrets
- Never commit .env to version control

**Vonage Cloud Runtime**:
- Configure environment variables in dashboard
- Ensure Japanese is enabled in `vcrBuild.env.sh`
- Test with `yarn vcr:dev`

---

## Maintenance & Future Updates

### Adding New Translations

1. **Add key-value pair to ja.json**:
   ```json
   {
     "newFeature": {
       "title": "新機能のタイトル",
       "description": "新機能の説明"
     }
   }
   ```

2. **Use in component**:
   ```typescript
   import { useTranslation } from 'react-i18next';
   
   function MyComponent() {
     const { t } = useTranslation();
     return <h1>{t('newFeature.title')}</h1>;
   }
   ```

3. **Test**:
   - Switch to Japanese in UI
   - Verify text displays correctly
   - Check for text overflow in layout

### Updating Existing Translations

1. Locate key in ja.json
2. Update value with corrected Japanese text
3. Verify changes:
   ```bash
   # Restart frontend to see changes
   yarn start:frontend
   # Clear browser cache and reload
   ```

### Adding Additional Languages

1. Create new locale file: `frontend/src/locales/xx.json`
2. Copy structure from ja.json
3. Translate all values to target language
4. Update `frontend/src/locales/index.ts`:
   ```typescript
   import XX from './xx.json';
   // Add to resources
   xx: { translation: XX }
   ```
5. Update `frontend/src/env.ts`:
   ```typescript
   export type Lang = '...' | 'xx';
   const langValues = ['...', 'xx'];
   ```
6. Add to LanguageSelector component
7. Update vcrBuild.env.sh if needed
8. Add tests for new language

---

## Troubleshooting Guide

### Common Issues

**Issue 1: Japanese text not showing**
- Solution: Clear browser cache, reload page
- Check that ja.json was created and imported
- Verify language selector shows 日本語

**Issue 2: Some text remains in English**
- Solution: Check ja.json for missing translation keys
- Verify all keys used in components exist in ja.json
- Add missing translations as needed

**Issue 3: Backend 502 error**
- Solution: Verify VONAGE_PRIVATE_KEY contains full key content
- Check that SESSION_KEY_SECRET is set
- Restart backend after config changes

**Issue 4: Layout broken with Japanese text**
- Solution: Check text element width constraints
- Japanese typically needs more horizontal space
- Adjust container sizes or font sizes as needed

### Debug Commands

```bash
# Check i18next initialization
open http://localhost:5173?debug=true

# Verify locale file syntax
node -e "const fs = require('fs'); console.log(JSON.parse(fs.readFileSync('frontend/src/locales/ja.json', 'utf8')))"

# Check language in browser console
# In DevTools console:
# i18next.language
# i18next.languages
# i18next.getResourceBundle('ja', 'translation')
```

---

## Performance Considerations

### File Size Impact

- **ja.json**: ~26 KB (similar to other locales)
- **Build size**: Negligible impact (~26 KB gzipped)
- **Translation lookup**: O(1) for simple key access

### Optimization Techniques

1. **Lazy loading** (if many languages):
   ```typescript
   const JA = () => import('./ja.json');
   ```

2. **Code splitting** (automatically handled by Vite)

3. **Caching** (browser caches JSON files)

### Monitoring

- Monitor translation file sizes
- Track lookup performance if using complex keys
- Test with many concurrent users

---

## References

### Official Documentation
- i18next: https://www.i18next.com/
- react-i18next: https://react.i18next.com/
- Vite: https://vitejs.dev/
- Material-UI: https://mui.com/

### Translation Resources
- Japanese language guide: [Internal team guide]
- Terminology guide: [Internal glossary]
- Style guide: [Internal style guidelines]

### Related Files
- UI Validation Guide: `docs/UI_LOCALIZATION_VALIDATION_GUIDE.md`
- Setup Checklist: `docs/UI_LOCALIZATION_CHECKLIST.md`
- Cloudflare Tunnel: `docs/CLOUDFLARE_TUNNEL_SETUP.md`

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-29  
**Author**: Development Team  
**Status**: Active
