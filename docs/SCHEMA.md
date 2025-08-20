# 📋 ReaderSpec JSON Schema

This document describes the JSON format that ReaderSpec expects in the machine-readable block of your `.readerspec.md` files.

## 🎯 Overview

Each `.readerspec.md` file contains two parts:
1. **Human-readable sections** (markdown prose)
2. **Machine-readable JSON block** (fenced with ```readerspec)

The JSON block is the single source of truth for code generation.

## 🔧 Complete Schema

```typescript
interface ReaderSpec {
  resource: string;           // Name of the resource (e.g., "Todo", "BlogPost")
  fields: Field[];           // Array of field definitions
  filters: Filter[];         // Available filtering options
  sort: SortOption[];        // Available sorting options
  paginate: PaginationOptions; // Pagination configuration
  ownership: OwnershipOptions;  // Ownership/access control
  returns: string[];         // What the API returns
}
```

## 📝 Field Definitions

```typescript
interface Field {
  name: string;              // Field name (e.g., "id", "title", "createdAt")
  type: string;              // Data type (see supported types below)
  desc?: string;             // Optional description
  relation?: string;         // Optional relation to another resource
}
```

### Supported Field Types

| Type | Description | Example Values |
|------|-------------|----------------|
| `id` | Unique identifier | UUID, auto-generated ID |
| `string` | Text content | "Hello world", "Title" |
| `boolean` | True/false value | "yes"/"no" (string format) |
| `datetime` | Date and time | ISO 8601 format |
| `number` | Numeric value | 42, 3.14, -1 |
| `array` | List of values | ["tag1", "tag2"] |

## 🔍 Filter Definitions

```typescript
interface Filter {
  field: string;             // Field to filter on
  op: 'equals' | 'search' | 'in' | 'range';  // Filter operation
  values?: string[];         // Valid values for equals/in filters
  target?: string;           // For search: which field to search in
}
```

### Filter Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `equals` | Exact match | `done: "yes"` |
| `search` | Text search | `q: "urgent"` |
| `contains` | Text search (alias for search) | `q: "urgent"` |
| `in` | Match any value in list | `category: ["tech", "news"]` |
| `range` | Numeric/date range | `createdAt: "2024-01-01..2024-12-31"` |

## 📊 Sort Definitions

```typescript
interface SortOption {
  field: string;             // Field to sort by
  dir: string[];             // Available sort directions
}
```

### Sort Directions

| Direction | Description |
|-----------|-------------|
| `"asc"` | Ascending (A-Z, 1-9, oldest first) |
| `"desc"` | Descending (Z-A, 9-1, newest first) |

## 📄 Pagination Configuration

```typescript
interface PaginationOptions {
  maxPer: number;            // Maximum items per page
  defaultPer: number;        // Default items per page
  startPage: number;         // Starting page number (usually 1)
}
```

## 🔐 Ownership Configuration

```typescript
interface OwnershipOptions {
  by: string;                // Field name that identifies the owner
}
```

This field is used to filter results by user ownership. The API will automatically filter results based on the `x-user-id` header.

## 📤 Return Configuration

```typescript
returns: string[];           // Array of strings describing what's returned
```

This is primarily for documentation purposes. Common values include:
- `"items"` - The actual data items
- `"page"` - Current page number
- `"per"` - Items per page
- `"total"` - Total number of matching items

## 📖 Complete Example

Here's a complete example for a Todo resource:

```json
{
  "resource": "Todo",
  "fields": [
    { "name": "id", "type": "id", "desc": "Unique identifier" },
    { "name": "text", "type": "string", "desc": "Todo text content" },
    { "name": "done", "type": "boolean", "desc": "Completion status" },
    { "name": "createdAt", "type": "datetime", "desc": "Creation timestamp" },
    { "name": "userId", "type": "id", "relation": "User", "desc": "Owner of the todo" }
  ],
  "filters": [
    { "field": "done", "op": "equals", "values": ["yes", "no"] },
    { "field": "q", "op": "search", "target": "text" }
    // Note: "contains" is also valid and equivalent to "search"
  ],
  "sort": [
    { "field": "createdAt", "dir": ["asc", "desc"] },
    { "field": "text", "dir": ["asc", "desc"] }
  ],
  "paginate": {
    "maxPer": 100,
    "defaultPer": 20,
    "startPage": 1
  },
  "ownership": {
    "by": "userId"
  },
  "returns": ["items", "page", "per", "total"]
}
```

## 🚨 Validation Rules

- **Required fields**: All top-level fields are required
- **Field names**: Must be valid JavaScript identifiers
- **Type consistency**: Field types must match the supported types
- **Filter fields**: Must reference actual field names
- **Sort fields**: Must reference actual field names
- **Ownership field**: Must reference an actual field name

## 🔧 Validation Command

Use the validation command to check your specs:

```bash
npm run check
```

This will validate all `.readerspec.md` files and report any schema violations.

## 💡 Tips for Manual JSON Writing

1. **Start with fields**: Define what data your resource contains
2. **Add filters**: Think about how users will want to narrow results
3. **Consider sorting**: What are the most useful sort orders?
4. **Set pagination**: Reasonable defaults for your use case
5. **Plan ownership**: How will you handle multi-user access?
6. **Test validation**: Use `npm run check` to catch errors early

## 🤖 AI Translation Alternative

If you prefer to write in plain English, you can use AI translation:

```bash
npm run translate -- --file specs/your-spec.readerspec.md
```

The AI will convert your human-readable descriptions into valid JSON following this schema.
