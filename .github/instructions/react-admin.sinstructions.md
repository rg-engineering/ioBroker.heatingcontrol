---
applyTo: "src-admin/**/*.ts,src-admin/**/*.tsx"
---

# React Admin Development Instructions

These instructions apply to the React-based administration interface of this ioBroker adapter.

They supplement the general repository, ioBroker, and TypeScript instructions.

The existing React Admin implementation, component structure, dependencies, configuration handling, styling, and UI behavior are intentional unless explicitly stated otherwise.

---

# 1. Respect the Existing Admin Architecture

Preserve the existing React Admin architecture.

Do not redesign, restructure, or replace the administration interface unless explicitly requested.

Follow the patterns already established in the current project.

Do not use a local change as an opportunity to:

- reorganize the complete component hierarchy;
- introduce a new state-management solution;
- introduce a new UI framework;
- replace existing ioBroker Admin components;
- replace existing Material UI components;
- migrate to another admin technology;
- rewrite class components as functional components or vice versa;
- introduce new architectural abstractions.

Make the smallest reasonable change required by the task.

---

# 2. Installed Dependencies Are Authoritative

Treat the project's `package.json` and installed dependency definitions as authoritative.

Before using APIs, components, hooks, properties, or patterns from a dependency, consider the version actually declared by the project.

Do not assume a particular version of:

- React;
- Material UI;
- ioBroker Admin packages;
- TypeScript;
- build tools;
- supporting libraries.

Do not write code for a newer or older API merely because that API is familiar.

Use APIs compatible with the dependencies currently declared by the project.

Do not change dependency versions as part of an unrelated UI task.

Dependency updates are handled separately from normal implementation tasks.

If an installed dependency version does not support a desired implementation, inform the user rather than silently upgrading or replacing the dependency.

---

# 3. Preserve Existing Component Patterns

Follow the component patterns already used in the project.

Before introducing a new component or implementation pattern, inspect nearby existing components for established conventions.

Preserve existing approaches to:

- component structure;
- properties;
- hooks;
- state;
- callbacks;
- forms;
- dialogs;
- layout;
- navigation;
- configuration access;
- error handling.

Do not introduce a new pattern merely because it is considered more modern.

Consistency within the existing project is preferred over stylistic modernization.

---

# 4. Prefer Existing UI Components

Reuse components and UI abstractions already used by the project.

If the project already uses appropriate components from:

- ioBroker Admin;
- Material UI;
- existing project components;

prefer those components over introducing custom replacements.

Do not add another UI library for functionality that can reasonably be implemented using the existing dependencies.

Do not recreate functionality already provided by an existing project component without a clear reason.

---

# 5. Material UI

Follow the Material UI version and patterns defined by the project's dependencies.

Do not assume that examples from another Material UI version are compatible.

Do not migrate deprecated or older Material UI patterns across unrelated code merely because newer alternatives exist.

When implementing new functionality, prefer APIs supported by the currently installed version.

If existing code uses an older but still functional pattern, leave it unchanged unless modifying that code is necessary for the task.

Do not perform project-wide MUI migrations as part of a feature or bug fix.

---

# 6. Configuration Is a Compatibility Interface

The Admin UI edits configuration used by the running adapter.

Treat existing configuration property names and semantics as compatibility-sensitive.

Do not:

- rename configuration properties;
- remove configuration properties;
- change their meaning;
- change default behavior;
- change value types;
- silently transform stored values;

unless explicitly requested.

Existing installations may already contain values created by previous adapter versions.

A UI field name being inconvenient or inconsistent is not sufficient reason to change the underlying configuration property.

---

# 7. Separate UI Labels from Configuration Keys

Do not rename internal configuration properties merely to improve user-visible wording.

User-visible labels and descriptions should be handled through the existing translation or UI mechanism.

For example, a configuration property may intentionally retain an older technical name for compatibility while the UI presents a clearer label.

Preserve this separation.

---

# 8. Configuration Validation

Do not assume that values entered through the Admin UI are automatically valid at runtime.

Client-side validation improves usability but does not replace runtime validation in the adapter.

Do not remove adapter-side validation because equivalent validation exists in the Admin UI.

When adding Admin validation:

- keep it focused on user feedback;
- preserve existing runtime validation;
- do not create incompatible validation rules between Admin and runtime code.

Do not silently modify invalid values unless that behavior is explicitly intended.

---

# 9. Sensitive Configuration

Treat passwords, API keys, tokens, secrets, and authentication information as sensitive.

Use the security mechanisms already established by the project and ioBroker.

Do not:

- display secrets unnecessarily;
- log secrets;
- copy secrets into state;
- expose secrets through error messages;
- convert password fields to normal text fields;
- remove existing encryption-related handling;
- store additional copies of secrets.

Do not assume that encryption or decryption happens automatically unless this is established by the project's implementation and applicable ioBroker mechanism.

Changes to sensitive configuration handling require particular care and should remain narrowly scoped.

---

# 10. State Management

Use the state-management approach already established by the Admin application.

Do not introduce Redux, Zustand, Context-based application state, or another state-management system merely for convenience.

Use local component state where the existing architecture uses local state.

Use existing shared state mechanisms where they already exist.

Do not move state between components as an unrelated refactoring.

---

# 11. React Hooks

Follow the hook patterns already established in the project.

When using hooks:

- respect React hook rules;
- use dependency arrays correctly;
- avoid unnecessary effects;
- avoid effects that create update loops;
- clean up subscriptions, timers, and listeners where required.

Do not use `useEffect` as a generic mechanism for deriving values that can be calculated directly during rendering.

Do not introduce memoization with `useMemo` or `useCallback` without a concrete reason.

Do not remove existing memoization merely because it appears unnecessary without understanding why it was introduced.

