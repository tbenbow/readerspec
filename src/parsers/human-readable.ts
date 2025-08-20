import { HumanReadableSection, MarkdownParseResult } from '../types';

export function parseHumanReadableSections(
  content: string
): MarkdownParseResult {
  const lines = content.split('\n');
  const humanSections: HumanReadableSection[] = [];
  let currentSection: HumanReadableSection | null = null;
  let jsonBlock: string | undefined;
  let hasJsonBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for JSON block
    if (line.trim().startsWith('```readerspec')) {
      hasJsonBlock = true;
      const jsonLines: string[] = [];
      i++; // Skip the opening line

      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        jsonLines.push(lines[i]);
        i++;
      }

      if (jsonLines.length > 0) {
        jsonBlock = jsonLines.join('\n').trim();
      }
      continue;
    }

    // Check for section headers
    if (line.startsWith('## ')) {
      // Save previous section if exists
      if (currentSection) {
        humanSections.push(currentSection);
      }

      const title = line.substring(3).trim();
      const type = inferSectionType(title);

      currentSection = {
        type,
        content: '',
        title,
      };
    } else if (currentSection && line.trim()) {
      // Add content to current section
      currentSection.content += line + '\n';
    }
  }

  // Add the last section
  if (currentSection) {
    humanSections.push(currentSection);
  }

  return {
    humanSections,
    jsonBlock,
    hasJsonBlock,
  };
}

function inferSectionType(title: string): HumanReadableSection['type'] {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('what') || lowerTitle.includes('ask')) return 'what';
  if (lowerTitle.includes('how') || lowerTitle.includes('narrow')) return 'how';
  if (lowerTitle.includes('return') || lowerTitle.includes('get back'))
    return 'returns';
  if (lowerTitle.includes('example') || lowerTitle.includes('looks like'))
    return 'example';
  if (lowerTitle.includes('belong') || lowerTitle.includes('ownership'))
    return 'belongs';
  if (lowerTitle.includes('combine') || lowerTitle.includes('mix'))
    return 'combine';
  if (lowerTitle.includes('note')) return 'notes';

  return 'what'; // Default fallback
}

export function formatSectionsForAI(sections: HumanReadableSection[]): string {
  let prompt =
    'Based on the following human-readable API specification sections, generate a valid JSON block for the ReaderSpec format:\n\n';

  sections.forEach((section) => {
    prompt += `## ${section.title}\n${section.content}\n\n`;
  });

  prompt += `\nGenerate a JSON block that follows this schema:

## Required Fields:
- "resource": string (lowercase, plural, e.g., "todos", "blog_posts")
- "fields": array of field objects with name, type, and desc
- "filters": array of filter objects
- "sort": array of sort objects
- "paginate": object with maxPer, defaultPer, startPage
- "ownership": object with "by" field
- "returns": array of strings describing what's returned

## Field Types (use exactly these):
- "string" for text content, IDs, dates, and any text-based data
- "boolean" for yes/no values (use "yes"/"no" strings)
- "number" for numeric values
- "array" for lists

## Important Notes:
- Use "string" for IDs, dates, and timestamps (not "id" or "datetime")
- Each search filter should have a unique field name
- Avoid duplicate filter definitions
- All filter values arrays must contain actual values, not empty arrays

## Filter Operations (use exactly these):
- "equals": for exact matches, requires "values" array
- "search": for text search, requires "target" field (not "values")
- "contains": for text search, requires "target" field (not "values") - same as "search"
- "in": for matching any value in a list, requires "values" array
- "range": for numeric/date ranges, requires "values" array

## Common Patterns:
- Use "q" as field name for general search filters
- Use "createdAt" for creation timestamps
- Use "updatedAt" for modification timestamps
- Use "status" for state fields (draft, published, etc.)

## Important Notes:
- Sort objects must use "dir" (not "order") for direction field
- Sort directions must be full words: "ascending", "descending" (not "asc", "desc")
- Search filters must reference actual field names that exist in the fields array
- All filter values arrays must contain actual values, not empty arrays
- For "equals", "in", and "range" operations, provide meaningful example values
- Use "string" as a placeholder for generic string values

## Example Filter:
{"field": "q", "op": "search", "target": "text"}

## Example Sort:
{"field": "createdAt", "dir": ["ascending", "descending"]}

Only return the JSON block, no additional text.`;

  return prompt;
}
