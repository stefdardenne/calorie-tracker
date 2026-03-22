# Architecture Rules

## Layer Responsibilities

| Layer           | Responsible for                                       | Never allowed to                                       |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| domain/         | Business types, validation, calculations              | Import browser APIs, storage, network, or UI           |
| application/    | Use-case logic, port interfaces                       | Import infrastructure or UI; know about storage detail |
| infrastructure/ | Implement ports using storage/API                     | Contain business rules or calculation logic            |
| ui/             | DOM rendering, user events, form handling             | Calculate nutrition, call storage directly             |
| shared/         | Pure cross-cutting utilities (ids, dates, formatting) | Contain business logic, DOM references, storage calls  |

## Dependency Direction

Nothing points back. Domain has zero external dependencies.

## The Deletion Test

Delete `infrastructure/`. Domain and application must still compile.  
If they do not, you have a boundary violation.

## Allowed Imports Per Layer

- `domain/` → nothing outside domain
- `application/` → domain, shared
- `infrastructure/` → application/ports, domain, shared
- `ui/` → application/usecases, domain (types only), shared
- `shared/` → nothing outside shared

## Red Flags To Watch

1. Calorie math inside a component or event handler
2. `localStorage` referenced outside `infrastructure/`
3. Hardcoded user-facing strings outside `ui/i18n/`
4. A use-case importing a concrete class instead of an interface
5. Domain types that include DOM or storage properties
6. A `utils.ts` file that contains business logic
