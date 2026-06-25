#!/usr/bin/env python3
import os
import subprocess
import sys

MODEL = "tanstack-project-expert"

def review_file(filepath):
    """Review a single file with the model"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        prompt = f"""
        Review this file from the Smart Clinic project:
        
        File: {filepath}
        
        Content:
        {content[:3000]}  # Limit to avoid token issues
        
        Check for:
        1. TanStack pattern compliance
        2. TypeScript best practices
        3. Performance issues
        4. Security concerns
        5. Code style and consistency
        
        Provide specific, actionable feedback.
        """
        
        result = subprocess.run(
            ['ollama', 'run', MODEL, prompt],
            capture_output=True,
            text=True
        )
        return result.stdout
    except Exception as e:
        return f"Error reviewing {filepath}: {e}"

def main():
    if len(sys.argv) < 2:
        print("Usage: python auto-review.py <file-or-directory>")
        sys.exit(1)
    
    path = sys.argv[1]
    
    if os.path.isfile(path):
        # Review single file
        print(f"\n=== Reviewing {path} ===\n")
        print(review_file(path))
    elif os.path.isdir(path):
        # Review all TypeScript/TSX files in directory
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    filepath = os.path.join(root, file)
                    print(f"\n=== Reviewing {filepath} ===\n")
                    print(review_file(filepath))
    else:
        print(f"Path not found: {path}")

if __name__ == "__main__":
    main()
