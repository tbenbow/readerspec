# ReaderSpec

**Generate production-ready APIs from human-readable markdown specifications.**

ReaderSpec takes the complexity out of API development by letting you describe your API in plain English, then automatically generating everything you need: Express routes, validation, documentation, and more.

## ✨ What You Get

- **🚀 Instant API** - Generate a working Express.js API in seconds
- **📝 Human-First** - Write your API spec in plain English markdown
- **🤖 AI-Powered** - AI automatically translates your descriptions to machine-readable JSON
- **📚 Complete Docs** - Auto-generated OpenAPI specs, Postman collections, and TypeScript types
- **🔒 Built-in Security** - Automatic ownership filtering and validation
- **⚡ Live Development** - Watch files and auto-regenerate on changes

## 🎯 Perfect For

- **Product teams** who want to prototype APIs without engineering overhead
- **Frontend developers** who need a backend API quickly
- **Full-stack developers** who want to focus on business logic, not boilerplate
- **Anyone** who believes APIs should be simple and human-friendly

## 🚀 Quick Start

### **What You'll Do**

1. **📝 Write** your API spec in plain English
2. **🤖 Translate** your API spec to json `npm run translate`
2. **🔨 Generate** your API `npm run build` 
4. **🚀 Run** your API server `npm run dev`

---

### 1. Install ReaderSpec

```bash
# Install dependencies
npm install

# Set up environment variables (optional - for AI features)
cp .env.example .env
# Edit .env and add your OpenAI API key: https://platform.openai.com/account/api-keys

# Generate your API
npm run build
```

### 2. Create Your First API Spec

Create a file called `specs/todo.readerspec.md`:

```markdown
# Todo API

## What you can ask for
A collection of todo items with text, completion status, and creation dates.

## How you can narrow it
- Filter by completion status (done/not done)
- Search through todo text
- Sort by creation date
- Paginate results

## What you get back
A list of todos with pagination information.

## What a single item looks like
Each todo has an ID, text content, completion status, creation date, and user ID.

## Belongs to
Todos are owned by individual users.

## How you can combine filters
You can mix conditions with AND logic. Examples:
- Show completed todos created in the last week
- Show todos with "urgent" in the text that aren't done yet
```

### 3. Generate and Run Your API

```bash
# Translate markdown into valid JSON
npm run translate

# Generate Express routes, validation, and docs from your spec
npm run build

# Start your API server
npm run dev
```

### 4. Test Your API

```bash
# Health check
curl http://localhost:3000/health

# List todos
curl http://localhost:3000/todos

# Filter todos
curl "http://localhost:3000/todos?done=yes&page=1&per=10"
```

**That's it!** You now have a fully functional API with filtering, sorting, pagination, and ownership scoping.

## 🤖 AI Translation (Optional)

ReaderSpec can automatically convert your human-readable descriptions to structured JSON using AI:

1. **Get an OpenAI API key** from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. **Add it to your `.env` file**: `OPEN_AI_API_KEY=your-key-here`
3. **Use the translate command**:
   ```bash
   # Convert your spec to JSON
   npm run translate -- --file specs/todo.readerspec.md
   
   # Watch mode: automatically translate as you edit
   npm run translate -- --watch
   ```

**Note:** AI translation is completely optional. You can still use ReaderSpec without it.

## 📚 What You Get After Building

After running `npm run build`, you'll find everything you need in the `apps/api/` directory:

- **🚀 Working API Server** - Ready to run with `npm run dev`
- **📋 Postman Collection** - Import into Postman for easy testing
- **📖 OpenAPI Spec** - Interactive API documentation
- **💻 TypeScript Types** - For frontend integration


## 📚 Docs

Need more technical details? Check out our developer guide:

- 📖 **[Schema Reference](docs/SCHEMA.md)** - Describes the JSON format ReaderSpec expects.
- 📖 **[Changelog](docs/CHANGELOG.md)** - All notable changes documented in this file.
- 📖 **[Developer Guide](docs/DEVELOPER.md)** - Advanced features, troubleshooting, and technical deep-dives.
- 📖 **[Testing Guide](docs/TESTING.md)** - Detailed instructions for testing the application.
- 📖 **[CI/CD SETUP](docs/CI_CD.md)** - Set up the complete CI/CD pipeline for ReaderSpec.

## License

MIT License - see [LICENSE](LICENSE) for details.
