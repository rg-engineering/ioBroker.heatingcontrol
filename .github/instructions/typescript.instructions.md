---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Development Instructions

These instructions apply to TypeScript and TSX source files.

They supplement the general repository and project-specific instructions.

The existing TypeScript configuration, module system, coding style, dependencies, and established patterns are intentional unless explicitly stated otherwise.

---

# 1. Follow the Existing TypeScript Configuration

Treat the existing TypeScript configuration as authoritative.

Do not modify `tsconfig.json` or related compiler configuration merely to make a local implementation easier.

Do not weaken compiler settings to suppress errors.

In particular, do not:

- disable strict type checking;
- enable broader interoperability options only to fix a single import;
- exclude problematic files from compilation;
- suppress errors globally;
- change module settings;
- change module resolution;
- change target settings;

unless the task explicitly requires such a configuration change.

Fix type problems at their actual source whenever reasonably possible.

---

# 2. Preserve the Existing Module System

Respect the module system already used by the project.

Do not convert between:

- CommonJS and ESM;
- `require()` and `import`;
- default imports and named imports;
- dynamic and static imports;

unless required by the task.

Do not perform project-wide import modernization as part of an unrelated change.

When an import causes a compiler or runtime problem, investigate the package exports, TypeScript configuration, and existing project conventions before changing the module architecture.

A solution that only satisfies the TypeScript compiler but breaks runtime behavior is not acceptable.

---

# 3. Preserve Existing Dependencies

Use the libraries already selected by the project.

Do not replace an existing library with:

- a native Node.js API;
- another npm package;
- a custom implementation;

unless explicitly requested or technically necessary.

For example, if existing code uses an HTTP client, parser, date library, or utility package, continue using it when modifying related functionality.

Do not use a TypeScript task as an opportunity to reduce, modernize, or reorganize dependencies.

---

# 4. Avoid `any`

Do not introduce `any` merely to make TypeScript accept an implementation.

Prefer:

- explicit interfaces;
- type aliases;
- generics;
- `unknown`;
- type guards;
- runtime validation;
- narrowing;

depending on the situation.

Existing `any` types outside the requested scope should not automatically be changed.

Do not perform unrelated type-cleanup.

---

# 5. External Data Is Not Automatically Type-Safe

TypeScript types do not validate runtime data.

Data originating outside the application must not be considered trustworthy solely because an interface describes its expected structure.

External data may include:

- HTTP responses;
- JSON;
- configuration;
- files;
- messages;
- environment variables;
- user input;
- third-party APIs.

When the existing code validates such data at runtime, preserve that validation.

Do not replace runtime validation with TypeScript type assertions.

For example, avoid treating:

```ts
const response = externalData as ApiResponse;
```

as proof that `externalData` actually conforms to `ApiResponse`.

Type assertions do not validate runtime values.

---

# 6. API Response Types

When working with external APIs, define or update types according to the actual API data used by the application.

Keep transport/API response types separate from internal application models when the existing architecture makes that distinction.

When an external API changes, prefer updating:

1. the affected API response types;
2. the affected runtime checks where necessary;
3. the affected mapping code;
4. directly affected tests.

Do not redesign unrelated internal models merely because the external response structure changed.

Do not invent optionality, fields, enums, or response structures that are not supported by the available API information.

---

# 7. Type Assertions

Use type assertions sparingly.

Do not use assertions primarily to silence compiler errors.

Avoid constructs such as:

```ts
value as SomeType
```

when the actual type of `value` has not been established.

Never use double assertions such as:

```ts
value as unknown as SomeType
```

merely to bypass incompatible types.

If an assertion is genuinely necessary because TypeScript cannot infer information that is known to be valid, keep the assertion local and make its reason understandable from the surrounding code.

---

# 8. Non-Null Assertions

Avoid introducing the non-null assertion operator (`!`) merely to silence null or undefined errors.

Do not replace:

```ts
if (value !== undefined) {
    use(value);
}
```

with:

```ts
use(value!);
```

unless the invariant is actually guaranteed and clear.

For user configuration, API responses, external data, and optional values, prefer explicit handling of missing values.

Preserve existing defensive checks.

---

# 9. Null and Undefined

Handle `null` and `undefined` according to the semantics of the existing code and external interfaces.

Do not automatically convert between:

- `null`;
- `undefined`;
- empty strings;
- zero;
- `false`;

because these values may have different meanings.

Do not use truthiness checks where valid falsy values are possible.

For example, consider whether:

```ts
if (value)
```

would incorrectly reject valid values such as `0`, `false`, or `""`.

Follow the existing behavior unless the task explicitly changes it.

---

# 10. Optional Chaining and Nullish Coalescing

Use optional chaining (`?.`) and nullish coalescing (`??`) where they improve clarity and preserve the intended semantics.

Do not use them to hide invalid or unexpected data.

For example, silently turning missing required API data into `undefined` may make an error harder to diagnose.

Required values should remain subject to appropriate validation.

Do not replace meaningful validation with long optional-chaining expressions.

---

# 11. Functions and Return Types

Preserve existing function contracts.

Do not change parameter types, return types, synchronous/asynchronous behavior, or error semantics unless required by the task.

When adding public or important internal functions, prefer clear parameter and return types.

Do not broaden types unnecessarily merely to accommodate one new case.

For example, do not change:

```ts
function process(value: string): Result
```

to:

```ts
function process(value: any): any
```

to avoid implementing proper type handling.

---

# 12. Async/Await and Promises

