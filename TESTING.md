# Testing & Git Hooks Setup

This project uses a comprehensive testing strategy with automated Git hooks powered by Husky.

## Testing Scripts

### Unit Tests

```bash
npm run test:unit
```

Runs all unit tests (excludes integration tests). Fast execution for quick feedback during development.

### Integration Tests

```bash
npm run test:integration
```

Runs integration tests using a dedicated Vitest configuration. Tests component interactions and data flow.

### End-to-End Tests

```bash
npm run test:e2e
```

Runs Playwright tests for full application testing in browser environment.

### All Tests

```bash
npm run test:all
```

Runs unit, integration, and E2E tests in sequence.

### Coverage

```bash
npm run test:coverage
```

Runs tests with coverage reporting.

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode for active development.

### UI Mode

```bash
npm run test:ui
```

Opens Vitest UI for interactive test management.

## Git Hooks (Husky)

### Pre-commit Hook

Automatically runs before each commit:

1. **Lint-staged**: Runs ESLint and Prettier on staged files
2. **Unit Tests**: Fast unit test execution
3. **Integration Tests**: Component integration validation

### Pre-push Hook

Automatically runs before pushing to remote:

1. **Full Test Suite**: All unit and integration tests
2. **E2E Tests**: Complete browser testing
3. **Build Verification**: Ensures the app builds successfully

### Commit Message Hook

Validates commit message format using conventional commits:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `style: code style changes`
- `refactor: code refactoring`
- `test: test changes`
- `chore: maintenance tasks`
- `perf: performance improvements`
- `ci: CI/CD changes`
- `build: build system changes`
- `revert: revert previous commit`

## Configuration Files

- `vitest.config.ts`: Main test configuration for unit tests
- `vitest.integration.config.ts`: Dedicated configuration for integration tests
- `playwright.config.ts`: E2E test configuration
- `.husky/pre-commit`: Pre-commit hook script
- `.husky/pre-push`: Pre-push hook script
- `.husky/commit-msg`: Commit message validation

## Benefits

1. **Quality Assurance**: Prevents broken code from being committed or pushed
2. **Fast Feedback**: Unit tests run quickly during commits
3. **Comprehensive Testing**: Integration and E2E tests ensure full functionality
4. **Consistent Code Style**: Automated linting and formatting
5. **Conventional Commits**: Standardized commit message format for better history

## Bypassing Hooks (Emergency Only)

If you need to bypass hooks in an emergency:

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

**Note**: This should only be used in critical situations and the bypassed checks should be run manually afterward.
