# Spec Kit Constitution

## Core Principles

### I. Specification-First Development (NON-NEGOTIABLE)

Every feature begins with a complete specification before any code is written.

**Requirements:**
- All features must have a specification created from the spec template
- Specifications must define the **why** (problem/value) and **what** (solution/behavior), never the **how** (implementation)
- User stories must be prioritized (P1, P2, P3, etc.) as independent journeys
- Each user story must be independently testable and deployable as an MVP slice
- Specifications must be reviewed and approved before planning begins
- Edge cases and error scenarios must be explicitly documented
- No implementation without an approved specification

**Rationale:** Specifications force clarity of thought, create shared understanding, enable earlier feedback, and serve as living documentation.

### II. Test-Driven Development (NON-NEGOTIABLE)

Tests are written and approved before implementation begins.

**Requirements:**
- Tests must be written directly from acceptance scenarios in specs
- User must review and approve tests before implementation starts
- Follow Red-Green-Refactor cycle strictly:
  1. Write failing tests (RED)
  2. Implement minimum code to pass (GREEN)  
  3. Refactor for quality (REFACTOR)
- Test coverage must include:
  - All acceptance scenarios from the specification
  - Edge cases explicitly listed in edge cases section
  - Error handling and failure modes
- Tests serve as executable documentation of intended behavior

**Rationale:** TDD ensures code meets requirements, catches regressions, and creates a safety net for refactoring.

### III. Plan Before Implementation

Every feature requires a detailed plan before code changes begin.

**Requirements:**
- A plan file must be created from the plan template
- Plans define the **how** (implementation approach, not specified in spec)
- Plans must break features into atomic, testable tasks
- Each task must specify:
  - File modifications required
  - Testing approach and validation criteria
  - Dependencies on other tasks
- Plans must include rollback strategy for each major change
- Plans require approval before execution

**Rationale:** Planning surfaces complexity early, enables better estimation, and creates a roadmap for implementation.

### IV. Template Adherence

All artifacts must follow the established template structure.

**Requirements:**
- Templates must not be modified without constitutional amendment
- All sections marked "mandatory" must be completed
- Placeholders must be replaced with actual content
- Comments and guidance in templates must be removed in final artifacts
- Version numbers must be maintained on all artifacts

**Rationale:** Consistency enables automation, reduces cognitive load, and ensures complete documentation.

### V. Incremental Delivery

Features must be delivered in small, independently valuable increments.

**Requirements:**
- Prioritize user stories to enable incremental delivery (P1 → P2 → P3)
- Each priority level represents a shippable increment
- P1 stories must represent a viable MVP
- Lower priority stories should build on, not block, higher priorities
- Features can be released with only P1 complete if higher value emerges
- Each increment must have its own test suite
- Documentation must be updated with each increment

**Rationale:** Incremental delivery reduces risk, enables faster feedback, and delivers value sooner.

## Code Quality Standards

### VI. Readability and Maintainability

Code must be written for humans first, computers second.

**Requirements:**
- Code must be self-documenting with clear names for variables, functions, and classes
- Functions should be small, focused, and do one thing well
- Avoid deep nesting - prefer early returns and guard clauses
- Comments must explain **why**, not **what** - the code should explain what
- Complex logic requires explanatory comments or documentation
- Magic numbers and strings must be replaced with named constants
- Dead code must be deleted, not commented out
- Code duplication should be eliminated when patterns emerge (DRY principle)

**Rationale:** Readable code is maintainable code. Teams spend more time reading code than writing it.

### VII. Code Review Excellence

All code must be reviewed by at least one other person before merging.

**Requirements:**
- Reviews must verify:
  - Specification requirements are met
  - All tests pass and provide adequate coverage
  - Code is clear, maintainable, and follows project conventions
  - Edge cases are handled
  - No unnecessary complexity
  - Security concerns are addressed
  - Performance is acceptable
- Never commit directly to master; all changes must go through a PR from a feature branch
- Reviewers must provide constructive, specific feedback
- Authors must respond to all feedback before merging
- Approval required before merge
- Reviews should happen within 24 hours of submission

**Rationale:** Code review catches bugs, spreads knowledge, maintains standards, and mentors developers.