Follow the asynchronous style already established in the relevant code.

Do not convert unrelated Promise chains to `async`/`await`, or vice versa, as part of another task.

Always handle asynchronous failures appropriately.

Do not introduce:

- floating Promises;
- unhandled Promise rejections;
- forgotten `await`;
- unnecessary Promise wrappers.

When parallelizing asynchronous operations, verify that execution order and side effects do not require sequential processing.

Do not introduce concurrency merely as a performance optimization unless requested.

---

# 13. Error Handling

Preserve existing error-handling semantics.

Do not use TypeScript constructs to hide runtime errors.

When handling caught errors, remember that the caught value may not necessarily be an `Error` object.

Narrow error types appropriately before accessing properties that are not guaranteed to exist.

Do not replace detailed error handling with:

```ts
catch {
    // ignore
}
```

unless ignoring the error is intentional and appropriate.

---

# 14. Interfaces and Type Aliases

Follow the convention already used by the project for interfaces and type aliases.

Do not convert all interfaces to type aliases, or vice versa, as an unrelated cleanup.

When modifying existing types, make the smallest change required by the new behavior.

Do not rename existing types merely to match personal naming preferences.

---

# 15. Enums and Literal Types

Preserve the project's existing approach to enums, constants, and literal union types.

Do not replace enums with union types, or union types with enums, merely because one style is preferred.

When external APIs define a limited set of known values, do not assume the set is exhaustive unless the API contract guarantees it.

Consider how unexpected future values should be handled when processing external data.

---

# 16. Object Shapes

Do not unnecessarily reconstruct or spread objects merely to achieve a different coding style.

Be especially careful with:

```ts
{ ...existingObject }
```

because spreading objects may unintentionally:

- copy properties that should not be propagated;
- lose prototype behavior;
- change optional-property semantics;
- overwrite properties depending on order.

Preserve existing explicit mapping when it documents which external properties are intentionally transferred into internal data.

---

# 17. Mapping External Data

When mapping external data to internal structures:

- map fields explicitly when practical;
- preserve existing transformations;
- preserve unit conversions;
- preserve default handling;
- preserve plausibility checks;
- preserve fallback behavior.

Do not replace explicit mapping with broad object spreading simply because property names currently match.

Explicit mappings often define an intentional boundary between an external API and the application's internal model.

---

# 18. Readonly and Mutability

Preserve existing mutability semantics.

Do not introduce `readonly`, immutable structures, or mutation-based alternatives across unrelated code as a stylistic improvement.

When modifying an existing object, follow the established project pattern unless changing mutability is part of the task.

---

# 19. Imports

Keep imports focused and consistent with the existing project.

Do not reorder or rewrite all imports in a file unless the project's formatter or linter requires it.

Do not change import style merely because another form is equivalent.

Remove an import when it becomes unused as a direct result of the requested change.

Do not remove dependencies or imports whose usage or side effects are unclear without investigating them first.

---

# 20. Linting and Formatting

Respect the project's existing ESLint, formatter, and TypeScript rules.

Do not disable lint rules merely to make new code pass.

Avoid adding:

```ts
// eslint-disable
```

or:

```ts
// @ts-ignore
```

unless there is a specific and justified reason.

Never use broad file-level suppression when a local and type-safe solution is possible.

Do not perform unrelated formatting changes.

Let the configured project tooling define formatting and style.

---

# 21. TypeScript Error Suppression

Compiler-error suppression is a last resort.

Do not introduce:

- `@ts-ignore`;
- `@ts-nocheck`;
- unnecessary `@ts-expect-error`;
- broad ESLint suppression;

as a substitute for correcting the implementation.

If `@ts-expect-error` is genuinely necessary, the surrounding code should make clear why the compiler is intentionally expected to report an error.

Do not suppress a new error without understanding its cause.

---

# 22. Do Not Modernize Unrelated Code

Do not automatically replace existing constructs with newer syntax.

Examples include:

- converting functions to arrow functions;
- replacing loops with array methods;
- replacing array methods with loops;
- changing Promise syntax;
- introducing destructuring;
- introducing optional chaining;
- introducing new ECMAScript features;
- changing class fields;
- replacing existing utility functions with native alternatives.

Newer syntax is not automatically better for an existing codebase.

Use the existing local style unless the requested change benefits directly from another construct.

---

# 23. Respect Runtime Compatibility

TypeScript compilation success does not guarantee runtime compatibility.

When changing TypeScript code, consider the runtime environment defined by the project.

Do not introduce APIs solely because they exist in the developer's current Node.js version if the project supports older runtime versions.

Use the project's declared runtime requirements as the compatibility boundary.

Do not silently increase the minimum runtime requirement.

---

# 24. Before Completing a TypeScript Change

Verify that:

- the code satisfies the existing TypeScript configuration;
- no compiler settings were weakened;
- no new `any` was introduced without a valid reason;
- no unsafe type assertion replaced runtime validation;
- existing null/undefined handling was preserved;
- existing API validation was preserved;
- function contracts were not unintentionally changed;
- asynchronous errors are handled;
- the module system remains unchanged;
- dependencies remain unchanged unless modification was required;
- lint rules were not suppressed unnecessarily;
- unrelated TypeScript code was not modernized or reformatted.

---

# Core TypeScript Principle

TypeScript should make the existing program safer and easier to understand.

It must not be used to create the appearance of type safety while bypassing runtime uncertainty.

**Prefer correct types, explicit boundaries, and existing project conventions over assertions, suppressions, and unsolicited modernization.**