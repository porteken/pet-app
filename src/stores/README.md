# Stores

This folder contains global state management stores.

## Guidelines

- Use for application-wide state that needs to be shared across features
- Keep feature-specific state within the feature folder
- Consider using React Query for server state management
- Use Zustand, Redux Toolkit, or Context API for client state

## Examples

Future stores might include:

- `authStore`: User authentication state
- `themeStore`: Application theme preferences
- `notificationStore`: Global notification system
- `cacheStore`: Application-level caching
