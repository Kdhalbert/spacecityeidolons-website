# Contributing to Space City Eidolons

Thank you for your interest in contributing to Space City Eidolons! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

### Creating a Pull Request

1. **Create a feature branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: Description of your changes"
   ```

3. **Push your branch:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create a pull request:**
   
   **Option 1: GitHub CLI (Recommended)**
   ```bash
   gh pr create --base main --head feature/your-feature-name \
     --title "feat: Your feature title" \
     --body "Detailed description of changes"
   ```
   
   **Option 2: GitHub Web UI**
   - Navigate to the repository on GitHub
   - Click "Compare & pull request" button
   - Fill in the PR template
   - Click "Create pull request"

   > **Note**: See [Version Control Practices in the Constitution](.specify/memory/constitution.md) for detailed Git workflow guidelines and tool usage policies.

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): implement JWT refresh token rotation"
git commit -m "fix(frontend): resolve form validation error handling"
git commit -m "docs: update API endpoint documentation"
```

## Testing Requirements

Before submitting a PR, ensure:

### Frontend Tests
```bash
npm test              # Run all tests
npm run test:ui       # Open Vitest UI
npm run build         # Verify production build
```

### Backend Tests
```bash
cd api
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run build         # Verify TypeScript compilation
```

### All Tests Must Pass
- Unit tests
- Integration tests
- Build verification
- Linting checks

## Code Style

### TypeScript
- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Avoid `any` type when possible

### React Components
- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces for props

### Naming Conventions
- Components: `PascalCase` (e.g., `InviteRequestForm`)
- Functions/variables: `camelCase` (e.g., `createInviteRequest`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- Files: Match component name (e.g., `InviteRequestForm.tsx`)

## Pull Request Template

When creating a PR, include:

```markdown
## Summary
Brief description of the changes

## Changes
- List of main changes
- New components/features
- Modified files

## Testing
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Build successful

## Tasks Completed
Reference task IDs from tasks.md (e.g., T081-T093)

## Related Issues
Closes #issue-number (if applicable)
```

## Code Review Process

1. **Automated Checks**: GitHub Actions runs tests and builds
2. **Review**: Team member reviews code
3. **Updates**: Address review feedback
4. **Approval**: Maintainer approves PR
5. **Merge**: Merge to main branch
6. **Deployment**: Automatic deployment triggered

## Getting Help

- Check existing documentation in `/docs`
- Review `README.md` for setup instructions
- Check `.specify/tasks.md` for project structure
- Ask questions in pull request comments

## License

By contributing to Space City Eidolons, you agree that your contributions will be licensed under the project's license.
