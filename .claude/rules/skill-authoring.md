---
paths:
  - "skills/**"
---

**A skill follows Anthropic's authoring rules (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), and `skill-lint.ts` in agent-skills/scripts blocks a commit that breaks the checkable ones: body under 500 lines, `## Contents` on any reference file over 100 lines, every reference linked straight from `SKILL.md`, a third-person description of what and when.** For the judgment rules run `/claude-api prompt-audit` on the skill.
