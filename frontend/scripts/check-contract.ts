#!/usr/bin/env tsx
/**
 * Contract Check Script
 *
 * This script validates that a live API (dev or prod) conforms to the
 * Zod schemas defined in src/api/schemas.ts.
 *
 * Usage:
 *   npm run check-contract                    # Check localhost:8000 (default)
 *   npm run check-contract -- --url <URL>     # Check custom URL
 *   npm run check-contract -- --verbose       # Show detailed output
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 *   2 - Script error (connection, etc.)
 */

import { z } from 'zod';
import {
  NoteOutSchema,
  PaginatedNotesSchema,
  NoteInSchema,
  TagSchema,
  TagListSchema,
  TagInSchema,
  formatZodError,
} from '../src/api/schemas';

interface CheckResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

interface ContractCheckOptions {
  apiUrl: string;
  verbose: boolean;
}

class ContractChecker {
  private results: CheckResult[] = [];
  private options: ContractCheckOptions;

  constructor(options: ContractCheckOptions) {
    this.options = options;
  }

  private log(message: string, verbose: boolean = false) {
    if (!verbose || this.options.verbose) {
      console.log(message);
    }
  }

  private addResult(result: CheckResult) {
    this.results.push(result);
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${status}${reset} ${result.name}`);

    if (!result.passed && result.error) {
      console.log(`  Error: ${result.error}`);
    }

    if (this.options.verbose && result.details) {
      console.log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  }

  async checkEndpoint<T>(
    name: string,
    method: string,
    path: string,
    schema: z.ZodSchema<T>,
    body?: unknown
  ): Promise<void> {
    const url = `${this.options.apiUrl}${path}`;

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      this.log(`\nFetching ${method} ${url}...`, true);

      const response = await fetch(url, options);

      if (!response.ok) {
        this.addResult({
          name,
          passed: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
        return;
      }

      const data = await response.json();

      try {
        const validated = schema.parse(data);
        this.addResult({
          name,
          passed: true,
          details: this.options.verbose ? validated : undefined,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          this.addResult({
            name,
            passed: false,
            error: formatZodError(error),
            details: { validationErrors: error.errors, responseData: data },
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.addResult({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async runChecks(): Promise<boolean> {
    console.log(`\n🔍 Checking API contract at: ${this.options.apiUrl}\n`);

    // Check 1: GET /tags/ - Should return array of tags
    await this.checkEndpoint(
      'GET /tags/ returns valid tag list',
      'GET',
      '/tags/',
      TagListSchema
    );

    // Check 2: GET /notes/ - Should return paginated notes
    await this.checkEndpoint(
      'GET /notes/ returns valid paginated note list',
      'GET',
      '/notes/',
      PaginatedNotesSchema
    );

    // Check 3: GET /notes/ with filters - Should filter notes (paginated)
    await this.checkEndpoint(
      'GET /notes/?body_text=test returns filtered paginated notes',
      'GET',
      '/notes/?body_text=test',
      PaginatedNotesSchema
    );

    // Check 4: Create and validate a test note
    const testNote = {
      title: 'Contract Check Test Note',
      content: 'This is a test note created by the contract checker',
      tags: ['contract-check'],
    };

    // Validate input schema
    try {
      NoteInSchema.parse(testNote);
      this.addResult({
        name: 'Test note input validates against NoteInSchema',
        passed: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.addResult({
          name: 'Test note input validates against NoteInSchema',
          passed: false,
          error: formatZodError(error),
        });
        // Don't proceed with POST if input validation fails
        return false;
      }
    }

    // Check 5: POST /notes/ - Create note and validate response
    await this.checkEndpoint(
      'POST /notes/ creates note and returns valid NoteOut',
      'POST',
      '/notes/',
      NoteOutSchema,
      testNote
    );

    // Check 6: Create a test tag
    const testTag = {
      name: 'contract-test-tag',
    };

    try {
      TagInSchema.parse(testTag);
      this.addResult({
        name: 'Test tag input validates against TagInSchema',
        passed: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.addResult({
          name: 'Test tag input validates against TagInSchema',
          passed: false,
          error: formatZodError(error),
        });
      }
    }

    // Check 7: POST /tags/ - Create tag and validate response
    await this.checkEndpoint(
      'POST /tags/ creates tag and returns valid Tag',
      'POST',
      '/tags/',
      TagSchema,
      testTag
    );

    // Print summary
    console.log('\n' + '='.repeat(60));
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const failed = total - passed;

    console.log(`\n📊 Summary: ${passed}/${total} checks passed`);

    if (failed > 0) {
      console.log(`\n❌ ${failed} check(s) failed\n`);
      return false;
    } else {
      console.log(`\n✅ All checks passed!\n`);
      return true;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  const options: ContractCheckOptions = {
    apiUrl: 'http://localhost:8000/api',
    verbose: false,
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.apiUrl = args[i + 1].replace(/\/$/, ''); // Remove trailing slash
      i++;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Contract Checker - Validate API against Zod schemas

Usage:
  npm run check-contract                    # Check localhost:8000 (default)
  npm run check-contract -- --url <URL>     # Check custom URL
  npm run check-contract -- --verbose       # Show detailed output
  npm run check-contract -- --help          # Show this help

Options:
  --url <URL>     API base URL (default: http://localhost:8000/api)
  --verbose, -v   Show detailed output including response data
  --help, -h      Show this help message

Examples:
  npm run check-contract
  npm run check-contract -- --url https://api.example.com/api
  npm run check-contract -- --url http://localhost:8000/api --verbose
      `);
      process.exit(0);
    }
  }

  const checker = new ContractChecker(options);

  try {
    const success = await checker.runChecks();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Script error:', error);
    process.exit(2);
  }
}

main();
