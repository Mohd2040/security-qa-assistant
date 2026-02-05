#!/usr/bin/env bash
set -euo pipefail

# Detects project characteristics in the checked-out repository.
# Outputs (via GITHUB_OUTPUT):
# - has_node, has_dotnet, has_python, has_go, has_java, has_frontend, has_iac
# - codeql_languages (best-effort)

has_node=false
has_dotnet=false
has_python=false
has_go=false
has_java=false
has_frontend=false
has_iac=false

if [ -f package.json ]; then
  has_node=true
fi

if ls *.sln *.csproj *.fsproj >/dev/null 2>&1; then
  has_dotnet=true
fi

if [ -f requirements.txt ] || [ -f pyproject.toml ] || [ -f Pipfile ] || [ -f setup.py ]; then
  has_python=true
fi

if [ -f go.mod ]; then
  has_go=true
fi

if [ -f pom.xml ] || [ -f build.gradle ] || [ -f build.gradle.kts ]; then
  has_java=true
fi

if [ -f angular.json ] || [ -f vite.config.* ] || [ -f next.config.* ] || [ -f nuxt.config.* ]; then
  has_frontend=true
fi

# IaC signals
if find . -maxdepth 6 -type f \( -name "*.tf" -o -name "*.tfvars" -o -name "terraform.lock.hcl" -o -name "kustomization.yaml" -o -name "kustomization.yml" -o -name "helmfile.yaml" -o -name "helmfile.yml" -o -name "Chart.yaml" \) | grep -q .; then
  has_iac=true
fi

codeql_languages=""
langs=()
$has_node && langs+=("javascript-typescript")
$has_python && langs+=("python")
$has_go && langs+=("go")
$has_java && langs+=("java")
# For dotnet, CodeQL uses "csharp"
$has_dotnet && langs+=("csharp")

if [ ${#langs[@]} -gt 0 ]; then
  codeql_languages="$(IFS=','; echo "${langs[*]}")"
else
  codeql_languages="javascript-typescript"
fi

{
  echo "has_node=$has_node"
  echo "has_dotnet=$has_dotnet"
  echo "has_python=$has_python"
  echo "has_go=$has_go"
  echo "has_java=$has_java"
  echo "has_frontend=$has_frontend"
  echo "has_iac=$has_iac"
  echo "codeql_languages=$codeql_languages"
} >> "${GITHUB_OUTPUT}"
