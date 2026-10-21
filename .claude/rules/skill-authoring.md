---
paths:
  - "skills/**"
---

**A skill follows Anthropic's authoring rules (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), and `skill-lint.ts` in agent-skills/scripts checks the checkable ones when run by hand (no hook runs it): body under 500 lines, `## Contents` on any reference file over 100 lines, every reference linked straight from `SKILL.md`, a description that opens with when to use it, then says what it does.** For the judgment rules run `/claude-api prompt-audit` on the skill.
