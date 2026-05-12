# GitHub Copilot Custom Instructions

## PR Review Guidelines

## Repository Workflow Policy

- All code and documentation changes must be delivered through pull requests.
- Do not commit directly to `master` or `main`.
- If a direct commit is discovered, treat it as a process violation and require follow-up via PR.

### Issue Categorization

When reviewing pull requests, categorize findings into two distinct groups:

#### 1. **PR-Scoped Issues** (Changes in this PR)
Issues that are directly related to the changes made in this pull request:
- Code logic errors or bugs introduced by these changes
- Missing error handling in modified functions
- Breaking changes to APIs or data structures
- Performance regressions in modified code
- Security vulnerabilities in new/modified code
- Violations of project coding standards in the changed files

**Action**: Report these as blocking or critical comments directly on the affected lines.

#### 2. **Legacy Issues** (Pre-existing problems)
Issues that exist in the codebase but are unrelated to this PR's changes:
- Existing code quality problems in untouched files
- Pre-existing broken links or documentation gaps
- Outdated dependencies not being updated in this PR
- Sensitive values/credentials in archived documentation
- Previous implementation decisions or architectural choices not being refactored here
- Other files with copy/paste errors or inconsistencies

**Action**: Report these as separate "Legacy Issues" section with this format:
```markdown
### 🏛️ Legacy Issues (Pre-existing, not blocking this PR)

These issues exist in the codebase but are unrelated to this PR's changes. The team can prioritize fixing them separately:

- **[File/Area]**: [Issue description] (found in untouched file)
  - Impact: [low/medium/high]
  - Suggested fix: [brief suggestion]
```

### Review Scope

- **Focus on changes in this PR**: Review modified/added files for correctness and quality
- **Note but don't block on legacy issues**: Flag pre-existing problems without making them PR blockers
- **Provide context**: Always note whether an issue is introduced by these changes or pre-existed
- **Constructive suggestions**: Offer brief fix suggestions for legacy issues to help future work
- **Enforce story scope**: Confirm the PR completes exactly one user story; flag multi-story PRs as out of scope and request split PRs

### Examples

**PR-Scoped Issue (Blocking)**:
```
In speckit.specify.prompt.md line 54, the duplicate --json flag could cause script failures.
This was introduced in this PR and should be removed.
```

**Legacy Issue (Non-blocking)**:
```
In docs/deployment/GITHUB_ACTIONS_SETUP.md, the firewall configuration guidance is overly permissive.
This is a pre-existing security concern in deployment docs, not introduced by this PR.
Team should address in a separate security audit task.
```

---

## General Review Principles

1. **Be specific**: Point to exact files and line numbers
2. **Be constructive**: Explain why something is an issue and how to fix it
3. **Be clear about scope**: Always indicate if an issue is PR-scoped or legacy
4. **Respect intent**: Understand that this PR may not address all pre-existing issues
5. **Suggest actionable fixes**: Provide brief implementation suggestions when possible
