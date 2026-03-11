# CodeQL Setup Guide

## What is CodeQL?

**CodeQL** is GitHub's semantic code analysis engine that:
- Treats code as data
- Finds security vulnerabilities and coding errors
- Supports multiple languages (JavaScript, TypeScript, Python, Java, C++, etc.)
- Provides deep semantic analysis (not just pattern matching)

---

## What Was Added

### 1. CodeQL Input Parameter ✅

```yaml
run_codeql:
  description: 'Run CodeQL analysis'
  required: false
  type: boolean
  default: true
```

### 2. CodeQL Analysis Steps ✅

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript
    queries: security-and-quality

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

### 3. Enabled in Main Workflow ✅

```yaml
with:
  run_codeql: true
```

---

## CodeQL vs Other Tools

| Tool | Type | What It Finds |
|------|------|---------------|
| **npm audit** | SCA | Known vulnerabilities in dependencies |
| **Trivy** | SAST | Vulnerabilities in packages & configs |
| **CodeQL** | SAST | Logic errors, security bugs in YOUR code |
| **ZAP** | DAST | Runtime vulnerabilities |

**CodeQL is unique** because it analyzes YOUR custom code logic, not just dependencies.

---

## What CodeQL Detects

### JavaScript/TypeScript Queries

CodeQL runs **security-and-quality** queries that detect:

#### Security Issues:
- SQL Injection
- Cross-Site Scripting (XSS)
- Path Traversal
- Command Injection
- Prototype Pollution
- Insecure Randomness
- Hardcoded Credentials
- Unvalidated Redirects

#### Code Quality:
- Unused variables
- Dead code
- Type errors
- Inconsistent returns
- Resource leaks

---

## Example Findings

### Before CodeQL:
```javascript
// Your code
app.get('/user', (req, res) => {
  const userId = req.query.id;
  db.query(`SELECT * FROM users WHERE id = ${userId}`);
});
```

**CodeQL detects:**
```
❌ SQL Injection vulnerability
Location: app.js:15
Severity: HIGH
User input flows directly to SQL query without sanitization
```

### After Fix:
```javascript
app.get('/user', (req, res) => {
  const userId = req.query.id;
  db.query('SELECT * FROM users WHERE id = ?', [userId]);
});
```

---

## How to View CodeQL Results

### Option 1: GitHub Security Tab

1. Go to **Security** → **Code scanning**
2. View all CodeQL alerts
3. Click on alert for details
4. See code flow visualization

### Option 2: Workflow Artifacts

1. **Actions** → Latest run
2. Download `codeql-results` artifact
3. View SARIF file (JSON format)

### Option 3: In Pull Requests

CodeQL automatically comments on PRs with findings:
```
🔒 CodeQL found 1 potential security issue
- SQL Injection in user.js:15
```

---

## Configuration Options

### Change Languages

For multi-language projects:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript, python, java
```

### Custom Queries

Add your own security rules:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript
    queries: security-and-quality, +security-extended
```

### Exclude Paths

Skip certain directories:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript
    config: |
      paths-ignore:
        - node_modules
        - test
        - dist
```

---

## Performance Notes

### Build Time Impact

CodeQL adds **~2-5 minutes** to workflow:
- Initialize: ~30 seconds
- Analysis: ~1-4 minutes (depends on code size)

### When It Runs

- ✅ On every push/PR (recommended)
- ✅ Scheduled scans (weekly)
- ❌ Not needed for dependency-only changes

---

## Integration with Security Report

CodeQL results will appear in:

1. **GitHub Security Tab** (automatic)
2. **Workflow Artifacts** (`codeql-results.sarif`)
3. **Future Enhancement**: Can be added to PDF report

---

## Troubleshooting

### Error: "No code to analyze"

**Solution:** CodeQL needs source code. If you only have `package.json`, it won't find anything.

### Error: "Language not detected"

**Solution:** Explicitly specify language:
```yaml
languages: javascript
```

### Slow Analysis

**Solution:** Exclude unnecessary paths:
```yaml
paths-ignore:
  - node_modules
  - dist
  - build
```

---

## Next Steps

### Immediate
1. ✅ CodeQL is now enabled
2. ✅ Runs on every push/PR
3. ✅ Results in Security tab

### Advanced
- [ ] Add custom CodeQL queries
- [ ] Configure path exclusions
- [ ] Add CodeQL results to PDF report
- [ ] Set up CodeQL alerts in Slack/Teams

---

## Comparison: Full Security Stack

You now have **complete coverage**:

```
┌─────────────────────────────────────┐
│   Your Security Scanning Stack      │
├─────────────────────────────────────┤
│ SCA:                                │
│  ✅ npm audit (dependencies)        │
│  ✅ OWASP Dependency-Check          │
├─────────────────────────────────────┤
│ SAST:                               │
│  ✅ Trivy (packages & configs)      │
│  ✅ CodeQL (custom code logic) ⭐   │
├─────────────────────────────────────┤
│ DAST:                               │
│  ✅ OWASP ZAP (runtime)             │
└─────────────────────────────────────┘
```

**This is enterprise-grade security!** 🎉

---

## Resources

- [CodeQL Documentation](https://codeql.github.com/docs/)
- [CodeQL Query Library](https://codeql.github.com/codeql-query-help/)
- [Writing Custom Queries](https://codeql.github.com/docs/writing-codeql-queries/)
