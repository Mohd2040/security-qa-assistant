#!/usr/bin/env bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════
# Enhanced Project Detection Script
# ════════════════════════════════════════════════════════════════════════════
# الوصف: يكتشف تلقائيًا نوع المشروع واللغات المستخدمة والأدوات المطلوبة
# الاستخدام: يُستخدم في GitHub Actions لتحديد الفحوصات الأمنية المناسبة
# ════════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════
# متغيرات للكشف
# ═══════════════════════════════════════════
has_node=false
has_dotnet=false
has_python=false
has_go=false
has_java=false
has_rust=false
has_ruby=false
has_php=false
has_frontend=false
has_iac=false
has_docker=false
has_k8s=false

# ═══════════════════════════════════════════
# 1. Node.js Detection
# ═══════════════════════════════════════════
if [ -f package.json ]; then
  has_node=true
  echo "✅ Detected: Node.js (package.json found)"
  
  # فحص إضافي لنوع المشروع
  if grep -q "\"type\": \"module\"" package.json 2>/dev/null; then
    echo "   📦 ESM module detected"
  fi
  
  if grep -q "\"typescript\"" package.json 2>/dev/null; then
    echo "   📘 TypeScript detected"
  fi
fi

# ═══════════════════════════════════════════
# 2. .NET Detection
# ═══════════════════════════════════════════
if ls *.sln *.csproj *.fsproj >/dev/null 2>&1; then
  has_dotnet=true
  echo "✅ Detected: .NET"
  
  # كشف نوع المشروع .NET
  if ls *.csproj >/dev/null 2>&1; then
    echo "   🎯 C# project"
  fi
  if ls *.fsproj >/dev/null 2>&1; then
    echo "   🎯 F# project"
  fi
fi

# ═══════════════════════════════════════════
# 3. Python Detection
# ═══════════════════════════════════════════
if [ -f requirements.txt ] || [ -f pyproject.toml ] || [ -f Pipfile ] || [ -f setup.py ] || [ -f poetry.lock ]; then
  has_python=true
  echo "✅ Detected: Python"
  
  if [ -f pyproject.toml ]; then
    echo "   📦 Poetry/PEP 518 project"
  fi
  if [ -f Pipfile ]; then
    echo "   📦 Pipenv project"
  fi
  if [ -f requirements.txt ]; then
    echo "   📦 pip requirements"
  fi
fi

# ═══════════════════════════════════════════
# 4. Go Detection
# ═══════════════════════════════════════════
if [ -f go.mod ]; then
  has_go=true
  echo "✅ Detected: Go (go.mod found)"
fi

# ═══════════════════════════════════════════
# 5. Java Detection
# ═══════════════════════════════════════════
if [ -f pom.xml ] || [ -f build.gradle ] || [ -f build.gradle.kts ]; then
  has_java=true
  echo "✅ Detected: Java"
  
  if [ -f pom.xml ]; then
    echo "   📦 Maven project"
  fi
  if [ -f build.gradle ] || [ -f build.gradle.kts ]; then
    echo "   📦 Gradle project"
  fi
fi

# ═══════════════════════════════════════════
# 6. Rust Detection
# ═══════════════════════════════════════════
if [ -f Cargo.toml ]; then
  has_rust=true
  echo "✅ Detected: Rust (Cargo.toml found)"
fi

# ═══════════════════════════════════════════
# 7. Ruby Detection
# ═══════════════════════════════════════════
if [ -f Gemfile ] || [ -f Rakefile ]; then
  has_ruby=true
  echo "✅ Detected: Ruby"
fi

# ═══════════════════════════════════════════
# 8. PHP Detection
# ═══════════════════════════════════════════
if [ -f composer.json ]; then
  has_php=true
  echo "✅ Detected: PHP (composer.json found)"
fi

# ═══════════════════════════════════════════
# 9. Frontend Frameworks Detection
# ═══════════════════════════════════════════
if [ -f angular.json ]; then
  has_frontend=true
  echo "✅ Detected: Angular framework"
elif [ -f vite.config.js ] || [ -f vite.config.ts ]; then
  has_frontend=true
  echo "✅ Detected: Vite framework"
elif [ -f next.config.js ] || [ -f next.config.mjs ]; then
  has_frontend=true
  echo "✅ Detected: Next.js framework"
elif [ -f nuxt.config.js ] || [ -f nuxt.config.ts ]; then
  has_frontend=true
  echo "✅ Detected: Nuxt.js framework"
elif grep -q "\"react\"" package.json 2>/dev/null; then
  has_frontend=true
  echo "✅ Detected: React library"
elif grep -q "\"vue\"" package.json 2>/dev/null; then
  has_frontend=true
  echo "✅ Detected: Vue.js library"
fi

# ═══════════════════════════════════════════
# 10. Infrastructure as Code (IaC) Detection
# ═══════════════════════════════════════════
echo "🔍 Scanning for IaC files (max depth: 6)..."

