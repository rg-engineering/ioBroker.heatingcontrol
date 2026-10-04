---
applyTo: "**/*.ts,**/*.tsx,**/io-package.json,**/admin/**,**/src-admin/**"
---

# ioBroker Adapter Development Instructions

These instructions apply to ioBroker adapter development.

They supplement the general repository instructions. If a rule here conflicts with a project-specific requirement explicitly given by the user, the explicit user requirement takes precedence.

---

# 1. Preserve the Existing Adapter Architecture

Treat the existing adapter architecture as intentional.

Do not redesign or restructure the adapter unless explicitly requested.

In particular, do not change:

- adapter lifecycle handling;
- initialization order;
- configuration handling;
- state and object structure;
- external API integration architecture;
- connection handling;
- timers and subscriptions;
- cleanup behavior;
- admin configuration architecture;

unless required by the explicit task.

Follow existing project patterns instead of introducing a different architecture.

---

# 2. Adapter Lifecycle

Preserve the existing ioBroker adapter lifecycle.

Typical lifecycle methods and handlers such as:

- `onReady`;
- `onStateChange`;
- `onObjectChange`;
- `onMessage`;
- `onUnload`;

may contain behavior that is important for existing installations.

Do not remove, merge, reorder, or substantially restructure lifecycle logic unless explicitly required.

Initialization performed during `onReady` or equivalent startup logic must remain compatible with existing behavior.

Cleanup performed during `onUnload` must not be removed or weakened.

When adding timers, intervals, subscriptions, connections, or other resources, ensure they can be cleaned up correctly.

---

# 3. User Configuration Is Untrusted Input

Never assume that adapter configuration is complete or valid.

Preserve existing validation of user-provided configuration.

This includes checks for values such as:

- API keys;
- usernames;
- passwords;
- host names;
- URLs;
- ports;
- IDs;
- locations;
- intervals;
- optional features;
- numeric limits;
- adapter-specific parameters.

Do not remove validation merely because a configuration property is defined in a TypeScript type, JSON schema, admin interface, or default configuration.

Configuration definitions describe possible values; they do not guarantee valid runtime values.

Existing validation may intentionally protect against incomplete configurations from older installations.

---

# 4. Configuration Compatibility

Existing configuration property names are part of the adapter's compatibility contract.

Do not rename, remove, reinterpret, or change existing configuration properties unless explicitly requested.

Assume that existing installations may contain configuration created by previous adapter versions.

When adding configuration properties:

- preserve compatibility with existing configurations;
- provide sensible defaults where appropriate;
- consider installations where the new property does not yet exist;
- follow the project's existing admin configuration pattern.

Do not perform configuration migrations unless they are actually required.

---

# 5. io-package.json

Treat `io-package.json` as a critical adapter definition.

Do not modify unrelated sections of `io-package.json`.

When a task requires changes to `io-package.json`, modify only the necessary properties.

Do not:

- rename existing native configuration properties without explicit reason;
- remove existing objects or states;
- change object IDs;
- change roles or types without checking compatibility;
- change dependencies unrelated to the task;
- change adapter metadata unrelated to the task;
- change encrypted configuration declarations without explicit reason.

Preserve existing `encryptedNative` entries and other security-related configuration.

Do not expose secrets by moving encrypted properties to unprotected configuration.

---

# 6. States and Objects Are a Public Interface

Treat existing ioBroker state IDs and object IDs as externally visible APIs.

Users may reference these IDs from:

- scripts;
- VIS visualizations;
- automations;
- Node-RED;
- Blockly;
- other adapters;
- external integrations.

Therefore, do not rename, move, or remove existing state or object IDs unless explicitly requested.

Do not change an existing state's:

- ID;
- type;
- role;
- read/write behavior;
- unit;
- meaning;

without considering backward compatibility.

A more logical or cleaner state structure is not sufficient justification for breaking an existing structure.

---

# 7. State Values and Acknowledgement

Preserve the existing semantics of state updates.

Do not change the meaning of `ack` values or state-writing behavior without understanding the existing flow.

Distinguish between:

- values written by the adapter;
- commands written by users or other systems;
- acknowledged states;
- unacknowledged commands.

Do not introduce state-update loops.

When modifying `onStateChange` or equivalent handlers, consider whether adapter-generated state changes can trigger the same handler again.

---

# 8. External APIs

When an adapter communicates with an external API, preserve the existing integration architecture unless explicitly requested otherwise.

For API changes, prefer adapting only:

- request parameters;
- request payloads;
- response interfaces/types;
- response parsing;
- response mapping;
- directly affected error handling;
- directly affected tests.

Do not use an external API change as an opportunity to:

- replace the HTTP client;
- replace an existing library;
- redesign the API abstraction;
- restructure unrelated adapter code;
- remove configuration validation;
- remove error handling;
- change logging behavior.

If the adapter currently uses a specific HTTP client or library, continue using it unless the task explicitly requires otherwise.

Never invent API fields, response structures, limits, or semantics.

If API documentation or sample data is insufficient, ask for clarification.

---

# 9. Error Handling

Preserve existing error handling.

External systems can fail because of:

- network problems;
- DNS failures;
- timeouts;
- authentication failures;
- authorization failures;
- rate limits;
- invalid responses;
- changed response formats;
- unavailable services;
- incomplete user configuration.

Do not assume that a successful HTTP request implies valid application data.

Validate external data where appropriate before using it.

Do not replace specific error handling with generic handling unless required.

Do not silently ignore failures that were previously visible to the user.

---

# 10. Logging

Use the adapter's existing logging infrastructure.

Prefer the established ioBroker logging methods such as:

- `this.log.silly(...)`;
- `this.log.debug(...)`;
- `this.log.info(...)`;
- `this.log.warn(...)`;
- `this.log.error(...)`;

