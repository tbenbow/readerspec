# ReaderSpec 🚀

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

- **Frontend developers** who need a backend API quickly
- **Full-stack developers** who want to focus on business logic, not boilerplate
- **Product teams** who want to prototype APIs without engineering overhead
- **Anyone** who believes APIs should be simple and human-friendly

## 🚀 Quick Start

### 📋 **What You'll Do**

1. **📝 Write** your API spec in plain English
2. **🤖 Translate** to JSON (optional - using AI or manually)
3. **🔨 Build** Express routes, validation, and docs
4. **📁 Navigate** to the generated API directory
5. **🚀 Run** your API server

### 1. Install ReaderSpec

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key: https://platform.openai.com/account/api-keys

# Build the CLI tool
npm run build
```

### 🤖 AI Translation Features

ReaderSpec includes AI-powered translation that can automatically convert your human-readable descriptions to structured JSON. To enable this:

1. **Get an OpenAI API key** from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. **Copy the example environment file**: `cp .env.example .env`
3. **Edit `.env`** and add your API key: `OPEN_AI_API_KEY=your-key-here`

**Note:** AI translation is optional. You can still use ReaderSpec without it by manually writing JSON specs.

**Manual JSON Writing:** If you prefer to write JSON directly, see our [Schema Documentation](docs/SCHEMA.md) for the complete format specification.

**Watch Mode:** Use `npm run translate -- --watch` to automatically translate files as you edit them - perfect for iterative development!

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

### 3. Generate Your API

You have three main operations you can perform (usually in this order):

#### 🔨 **Build the API from Specs**
```bash
# Generate Express routes, validation, and docs from all .readerspec.md files
npm run build:api
```

#### 🤖 **AI Translation (Optional)**
```bash
# Convert human-readable descriptions to JSON using AI
npm run translate -- --file specs/todo.readerspec.md

# Or translate all spec files at once
npm run translate

# Watch mode: automatically translate files as they change
npm run translate -- --watch
```

#### 🚀 **Run the Generated Server**
```bash
# Navigate to the generated API directory
cd apps/api

# Start the Express server (auto-regenerates on spec changes)
npm run dev

# Or start without auto-regeneration
npm start
```

### 4. Test Your API

```bash
# Health check
curl http://localhost:3000/health

# List todos
curl http://localhost:3000/todo

# Filter todos
curl "http://localhost:3000/todo?done=yes&page=1&per=10"
```

> **💡 Note:** Make sure your server is running from the `apps/api/` directory before testing.

**That's it!** You now have a fully functional API with filtering, sorting, pagination, and ownership scoping.

> **💡 Pro Tip:** Enable AI translation by setting up your OpenAI API key in `.env` for automatic conversion of human-readable descriptions to structured specs.

## 📚 How to Read the Generated API Docs

After running `npm run build:api`, you'll find comprehensive documentation in the `apps/api/` directory:

### 📖 README.md
- **Start here!** Contains getting started guide and examples
- Explains each endpoint in plain English
- Shows practical curl examples for every feature
- Includes development setup instructions

### 🔍 OpenAPI Specification (openapi.yaml)
- **Import into Swagger UI** for interactive API exploration
- **Use with Postman** for API testing
- **Generate client libraries** for your frontend
- **Share with your team** for API documentation

### 📋 Postman Collection (postman-collection.json)
- **Import directly into Postman** - all requests are pre-configured
- **Test all endpoints** with example parameters
- **Use variables** for base URL and user ID
- **Built-in test scripts** for response validation

### 💻 TypeScript Types (types.ts)
- **Copy into your frontend project** for type safety
- **Use the included API client** for easy integration
- **Get autocomplete** and error checking in your IDE

## 🧪 Testing Your API

Ready to test your API? Check out our comprehensive testing guide:

📖 **[Testing Guide](docs/TESTING.md)** - Manual testing, Postman collections, automated testing, and performance testing.

**Quick Start:**
1. **Health check**: `curl http://localhost:3000/health`
2. **Test endpoints**: Use the generated Postman collection
3. **Automated testing**: Set up Jest and Supertest
4. **Follow the guide** in `docs/TESTING.md`

**Generated Files:**
- **Postman Collection**: `apps/api/postman-collection.json` - Import into Postman for easy testing
- **TypeScript Types**: `apps/api/types.ts` - Use in your frontend for type safety

## 🚀 Deployment

Ready to deploy your API? Check out our comprehensive deployment guide:

📖 **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step instructions for Render, Railway, Heroku, Vercel, Docker, and more.

**Quick Start:**
1. **Push your code** to GitHub
2. **Choose a platform** (Render recommended for beginners)
3. **Follow the guide** in `docs/DEPLOYMENT.md`

**Local Development:** Copy `.env.example` to `.env` and add your OpenAI API key for AI features.

## 🔧 Development

### 📋 **Documentation**
- **[Schema Reference](docs/SCHEMA.md)** - Complete JSON format specification
- **[Testing Guide](docs/TESTING.md)** - Testing strategies and examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Platform-specific deployment instructions
- **[CI/CD Setup](docs/CI_CD_SETUP.md)** - Complete CI/CD pipeline configuration

### Project Structure

```
readerspec/
├── specs/                  # Your API specifications
│   ├── todo.readerspec.md  # Todo API spec
│   └── blog.readerspec.md  # Blog API spec
├── src                     # ReaderSpec CLI tool
├── .env.example            # Environment variables template
├── apps/api/               # Generated API (after build)
│   ├── routes/             # Express routes
│   ├── services/           # Business logic
│   ├── validation/         # Zod schemas
│   ├── openapi.yaml        # API documentation
│   ├── README.md           # Usage guide
│   ├── types.ts            # TypeScript types
│   └── postman-collection.json # Testing collection
├── docs/                   # Documentation
│   ├── SCHEMA.md           # JSON schema reference
│   ├── TESTING.md          # Testing guide
│   └── DEPLOYMENT.md       # Deployment guide
└── README.md               # This file
```

### Development Commands

```bash
# Build the CLI tool
npm run build

# 1. Generate API from specs (creates Express routes, validation, docs)
npm run build:api

# 2. AI translation (optional - converts human text to JSON)
npm run translate -- --file specs/todo.readerspec.md
npm run translate  # translate all files
npm run translate -- --watch  # watch mode for auto-translation

# 3. Run the generated server
cd apps/api        # navigate to generated API
npm run dev        # with auto-regeneration
npm start          # without auto-regeneration

# Validate your specs
npm run check

# Translate human text to JSON using AI
npm run translate -- --file specs/todo.readerspec.md
```
> **Note:** AI translation requires an OpenAI API key set in your `.env` file.

**Typical Workflow:**
1. **Write specs** in human-readable format (or use AI translation)
2. **Build the API** from your specs
3. **Navigate to `apps/api/`** directory
4. **Run the server** to test your endpoints

**💡 Pro Tip:** Use `npm run translate -- --watch` for automatic AI translation as you write specs!

## Troubleshooting

**AI Translation Not Working?**
- Check that `OPEN_AI_API_KEY` is set in your `.env` file
- Verify your OpenAI API key is valid and has credits
- Ensure you're using the correct environment variable name: `OPEN_AI_API_KEY` (not `OPENAI_API_KEY`)

**Want Continuous Translation?**
- Use `npm run translate -- --watch` to automatically translate files as you edit them
- Perfect for iterative development where you're refining your specs

**Port Already in Use?**
- Change the port in your `.env` file: `PORT=3001`
- Or kill the existing process: `lsof -ti:3000 | xargs kill -9`

## License

MIT License - see [LICENSE](LICENSE) for details.
