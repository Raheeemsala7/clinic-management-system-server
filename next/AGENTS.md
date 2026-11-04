# Project Rules

## Framework & Language

- This project uses Next.js 16.
- Use the current Next.js 16 APIs, conventions, and recommended patterns.
- Always use TypeScript.
- Write strongly typed code.
- Avoid `any` completely unless there is a truly unavoidable technical reason.
- Prefer type inference where it keeps the code clear.
- Define explicit types for component props, API responses, form data, server actions, and important data structures.
- Do not use outdated Next.js patterns when a Next.js 16 approach is available.

---

## Server-First Architecture

- The default architecture is Server Components.
- When fetching data, ALWAYS prefer fetching from Server Components first.
- Do NOT use Client Components for data fetching unless there is a real client-side requirement.
- Do not add `"use client"` unnecessarily.
- Keep the Client Component boundary as small as possible.
- Prefer passing server-fetched data to Client Components as props.
- Avoid fetching the same data again on the client when it can already be fetched on the server.
- Before creating a Client Component, ask whether the component actually needs:
  - React state
  - browser APIs
  - event handlers
  - client-only libraries
  - React Query client-side behavior
- If none of these are required, keep it as a Server Component.

---

## Sensitive Data & Authentication

- NEVER expose sensitive credentials, access tokens, refresh tokens, API secrets, or private authentication data to the client.
- If a request requires sending a token or other sensitive authentication data and a client-side request is genuinely required:
  - Create a Next.js Route Handler.
  - Keep the token handling on the server.
  - The Client Component must communicate with the Route Handler instead of directly accessing sensitive credentials.
- Never put secrets or private tokens in client-side code.
- Never expose server-only environment variables to the browser.
- Prefer server-side authentication and authorization checks.

---

## Data Fetching

- Prefer Server Components for initial data fetching.
- Fetch data as close to the server boundary as possible.
- Avoid unnecessary client-side requests.
- Avoid waterfalls when fetching independent data.
- Parallelize independent server requests when possible.
- Reuse existing server-side fetching utilities instead of duplicating API logic.
- Keep API communication and data transformation logic separated from UI components.
- Always consider caching behavior before implementing a fetch.
- Choose an appropriate caching/revalidation strategy based on the nature of the data.
- Do not disable caching by default.
- Do not use aggressive revalidation or `no-store` unless there is a specific reason.
- For frequently changing or user-specific data, carefully evaluate whether caching is safe.
- Never cache private or user-specific data in a way that could expose it to another user.

---

## Mutations

- All mutations should be implemented as Server Actions by default.
- Do NOT implement mutations as normal client-side API requests when a Server Action is appropriate.
- Server Actions are responsible for:
  - authentication/authorization checks
  - validation
  - business logic
  - database/API mutation
  - error handling
- Validate all incoming mutation data with Zod on the server.
- Never trust client-side validation alone.
- After a mutation, properly invalidate/revalidate affected cached data when necessary.
- Keep Server Actions focused and reusable.

### React Query + Mutations

- React Query should be used when client-side mutation state or query management is actually needed.
- When using React Query for mutations:
  - The mutation should call the Server Action.
  - React Query manages the client-side mutation lifecycle.
  - Do not move the actual business logic into the Client Component.
- Keep the Server Action as the source of truth for the mutation.
- Properly invalidate or update affected React Query caches after successful mutations.

---

## React Query

- Do not use React Query automatically for every query.
- Prefer Server Components for initial/SSR data fetching.
- Use React Query when client-side caching, refetching, polling, optimistic updates, or interactive query state provides real value.
- Avoid fetching the same data with both Server Components and React Query unless hydration/dehydration or a clear client-side requirement justifies it.
- Configure stale times and cache behavior intentionally.
- Avoid unnecessary refetches.
- Avoid duplicate requests.
- Use query keys that are stable, predictable, and properly scoped.
- Keep query logic in dedicated hooks/utilities rather than scattering it throughout components.

---

## State Management

### Zustand

- Use Zustand for global client-side state only when the state genuinely needs to be shared across Client Components.
- Do not use Zustand for server data that belongs in Server Components or React Query.
- Do not duplicate server state in Zustand.
- Keep Zustand stores small and focused.
- Avoid unnecessary global state.

### React Hook Form

- Use React Hook Form for complex or interactive forms.
- Keep form state local to the form whenever possible.
- Avoid unnecessary controlled inputs when React Hook Form can manage them efficiently.

### Zod

- Use Zod as the source of truth for runtime validation.
- Validate form input with Zod.
- Validate Server Action input on the server.
- Do not rely only on TypeScript for runtime validation.
- Reuse schemas when appropriate instead of duplicating validation rules.
- Infer TypeScript types from Zod schemas when possible.

---

## UI

- Use shadcn/ui as the primary UI component system.
- Prefer existing shadcn/ui components before creating custom equivalents.
- Do not recreate a component that already exists in shadcn/ui unless there is a strong reason.
- Follow the existing project's shadcn/ui conventions.
- Keep UI components reusable and composable.
- Keep business logic out of presentational components whenever possible.

### Design System