# Terraform
if find . -maxdepth 6 -type f \( -name "*.tf" -o -name "*.tfvars" -o -name "terraform.lock.hcl" \) 2>/dev/null | grep -q .; then
  has_iac=true
  echo "✅ Detected: Terraform files"
fi

# Kubernetes
if find . -maxdepth 6 -type f \( -name "kustomization.yaml" -o -name "kustomization.yml" \) 2>/dev/null | grep -q .; then
  has_iac=true
  has_k8s=true
  echo "✅ Detected: Kustomize files"
fi

# Helm
if find . -maxdepth 6 -type f \( -name "Chart.yaml" -o -name "helmfile.yaml" -o -name "helmfile.yml" \) 2>/dev/null | grep -q .; then
  has_iac=true
  has_k8s=true
  echo "✅ Detected: Helm charts"
fi

# CloudFormation
if find . -maxdepth 6 -type f -name "*.template" 2>/dev/null | grep -q .; then
  has_iac=true
  echo "✅ Detected: CloudFormation templates"
fi

# Ansible
if find . -maxdepth 6 -type f \( -name "ansible.cfg" -o -name "playbook.yml" -o -name "playbook.yaml" \) 2>/dev/null | grep -q .; then
  has_iac=true
  echo "✅ Detected: Ansible playbooks"
fi

# ═══════════════════════════════════════════
# 11. Docker Detection
# ═══════════════════════════════════════════
if [ -f Dockerfile ] || [ -f docker-compose.yml ] || [ -f docker-compose.yaml ]; then
  has_docker=true
  echo "✅ Detected: Docker configuration"
fi

# ═══════════════════════════════════════════
# 12. تحديد لغات CodeQL
# ═══════════════════════════════════════════
codeql_languages=""
langs=()

$has_node && langs+=("javascript-typescript")
$has_python && langs+=("python")
$has_go && langs+=("go")
$has_java && langs+=("java-kotlin")
$has_dotnet && langs+=("csharp")
$has_rust && langs+=("rust")
$has_ruby && langs+=("ruby")

if [ ${#langs[@]} -gt 0 ]; then
  codeql_languages="$(IFS=','; echo "${langs[*]}")"
else
  # Default fallback
  codeql_languages="javascript-typescript"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "📊 CodeQL Languages: $codeql_languages"
echo "═══════════════════════════════════════════"

# ═══════════════════════════════════════════
# 13. تحديد نوع المشروع الأساسي
# ═══════════════════════════════════════════
project_type="node"  # default

if $has_node; then
  project_type="node"
elif $has_python; then
  project_type="python"
elif $has_dotnet; then
  project_type="dotnet"
elif $has_go; then
  project_type="go"
elif $has_java; then
  project_type="java"
elif $has_rust; then
  project_type="rust"
elif $has_ruby; then
  project_type="ruby"
elif $has_php; then
  project_type="php"
fi

echo "🎯 Primary Project Type: $project_type"

# ═══════════════════════════════════════════
# 14. تحديد الأدوات المطلوبة
# ═══════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════"
echo "🔧 Recommended Security Tools:"
echo "═══════════════════════════════════════════"

$has_node && echo "  ✓ npm audit (Node.js dependency scanning)"
$has_python && echo "  ✓ pip-audit / safety (Python dependency scanning)"
$has_dotnet && echo "  ✓ dotnet list package --vulnerable (.NET scanning)"
$has_go && echo "  ✓ govulncheck (Go vulnerability scanning)"
$has_java && echo "  ✓ OWASP Dependency-Check (Java scanning)"
$has_rust && echo "  ✓ cargo audit (Rust dependency scanning)"
$has_docker && echo "  ✓ Trivy (Docker image scanning)"
$has_iac && echo "  ✓ tfsec / checkov (IaC scanning)"
$has_k8s && echo "  ✓ kubesec / kube-bench (Kubernetes scanning)"

echo "  ✓ CodeQL (SAST - Static Analysis)"
echo "  ✓ Trivy (SCA - Software Composition Analysis)"
echo "  ✓ Semgrep (SAST - Pattern-based scanning)"
echo "  ✓ OWASP ZAP (DAST - Dynamic Application Security Testing)"

# ═══════════════════════════════════════════
# 15. كتابة المخرجات إلى GITHUB_OUTPUT
# ═══════════════════════════════════════════
{
  echo "has_node=$has_node"
  echo "has_dotnet=$has_dotnet"
  echo "has_python=$has_python"
  echo "has_go=$has_go"
  echo "has_java=$has_java"
  echo "has_rust=$has_rust"
  echo "has_ruby=$has_ruby"
  echo "has_php=$has_php"
  echo "has_frontend=$has_frontend"
  echo "has_iac=$has_iac"
  echo "has_docker=$has_docker"
  echo "has_k8s=$has_k8s"
  echo "codeql_languages=$codeql_languages"
  echo "project_type=$project_type"
} >> "${GITHUB_OUTPUT}"

echo ""
echo "✅ Detection complete! Results written to GITHUB_OUTPUT"
echo "═══════════════════════════════════════════"
