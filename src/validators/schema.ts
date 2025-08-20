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
    spec.filters.forEach((filter, index) => {
      const filterErrors = validateFilter(filter, index);
      errors.push(...filterErrors);
    });
  }

  if (!Array.isArray(spec.sort)) {
    errors.push('sort must be an array');
  } else {
    spec.sort.forEach((sortOption, index) => {
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

  return {
    isValid: errors.length === 0,
    errors,
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
    const validOps = ['equals', 'search', 'in', 'range'];
    if (!validOps.includes(f.op)) {
      errors.push(
        `filters[${index}].op must be one of: ${validOps.join(', ')}`
      );
    }
  }

  if (
    f.op === 'equals' &&
    (!Array.isArray(f.values) || !f.values.every((v) => typeof v === 'string'))
  ) {
    errors.push(
      `filters[${index}].values must be an array of strings for equals operation`
    );
  }

  if (f.op === 'search' && (!f.target || typeof f.target !== 'string')) {
    errors.push(
      `filters[${index}].target must be a string for search operation`
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
