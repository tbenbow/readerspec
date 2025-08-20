# Developer Guide

This guide contains technical details, advanced features, and troubleshooting information for developers working with ReaderSpec.

## 🚀 Advanced Commands

### **Available Commands**

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run build` | Builds CLI tool + generates API | Default build command |
| `npm run build:cli` | Builds only the CLI tool | CLI development |
| `npm run build:api` | Generates API from specs | API generation only |
| `npm run dev` | Runs the generated API server | Default dev command |
| `npm run dev:cli` | Runs CLI tool in watch mode | CLI development |
| `npm run translate` | AI translation of specs | Converting human text to JSON |
| `npm run check` | Validates all specs | Before building |

### **Development Workflow**

```bash
# Build the CLI tool
npm run build

# 1. Generate API from specs (creates Express routes, validation, docs)
npm run build

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

**Typical Workflow:**
1. **Write specs** in human-readable format (or use AI translation)
2. **Build the API** from your specs
3. **Navigate to `apps/api/`** directory
4. **Run the server** to test your endpoints

**💡 Pro Tip:** Use `npm run translate -- --watch` for automatic AI translation as you write specs!

## 🤖 AI Translation Features

ReaderSpec includes AI-powered translation that can automatically convert your human-readable descriptions to structured JSON. To enable this:

1. **Get an OpenAI API key** from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. **Copy the example environment file**: `cp .env.example .env`
3. **Edit `.env`** and add your API key: `OPEN_AI_API_KEY=your-key-here`

**Note:** AI translation is optional. You can still use ReaderSpec without it by manually writing JSON specs.

**Manual JSON Writing:** If you prefer to write JSON directly, see our [Schema Documentation](docs/SCHEMA.md) for the complete format specification.

**Watch Mode:** Use `npm run translate -- --watch` to automatically translate files as you edit them - perfect for iterative development!

## 📚 Generated API Documentation

After running `npm run build`, you'll find comprehensive documentation in the `apps/api/` directory:

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

## 🚨 Troubleshooting

### **AI Translation Issues**

**AI Translation Not Working?**
- Check that `OPEN_AI_API_KEY` is set in your `.env` file
- Verify your OpenAI API key is valid and has credits
- Ensure you're using the correct environment variable name: `OPEN_AI_API_KEY` (not `OPENAI_API_KEY`)

**Want Continuous Translation?**
- Use `npm run translate -- --watch` to automatically translate files as you edit them
- Perfect for iterative development where you're refining your specs

### **Build and Runtime Issues**

**Port Already in Use?**
- Change the port in your `.env` file: `PORT=3001`
- Or kill the existing process: `lsof -ti:3000 | xargs kill -9`

**TypeScript Compilation Errors?**
- Check the generated validation files in `apps/api/validation/`
- Ensure your specs are valid and complete
- Run `npm run check` to validate your specs before building

**Generated API Not Working?**
- Verify your specs are in the correct format
- Check the console output for specific error messages
- Ensure all required fields are defined in your specs

### **Performance and Development**

**Slow Build Times?**
- Use `npm run build:api` to only generate the API (skip CLI build)
- Consider using watch mode for development: `npm run translate -- --watch`

**File Watching Issues?**
- Ensure your file system supports file watching
- Check if antivirus software is interfering with file watching
- Use manual rebuild commands if needed

## 🔍 Advanced Features

### **Custom Validation Schemas**
You can extend the generated validation by modifying the Zod schemas in `apps/api/validation/`.

### **Custom Business Logic**
Add your own business logic by extending the generated services in `apps/api/services/`.

### **API Middleware**
Customize the Express middleware stack by modifying `apps/api/server.ts`.

### **Environment-Specific Configuration**
Use different `.env` files for different environments (development, staging, production).

## 📖 Additional Resources

- **[Schema Documentation](docs/SCHEMA.md)** - Complete JSON format specification
- **[Testing Guide](docs/TESTING.md)** - Testing strategies and examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Platform-specific deployment instructions
- **[CI/CD Setup](docs/CI_CD_SETUP.md)** - Complete CI/CD pipeline configuration

## 🤝 Contributing

Found a bug or have a feature request? Check out our contributing guidelines and development setup.

**Development Setup:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

**Running Tests:**
```bash
npm test
npm run test:watch
npm run test:coverage
```