---

# 12. Side Effects

Keep side effects explicit and controlled.

Be careful with:

- configuration loading;
- configuration saving;
- asynchronous requests;
- timers;
- subscriptions;
- event listeners;
- communication with the adapter;
- communication with ioBroker.

Do not trigger persistent configuration changes automatically merely because a component renders.

Do not create repeated requests or save loops through incorrect effect dependencies.

Preserve existing cleanup behavior.

---

# 13. Forms and Input Fields

Preserve the semantics of existing input fields.

Consider the difference between:

- empty values;
- `undefined`;
- `null`;
- zero;
- `false`.

Do not use truthiness checks when valid falsy values are possible.

Do not silently change stored value types when processing form input.

For numeric inputs, consider that UI input values may temporarily be empty or represented as strings during editing.

Follow existing project conventions for converting and validating input values.

---

# 14. Save Behavior

Preserve the existing configuration save mechanism.

Do not introduce alternative persistence mechanisms.

Do not save configuration automatically unless the existing UI intentionally behaves that way.

Do not bypass existing validation or change-tracking mechanisms.

If the UI tracks whether configuration has changed, preserve that behavior.

A visual UI change should not unintentionally alter configuration persistence.

---

# 15. Internationalization

Use the project's existing translation mechanism for user-visible text.

Do not introduce hardcoded user-visible strings when the project uses translations.

When adding new user-visible text:

- add or use the appropriate translation key;
- follow existing naming conventions;
- preserve existing language fallback behavior.

Do not rename existing translation keys merely for stylistic consistency unless required.

Do not rewrite unrelated translations as part of another task.

Technical identifiers, internal values, and configuration keys should not be translated.

---

# 16. Layout and Responsive Behavior

Preserve the existing layout system.

Follow existing Material UI and project conventions for:

- spacing;
- containers;
- grids;
- breakpoints;
- field widths;
- alignment;
- dialogs.

Do not introduce a separate CSS framework or layout library.

When changing a UI element, consider different viewport sizes if the existing Admin interface supports responsive behavior.

Do not redesign surrounding UI merely to accommodate a small change.

---

# 17. Styling

Follow the existing styling approach used by the project.

Do not introduce another styling technology merely because it is preferred or newer.

Avoid unnecessary inline styling when the project uses another established approach.

Do not perform broad visual redesigns unless explicitly requested.

Preserve existing themes, including dark/light theme compatibility where supported by the current application.

Do not hardcode colors when the existing theme provides an appropriate semantic value.

---

# 18. Accessibility and Usability

New UI functionality should remain understandable and operable.

Where applicable:

- associate labels with inputs;
- use appropriate controls for the intended data;
- provide meaningful button labels;
- preserve keyboard usability;
- provide useful validation feedback.

Do not redesign unrelated existing UI solely to improve accessibility as part of another task.

If a significant existing accessibility problem is discovered outside the task scope, mention it separately rather than performing an unrelated redesign.

---

# 19. Error Feedback

Errors that affect the user's ability to configure the adapter should be communicated meaningfully.

Follow the project's existing mechanism for:

- validation messages;
- notifications;
- dialogs;
- warnings;
- error displays.

Do not expose raw internal exceptions to users when a meaningful message can be provided.

Do not hide errors that prevent configuration from being saved or used correctly.

Technical diagnostic information belongs in the appropriate logging mechanism, not necessarily in the user-facing UI.

---

# 20. Loading and Asynchronous UI States

When UI functionality performs asynchronous operations, preserve existing loading and disabled-state behavior.

Avoid allowing the same action to be triggered repeatedly while an operation is already in progress when that could cause duplicate operations.

Do not introduce global loading mechanisms for local operations unless required.

Follow existing project patterns.

---

# 21. Do Not Couple UI Changes to Runtime Refactoring

A change in the Admin UI does not automatically justify changes to the adapter runtime.

Modify runtime code only when the requested Admin functionality requires corresponding runtime behavior.

Similarly, do not redesign Admin code merely because runtime code is being changed.

Keep the boundary between:

- configuration UI;
- stored configuration;
- adapter runtime behavior;

clear.

---

# 22. Build and Tooling Configuration

Treat the existing Admin build configuration as intentional.

Do not modify:

- Vite configuration;
- Webpack configuration;
- TypeScript configuration;
- ESLint configuration;
- package scripts;
- module federation configuration;
- build output structure;

unless required by the explicit task.

Do not change build tooling merely to implement a UI feature.

If a build-tool problem prevents the requested implementation, identify it separately before making substantial tooling changes.

---

# 23. Generated and Managed Files

Do not manually modify generated files unless the project explicitly expects them to be edited.

Do not modify lock files unless a dependency operation legitimately requires it.

Do not update dependencies or regenerate package metadata as a side effect of an unrelated source-code change.

---

# 24. Before Completing a React Admin Change

Verify that:

- the requested UI behavior was implemented;
- existing configuration keys remain compatible;
- unrelated configuration behavior was not changed;
- existing validation remains intact;
- sensitive values remain protected;
- the existing component architecture was preserved;
- existing dependencies were used;
- no dependency versions were changed;
- APIs are compatible with the versions declared by the project;
- no unrelated UI refactoring was performed;
- translation mechanisms were respected;
- theme behavior was preserved;
- save behavior was not unintentionally changed;
- runtime code was changed only when necessary.

Do not claim that the Admin UI was built, linted, tested, or executed unless that operation was actually performed and its result was observed.

---

# Core React Admin Principle

The Admin UI is the user's interface to an existing adapter configuration and therefore forms part of the adapter's compatibility contract.

**Preserve existing configuration semantics, use the dependencies and patterns actually present in the project, and make only the UI changes required by the user's request.**