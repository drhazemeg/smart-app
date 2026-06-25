#!/bin/bash

MODEL="tanstack-project-expert"

echo "🔍 Smart Clinic Code Review Session"
echo "=================================="
echo ""
echo "What would you like to review?"
echo "1. Project Architecture"
echo "2. Specific Feature (you'll provide the path)"
echo "3. Database Schema"
echo "4. TanStack Query Usage"
echo "5. Server Functions"
echo "6. Custom Analysis"
echo ""

read -p "Choice (1-6): " choice

case $choice in
  1)
    cat << 'PROMPT' | ollama run $MODEL
    Please review the overall architecture of the Smart Clinic project.
    Focus on:
    - Modular design and separation of concerns
    - Type safety implementation
    - State management strategy
    - Performance considerations
    - Scalability of the current architecture
    PROMPT
    ;;
  2)
    read -p "Feature path (e.g., features/appointments): " path
    cat << PROMPT | ollama run $MODEL
    Review the following feature module: $path
    
    Check for:
    1. TanStack Query patterns (queryOptions, mutationOptions)
    2. Component organization and reusability
    3. TypeScript type safety
    4. Form handling with TanStack Form
    5. Performance optimizations (memo, useCallback)
    6. Proper separation of concerns (api/components/schemas)
    PROMPT
    ;;
  3)
    cat << 'PROMPT' | ollama run $MODEL
    Review the database schema in src/db/schema/
    Analyze:
    - Table relationships and foreign keys
    - Indexing strategy
    - Enum usage
    - Data type choices
    - Schema completeness for a pediatric clinic
    PROMPT
    ;;
  4)
    cat << 'PROMPT' | ollama run $MODEL
    Review the TanStack Query implementation across the app.
    Look at:
    - Query key strategy
    - Cache invalidation patterns
    - Optimistic updates
    - Error handling in queries/mutations
    - useSuspenseQuery usage
    
    Are there any anti-patterns or improvements?
    PROMPT
    ;;
  5)
    cat << 'PROMPT' | ollama run $MODEL
    Review the server functions in src/functions/
    Focus on:
    - createServerFn patterns
    - Type safety with Zod schemas
    - Error handling
    - Authorization/authentication
    - Proper use of Drizzle queries
    
    What's working well and what could be improved?
    PROMPT
    ;;
  6)
    read -p "Enter your custom analysis prompt: " custom
    echo "$custom" | ollama run $MODEL
    ;;
esac
