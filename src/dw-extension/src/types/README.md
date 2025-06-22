# DealWizard Extension Types Documentation

This document provides an overview of the TypeScript type system used throughout the DealWizard Chrome Extension.

## Directory Structure

```
src/
  types/             # Common interfaces and types
    api-responses.ts # API response interfaces
    global.ts        # Global window extensions
    index.ts         # Main export file for all types
    messages.ts      # Extension messaging types
    settings.ts      # Extension settings types
    ui-models.ts     # UI component interfaces
    utils.ts         # Utility interfaces
  models/            # Business model implementations
    deal-model.ts    # Deal model class
    goal-model.ts    # Goal model class
    strategy-model.ts # Strategy model class
```

## Type System Overview

The type system is designed to:
1. Provide consistent interfaces across the application
2. Enable strong typing for all components and communication
3. Separate interface definitions from implementation
4. Centralize related types for easier maintenance

## Key Type Groups

### API Responses
Found in `types/api-responses.ts`, these interfaces define the structure of data returned from external APIs such as Bubble.io.

### Extension Messaging
Found in `types/messages.ts`, these interfaces define the structure of messages passed between different parts of the extension (content script, background script, popup).

### UI Models
Found in `types/ui-models.ts`, these interfaces define the data structures used by UI components.

### Settings and Configuration
Found in `types/settings.ts`, these interfaces define the extension settings and storage structures.

### Utility Types
Found in `types/utils.ts`, these interfaces define types for utility functions like logging and analytics.

## Models

The models directory contains concrete implementations of business objects that implement the interfaces defined in the types directory:

- `DealModel`: Represents a property investment deal with analysis metrics
- `GoalModel`: Represents an investment goal set by the user
- `StrategyModel`: Represents an investment strategy with parameters

## Best Practices

1. Always import types from the centralized type files rather than defining inline
2. Add new types to the appropriate type file based on their purpose
3. Keep interfaces focused on data structures, not implementation details
4. Use type guards when narrowing types
5. Prefer interfaces over type aliases for object shapes
6. Use the `index.ts` export for importing multiple types
