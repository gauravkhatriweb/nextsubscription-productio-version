#!/usr/bin/env node
/**
 * Color Migration Script
 * 
 * REF: THEME/REFACTOR: Automated script to help migrate hardcoded colors to theme tokens.
 * 
 * This script scans for hardcoded color values (hex, rgb, rgba) and suggests
 * replacements using theme tokens. Run with --dry-run first to preview changes.
 * 
 * Usage:
 *   node scripts/migrate-colors.js --dry-run  # Preview changes
 *   node scripts/migrate-colors.js            # Apply changes
 * 
 * @module scripts/migrate-colors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// REF: THEME/REFACTOR: Common color mappings to theme tokens
const COLOR_MAPPINGS = {
  // Primary brand colors
  '#E43636': "var(--theme-primary) or themeTokens.primary",
  '#e43636': "var(--theme-primary) or themeTokens.primary",
  
  // Accent colors
  '#F6EFD2': "var(--theme-accent) or themeTokens.accent",
  '#f6efd2': "var(--theme-accent) or themeTokens.accent",
  '#E2DDB4': "var(--theme-secondary) or themeTokens.secondary",
  '#e2ddb4': "var(--theme-secondary) or themeTokens.secondary",
  
  // Status colors
  '#10B981': "var(--theme-success) or themeTokens.success",
  '#F59E0B': "var(--theme-warning) or themeTokens.warning",
  '#EF4444': "var(--theme-error) or themeTokens.error",
  '#3B82F6': "var(--theme-chart-info) or themeTokens.chartInfo",
  
  // Common grays/blacks/whites
  '#000000': "var(--theme-text) or themeTokens.text",
  '#FFFFFF': "var(--theme-surface) or themeTokens.surface",
  '#ffffff': "var(--theme-surface) or themeTokens.surface",
  '#4A4A4A': "var(--theme-text-secondary) or themeTokens.textSecondary",
  '#6B6B6B': "var(--theme-text-subtle) or themeTokens.textSubtle",
  '#9A9A9A': "var(--theme-text-disabled) or themeTokens.textDisabled",
};

// REF: THEME/REFACTOR: Patterns to match hardcoded colors
const COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,6}\b/g,                    // Hex colors
  /rgb\([^)]+\)/g,                            // RGB colors
  /rgba\([^)]+\)/g,                           // RGBA colors
];

/**
 * Recursively find all JS/JSX files in a directory
 */
function findFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].includes(extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Find hardcoded colors in a file
 */
function findColors(content) {
  const matches = [];
  
  COLOR_PATTERNS.forEach(pattern => {
    const patternMatches = content.matchAll(pattern);
    for (const match of patternMatches) {
      matches.push({
        value: match[0],
        index: match.index,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  });
  
  return matches;
}

/**
 * Generate migration report
 */
function generateReport(files, dryRun = true) {
  const report = {
    totalFiles: 0,
    filesWithColors: 0,
    totalColors: 0,
    suggestions: [],
  };
  
  files.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf8');
      const colors = findColors(content);
      
      if (colors.length > 0) {
        report.totalFiles++;
        report.filesWithColors++;
        report.totalColors += colors.length;
        
        const relativePath = filePath.replace(join(__dirname, '../'), '');
        report.suggestions.push({
          file: relativePath,
          colors: colors.map(c => ({
            value: c.value,
            line: c.line,
            suggestion: COLOR_MAPPINGS[c.value.toLowerCase()] || 'Review and map to theme token',
          })),
        });
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  });
  
  return report;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  const srcDir = join(__dirname, '../src');
  const files = findFiles(srcDir);
  
  console.log(`\n🔍 Scanning ${files.length} files for hardcoded colors...\n`);
  
  const report = generateReport(files, dryRun);
  
  console.log('📊 Migration Report:');
  console.log(`   Total files scanned: ${files.length}`);
  console.log(`   Files with colors: ${report.filesWithColors}`);
  console.log(`   Total color instances: ${report.totalColors}\n`);
  
  if (report.suggestions.length > 0) {
    console.log('📝 Files requiring migration:\n');
    report.suggestions.forEach(suggestion => {
      console.log(`   ${suggestion.file}`);
      suggestion.colors.slice(0, 5).forEach(color => {
        console.log(`      Line ${color.line}: ${color.value} → ${color.suggestion}`);
      });
      if (suggestion.colors.length > 5) {
        console.log(`      ... and ${suggestion.colors.length - 5} more`);
      }
      console.log('');
    });
  }
  
  if (dryRun) {
    console.log('💡 Run without --dry-run to see detailed suggestions for all files.');
    console.log('⚠️  Note: This script provides suggestions only. Manual review required.\n');
  }
  
  // Save report to file
  const reportPath = join(__dirname, '../color-migration-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);
}

main();

