# Test AI Translation

## What you can ask for
A collection of blog posts with titles, content, and metadata.

## How you can narrow it
- Filter by author name
- Search through post titles and content
- Filter by publication status (draft, published, archived)
- Filter by category or tags
- Sort by creation date or title
- Paginate results

## What you get back
A list of blog posts with pagination information.

## What a single item looks like
Each blog post has a unique ID, title, content excerpt, author name, publication status, category, tags, creation date, and last modified date.

## Belongs to
Posts are owned by their authors.

## How you can combine filters
You can mix conditions with all of these (AND) or any of these (OR). Examples:
- Show published posts by a specific author in the "Technology" category
- Show posts with "AI" in the title OR content that were created in the last 30 days
- Show draft posts with high priority tags


```readerspec
{
  "resource": "blog_posts",
  "fields": [
    {
      "name": "id",
      "type": "id",
      "desc": "Unique identifier for the blog post"
    },
    {
      "name": "title",
      "type": "string",
      "desc": "Title of the blog post"
    },
    {
      "name": "contentExcerpt",
      "type": "string",
      "desc": "Excerpt of the blog post content"
    },
    {
      "name": "authorName",
      "type": "string",
      "desc": "Name of the author of the blog post"
    },
    {
      "name": "status",
      "type": "string",
      "desc": "Publication status of the blog post (draft, published, archived)"
    },
    {
      "name": "category",
      "type": "string",
      "desc": "Category of the blog post"
    },
    {
      "name": "tags",
      "type": "array",
      "desc": "Tags associated with the blog post"
    },
    {
      "name": "createdAt",
      "type": "datetime",
      "desc": "Creation date of the blog post"
    },
    {
      "name": "updatedAt",
      "type": "datetime",
      "desc": "Last modified date of the blog post"
    }
  ],
  "filters": [
    {
      "field": "authorName",
      "op": "equals",
      "values": ["string"]
    },
    {
      "field": "q",
      "op": "search",
      "target": "title"
    },
    {
      "field": "status",
      "op": "in",
      "values": ["draft", "published", "archived"]
    },
    {
      "field": "category",
      "op": "equals",
      "values": ["string"]
    },
    {
      "field": "tags",
      "op": "in",
      "values": ["string"]
    },
    {
      "field": "createdAt",
      "op": "range",
      "values": ["2024-01-01", "2024-12-31"]
    }
  ],
  "sort": [
    {
      "field": "createdAt",
      "dir": ["ascending", "descending"]
    },
    {
      "field": "title",
      "dir": ["ascending", "descending"]
    }
  ],
  "paginate": {
    "maxPer": 100,
    "defaultPer": 10,
    "startPage": 1
  },
  "ownership": {
    "by": "author"
  },
  "returns": [
    "A list of blog posts",
    "Pagination information"
  ]
}
```