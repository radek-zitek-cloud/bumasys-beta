# BetterStack Integration - Frontend

## Overview

BetterStack logging support has been added to the frontend configuration system. The frontend can now send logs to BetterStack using environment variables for configuration.

## Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# BetterStack Configuration (optional)
VITE_BETTERSTACK_TOKEN=your-betterstack-source-token-here
VITE_BETTERSTACK_ENDPOINT=https://logs.betterstack.com
VITE_BETTERSTACK_ENABLED=true
```

### Files Modified

1. **`fe/src/utils/config.ts`** - Added BetterStack configuration support
2. **`fe/src/utils/logger.ts`** - Updated to use BetterStack configuration from both backend and frontend
3. **`fe/src/services/config.ts`** - Updated to properly map frontend config to backend config interface
4. **`fe/.env.example`** - Added documentation for all environment variables
5. **`fe/.env.local.example`** - Created example local development configuration
6. **`fe/README.md`** - Added environment configuration documentation

## Usage

### Automatic Integration

When the `VITE_BETTERSTACK_TOKEN` environment variable is set, BetterStack logging will be automatically enabled. The logger will:

1. Try to use backend configuration first (if available)
2. Fall back to frontend configuration
3. Fall back to console logging if BetterStack is not configured

### Configuration Priority

1. **Backend Config** (from GraphQL API) - highest priority
2. **Frontend Config** (from environment variables) - fallback
3. **Console Logging** - final fallback

### Testing

You can test the configuration by:

1. Setting the `VITE_BETTERSTACK_TOKEN` environment variable
2. Starting the development server: `pnpm run dev`
3. Checking the browser console for log output (currently shows as console logs until actual BetterStack HTTP integration is implemented)

## Implementation Notes

- The actual HTTP requests to BetterStack are not yet implemented (marked with TODO comments)
- Currently logs are sent to console with `[BetterStack:level]` prefix when BetterStack is configured
- The logger gracefully handles cases where BetterStack is not available
- All configuration is optional - the app works without BetterStack configuration

## Next Steps

To complete the BetterStack integration:

1. Implement the actual HTTP POST requests to BetterStack endpoints
2. Add proper error handling and retry logic
3. Consider adding log batching for performance
4. Add metrics for monitoring log delivery success/failure
