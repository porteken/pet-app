# Test Utilities Consolidation

This directory contains consolidated mock utilities and test helpers to reduce code duplication across test files.

## Structure

```
src/testing/
├── index.ts                 # Main export file
├── test-utilities.ts        # Common test setup functions
└── mocks/
    ├── next.ts             # Next.js related mocks (cookies, headers, SimpleLinearRegression)
    ├── supabase.ts         # Supabase client and query mocks
    └── validation.ts       # Validation function mocks
```

## Usage Examples

### API Client Tests

```typescript
import {
  clearAllMocks,
  mockSupabaseClient,
  mockValidationModule,
  setupApiClientTest,
} from "@/testing";

// Setup mocks
mockSupabaseClient();
mockValidationModule();

describe("API Function", () => {
  let mockSupabaseClient, mockValidation;

  beforeEach(async () => {
    clearAllMocks();
    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;
  });
});
```

### API Server Tests

```typescript
import {
  clearAllMocks,
  mockNextHeaders,
  mockSupabaseServer,
  setupApiServerTest,
} from "@/testing";

// Setup mocks
mockNextHeaders();
mockSupabaseServer();

describe("Server Function", () => {
  let mockCookieStore, mockSupabaseClient, mockLinearRegression;

  beforeEach(async () => {
    clearAllMocks();
    const setup = await setupApiServerTest();
    ({ mockCookieStore, mockSupabaseClient, mockLinearRegression } = setup);
  });
});
```

### Next.js Actions Tests

```typescript
import { clearAllMocks, mockNextHeaders, setupActionsTest } from "@/testing";

mockNextHeaders();

describe("Actions", () => {
  let mockCookieStore;

  beforeEach(async () => {
    clearAllMocks();
    const setup = await setupActionsTest();
    mockCookieStore = setup.mockCookieStore;
  });
});
```

## Benefits

1. **Reduced Duplication**: Common mocking patterns are centralized
2. **Consistency**: All tests use the same mock implementations
3. **Maintainability**: Changes to mock behavior only need to be made in one place
4. **Type Safety**: Proper TypeScript types for all mock utilities
5. **Easier Testing**: Pre-configured setups for common test scenarios

## Mock Utilities Available

- **Supabase**: Client/server mocks with query builders
- **Validation**: All validation function mocks with default implementations
- **Next.js**: Headers, cookies, navigation, dynamic imports
- **UI Libraries**: Mantine, React Plotly mocks
- **Browser APIs**: matchMedia and other browser API mocks

## Query Builder Helpers

The Supabase mocks include helper functions for common query patterns:

- `createMockQueryWithData(data, error?)` - Query that resolves with data
- `createMockQueryWithError(error)` - Query that resolves with error
- `createMockQueryWithRejection(error)` - Query that rejects
- `createMockServerQueryWithData(data, error?)` - Server-style chained eq queries
