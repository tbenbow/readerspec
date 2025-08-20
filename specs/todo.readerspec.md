# Resource: Todo

## What you can ask for
- All todos
- Only the ones that are done
- Only the ones still open
- Only those matching a search word

## How you can narrow it
- Filter by: done is yes|no
- Sort by: createdAt (ascending | descending)
- Show page 1, with 20 per page (max 100)

## What you get back each time
- A list of Todo items
- Page number, items per page, total matching items

## What a single Todo looks like
- id: a unique label
- text: the note
- done: yes or no
- createdAt: when it was first written

## Belongs to
- Each Todo belongs to one User (the person who created it)

## Notes
- Search word looks inside the text

```readerspec
{
  "resource": "Todo",
  "fields": [
    { "name": "id", "type": "id", "desc": "unique label" },
    { "name": "text", "type": "string" },
    { "name": "done", "type": "boolean" },
    { "name": "createdAt", "type": "datetime" },
    { "name": "userId", "type": "id", "relation": "User" }
  ],
  "filters": [
    { "field": "done", "op": "equals", "values": ["yes", "no"] },
    { "field": "q", "op": "search", "target": "text" }
  ],
  "sort": [{ "field": "createdAt", "dir": ["asc", "desc"] }],
  "paginate": { "maxPer": 100, "defaultPer": 20, "startPage": 1 },
  "ownership": { "by": "userId" },
  "returns": ["items", "page", "per", "total"]
}
```
