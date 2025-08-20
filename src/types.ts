export interface CommandOptions {
  specs?: string;
  output?: string;
  port?: string;
  open?: boolean;
}

export interface ReaderSpec {
  resource: string;
  fields: Field[];
  filters: Filter[];
  sort: SortOption[];
  paginate: PaginationOptions;
  ownership: OwnershipOptions;
  returns: string[];
}

export interface Field {
  name: string;
  type: string;
  desc?: string;
  relation?: string;
}

export interface Filter {
  field: string;
  op: 'equals' | 'search' | 'in' | 'range';
  values?: string[];
  target?: string;
}

export interface SortOption {
  field: string;
  dir: string[];
}

export interface PaginationOptions {
  maxPer: number;
  defaultPer: number;
  startPage: number;
}

export interface OwnershipOptions {
  by: string;
}

export interface AITranslationOptions {
  openaiApiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface HumanReadableSection {
  type:
    | 'what'
    | 'how'
    | 'returns'
    | 'example'
    | 'belongs'
    | 'notes'
    | 'combine';
  content: string;
  title?: string;
}

export interface MarkdownParseResult {
  humanSections: HumanReadableSection[];
  jsonBlock?: string;
  hasJsonBlock: boolean;
}

export interface AITranslationResult {
  success: boolean;
  jsonBlock?: string;
  error?: string;
  confidence?: number;
}
