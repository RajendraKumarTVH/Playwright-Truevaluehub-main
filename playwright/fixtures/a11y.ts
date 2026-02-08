import { Page, test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

type A11yOptions = {
  /** CSS selector to scope the scan (e.g., main content area). If omitted, scans the whole document. */
  scope?: string;
  /** Axe tags or rules to include; e.g., ['wcag2a','wcag2aa'] */
  includeTags?: string[];
  /** Axe rules to disable temporarily if you have known exceptions. */
  disableRules?: string[];
};

export async function assertA11y(page: Page, opts: A11yOptions = {}) {
  const { scope, includeTags, disableRules } = opts;

  let builder = new AxeBuilder({ page });

  if (scope) builder = builder.include(scope);
  if (includeTags?.length) builder = builder.withTags(includeTags);
  if (disableRules?.length) {
    builder = builder.disableRules(disableRules);
  }

  const results = await builder.analyze();
  const { violations } = results;

  // Nice failure message with a compact list of nodes per rule
  const format = (v: typeof violations[number]) =>
    `• ${v.id} (${v.impact ?? 'no-impact'}) — ${v.help}
   ${v.nodes
      .slice(0, 5)
      .map(n => `- ${n.html.replace(/\s+/g, ' ').slice(0, 120)}`)
      .join('\n   ')}${v.nodes.length > 5 ? `\n   …and ${v.nodes.length - 5} more` : ''}`;

  expect.soft(violations, violations.map(format).join('\n\n')).toHaveLength(0);
}

// Optional: make an a11y-aware test that always sets up axe-friendly defaults.
export const a11yTest = test.extend<{}>({});
