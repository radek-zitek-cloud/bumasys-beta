# Dynamic Configuration Example

This demonstrates how to add new configuration fields without modifying code.

## Before (the problem)

Previously, adding a new configuration field like `logging.level` required:

1. Adding it to the Zod schema in `config.ts`
2. Adding it to the `loadConfig()` function
3. Modifying the TypeScript types

## After (the solution)

Now you can add any configuration field by simply:

1. Adding it to the JSON config files
2. Optionally adding environment variable mapping
3. Using it directly in code

## Example: Adding a new feature flag

### 1. Add to config/default.json

```json
{
  "newFeature": {
    "enabled": true,
    "options": {
      "maxRetries": 3,
      "timeout": 5000
    }
  }
}
```

### 2. Add environment variable mapping (optional)

In `config/custom-environment-variables.json`:

```json
{
  "newFeature": {
    "enabled": "NEW_FEATURE_ENABLED",
    "options": {
      "maxRetries": "NEW_FEATURE_MAX_RETRIES",
      "timeout": "NEW_FEATURE_TIMEOUT"
    }
  }
}
```

### 3. Use in your code immediately

```typescript
import config from './utils/config';

// No code changes needed in config.ts!
if (config.newFeature.enabled) {
  console.log('New feature is enabled');
  console.log('Max retries:', config.newFeature.options.maxRetries);
}
```

### 4. Override with environment variables

```bash
NEW_FEATURE_ENABLED=false npm start
NEW_FEATURE_MAX_RETRIES=5 npm start
```

## What's Still Validated

Critical security fields remain validated:

- `port` (must be positive integer)
- `jwtSecret` (must be at least 10 characters)

## Best Practices

✅ **Do**: Add non-critical config fields directly to JSON
✅ **Do**: Use environment variables for deployment-specific overrides  
✅ **Do**: Add validation in `config.ts` only for security-critical fields
❌ **Don't**: Store secrets in JSON files (use environment variables)
❌ **Don't**: Add validation for every config field (defeats the purpose)

This approach follows Node.js ecosystem best practices and provides the flexibility you requested while maintaining security for critical configuration.