- If the project contains an existing Design System, ALWAYS follow it.
- Reuse existing design tokens, colors, typography, spacing, radius, shadows, and component patterns.
- Do not introduce arbitrary colors when a Design System token already exists.
- Use the Design System's colors and visual language consistently.
- Do not invent new UI patterns unnecessarily.
- When adding a new component, make it visually consistent with the existing Design System.

### Responsive Design

- All UI must be responsive.
- Design mobile-first when appropriate.
- Consider mobile, tablet, and desktop layouts.
- Avoid fixed dimensions when they can cause overflow or broken layouts.
- Test components across different viewport sizes.

### Accessibility

- Consider accessibility in every UI implementation.
- Use semantic HTML where possible.
- Use proper labels for form controls.
- Ensure interactive elements are keyboard accessible.
- Use appropriate ARIA attributes when necessary.
- Maintain reasonable focus states.
- Do not sacrifice accessibility for visual appearance.

---

## Performance

- Performance is a first-class requirement.
- Always look for opportunities to improve performance without unnecessarily complicating the code.
- Minimize Client Components.
- Minimize JavaScript sent to the browser.
- Prefer Server Components whenever possible.
- Avoid unnecessary re-renders.
- Avoid unnecessary state.
- Avoid unnecessary `useEffect`.
- Avoid unnecessary memoization; use `memo`, `useMemo`, and `useCallback` only when they provide a meaningful benefit.
- Avoid unnecessary network requests.
- Avoid duplicate data fetching.
- Lazy-load heavy client-side components when appropriate.
- Optimize images using Next.js image optimization.
- Avoid importing large libraries when a smaller or native solution is sufficient.
- Prefer server-side computation when it reduces client-side work.

---

## Caching

Caching must always be considered when implementing data fetching.

Before writing a fetch, determine:

1. Is the data public or user-specific?
2. Can it be cached safely?
3. How long should it remain fresh?
4. What event should invalidate/revalidate it?
5. Could caching cause stale or incorrect data?

Rules:

- Prefer caching when data can safely be cached.
- Never cache private/user-specific data in a way that can leak between users.
- Use appropriate Next.js caching and revalidation mechanisms.
- Avoid `no-store` as a default solution.
- After mutations, invalidate or revalidate the relevant data instead of unnecessarily disabling caching globally.
- Avoid duplicate cache layers unless there is a clear reason.
- React Query caching and Next.js server caching should have clearly defined responsibilities.

---

## Code Quality

- Always improve the code when making changes.
- Prefer clean, simple, maintainable solutions.
- Do not over-engineer.
- Avoid premature abstractions.
- Avoid duplicated logic.
- Extract reusable logic when duplication becomes meaningful.
- Keep functions and components focused.
- Prefer composition over complicated conditional logic.
- Follow existing project conventions before introducing new patterns.
- Do not refactor unrelated code unless necessary for the requested change.
- Remove dead code when you encounter it and it is safe to do so.
- Do not leave temporary debugging code such as `console.log` in production code.

---

## Comments & Documentation

- Write useful comments.
- Comments should explain WHY something is done, not simply WHAT the code does.
- Add comments for:
  - complex business logic
  - non-obvious architectural decisions
  - caching decisions
  - performance optimizations
  - workarounds
  - security considerations
  - complex algorithms
- Do not add meaningless comments to obvious code.
- Keep comments accurate when modifying code.
- If existing code has confusing logic, improve the comment while improving the implementation.

---

## Error Handling

- Handle errors intentionally.
- Do not silently swallow errors.
- Provide meaningful error messages.
- Never expose sensitive server errors to the client.
- Validate all external/user input.
- Handle loading, error, and empty states where appropriate.
- Keep error handling consistent with the project's existing patterns.

---

## Security

- Never expose secrets, tokens, credentials, or private environment variables to the client.
- Never trust client-provided data.
- Always validate and authorize Server Actions.
- Validate Route Handler input.
- Validate external API responses when appropriate.
- Avoid unsafe HTML rendering.
- Do not bypass authentication or authorization checks.
- Do not weaken security to make an implementation easier.

---

## File & Architecture Rules

- Follow the existing project folder structure.
- Reuse existing utilities, hooks, components, schemas, and services before creating new ones.
- Keep related code close together when the project's architecture follows feature-based organization.
- Do not move files or change architecture without a good reason.
- Do not create unnecessary abstraction layers.
- Keep server-only code server-only.
- Keep client-only code isolated behind Client Component boundaries.

---

## Before Making Changes

Before implementing a feature:

1. Inspect the existing architecture.
2. Look for existing components/utilities/hooks that can be reused.
3. Determine whether the implementation belongs on the server or client.
4. Determine the appropriate caching strategy.
5. Determine whether React Query is actually necessary.
6. Check whether shadcn/ui already provides the required component.
7. Check the existing Design System.
8. Consider performance and accessibility.
9. Implement the smallest clean solution.
10. Verify TypeScript correctness and avoid introducing unnecessary dependencies.

---

## Final Principle

When there are multiple valid implementations, prefer the solution that:

1. Keeps more code on the server.
2. Sends less JavaScript to the client.
3. Protects sensitive data.
4. Uses proper caching.
5. Minimizes network requests.
6. Reuses existing project patterns.
7. Uses shadcn/ui and the existing Design System.
8. Is strongly typed with TypeScript.
9. Is accessible and responsive.
10. Is simple, maintainable, and performant.