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
  "resource": "todos",
  "fields": [
    {
      "name": "id",
      "type": "id",
      "desc": "a unique label"
    },
    {
      "name": "text",
      "type": "string",
      "desc": "the note"
    },
    {
      "name": "done",
      "type": "boolean",
      "desc": "yes or no"
    },
    {
      "name": "createdAt",
      "type": "datetime",
      "desc": "when it was first written"
    }
  ],
  "filters": [
    {
      "field": "done",
      "op": "in",
      "values": ["yes", "no"]
    },
    {
      "field": "q",
      "op": "search",
      "target": "text"
    }
  ],
  "sort": [
    {
      "field": "createdAt",
      "dir": ["ascending", "descending"]
    }
  ],
  "paginate": {
    "maxPer": 100,
    "defaultPer": 20,
    "startPage": 1
  },
  "ownership": {
    "by": "User"
  },
  "returns": [
    "A list of Todo items",
    "Page number",
    "Items per page",
    "Total matching items"
  ]
}
```