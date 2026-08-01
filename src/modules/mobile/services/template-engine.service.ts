import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateEngineService {
  compile(template: string, variables: Record<string, any>): string {
    if (!template) return '';
    let compiled = template;

    // Handle conditionals: {{#if variable}} content {{/if}}
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    compiled = compiled.replace(conditionalRegex, (match, key, content) => {
      return variables[key] ? content.trim() : '';
    });

    // Handle variables: {{variable}}
    const variableRegex = /\{\{(\w+)\}\}/g;
    compiled = compiled.replace(variableRegex, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });

    return compiled;
  }
}
