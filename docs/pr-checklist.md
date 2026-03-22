# PR Review Checklist

Use this for every pull request, including solo work.

## Architecture

- [ ] No business logic in UI layer
- [ ] No storage or browser API calls outside infrastructure/
- [ ] No hardcoded strings in domain, application, or infrastructure
- [ ] Use-cases depend on interfaces, not concrete implementations
- [ ] Dependency direction respected (deletion test would pass)

## Code Quality

- [ ] No duplication without a justified reason
- [ ] No abstraction created for a single use-case (wait for the second)
- [ ] Naming is clear and consistent with existing conventions
- [ ] No commented-out code committed
- [ ] No TODO left without a linked issue or follow-up PR

## TypeScript

- [ ] No use of `any` without explicit justification in a comment
- [ ] All public function signatures are explicitly typed
- [ ] Strict mode violations resolved

## Testing

- [ ] At least one happy-path test for new behaviour
- [ ] At least one failure-path or edge-case test
- [ ] Tests assert on behaviour, not on implementation details
- [ ] No test depends on another test's side effects

## Accessibility (a11y)

- [ ] Form inputs have associated labels
- [ ] Interactive elements are keyboard reachable
- [ ] Focus is visible and logical
- [ ] Error messages are associated with their field (aria or label)
- [ ] No information conveyed by color alone

## Internationalisation (i18n)

- [ ] All user-facing strings are in `ui/i18n/`
- [ ] Dates and numbers use locale-aware formatting APIs
- [ ] Layout is not hardcoded for short English text only

## Git

- [ ] Commits are atomic and intentional
- [ ] Commit messages follow conventional commit style
- [ ] No unrelated changes bundled in this PR
- [ ] PR description states: what changed, how tested, any risk

## CI

- [ ] Lint passes
- [ ] Type check passes
- [ ] All tests pass
- [ ] Build succeeds
