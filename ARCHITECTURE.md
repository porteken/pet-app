# Project Structure

This project follows the [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture patterns for scalable and maintainable React applications.

## 📁 Structure Overview

```
src/
├── app/                 # Next.js App Router (application layer)
│   ├── routes/         # Application routes/pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Root page
├── assets/             # Static files (images, fonts, etc.)
├── components/         # Shared components
│   ├── ui/            # UI components
│   └── providers/     # React providers
├── config/             # Global configurations
│   └── supabase/      # Database configuration
├── features/           # Feature-based modules
│   ├── about/         # About page feature
│   ├── home/          # Home page feature
│   ├── page/          # Location page feature
│   └── header-bar/    # Header navigation feature
├── hooks/              # Shared custom hooks
├── lib/                # Reusable libraries
│   ├── api/           # API client functions
│   ├── actions/       # Server actions
│   ├── constants/     # Application constants
│   └── utils/         # Utility functions
├── stores/             # Global state stores
├── testing/            # Test utilities and mocks
├── types/              # Shared TypeScript types
└── utils/              # Shared utility functions
```

## 🔄 Data Flow Architecture

The project enforces a **unidirectional data flow** architecture:

```
shared (components, hooks, lib, utils, config, stores)
  ↓
features (business logic modules)
  ↓
app (Next.js routes and layouts)
```

### Flow Rules:

- ✅ **App** can import from **features** and **shared**
- ✅ **Features** can import from **shared** modules
- ❌ **Features** cannot import from other **features**
- ❌ **Shared** modules cannot import from **features** or **app**

## 📦 Feature Structure

Each feature is self-contained and follows this pattern:

```
src/features/feature-name/
├── components/         # Feature-specific components
├── hooks/             # Feature-specific hooks
├── types.ts           # Feature-specific types
├── utils.ts           # Feature-specific utilities
├── api/               # Feature-specific API calls (optional)
├── stores/            # Feature-specific state (optional)
└── __tests__/         # Feature tests
```

## 🛡️ ESLint Enforcement

The project uses ESLint rules to enforce these architectural boundaries:

- Prevents cross-feature imports
- Enforces unidirectional data flow
- Maintains clear separation of concerns

## 📚 Guidelines

### Features

- Keep features independent and self-contained
- Don't import from other features
- Compose features at the app level
- Include comprehensive tests

### Shared Modules

- Create reusable, framework-agnostic utilities
- Keep focused on single responsibilities
- Avoid feature-specific logic
- Document APIs clearly

### Performance

- No barrel files (direct imports for better tree-shaking)
- Lazy load features when possible
- Optimize bundle splitting

## 🧪 Testing Strategy

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test feature interactions with MSW
- **E2E Tests**: Test complete user workflows with Playwright

## 🔗 Related Docs

- [Bulletproof React Guide](https://github.com/alan2207/bulletproof-react)
- [Testing Documentation](./TESTING.md)
- [Performance Guidelines](./PERFORMANCE.md)
