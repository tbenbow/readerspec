import {
  ReaderSpec,
  Field,
  Filter,
  SortOption,
  PaginationOptions,
  OwnershipOptions,
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
  warnings?: string[];
}

export function validateReaderSpec(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Data must be an object'] };
  }

  const spec = data as Record<string, unknown>;

  // Validate required top-level fields
  if (!spec.resource || typeof spec.resource !== 'string') {
    errors.push('resource must be a string');
  }

  if (!Array.isArray(spec.fields)) {
    errors.push('fields must be an array');
  } else {
    spec.fields.forEach((field, index) => {
      const fieldErrors = validateField(field, index);
      errors.push(...fieldErrors);
    });
  }

  if (!Array.isArray(spec.filters)) {
    errors.push('filters must be an array');
  } else {
    // Check for duplicate filter field names
    const filterFields = new Set<string>();
    spec.filters.forEach((filter, index) => {
      const f = filter as Record<string, unknown>;
      if (f.field && typeof f.field === 'string') {
        if (filterFields.has(f.field)) {
          errors.push(
            `filters[${index}]: Duplicate filter field "${f.field}". Each filter must have a unique field name.`
          );
        } else {
          filterFields.add(f.field);
        }
      }

      const filterErrors = validateFilter(filter, index);
      errors.push(...filterErrors);
    });
  }

  if (!Array.isArray(spec.sort)) {
    errors.push('sort must be an array');
  } else {
    // Check for duplicate sort field names
    const sortFields = new Set<string>();
    spec.sort.forEach((sortOption, index) => {
      const s = sortOption as Record<string, unknown>;
      if (s.field && typeof s.field === 'string') {
        if (sortFields.has(s.field)) {
          errors.push(
            `sort[${index}]: Duplicate sort field "${s.field}". Each sort option must have a unique field name.`
          );
        } else {
          sortFields.add(s.field);
        }
      }

      const sortErrors = validateSortOption(sortOption, index);
      errors.push(...sortErrors);
    });
  }

  if (!spec.paginate || typeof spec.paginate !== 'object') {
    errors.push('paginate must be an object');
  } else {
    const paginationErrors = validatePagination(
      spec.paginate as Record<string, unknown>
    );
    errors.push(...paginationErrors);
  }

  if (!spec.ownership || typeof spec.ownership !== 'object') {
    errors.push('ownership must be an object');
  } else {
    const ownershipErrors = validateOwnership(
      spec.ownership as Record<string, unknown>
    );
    errors.push(...ownershipErrors);
  }

  if (!Array.isArray(spec.returns)) {
    errors.push('returns must be an array');
  } else {
    spec.returns.forEach((returnField, index) => {
      if (typeof returnField !== 'string') {
        errors.push(`returns[${index}] must be a string`);
      }
    });
  }

  const suggestions = generateSuggestions(spec, errors);
  const warnings = generateWarnings(spec);

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    warnings,
  };
}

function validateField(field: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!field || typeof field !== 'object') {
    return [`fields[${index}] must be an object`];
  }

  const f = field as Record<string, unknown>;

  if (!f.name || typeof f.name !== 'string') {
    errors.push(`fields[${index}].name must be a string`);
  }

  if (!f.type || typeof f.type !== 'string') {
    errors.push(`fields[${index}].type must be a string`);
  } else {
    const validTypes = ['string', 'boolean', 'number', 'array'];
    if (!validTypes.includes(f.type)) {
      errors.push(
        `fields[${index}].type must be one of: ${validTypes.join(', ')}. Got "${f.type}". Use "string" for IDs, dates, and text content.`
      );
    }
  }

  if (f.desc !== undefined && typeof f.desc !== 'string') {
    errors.push(`fields[${index}].desc must be a string if provided`);
  }

  if (f.relation !== undefined && typeof f.relation !== 'string') {
    errors.push(`fields[${index}].relation must be a string if provided`);
  }

  return errors;
}

function validateFilter(filter: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!filter || typeof filter !== 'object') {
    return [`filters[${index}] must be an object`];
  }

  const f = filter as Record<string, unknown>;

  if (!f.field || typeof f.field !== 'string') {
    errors.push(`filters[${index}].field must be a string`);
  }

  if (!f.op || typeof f.op !== 'string') {
    errors.push(`filters[${index}].op must be a string`);
  } else {
    const validOps = ['equals', 'search', 'contains', 'in', 'range'];
    if (!validOps.includes(f.op)) {
      errors.push(
        `filters[${index}].op must be one of: ${validOps.join(', ')}. Got "${f.op}". Did you mean "search" or "contains"?`
      );
    }
  }

  if (
    f.op === 'equals' &&
    (!Array.isArray(f.values) ||
      f.values.length === 0 ||
      !f.values.every((v) => typeof v === 'string'))
  ) {
    errors.push(
      `filters[${index}].values must be a non-empty array of strings for equals operation`
    );
  }

  if (
    (f.op === 'search' || f.op === 'contains') &&
    (!f.target || typeof f.target !== 'string')
  ) {
    errors.push(
      `filters[${index}].target must be a string for ${f.op} operation`
    );
  }

  if (
    (f.op === 'in' || f.op === 'range') &&
    (!Array.isArray(f.values) ||
      f.values.length === 0 ||
      !f.values.every((v) => typeof v === 'string'))
  ) {
    errors.push(
      `filters[${index}].values must be a non-empty array of strings for ${f.op} operation`
    );
  }

  return errors;
}