### VIII. Simplicity and YAGNI (You Aren't Gonna Need It)

Start simple and only add complexity when genuinely needed.

**Requirements:**
- Implement the simplest solution that meets requirements
- No speculative features or "we might need this later" code
- Complexity must be explicitly justified in the plan
- Abstractions require at least 3 concrete use cases
- Every dependency must justify its cost
- Delete code aggressively when it's no longer needed
- Prefer composition over inheritance
- Prefer explicit over implicit

**Rationale:** Simplicity reduces bugs, improves maintainability, and accelerates development.

## Testing Standards

### IX. Comprehensive Test Coverage

All code must be thoroughly tested at appropriate levels.

**Test Pyramid:**
- **Unit Tests** (70%+): Test individual functions/methods in isolation
- **Integration Tests** (20%): Test component interactions
- **End-to-End Tests** (10%): Test complete user workflows

**Requirements:**
- All public APIs must have unit tests
- All user scenarios from specs must have corresponding tests
- Edge cases and error paths must be tested
- Tests must be deterministic (no flaky tests)
- Tests must be fast (unit tests < 100ms, integration tests < 5s)
- Tests must be isolated and independent
- Test names must clearly describe what is being tested
- Tests must be maintainable and easy to understand

**Rationale:** Comprehensive testing catches bugs early, enables confident refactoring, and serves as documentation.

### X. Test Quality and Maintainability

Tests are code too and must meet quality standards.

**Requirements:**
- Tests must follow the Arrange-Act-Assert (AAA) pattern
- Each test should verify one behavior
- Test data should be minimal and relevant
- Avoid test interdependencies - tests must run independently
- Use descriptive assertions that explain failures
- Mock external dependencies, never real services/databases in unit tests
- Keep test setup/teardown in appropriate lifecycle hooks
- Refactor tests when they become brittle or unclear

**Rationale:** Quality tests remain valuable over time and don't become a maintenance burden.

## User Experience Standards

### XI. Consistency and Predictability

User experience must be consistent and predictable across the entire application.

**Requirements:**
- UI patterns and interactions must be consistent
- Terminology must be consistent across all user touchpoints
- Visual design must follow a cohesive system
- Navigation patterns must be predictable
- Similar actions should work the same way everywhere
- Feedback for user actions must be immediate and clear
- Error messages must be helpful and actionable
- Success states must be clearly communicated

**Rationale:** Consistency reduces cognitive load, speeds learning, and builds user trust.

### XII. Accessibility First

All features must be accessible to all users regardless of ability.

**Requirements:**
- Semantic HTML must be used appropriately
- Keyboard navigation must work for all interactive elements
- Color must not be the only means of conveying information
- Text must meet minimum contrast ratios
- All images must have descriptive alternative text
- Forms must have clear labels and error messages
- Screen readers must be able to navigate and understand content
- Interactive elements must have appropriate ARIA labels when needed
- Focus states must be visible

**Rationale:** Accessibility is a right, not a feature. It expands reach and benefits all users.

### XIII. Performance as a Feature

Performance is a core part of user experience, not an optimization.

**Requirements:**
- User interactions must feel responsive (< 100ms perceived delay)
- Page loads must be fast (< 3s on average connection)
- Critical rendering path must be optimized
- Assets must be optimized (images, scripts, styles)
- Unnecessary network requests must be eliminated
- Loading states must be shown for operations > 500ms
- Large operations must provide progress indicators
- Performance must be measured and monitored
- Performance regressions must be prevented

**Rationale:** Fast applications feel better, increase engagement, and improve conversion.

### XIV. Error Handling and Recovery

Errors should be prevented when possible, handled gracefully when they occur.

**Requirements:**
- Validate user input early and provide immediate feedback
- Prevent errors through good UI design (disable invalid actions)
- All errors must be caught and handled appropriately
- User-facing errors must be clear, specific, and actionable
- Error messages must tell users what happened and what to do next
- Provide recovery options when possible
- Never expose technical details or stack traces to users
- Log all errors with appropriate context for debugging
- Critical errors must have monitoring and alerts

**Rationale:** Good error handling reduces user frustration and support burden.

## Documentation Standards

### XV. Documentation as a First-Class Artifact

