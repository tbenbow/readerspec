# 🛡️ Branch Protection Rules

This document describes the branch protection rules that should be configured in GitHub to ensure code quality and maintain project standards.

## 🎯 Main Branch Protection

The `main` branch should have the following protection rules enabled:

### ✅ Required Status Checks

**Require status checks to pass before merging:**
- `test` - All tests must pass
- `security` - Security audit must pass  
- `quality` - Code quality checks must pass

**Require branches to be up to date before merging:**
- ✅ Enabled

### 🔒 Required Pull Request Reviews

**Require a pull request before merging:**
- ✅ Enabled

**Required approving reviews:**
- Minimum number of reviewers: `1`
- Dismiss stale PR approvals when new commits are pushed: ✅ Enabled
- Require review from code owners: ✅ Enabled (if CODEOWNERS file exists)

### 🚫 Restrictions

**Restrict pushes that create files larger than 100 MB:**
- ✅ Enabled

**Restrict pushes that create files with certain file extensions:**
- Blocked file extensions: `.exe`, `.dll`, `.so`, `.dylib`, `.bin`

## 🌿 Develop Branch Protection

The `develop` branch should have similar but slightly relaxed protection:

### ✅ Required Status Checks

**Require status checks to pass before merging:**
- `test` - All tests must pass
- `quality` - Code quality checks must pass

**Require branches to be up to date before merging:**
- ✅ Enabled

### 🔒 Required Pull Request Reviews

**Require a pull request before merging:**
- ✅ Enabled

**Required approving reviews:**
- Minimum number of reviewers: `1`
- Dismiss stale PR approvals when new commits are pushed: ✅ Enabled

## 🚀 Feature Branch Guidelines

Feature branches should follow these naming conventions:

- `feature/descriptive-name` - For new features
- `bugfix/issue-description` - For bug fixes
- `hotfix/critical-fix` - For urgent fixes
- `docs/documentation-update` - For documentation changes
- `refactor/code-improvement` - For code refactoring

## 🔄 Pull Request Requirements

All pull requests must:

1. **Pass CI checks** - All GitHub Actions workflows must succeed
2. **Have at least one review** - From maintainers or contributors
3. **Be up to date** - Branch must be current with target branch
4. **Follow commit conventions** - Use conventional commit messages
5. **Include tests** - New features must include appropriate tests
6. **Update documentation** - User-facing changes must update docs

## 🧪 CI/CD Pipeline

The following checks run automatically on all PRs:

### Test Job
- Runs on Node.js 18.x, 20.x, and 22.x
- Executes all tests with coverage
- Builds the project
- Uploads coverage reports

### Security Job
- Runs security audit
- Checks for outdated dependencies
- Ensures no known vulnerabilities

### Quality Job
- Verifies code formatting
- Checks TypeScript compilation
- Identifies unused dependencies

## 🚨 Failure Handling

If any required check fails:

1. **PR cannot be merged** - GitHub will block merging
2. **Fix the issue** - Address the failing check
3. **Push changes** - New commit will trigger re-run
4. **Wait for completion** - All checks must pass again

## 📋 Manual Override

In emergency situations, maintainers can:

1. **Temporarily disable protection** - For critical hotfixes
2. **Force push** - Only when absolutely necessary
3. **Document the reason** - In PR description and commit message

## 🔧 Configuration Steps

To set up these protection rules:

1. Go to repository **Settings** → **Branches**
2. Click **Add rule** for each protected branch
3. Configure the settings as described above
4. Save the protection rules

## 📚 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Note:** These rules help maintain code quality and ensure that all contributions meet project standards. They are designed to protect the project while remaining flexible enough for efficient development.
