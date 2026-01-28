# DAST Authentication Setup Guide

## Problem: ZAP Scan Errors

### Errors Fixed:
1. ✅ Permission denied → Removed rules file requirement
2. ✅ Read timeout → Increased timeout to 120 seconds
3. ✅ Authentication → Added support for login

---

## Authentication Options

### Option 1: Form-Based Login (Username/Password)

For sites with login forms like yours:

#### Step 1: Create Authentication Context File

Create `.zap/auth-context.yaml`:

```yaml
env:
  contexts:
    - name: "Security QA Assistant"
      urls:
        - "https://security-qa-assistant.onrender.com.*"
      authentication:
        method: "form"
        parameters:
          loginUrl: "https://security-qa-assistant.onrender.com/api/auth/signin"
          loginRequestData: "username={%username%}&password={%password%}"
        verification:
          method: "response"
          loggedInRegex: "\\QLogout\\E"
          loggedOutRegex: "\\QLogin\\E"
      users:
        - name: "test-user"
          credentials:
            username: "your-username"
            password: "your-password"
```

#### Step 2: Update Workflow

```yaml
- name: Run OWASP ZAP Authenticated Scan
  uses: zaproxy/action-full-scan@v0.9.0
  with:
    target: 'https://security-qa-assistant.onrender.com'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-a -j -z "-configfile /zap/wrk/.zap/auth-context.yaml"'
```

### Option 2: API Token/Bearer Authentication

If your site uses JWT tokens:

#### Add to GitHub Secrets:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `ZAP_AUTH_HEADER` = `Authorization`
   - `ZAP_AUTH_HEADER_VALUE` = `Bearer YOUR_JWT_TOKEN`

#### Already Configured in Workflow ✅
```yaml
env:
  ZAP_AUTH_HEADER: ${{ secrets.ZAP_AUTH_HEADER }}
  ZAP_AUTH_HEADER_VALUE: ${{ secrets.ZAP_AUTH_HEADER_VALUE }}
```

### Option 3: Cookie-Based Authentication

If you have a session cookie:

```yaml
env:
  ZAP_AUTH_HEADER: 'Cookie'
  ZAP_AUTH_HEADER_VALUE: 'session=YOUR_SESSION_COOKIE'
```

---

## Current Configuration

### What Was Fixed:

```yaml
# Before (causing errors):
rules_file_name: '.zap/rules.tsv'  # File didn't exist
cmd_options: '-a'                   # No timeout

# After (working):
cmd_options: '-T 120 -z "-config api.disablekey=true"'
# -T 120 = 120 second timeout
# -z = ZAP command line options
```

---

## For Your NextAuth.js Site

Since you're using NextAuth.js, here's the best approach:

### Step 1: Create Test User Credentials

Add to GitHub Secrets:
- `TEST_USER_EMAIL` = test user email
- `TEST_USER_PASSWORD` = test user password

### Step 2: Use Full Scan with Authentication

Replace the baseline scan with:

```yaml
- name: Run OWASP ZAP Full Scan (Authenticated)
  uses: zaproxy/action-full-scan@v0.9.0
  with:
    target: 'https://security-qa-assistant.onrender.com'
    cmd_options: '-T 120'
  env:
    # NextAuth uses cookies
    ZAP_AUTH_HEADER: 'Cookie'
    ZAP_AUTH_HEADER_VALUE: 'next-auth.session-token=${{ secrets.NEXTAUTH_SESSION_TOKEN }}'
```

### Step 3: Get Session Token

1. Login to your site manually
2. Open DevTools → Application → Cookies
3. Copy `next-auth.session-token` value
4. Add to GitHub Secrets as `NEXTAUTH_SESSION_TOKEN`

---

## Quick Test Without Authentication

If you want to test public pages only:

```yaml
- name: Run ZAP on Public Pages
  uses: zaproxy/action-baseline@v0.12.0
  with:
    target: 'https://security-qa-assistant.onrender.com'
    cmd_options: '-T 120 -j'  # -j = use AJAX spider
  continue-on-error: true
```

---

## Troubleshooting

### Still Getting Timeout?

Your site might be slow to respond. Options:
1. Increase timeout: `-T 300` (5 minutes)
2. Scan specific pages: `-t https://your-site.com/specific-page`
3. Use API scan instead of full scan

### Permission Denied?

Already fixed by removing `rules_file_name`.

### Want to Skip Login Pages?

Add to `.zap/rules.tsv`:
```
IGNORE	https://security-qa-assistant.onrender.com/api/auth/.*	.*	.*	.*
```

---

## Recommended Next Steps

1. ✅ Current fix works for public pages
2. If you need authenticated scanning:
   - Add session token to GitHub Secrets
   - Use full-scan action
   - Configure authentication context

3. For production:
   - Create dedicated test account
   - Use API tokens instead of passwords
   - Rotate credentials regularly
