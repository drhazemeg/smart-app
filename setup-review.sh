#!/bin/bash

echo "🚀 Setting up Smart Clinic AI Code Review..."

# Create project context
cat > ./data/project-context.md << 'CONTEXT_EOF'
# Smart Clinic Project
Pediatric clinic management with TanStack Start + Query + Form + Table + Drizzle

## Architecture
- Features: Modular, self-contained in src/features/
- Server: createServerFn functions in src/functions/
- Database: Drizzle ORM with PostgreSQL in src/db/
- Routing: TanStack Router with file-based routes in src/routes/
- State: TanStack Query (server) + TanStack Store (client)

## Key Patterns
1. Query Options: [entity]Keys + [entity]Options functions
2. Mutation Options: [action]Mutation pattern with cache invalidation
3. Forms: useAppForm with Zod validators
4. Tables: useDataTable with URL-sync filtering
5. Server: createServerFn with Zod validation
CONTEXT_EOF

# Create project expert model
cat > ./data/project-expert.Modelfile << 'MODEL_EOF'
FROM tanstack-expert

SYSTEM """
You are an expert on the Smart Clinic pediatric management codebase.
Use the context below when reviewing code.

Project Context:
$(cat ./data/project-context.md)

When reviewing code:
1. Always reference project-specific patterns
2. Suggest improvements that fit the architecture
3. Check for proper TanStack library usage
4. Ensure type safety throughout the stack
5. Consider the clinic domain context
"""
MODEL_EOF

# Create the model
ollama create tanstack-project-expert -f ./data/project-expert.Modelfile

echo "✅ Setup complete!"
echo ""
echo "Usage:"
echo "1. Review a feature: ollama run tanstack-project-expert 'Review the patients feature'"
echo "2. Review a file: ollama run tanstack-project-expert 'Review this code: $(cat your-file.tsx)'"
echo "3. Run interactive review: ./scripts/interactive-review.sh"
