# UI Localization Validation Guide

## Overview

This document provides comprehensive guidelines for validating the Japanese (日本語) localization of the Vonage Video React Application. It covers all UI elements that have been translated, test procedures, and verification checkpoints across different user flows.

## Table of Contents

1. [Setup Prerequisites](#setup-prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Testing Procedures](#testing-procedures)
4. [Localization Coverage](#localization-coverage)
5. [Validation Checklist](#validation-checklist)
6. [Troubleshooting](#troubleshooting)
7. [Backend Configuration](#backend-configuration)

---

## Setup Prerequisites

### System Requirements

- Node.js: v22.x or later
- npm/yarn: 9.x or later
- macOS, Linux, or Windows with WSL2

### Required Environment Files

Before starting, ensure the following are configured:

1. **backend/.env** - Contains Vonage API credentials and private key
   - `VONAGE_APP_ID`: Your Vonage application ID
   - `VONAGE_PRIVATE_KEY`: RSA private key content (not file path)
   - `SESSION_KEY_SECRET`: JWT signing secret key
   - `VIDEO_SERVICE_PROVIDER`: Set to 'vonage'

2. **backend/private.key** - Private RSA key file (optional, but .env should contain full key content)

### Port Requirements

- Frontend development server: **5173** (Vite)
- Backend API server: **3345** (Express/NX)

---

## Environment Configuration

### Installing Dependencies

```bash
cd <project-root>
yarn install
```

### Starting the Development Environment

**Terminal 1 - Start Backend:**
```bash
yarn start:backend
# Expected output: "Server listening on port 3345"
```

**Terminal 2 - Start Frontend:**
```bash
yarn start:frontend
# Expected output: "Local: http://localhost:5173"
```

**Terminal 3 - (Optional) Start Storybook:**
```bash
yarn storybook
# For isolated component testing
```

### Accessing the Application

- **Development**: http://localhost:5173
- **Backend API**: http://localhost:3345

---

## Testing Procedures

### Browser Preparation

1. **Clear Browser Cache**
   - Chrome/Firefox: Ctrl+Shift+Delete (Cmd+Shift+Delete on macOS)
   - Select "All time"
   - Clear cookies, cached images and files

2. **Open Developer Tools**
   - Press F12 (or Cmd+Option+I on macOS)
   - Go to "Console" tab to monitor for errors

3. **Set Language to Japanese**
   - Locate language selector dropdown (top-right corner)
   - Click and select "日本語" (Japanese)
   - Wait 2-3 seconds for UI to re-render

### Test Flow Stages

#### Stage 1: Landing Page (Pre-Conference)

**Entry Point**: http://localhost:5173

**Expected UI Elements in Japanese:**

1. **Header Section**
   - Logo/Title area
   - Language selector dropdown showing "日本語"
   - Navigation elements

2. **Hero Section**
   - Main title with Japanese text
   - Tagline/description in Japanese
   - Subheadings in Japanese

3. **Call-to-Action Section**
   - **"新しいビデオ会議を開始"** (Start New Video Conference)
     - Button: **"新しいルームを作成"** (Create New Room)
   
   - **"既存の会議に参加"** (Join Existing Conference)
     - Label: **"ルーム名"** (Room Name)
     - Placeholder text: **"ルーム名"** (Room Name)
     - Button: **"待機ルームに参加"** (Join Waiting Room)

4. **Footer Section**
   - GitHub repository link in Japanese
   - Copyright notice
   - Contact information

**Validation Steps:**

```
□ All text elements display in Japanese
□ No English fallback text is visible
□ Input placeholder shows Japanese text
□ Button labels are fully readable
□ Text alignment is correct for RTL/LTR
□ No text overflow in any elements
□ Icons and labels are properly aligned
```

#### Stage 2: Room Creation Flow

**Trigger**: Click **"新しいルームを作成"** button

**Expected Behavior:**

1. Navigate to room creation page or modal
2. Display room name input field with Japanese label
3. Show configuration options in Japanese:
   - Media mode selection
   - Room properties
   - Advanced settings (if available)

**Expected UI Elements:**

- [ ] Page title in Japanese
- [ ] Form field labels in Japanese
- [ ] Help text/descriptions in Japanese
- [ ] Submit button label in Japanese
- [ ] Cancel button label in Japanese
- [ ] Error messages in Japanese (if validation fails)

#### Stage 3: Conference Join Flow

**Trigger**: Enter room name and click **"待機ルームに参加"**

**Expected Behavior:**

1. Validate room name input
2. Connect to backend to create/join session
3. Load conference interface

**Expected UI Elements in Conference Room:**

1. **Top Navigation Bar**
   - [ ] Room name display in appropriate location
   - [ ] Participant count indicator
   - [ ] Leave/End call button

2. **Video Controls**
   - [ ] Microphone toggle: **"マイク"** / Muted indicator
   - [ ] Camera toggle: **"カメラ"** / Disabled indicator
   - [ ] Screen share button with Japanese label
   - [ ] Settings menu in Japanese

3. **Participant Panel**
   - [ ] Section title: **"参加者"** (Participants)
   - [ ] Participant list with names
   - [ ] Online/offline status indicators
   - [ ] Mute/unmute indicators with Japanese labels
   - [ ] Hand raise button with Japanese label
   - [ ] Remove participant option (if admin)

4. **Chat Panel**
   - [ ] Panel title: **"チャット"** (Chat)
   - [ ] Message input placeholder: **"メッセージを入力..."** (Type message...)
   - [ ] Send button
   - [ ] Message timestamps
   - [ ] Sender names

5. **Recording/Archive**
   - [ ] Record button: **"録画開始"** (Start Recording) / **"録画停止"** (Stop Recording)
   - [ ] Recording status indicator
   - [ ] Timer display

6. **Settings/Options Menu**
   - [ ] Menu title/header in Japanese
   - [ ] Setting categories in Japanese:
     - Audio settings
     - Video settings
     - Display options
     - Advanced options
   - [ ] All toggle labels in Japanese
   - [ ] All descriptive text in Japanese

#### Stage 4: Conference Exit Flow

**Trigger**: Click leave/end call button

**Expected Behavior:**

1. Display confirmation dialog
2. Show session summary (optional)
3. Request feedback (optional)
4. Return to landing page

**Expected UI Elements:**

1. **Confirmation Dialog**
   - [ ] Message: **"本当に退出しますか？"** (Are you sure you want to leave?)
   - [ ] Cancel button: **"キャンセル"** (Cancel)
   - [ ] Leave button: **"退出"** (Leave)

2. **Feedback/Survey (if enabled)**
   - [ ] Survey title in Japanese
   - [ ] Questions in Japanese
   - [ ] Rating scale labels in Japanese:
     - "非常に満足" (Very Satisfied)
     - "満足" (Satisfied)
     - "普通" (Neutral)
     - "不満" (Dissatisfied)
     - "非常に不満" (Very Dissatisfied)
   - [ ] Submit button: **"送信"** (Submit)
   - [ ] Skip button: **"スキップ"** (Skip)

3. **Session Summary (if displayed)**
   - [ ] Duration label: **"通話時間"** (Call Duration)
   - [ ] Participant count label
   - [ ] Data usage label (if applicable)
   - [ ] All summary labels in Japanese

---

## Localization Coverage

### Translation Files

**Primary File**: `frontend/src/locales/ja.json`

**File Details:**
- Format: JSON with translation keys and values
- Total Keys: 380+
- File Size: ~26 KB

**File Organization:**

```json
{
  "common": { ... },
  "landing": { ... },
  "conference": { ... },
  "settings": { ... },
  "feedback": { ... },
  "errors": { ... }
}
```

### Configuration Files Modified

1. **frontend/src/locales/index.ts**
   - Imports `ja.json`
   - Registers Japanese locale with i18next
   - Enables language switching

2. **frontend/src/env.ts**
   - Added 'ja' to Lang type union
   - Updated langValues array to include 'ja'
   - Provides TypeScript type safety for language selection

3. **frontend/src/components/LanguageSelector/LanguageSelector.tsx**
   - Added Japanese option to language list
   - Sets display name as "日本語"
   - Associates flag icon "flag-japan"

### Build Configuration

**File**: `vcrBuild.env.sh`
- Updated to include 'ja' in `I18N_SUPPORTED_LANGUAGES`
- Enables Japanese during Vonage Cloud Runtime builds

---

## Validation Checklist

### Pre-Testing Checklist

- [ ] Node.js version is 22.x or later
- [ ] All dependencies installed (`yarn install` completed)
- [ ] Backend `.env` file is configured with Vonage credentials
- [ ] `VONAGE_PRIVATE_KEY` contains full key content (not file path)
- [ ] `SESSION_KEY_SECRET` is set to a secure value
- [ ] Backend port 3345 is available
- [ ] Frontend port 5173 is available
- [ ] Backend and frontend both started successfully

### Landing Page Checklist

- [ ] Language selector visible and functional
- [ ] Japanese (日本語) option available in language dropdown
- [ ] Clicking Japanese changes all text to Japanese
- [ ] All headings display in Japanese
- [ ] All descriptions/taglines display in Japanese
- [ ] All button labels display in Japanese
- [ ] All input placeholders display in Japanese
- [ ] No console errors related to missing translations
- [ ] No broken images or missing assets
- [ ] Layout remains responsive on different screen sizes

### Room Creation Checklist

- [ ] Room name input label in Japanese
- [ ] Form validation messages in Japanese
- [ ] Success messages in Japanese
- [ ] Error messages in Japanese
- [ ] All buttons labeled in Japanese
- [ ] Dialog titles in Japanese (if applicable)

### Conference Interface Checklist

**Video/Audio Controls:**
- [ ] Microphone toggle button has Japanese label
- [ ] Camera toggle button has Japanese label
- [ ] Volume control labeled in Japanese
- [ ] Device selection dropdown options in Japanese
- [ ] Audio input device name shows correctly

**Participant Management:**
- [ ] Participants panel title in Japanese
- [ ] Participant list displays correctly
- [ ] Mute indicator shows with Japanese label
- [ ] Hand raise button labeled in Japanese
- [ ] Participant actions menu in Japanese

**Chat Functionality:**
- [ ] Chat panel title in Japanese
- [ ] Input placeholder in Japanese
- [ ] Send button accessible
- [ ] Message timestamps display correctly
- [ ] User names display correctly

**Recording/Archive:**
- [ ] Record button label in Japanese
- [ ] Recording status text in Japanese
- [ ] Timer updates correctly

**Settings Menu:**
- [ ] All menu items in Japanese
- [ ] All descriptions in Japanese
- [ ] Toggle labels in Japanese
- [ ] Settings persist correctly

### Exit/Feedback Checklist

- [ ] Confirmation dialog message in Japanese
- [ ] Dialog buttons labeled in Japanese
- [ ] Feedback questions in Japanese
- [ ] Rating options labeled in Japanese
- [ ] Submit/Skip buttons in Japanese
- [ ] Success message in Japanese
- [ ] Return to landing page works correctly

---

## Troubleshooting

### Issue: Text still displays in English

**Solutions:**

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (Cmd+Shift+Delete on macOS)
   - Select "All time"
   - Clear all browsing data

2. **Check language setting:**
   - Verify language selector shows "日本語"
   - Click again to reselect Japanese

3. **Reload page:**
   - Press F5 or Cmd+R
   - Or do a hard refresh: Ctrl+Shift+R (Cmd+Shift+R on macOS)

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors related to "translation" or "i18next"
   - Check that `frontend/src/locales/ja.json` is being loaded

### Issue: Missing translation keys

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls -lh frontend/src/locales/ja.json
   ```
   Expected output: File should be ~26 KB

2. **Check file format:**
   ```bash
   head -20 frontend/src/locales/ja.json
   ```
   Should show valid JSON with translation keys

3. **Verify import in index.ts:**
   ```bash
   grep -n "import JA" frontend/src/locales/index.ts
   ```
   Should show: `import JA from './ja.json';`

4. **Check i18next configuration:**
   ```bash
   grep -n "ja:" frontend/src/locales/index.ts
   ```
   Should show Japanese registered in resources

### Issue: Backend returns 502 error

**Solutions:**

1. **Verify Vonage credentials:**
   ```bash
   grep -E "VONAGE_APP_ID|VONAGE_PRIVATE_KEY" backend/.env
   ```
   - `VONAGE_APP_ID` should be a valid UUID
   - `VONAGE_PRIVATE_KEY` should contain full key content starting with `-----BEGIN`

2. **Check private key format:**
   ```bash
   head -1 backend/private.key
   # Should output: -----BEGIN PRIVATE KEY-----
   ```

3. **Verify SESSION_KEY_SECRET:**
   ```bash
   grep "SESSION_KEY_SECRET" backend/.env
   ```
   Should be set to a secure value (minimum 32 characters recommended)

4. **Restart backend:**
   ```bash
   # Stop existing backend (Ctrl+C)
   # Clear cache
   rm -rf .nx/cache
   # Restart
   yarn start:backend
   ```

### Issue: Language selector not showing Japanese option

**Solutions:**

1. **Check component file:**
   ```bash
   grep -n "flag-japan" frontend/src/components/LanguageSelector/LanguageSelector.tsx
   ```
   Should show entry for Japanese

2. **Verify env.ts configuration:**
   ```bash
   grep -n "'ja'" frontend/src/env.ts
   ```
   Should show 'ja' in Lang type and langValues array

3. **Rebuild frontend:**
   ```bash
   # Stop frontend server
   # Clear cache
   rm -rf node_modules/.vite
   # Restart
   yarn start:frontend
   ```

---

## Backend Configuration

### Private Key Setup

The `VONAGE_PRIVATE_KEY` environment variable must contain the full RSA private key content, not a file path.

**Correct Format (in backend/.env):**

```bash
VONAGE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5U57U/SQI8w7y
... (key content)
-----END PRIVATE KEY-----'
```

**Important:**
- The value must be wrapped in single quotes
- The key content spans multiple lines
- Do NOT use a file path (e.g., `backend/private.key`)
- The `.env` file is in `.gitignore` - it won't be committed

### SESSION_KEY_SECRET Configuration

**Generation Recommendation:**

Generate a strong random secret for JWT signing:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Recommended Length:** 32+ characters

**Example Configuration:**
```bash
SESSION_KEY_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Validation Report Template

Use this template to document localization validation results:

```markdown
# Localization Validation Report

**Date**: [Date]
**Tester**: [Name]
**Language**: Japanese (日本語)
**Application Version**: [Version]

## Environment

- Node.js Version: [Version]
- Browser: [Browser Name and Version]
- OS: [Operating System]

## Results Summary

### Landing Page
- Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- Issues Found: [Number]

### Conference Interface
- Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- Issues Found: [Number]

### Exit/Feedback
- Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- Issues Found: [Number]

## Detailed Findings

### Issue #1
- **Component**: [Component Name]
- **Expected**: [Expected Text]
- **Actual**: [Actual Text]
- **Status**: ❌ FAIL
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Recommendation**: [Recommendation]

### Issue #2
...

## Sign-off

- [ ] All critical issues resolved
- [ ] All high-priority issues addressed
- [ ] Localization quality acceptable for production
- [ ] Approved for release

**Validator Signature**: _______________  
**Date**: _______________
```

---

## References

### File Locations

- Translation file: `frontend/src/locales/ja.json`
- i18next config: `frontend/src/locales/index.ts`
- Language selector: `frontend/src/components/LanguageSelector/LanguageSelector.tsx`
- Type definitions: `frontend/src/env.ts`
- Backend config: `backend/helpers/config.ts`
- Backend environment: `backend/.env`

### Related Documentation

- i18next Documentation: https://www.i18next.com/
- React-i18next: https://react.i18next.com/
- Vonage Video API: https://developer.vonage.com/en/video/overview
- Material-UI (MUI): https://mui.com/

### Support Resources

For issues with:
- **Translations**: Check `frontend/src/locales/ja.json`
- **Components**: Check component test files (*.spec.tsx)
- **Backend**: Check `backend/helpers/config.ts` and logs
- **Vonage API**: Visit https://developer.vonage.com/en/

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-29  
**Status**: Active