Documentation is essential and must be maintained with the same rigor as code.

**Requirements:**
- Documentation must live in the repository alongside code
- All features must update relevant documentation
- Documentation must be versioned with code
- Breaking changes require migration guides
- Setup and usage instructions must be clear and complete
- API documentation must be comprehensive and up-to-date
- Architecture decisions must be documented with rationale
- Examples must be provided for common use cases

**Rationale:** Good documentation multiplies impact, reduces support burden, and enables team scale.

## Development Workflow

### Feature Development Lifecycle

1. **Discovery Phase** - Define **why** and **what**
   - User describes need or problem
   - Create feature branch
   - Generate specification from template
   - Document user scenarios, acceptance criteria, edge cases
   - Review and refine specification

2. **Planning Phase** - Define **how**
   - Generate plan from template
   - Break feature into atomic tasks
   - Identify technical approach and dependencies
   - Estimate effort and timeline
   - Review and approve plan

3. **Test Phase**
   - Write tests from acceptance scenarios
   - User reviews and approves tests
   - All tests should fail (RED state)
   - Commit tests to repository

4. **Implementation Phase**
   - Implement minimum code to pass tests (GREEN state)
   - Refactor for quality while keeping tests green
   - Update documentation

5. **Validation Phase**
   - Execute full test suite
   - Validate all acceptance scenarios
   - Complete feature checklist
   - Conduct code review

6. **Integration Phase**
   - Merge to main branch
   - Deploy to appropriate environment
   - Monitor for issues

### Quality Gates

**Pre-Implementation Gates:**
- ✅ Specification approved
- ✅ Tests written and approved
- ✅ Plan reviewed and approved

**Pre-Merge Gates:**
- ✅ All tests passing
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ All acceptance scenarios validated
- ✅ Edge cases tested
- ✅ Performance benchmarks met
- ✅ Accessibility requirements met
- ✅ Security review completed (if applicable)

## Governance

### Constitutional Authority

- This constitution defines **principles** that transcend technology choices
- Technology decisions (the **how**) are documented in specs and plans
- This constitution supersedes all other development practices and guidelines
- All development decisions must conform to constitutional principles
- When in doubt, constitutional principles take precedence
- Team members may raise constitutional concerns on any work item

### Separation of Concerns

**Constitution** (This document):
- **Principles**: Code quality, testing, UX, performance standards
- **Why certain practices matter**
- Technology-agnostic standards

**Specification Files** (`spec.md`):
- **Why**: Problem being solved, value proposition
- **What**: Solution behavior, acceptance criteria
- User scenarios and edge cases
- Never the **how** (implementation)

**Plan Files** (`plan.md`):
- **How**: Implementation approach and technical decisions
- Technology stack and tooling choices
- Task breakdown and dependencies
- Architecture and design patterns

### Amendment Process

**Amendments require:**
1. Written proposal with rationale
2. Review by all team members
3. Approval by 2/3 majority
4. Migration plan for existing work if applicable
5. Update to version number and amendment date
6. Communication to all stakeholders

**Amendment Types:**
- **Minor Amendment** - Clarification, no behavior change - requires majority approval
- **Major Amendment** - New principle or significant change - requires 2/3 approval
- **Emergency Amendment** - Security or critical issue - can be fast-tracked

### Enforcement

- All pull requests must verify constitutional compliance
- Reviewers must cite specific constitutional principles when requesting changes
- Constitutional violations must be fixed before merge
- Repeated violations may require team discussion and process improvement

### Continuous Improvement

- Constitution should be reviewed quarterly
- Metrics should inform constitutional effectiveness:
  - Bug escape rate
  - Time to delivery
  - Code review feedback quality
  - Test coverage and reliability
  - User satisfaction and performance metrics
- Retrospectives should identify constitutional gaps or friction
- Improvements should be proposed as amendments

### Living Document Philosophy

This constitution is a living document that evolves with the team and project. It should enable great work, not obstruct it. When the constitution creates unnecessary friction, it should be amended. When it prevents problems, it should be celebrated and reinforced.

---

**Version**: 2.0.0  
**Ratified**: 2026-02-23  
**Last Amended**: 2026-02-23  
**Next Review**: 2026-05-23
