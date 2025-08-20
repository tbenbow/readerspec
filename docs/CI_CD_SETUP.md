# 🚀 CI/CD Setup Guide

This guide explains how to set up the complete CI/CD pipeline for ReaderSpec, including GitHub Actions workflows, branch protection, and automated processes.

## 📋 Overview

The CI/CD pipeline includes:

- **Automated Testing** - Runs on every PR and push
- **Code Quality Checks** - Linting, formatting, and security audits
- **Dependency Management** - Automated updates and security fixes
- **Release Automation** - Tagged releases with NPM publishing
- **Branch Protection** - Enforces quality gates before merging

## 🔧 GitHub Actions Workflows

### 1. Main CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Test** - Runs tests on Node.js 18.x, 20.x, and 22.x
- **Security** - Security audit and dependency checks
- **Quality** - Code formatting and TypeScript compilation

**Features:**
- Matrix testing across Node.js versions
- Coverage reporting with Codecov
- Parallel job execution for speed

### 2. Dependency Updates (`.github/workflows/dependency-update.yml`)

**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Features:**
- Automatically checks for outdated packages
- Creates PRs with updates
- Runs full test suite before proposing changes
- Applies security fixes where possible

### 3. Release Automation (`.github/workflows/release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`)

**Features:**
- Creates GitHub releases automatically
- Publishes to NPM registry
- Generates release notes from commits
- Runs full validation before release

## 🛡️ Branch Protection Setup

### Required GitHub Settings

1. **Go to Repository Settings** → **Branches**
2. **Add rule** for `main` branch
3. **Configure protection rules:**

#### ✅ Required Status Checks
- `test` - All tests must pass
- `security` - Security audit must pass
- `quality` - Code quality checks must pass
- ✅ "Require branches to be up to date before merging"

#### 🔒 Required Pull Request Reviews
- ✅ "Require a pull request before merging"
- ✅ "Require approvals" (minimum 1)
- ✅ "Dismiss stale PR approvals when new commits are pushed"

#### 🚫 Restrictions
- ✅ "Restrict pushes that create files larger than 100 MB"
- ✅ "Restrict pushes that create files with certain file extensions"

### Develop Branch Protection

Similar to main but slightly relaxed:
- Required: `test` and `quality` checks
- Security checks are recommended but not required

## 🔑 Required Secrets

### NPM Publishing (for releases)

1. **Generate NPM Token:**
   ```bash
   npm login
   npm token create --read-only
   ```

2. **Add to GitHub Secrets:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add secret: `NPM_TOKEN` with your NPM token

### Codecov (optional)

1. **Sign up at [codecov.io](https://codecov.io)**
2. **Connect your GitHub repository**
3. **Add secret:** `CODECOV_TOKEN` (if required)

## 📊 Monitoring and Metrics

### GitHub Actions Insights

- **Go to Actions** tab in your repository
- **View workflow runs** and success rates
- **Monitor job performance** and execution times
- **Check for failed workflows** and common issues

### Test Coverage

- Coverage reports are generated on every run
- View coverage trends over time
- Identify areas needing more tests

### Security Alerts

- GitHub automatically scans for vulnerabilities
- Dependabot creates security PRs
- Weekly dependency updates include security fixes

## 🚨 Troubleshooting

### Common Issues

#### CI Checks Failing

1. **Tests failing:**
   ```bash
   npm test                    # Run tests locally
   npm run test:coverage      # Check coverage
   ```

2. **Linting errors:**
   ```bash
   npm run lint               # Check for issues
   npm run lint:fix           # Auto-fix issues
   ```

3. **Formatting issues:**
   ```bash
   npm run format:check       # Check formatting
   npm run format             # Auto-format code
   ```

4. **Build failures:**
   ```bash
   npm run build              # Build locally
   npm run check              # Validate specs
   ```

#### Workflow Not Triggering

1. **Check branch names** - Workflows only run on `main` and `develop`
2. **Verify file paths** - Workflows are in `.github/workflows/`
3. **Check GitHub Actions permissions** - Ensure Actions are enabled

#### Dependency Update Issues

1. **Manual trigger:** Go to Actions → Dependency Update → Run workflow
2. **Check logs** for specific error messages
3. **Verify NPM access** and token validity

## 🔄 Workflow Customization

### Adding New Checks

1. **Create new job** in `ci.yml`:
   ```yaml
   new-check:
     runs-on: ubuntu-latest
     needs: test
     steps:
       - name: Checkout code
         uses: actions/checkout@v4
       - name: Run custom check
         run: npm run custom-check
   ```

2. **Add to branch protection** if required

### Modifying Triggers

- **Change branches** in workflow `on` section
- **Add new triggers** like `workflow_dispatch` for manual runs
- **Modify schedules** for dependency updates

### Environment-Specific Settings

- **Use environment variables** for different deployment targets
- **Conditional steps** based on branch or event
- **Matrix strategies** for multiple configurations

## 📚 Best Practices

### For Contributors

1. **Always run tests locally** before pushing
2. **Check formatting** with `npm run format:check`
3. **Verify linting** with `npm run lint`
4. **Update tests** for new functionality
5. **Follow commit conventions**

### For Maintainers

1. **Monitor workflow runs** regularly
2. **Review dependency updates** weekly
3. **Address security alerts** promptly
4. **Maintain branch protection** rules
5. **Update workflows** as needed

### For the Project

1. **Keep dependencies updated** and secure
2. **Maintain high test coverage** (>80%)
3. **Enforce code quality** standards
4. **Automate repetitive tasks** where possible
5. **Document changes** and processes

## 🔗 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Note:** This CI/CD setup ensures code quality, security, and reliability while automating routine maintenance tasks. Regular monitoring and updates help maintain the pipeline's effectiveness.
