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
{
  "resource": "string",
  "fields": [{"name": "string", "type": "string", "desc": "string"}],
  "filters": [{"field": "string", "op": "string", "values": ["string"]}],
  "sort": [{"field": "string", "dir": ["string"]}],
  "paginate": {"maxPer": number, "defaultPer": number, "startPage": number},
  "ownership": {"by": "string"},
  "returns": ["string"]
}

Only return the JSON block, no additional text.`;

  return prompt;
}
