# Playwright Tests

This directory contains end-to-end tests for the Pet App using Playwright.

## Test Files

- `home.spec.ts` - Tests for the home page functionality
- `about.spec.ts` - Tests for the about page
- `map.spec.ts` - Tests for the map page
- `map-interactions.spec.ts` - Tests for map interactions (markers, popups)
- `dynamic-route.spec.ts` - Tests for location-specific pages

## Test Configuration

The tests are configured in `playwright.config.ts` and will:

- Start the Next.js dev server automatically before running tests
- Run tests against Chrome, Firefox, and Safari
- Generate HTML reports
- Use `http://localhost:3001` as the base URL