or the equivalent pattern already used by the project.

Do not introduce `console.log`, `console.error`, or similar output when adapter logging is available.

Preserve existing log messages unless the task requires changing them.

Choose log levels according to their purpose.

Do not log sensitive information such as:

- passwords;
- API keys;
- access tokens;
- refresh tokens;
- authentication headers;
- credentials.

Be careful when logging complete request or configuration objects because they may contain sensitive information.

---

# 11. Connection State

If the adapter maintains a connection state such as:

`info.connection`

preserve its existing semantics.

Do not set a connection state merely because adapter initialization completed.

Connection status should represent the meaning already established by the adapter.

If changing connection handling, consider:

- successful communication;
- failed communication;
- authentication failures;
- disconnection;
- shutdown.

Do not redesign connection-state semantics unless explicitly requested.

---

# 12. Timers, Intervals, and Scheduled Work

Preserve existing scheduling behavior unless the task requires changing it.

When adding or modifying:

- `setTimeout`;
- `setInterval`;
- cron jobs;
- polling;
- delayed execution;
- recurring API requests;

consider adapter shutdown and cleanup.

Do not accidentally create multiple timers for the same task.

Do not change polling intervals or timing behavior as an unrelated optimization.

---

# 13. Asynchronous Operations

Follow the asynchronous style already established in the adapter.

Do not convert between callbacks, Promises, and `async`/`await` across unrelated code merely for stylistic reasons.

Handle asynchronous failures appropriately.

Do not introduce unhandled Promise rejections.

During shutdown, avoid starting unnecessary new asynchronous work.

---

# 14. Admin Configuration

Preserve the admin technology already used by the project.

An ioBroker adapter may use different admin implementations, for example:

- JSON Config;
- React-based admin;
- custom admin implementations.

Do not migrate from one admin approach to another unless explicitly requested.

Follow the existing admin implementation and its established patterns.

Do not assume that behavior from one admin technology automatically applies to another.

---

# 15. Sensitive Configuration

Treat credentials and authentication data as sensitive.

Preserve existing encryption mechanisms and encrypted configuration declarations.

Do not:

- log secrets;
- expose secrets in error messages;
- store secrets in states;
- move encrypted configuration into plain-text storage;
- include credentials in diagnostic output.

When working with encrypted configuration, follow the mechanism already used by the adapter and the applicable ioBroker API.

Do not assume encryption or decryption behavior without verifying the mechanism used by the project.

---

# 16. Backward Compatibility

Backward compatibility is important for ioBroker adapters.

Assume that users may update directly from older adapter versions and may have:

- older configuration data;
- existing states and objects;
- scripts depending on existing IDs;
- visualizations depending on existing IDs;
- automations depending on existing behavior.

Avoid breaking these installations unless a breaking change is explicitly required.

When a breaking change appears necessary, inform the user instead of silently implementing it.

---

# 17. Object and State Creation

Follow the existing project strategy for creating and extending objects.

Do not switch between object-management APIs merely because another API appears more convenient.

Preserve existing object definitions where possible.

Do not recreate or overwrite objects unnecessarily.

When extending existing objects, consider whether users may already have those objects from previous adapter versions.

---

# 18. Adapter Shutdown

Adapter shutdown must remain reliable.

Preserve cleanup of:

- timers;
- intervals;
- subscriptions;
- sockets;
- HTTP connections;
- external clients;
- file handles;
- other allocated resources.

Do not remove cleanup code because it appears unnecessary during normal execution.

Shutdown behavior may affect adapter restarts and ioBroker host stability.

---

# 19. Dependencies

Do not add, remove, replace, or upgrade npm dependencies unless required by the explicit task.

Do not replace a dependency simply because equivalent functionality exists in the current Node.js runtime.

Do not run broad dependency modernization as part of an unrelated task.

When a dependency change is required, consider:

- supported Node.js versions;
- ioBroker compatibility;
- TypeScript compatibility;
- ESM/CommonJS compatibility;
- existing tests;
- runtime behavior.

Keep dependency changes separate and focused whenever possible.

---

# 20. Tests

Preserve existing adapter tests.

Tests may verify:

- adapter startup;
- configuration handling;
- state creation;
- API mapping;
- error handling;
- lifecycle behavior;
- integration behavior.

Do not weaken or remove tests to accommodate a code change.

When external API behavior changes, prefer adding or adapting focused tests for the affected parsing or mapping logic.

Avoid rewriting unrelated tests.

---

# 21. Do Not Assume All ioBroker Adapters Are Identical

Different adapters may intentionally use different:

- admin technologies;
- dependencies;
- project structures;
- APIs;
- state models;
- configuration mechanisms;
- test frameworks;
- build systems.

Inspect the current repository before making assumptions.

Existing repository conventions take precedence over generic preferences.

Do not copy architectural patterns from another adapter unless explicitly requested or clearly applicable.

---

# 22. Before Completing an ioBroker Change

Verify that the change did not unintentionally affect:

- adapter startup;
- configuration validation;
- existing state IDs;
- existing object IDs;
- state types and roles;
- `ack` semantics;
- connection state;
- logging;
- error handling;
- encrypted configuration;
- polling or timers;
- adapter shutdown;
- backward compatibility.

For changes involving an external API, additionally verify that:

- existing user configuration is still validated;
- the existing HTTP client is preserved unless changing it was required;
- unexpected or incomplete API responses are handled appropriately;
- only the necessary mapping/parsing behavior was changed.

---

# Core ioBroker Principle

An installed ioBroker adapter is part of an existing automation system.

Its configuration, states, object IDs, timing, and behavior may be dependencies of other scripts, visualizations, automations, and systems.

Therefore:

**Preserve existing externally observable behavior unless changing that behavior is an explicit part of the task.**