function validateSortOption(sortOption: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!sortOption || typeof sortOption !== 'object') {
    return [`sort[${index}] must be an object`];
  }

  const s = sortOption as Record<string, unknown>;

  if (!s.field || typeof s.field !== 'string') {
    errors.push(`sort[${index}].field must be a string`);
  }

  if (!Array.isArray(s.dir) || !s.dir.every((d) => typeof d === 'string')) {
    errors.push(`sort[${index}].dir must be an array of strings`);
  }

  return errors;
}

function validatePagination(paginate: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (typeof paginate.maxPer !== 'number' || paginate.maxPer <= 0) {
    errors.push('paginate.maxPer must be a positive number');
  }

  if (typeof paginate.defaultPer !== 'number' || paginate.defaultPer <= 0) {
    errors.push('paginate.defaultPer must be a positive number');
  }

  if (typeof paginate.startPage !== 'number' || paginate.startPage < 1) {
    errors.push('paginate.startPage must be a number >= 1');
  }

  // Only do this comparison if both values are numbers
  if (
    typeof paginate.defaultPer === 'number' &&
    typeof paginate.maxPer === 'number'
  ) {
    if (paginate.defaultPer > paginate.maxPer) {
      errors.push('paginate.defaultPer cannot be greater than paginate.maxPer');
    }
  }

  return errors;
}

function validateOwnership(ownership: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!ownership.by || typeof ownership.by !== 'string') {
    errors.push('ownership.by must be a string');
  }

  return errors;
}

function generateSuggestions(
  spec: Record<string, unknown>,
  errors: string[]
): string[] {
  const suggestions: string[] = [];

  // Check for common "contains" usage that should be "search"
  if (Array.isArray(spec.filters)) {
    const filterFields = new Set<string>();

    spec.filters.forEach((filter: unknown, index: number) => {
      const f = filter as Record<string, unknown>;

      // Check for duplicate filter field names
      if (f.field && typeof f.field === 'string') {
        if (filterFields.has(f.field)) {
          suggestions.push(
            `filters[${index}]: Duplicate filter field "${f.field}". Consider combining filters or using different field names.`
          );
        } else {
          filterFields.add(f.field);
        }
      }

      if (f.op === 'contains' && f.values && !f.target) {
        suggestions.push(
          `filters[${index}]: Consider using "search" with "target" field instead of "contains" with "values" for better clarity`
        );
      }

      // Check for empty values arrays
      if (
        (f.op === 'equals' || f.op === 'in' || f.op === 'range') &&
        Array.isArray(f.values) &&
        f.values.length === 0
      ) {
        suggestions.push(
          `filters[${index}]: Empty values array not allowed. Use ["string"] for generic values or provide specific examples.`
        );
      }
    });
  }

  // Check for missing common fields
  if (Array.isArray(spec.fields)) {
    const fieldNames = spec.fields.map((f: any) => f.name);
    if (!fieldNames.includes('id') && !fieldNames.includes('_id')) {
      suggestions.push(
        'Consider adding an "id" field for unique identification'
      );
    }
    if (
      !fieldNames.includes('createdAt') &&
      !fieldNames.includes('created_at')
    ) {
      suggestions.push(
        'Consider adding a "createdAt" field for tracking creation time'
      );
    }
  }

  return suggestions;
}

function generateWarnings(spec: Record<string, unknown>): string[] {
  const warnings: string[] = [];

  // Check for potential performance issues
  if (Array.isArray(spec.filters)) {
    const searchFilters = spec.filters.filter(
      (f: any) => f.op === 'search' || f.op === 'contains'
    );
    if (searchFilters.length > 2) {
      warnings.push(
        'Multiple search filters may impact performance. Consider consolidating search operations.'
      );
    }
  }

  // Check pagination limits
  if (spec.paginate && typeof spec.paginate === 'object') {
    const paginate = spec.paginate as Record<string, unknown>;
    if (typeof paginate.maxPer === 'number' && paginate.maxPer > 1000) {
      warnings.push(
        'Very high maxPer values may impact performance. Consider limiting to 1000 or less.'
      );
    }
  }

  return warnings;
}
