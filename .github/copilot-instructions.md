
# Instruction

All rules in this document should be treated as strict coding and architectural requirements for this repository.  
When generating or editing code, always choose the option that is consistent with these rules.  
When reviewing code, Copilot must also evaluate changes according to these rules and suggest corrections whenever the submitted code violates any of them.

# Repository Overview

- **Rule:** Vera is a video call application built with Vonage Video API and is being transformed into a reusable component library for Vonage Video API React SDK users.
- **Rule:** Video components, hooks, and primitives must be extracted into `libs/ui` and `libs/core`.
- **Rule:** Backend-agnostic Vonage Video API handler logic must live in `libs/api`.
- **Rule:** New features must be designed with **reusability** in mind and must remain **agnostic of Vera** wherever possible.

---

# Project Architecture & Libraries

This is a mono repo containing:

- Libs: `ui`, `core`, `common`, `api`
- Main projects: `frontend`, `backend`
- `integration-test`

---

# Technology Stack

- Frontend: React, TypeScript, MUI, react-router-dom, axios  
- Backend: Node.js, TypeScript, Express  
- Integration tests: Playwright, TypeScript  
- libs/ui: React, TypeScript, MUI  
- libs/core: React, TypeScript  
- libs/common: React, TypeScript  

React version: `^19.2`  
TypeScript version: `^5.8.3`

---

# General Development Guidelines, Import Rules

## Library and feature placement

- **Rule:** If a component is completely stateless and generic, it must be placed in:
  - `libs/ui` for visual components  
  - `libs/core` if it is faceless (non-visual logic).
  - `libs/common` for helpers, utilities, and hooks that are agnostic of the project.
- **Rule:** Vera-specific business logic (roles, permissions, product policy/decisions) must stay in the app layer (`frontend`/`backend`).
- **Rule:** This is **especially enforced** for video-related components such as publishers, subscribers, sessions, `videoView`s, etc.
- **Rule:** Helpers, utilities, and hooks that are agnostic of the project must be placed in `libs/common`.
- **Rule:** Logic that is shared between different projects (**frontend**, **backend**, **libs**) should be proposed for `libs/common`.
- **Rule:** Do not add new dependencies. Use only the installed dependencies.
- **Rule:** Do not add new state management libraries. Use only existing tooling.
- **Rule:** Components must be kept small, focused, and composable.

## Import rules

- **Rule:** Always prefer specific imports over deep namespace imports.

**Violation:**

```tsx
// Bad
import { isNil } from 'lodash';
```

**Correct:**

```tsx
// Good
import isNil from 'lodash/isNil';
```

---

# Coding Style & Programming Patterns

- **Rule:** Prefer early returns / fast-fail to reduce nesting.
- **Rule:** Prefer **linear code** whenever possible.
- **Rule:** Prefer IIFE (Immediately Invoked Function Expression) for computing values linearly instead of branching assignments.

**Violation:**

```tsx
// Bad
let url = '';

if (condition1) {
    url = 'value1';
} else {
    if (condition2) {
        url = 'value2';
    } else {
        url = 'value3';
    }
}

this.API_URL = url;
```

**Correct:**

```tsx
// Good
const url = (() => {
    if (condition1) return 'value1';
    if (condition2) return 'value2';
    return 'value3';
})();

this.API_URL = url;
```

- **Rule:** Use named boolean expressions or named helper functions for complex boolean conditions.

**Violation:**

```tsx
// Bad
if (user.isAdmin && user.isActive && hasValidSubscription(user)) {
    // ...
}
```

**Correct:**

```tsx
// Good
const isUserEligible =
    user.isAdmin && user.isActive && hasValidSubscription(user);

if (isUserEligible) {
    // ...
}
```

**Correct (extracted helper):**

```tsx
// Good
if (isUserEligible(user)) {
    // ...
}
```

**Correct (simple null check):**

```tsx
// Good
if (isNil(data)) return;
```

- **Rule:** Acronyms in names are banned across the codebase, except `req` and `res` when working with Express `Request` and `Response`.
- **Rule:** Use fully descriptive names, even if they are longer. Minification handles bundle size.

**Violation:**

```tsx
// Bad
function fetchUsrDtls() {
    // ...
}
```

**Correct:**

```tsx
// Good
function fetchUserDetails() {
    // ...
}
```

**Violation:**

```tsx
// Bad
const vc = new VideoClient();
```

**Correct:**

```tsx
// Good
const videoClient = new VonageVideoClient();
```

- **Rule:** Prefer linear `tryCatch` helpers instead of nested `try/catch`.
- **Rule:** Nested `try/catch` blocks are banned.

**Violation:**

```tsx
// Bad
const ValidateRequest = async (req) => {
    const validator = new RequestValidator();

    let error = null;
    let data = null;
    
    // nested try/catch just make the code messy and hard to read
    try {
        data = parseRequest(req.body);
    } catch (error) {
        error = error;
    }

    if(error || !data) {
        validator.addError(error?.message || 'Unknown parsing error');
    }

    // this is okay
    validator.assert();
};
```

**Correct:**

```tsx
// Good
import tryCatch from '@common/execution/tryCatch';

const myFunction = async () => {
    const { result: data, error } = await tryCatch(() => fetchData());

    if (error) {
       console.error('Error fetching data:', error);
       return defaultValue;
    };

    return data;
};
```

## Type modeling & correctness

- **Rule:** Prefer `named parameters` for functions with 2+ parameters or parameters of the same type. 

**Violation:**

```tsx  
// Bad
function createUser(name: string, age: number, isAdmin: boolean) {
    // ...
}

// Call site is hard to read, what does true mean?
createUser('Alice', 30, true);
``` 

**Correct:**

```tsx
// Good
function createUser(args: { name: string; age: number; isAdmin: boolean }) {
    // ...
}

// Call site is clear and readable
createUser({ name: 'Alice', age: 30, isAdmin: true });
```
- **Rule:** Prefer type conjunctions (unions/intersections) over optional properties.

**Violation:**

```tsx
// Bad
type PaymentMethod = {
  methodType: 'card' | 'bankTransfer' | 'cash';

  // card-specific
  cardNumber?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;

  // bank-transfer-specific
  IBAN?: string;

  // cash-specific
  cashReceivedByEmployeeId?: string;
};

const charge = (paymentMethod: PaymentMethod): Promise<void>;

// everything is optional, there is not type safety
charge({
  methodType: 'card',
});
```

**Correct:**

```tsx
type MethodType = 'card' | 'paypal' | 'bank_transfer';

type BasePaymentMethod<M extends MethodType> = {
  methodType: M;
};

type CardPaymentMethod = BasePaymentMethod<'card'> & {
  methodType: 'card';
  cardNumber: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
};

type PayPalPaymentMethod = BasePaymentMethod<'paypal'> & {
  methodType: 'paypal';
  email: string;
};

type BankTransferPaymentMethod = BasePaymentMethod<'bank_transfer'> & {
  methodType: 'bank_transfer';
  accountNumber: string;
  routingNumber: string;
};

type PaymentMethod = CardPaymentMethod | PayPalPaymentMethod | BankTransferPaymentMethod;

const charge = (paymentMethod: PaymentMethod): Promise<void>;

charge({
  methodType: 'card',
}); // Error: missing cardNumber, cardExpiryMonth, cardExpiryYear

charge({
  methodType: 'card',
  cardNumber: '1234567890123456',
  cardExpiryMonth: 12,
  cardExpiryYear: 2025,
}); // OK

charge({
  methodType: 'paypal',
  email: 'john@some.com',
  routingNumber: '123456',
}); // Error: routingNumber is not valid for PayPal
```

- **Rule:** Always use `type` for type-only imports.

**Violation:**

```tsx  
// Bad
import { User } from './types';
```

**Correct:**

```tsx
// Good
import type { User } from './types'; // this will not be included in the compiled JS
```

- **Rule:** Prefer `type` over `interface` for type definitions.

**Violation:**

```tsx
// Bad
interface User {
    id: string;
    name: string;
}
```

**Correct:**

```tsx
// Good
type User = {
    id: string;
    name: string;
};

// Good: This is okay since function overloads are not supported in the same way with `type`.
// Using a union of function types is not equivalent and is usually less readable with worse IntelliSense/error messages.
interface Select<State> {
    <Selected>(callback: (state: State) => Selected): Selected;

    <Selected, Result>(callback: (state: State) => Selected, transformer: (selected: Selected) => Result): Result;
}

// Good: This is an actual interface intend to be implemented by classes.
interface ILogger {
    log(message: string): void;
    error(message: string): void;
}
```

- **Rule:** Ban string IDs... Always prefer to use branded types for identifiers.

**Violation:**

```tsx
// Bad
type User = {
    id: string; // string ID is not type-safe
    name: string;
};
```

**Correct:**

```tsx
declare const _brand: unique symbol;

// Good
type UserId = string & { [__brand]: 'UserId' };

type User = {
    id: UserId; // branded type ID is type-safe
    name: string;
};

// Even Better
// This allows us to run-time validate ids
type UserId = `user:${string}` & { [__brand]: 'UserId' };

// Good
// If the brand is duplicated across different entities use symbols
declare const UserIdBrand: unique symbol;

// Try to avoid duplicating prefixes and brands but if necessary use symbols
type UserId = `user:${string}` & { [__brand]: typeof UserIdBrand };
```
---

# Folder and File Structure

We use a **domain-driven** folder structure.

- **Rule:** Each feature/domain must live in its own folder and contain all related components, hooks, utils, types, etc.
- **Rule:** Generic "global" buckets like `components/`, `hooks/`, `utils/` at the top are discouraged as a catch-all for unrelated features.

**Violation:**

```plaintext
// Bad

src/
  components/
    Header.tsx
    Footer.tsx
    UserProfile.tsx
  hooks/
    useAuth.ts
    useFetchData.ts
  utils/
    formatDate.ts
    calculateAge.ts
```

**Correct:**

```plaintext
// Good

src/
  components/
    Banner/
      index.ts
      Banner.tsx
      Banner.test.tsx
    Separator/
      index.ts
      Separator.tsx
      Separator.test.tsx
  features/
    Auth/
      components/
        LoginForm/
          components/
            UsernameInput.tsx
            PasswordInput.tsx
          hooks/
            useLogin.ts
          helpers/
            validateCredentials.ts
          index.ts
          LoginForm.tsx
          LoginForm.test.tsx
```

- **Rule:** Each domain may contain its own components, hooks, utils, types, etc. related strictly to that domain/feature.
- **Rule:** Do not overexpose components/helpers/utils/hooks/types to higher levels when they are only useful for a specific domain.
- **Rule:** Only promote an entity to a higher level when strictly necessary.
- **Rule:** When possible, each domain should have an `index.ts` that exports the default entry point of that domain (example: `LoginForm/index.ts` exporting `LoginForm.tsx`).

---

# Single-Responsibility Principle & File Organization

- **Rule:** Files must have a single responsibility. Each file should contain exactly one component, hook, util, type, etc.
- **Rule:** Test files are an exception. They can group multiple tests or small helpers for the thing being tested.

**Violation:**

```tsx
/**
* Bad
* src/helpers/utils.ts
*/

export const formatDate = (date: Date): string;
export const calculateAge = (birthDate: Date): number;
export const isAdult = (age: number): boolean;
// etc...
```

**Correct (split into multiple files):**

```tsx
/**
* Good
* src/helpers/formatDate.ts
*/
export const formatDate = (date: Date): string;

/**
* Good
* src/helpers/calculateAge.ts
*/
export const calculateAge = (birthDate: Date): number;

/**
* Good
* src/helpers/isAdult/
*               isAdult.ts
*               isAdult.test.ts
*/
```

- **Rule:** The default export of a file should be visible at first glance when opening the file.
- **Rule:** A file may contain a small number of internal helpers, but:
  - They should be declared as **function expressions** (not hoisted arrow functions) to keep linting and hoisting behavior predictable.
  - If there are more than 2 helpers, prefer splitting them into separate files inside the same domain/feature folder.

**Violation:**

```tsx
// Bad
// hooks/useComplexLogic.ts

// helpers are preventing use to see the main export at first glance
const helper1 = () => { ... };

const helper2 = () => { ... };

// too many helpers in the same file, this is probably a big file that is hard to understand and maintain
const helper3 = () => { ... };

const useComplexLogic = () => {   
    // complex logic using helpers
};

export default useComplexLogic;
```

**Correct (helpers inline but minimal):**

```tsx
// Good
// hooks/useComplexLogic/
//               useComplexLogic.ts

// Main export is visible at first glance
const useComplexLogic = () => {   
    // complex logic using helpers
};

// small reusable helper inside the same file, useful to increase readability or semantics
// this helpers is too specialized to be reused outside this file
function helper1() { ... }

export default useComplexLogic;
```

**Correct (helpers split out):**

```tsx
// Good
// hooks/useComplexLogic/
//               useComplexLogic.ts
import helper1 from './helpers/helper1';
import useSomething from './hooks/useSomething';

const useComplexLogic = () => {   
    // complex logic using helpers/hooks
};

export default useComplexLogic;
```

---

# React Component Guidelines

This section defines explicit rules for how components and styling with CSS/MUI/Tailwind must be written.

---

# Component Types & Reusability Rules

- **Rule:** Reusable components must be:
  - Generic
  - Stateless (or at least UI-focused and not tied to a specific screen)
  - Agnostic of any specific app/screen
  - Located in `libs/ui` or `libs/common`
- **Rule:** Screen-specific components must be located in `frontend` or `backend`.

**Correct reusable logic example:**

```tsx
const publisherRef = useStableRef(() => {
  return new OT.Publisher(...);
}, []); 
// useStableRef is agnostic of any specific screen or app, so it can be reused anywhere. Candidate for libs/common
```

```tsx
const { result, error } = await tryCatch(() => fetchDataFromApi()); 
// tryCatch is agnostic of any specific screen or app, so it can be reused anywhere. Candidate for libs/common
```

**Correct reusable UI example (libs/ui):**

```tsx
// Reusable UI component candidate (libs/ui)
export const Dialog = ({ children }) => {
  ...
  return (
    <dialog ref={ref}>
      {children}
    </dialog>
  );
}
// A dialog is agnostic of any specific screen or app, so it can be reused anywhere.
```

**Correct screen-specific example (frontend):**

```tsx
// Welcome page for the frontend app (frontend)
export const WelcomePager = () => {
  return (
    <PageLayout>
      <Banner />
      <WelcomeForm />
    </PageLayout>
  );
}
// The WelcomePager, Banner, WelcomeForm, PageLayout are specific to the frontend app and not reusable as generic components.
```

**Correct reusable UI example:**

```tsx
export const RadioButton = ({ selected, onSelect, label }) => {
  ...
  return (
    <input type="radio" checked={selected} onChange={onSelect} />
  );
}
// A RadioButton is a reusable UI component that can be used in multiple places.
```

**Correct domain-specific example (stays in frontend):**

```tsx
// Form which uses RadioButton (frontend)
export const SurveyForm = () => {
  ...
  return (
    <form>
      <RadioButton label="Option 1" ... />
      <RadioButton label="Option 2" ... />
    </form>
  );
}
// The SurveyForm is too specific, it can be reuse in certain domain but is not generic enough to be a reusable UI component.
```

---

# Async Logic & Suspense Usage Rules

- **Rule:** `setState` + `useEffect` patterns must not be used for async operations.
- **Rule:** Native `React.Suspense` and `React.use` must not be used directly.  
  Only `Suspense$` and `use$`/suspense-specific hooks provided by Vera are allowed.
- **Rule:** Asynchronous operations must be handled through:
  - `Suspense$` component
  - `use$`, `useSuspenseMemo`, or compatible Vera hooks
- **Rule:** `use$` must only be used inside a `Suspense$` boundary; by design it will throw an explicit error otherwise.

**Violation (async with state/effect):**

```tsx
// Bad: using useEffect and setState for async operations
// the component is actually rendering event when data is not ready yet, this could cause flickering, unnecessary re-renders and inconsistent states, make the code harder to read and maintain
const MyComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData().then((result) => setData(result))   
    }, []);

    // Super Bad: Conditional rendering root element
    if (!data) {
        return <div>Loading...</div>;
    }

    // potentially need to validate nulls everywhere
    return <ul>
            {data?.map((item) => (
                <li key={item.id}>{item.name}</li>
            ))}
         </ul>;
};
```

**Correct (use$ and Suspense-aware pattern):**

```tsx
// Good: uses Vera use$ hook and Suspense$ component for async operations
import use$ from '@ui/suspense/use$';

const fetchData = axios.get('https://some-api.com/data');

const MyComponent = () => {
    // data is the awaited result of fetchData promise
    // use$ is aware of the suspense context so it will throw if used outside a Suspense$ boundary
    const data = use$(fetchData);

    return <ul>
            {data.map((item) => (
                <li key={item.id}>{item.name}</li>
            ))}
         </ul>;
};
```

**Correct (useSuspenseMemo):**

```tsx
// Good
import useSuspenseMemo from '@ui/suspense/useSuspenseMemo';

const MyComponent = () => {
    // execute fetch data only once when the component is first rendered
    const data = useSuspenseMemo(() => fetchData(), []);

    // Data is typed as the awaited result of fetchData promise, no need to validate nulls
    return <ul>
            {data.map((item) => (
                <li key={item.id}>{item.name}</li>
            ))}
         </ul>;
};
```

**Correct (combining nullable data and Suspense memo):**

```tsx
// Good
import useSuspenseMemo from '@ui/suspense/useSuspenseMemo';

const MyComponent = () => {
    const { data: nullableData, fetchData } = useSomeContext(); // data could be null

    // if data was already in place there it can be returning directly preventing unnecessary suspense
    const data = useSuspenseMemo(() => {
        if (isNil(nullableData)) return fetchData();
        return nullableData;
    }, []);

    // Data is typed as the awaited result of fetchData promise, no need to validate nulls
    return <ul>
            {data.map((item) => (
                <li key={item.id}>{item.name}</li>
            ))}
         </ul>;
};
```

**Correct parent usage:**

```tsx
// Parent component
import Suspense$ from '@ui/suspense/Suspense$';

const ParentComponent = () => {
    return (
        // prefer skeleton instead of loading indicators/spinners
        <div>
            ... 
            <Suspense$ fallback={<MyComponentSkeleton />}>
                <MyComponent />
            </Suspense$>
        </div>
    );
};
```

---

# React Context Guidelines

- **Rule:** Do not create highly volatile contexts that change frequently and cause unnecessary re-renders.
- **Rule:** Context state should either:
  - be stable enough that you do not need fine-grained granularity, or
  - be granular enough that consumers can subscribe to specific portions of the state.
- **Rule:** Context APIs must not be reactive. They should not re-render consumers unnecessarily.

**Violation (manual React context for simple use case):**

```tsx
// Bad creating unnecessary boilerplate for simple context
// dialogContext.tsx
import React, { useState, useCallback, useContext } from 'react';

// React plain context should start with null as default value to avoid misleading consumers
// So context cannot infer the type automatically
type DialogContextType = {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
};

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

// Prefer not to use this kind of provider which mixes state and actions together
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <DialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
            {children}
        </DialogContext.Provider>
    );
};

export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};
```

**Correct (using react-global-state-hooks):**

```tsx
// Good: prefer use react-global-state-hooks/createContext to create simple contexts
import createContext from 'react-global-state-hooks/createContext';

// state and actions are separated so consumer can choose which portion of the context to subscribe to
export const dialog$ = createContext({
    isOpen: false,
}, {
    actions: {
        open() {
            return ({ setState }) => {
                // prefer use delta updates in case the state becomes bigger in the future
                setState((state) => ({ ...state, isOpen: true }));
            };
        },
        close() {
            return ({ setState }) => {
                setState((state) => ({ ...state, isOpen: false }));
            };
        },
    },
});

export default dialog$;

// Provider component is automatically created
<dialog$.Provider>
    {children}
</dialog$.Provider>
```

**Violation (mixed state and actions, no granularity):**

```tsx
// Bad creating react context with several problems

// state and actions are mixed so consumer cannot manipulate the context without subscribing to the whole state changes
// consumer cannot choose which portion of the context to subscribe to
const publisherContext = React.createContext<{
    publisher: OT.Publisher | null;
    publisherOptions: PublisherOptions | null;
    initializePublisher: (options: PublisherOptions) => void;
    updatePublisherOptions: (options: Partial<PublisherOptions>) => void;
}>(null);

/**
* This hooks creates the context for the publisherContext.Provider
*/
const usePublisher = () => {
    const [publisher, setPublisher] = useState<OT.Publisher | null>(null);

    // using state in context make it impossible to add granularity 
    const [publisherOptions, setPublisherOptions] = useState<PublisherOptions | null>(null);

    // callbacks are memoized but the state changes will cause consumer re-renders even if they don't use the state
    const initializePublisher = useCallback((options: PublisherOptions) => {
        setPublisherOptions(options);
    }, []);

    const updatePublisherOptions = useCallback((newOptions: Partial<PublisherOptions>) => {
        setPublisherOptions({
            ...prevOptions,
            ...newOptions,
        });
    }, []);

    // prefer to useEffect only for component lifecycle, not for reacting to state changes/side effects
    // this whole useEffect is totally unnecessary, we can initialize the publisher directly in initializePublisher
    useEffect(() => {
        if (!publisherOptions) return;

        const newPublisher = OT.initPublisher(..., publisherOptions);
        setPublisher(newPublisher);
    }, [publisherOptions]);
    
    // this useMemo prevents to lose the state on parent re-renders, 
    // but will recompute the whole object on every state change which will cause unnecessary re-renders and potentially side effects on consumers making the useEffect useless
    // context's API/actions are part of the state so consumer cannot use them subscribing to the state changes
    return useMemo(() => ({
        publisher,
        publisherOptions,
        initializePublisher,
        updatePublisherOptions,
    }), [publisher, publisherOptions, initializePublisher, updatePublisherOptions]);
};
```

**Correct (granular context using react-global-state-hooks):**

```tsx
// Good: prefer use react-global-state-hooks/createContext to create granular contexts
// publisherContext.ts
import createContext, { InferContextApi } from 'react-global-state-hooks/createContext';
import initializePublisher from './actions/initializePublisher';
import updatePublisherOptions from './actions/updatePublisherOptions';

export type PublisherContextApi = InferContextApi<typeof publisher$.Context>;

// Prefer to use a callback to initialize the default state to prevent multiples providers from sharing the same state reference
const publisher$ = createContext(() => ({
    publisher: null as OT.Publisher | null,
    publisherOptions: null as PublisherOptions | null,
}), {
    // for complex actions or big contexts, suggest to split actions into separate files
    actions: {        
        initializePublisher,
        updatePublisherOptions,
    },
});

// Prefer single responsibility files is aligned with splitting actions into separate files 
// ./actions/initializePublisher.ts
function initializePublisher(publisherOptions: PublisherOptions) {
    return ({ setState }) => {
        const publisher = OT.initPublisher(publisherOptions);

        setState({ publisher, publisherOptions });
    };
}

// if using single responsibility files, prefer export default instead of named exports
export default initializePublisher;
```

```tsx
// ./actions/updatePublisherOptions.ts
// import the types in this way to avoid circular dependencies
export type PublisherContextApi = import('../publisherContext').PublisherContextApi;    

// all actions are bound to the context.actions object so they can access each other
function updatePublisherOptions(this: PublisherContextApi['actions'], updates: Partial<PublisherOptions>) {
    return ({ getState }) => {  
        const { publisherOptions } = getState();

        this.initializePublisher({
            ...publisherOptions,
            ...updates,
        });
    };
}

export default updatePublisherOptions;

// provider component is automatically created
<publisher$.Provider>
    {children}
</publisher$.Provider>

// context hook is automatically created and allows granular subscriptions
const publisherOptions = publisher$.use.select(({ publisherOptions }) => publisherOptions);

// children can use actions without subscribing to state changes
const { initializePublisher } = publisher.use.actions();

// children can consume the whole context if needed
const [{ publisher, publisherOptions }, actions] = publisher$.use();

// prefer to create reusable selectors when accessing specific portions of the context is common
const usePublisherOptions = publisher$.use.createSelectorHook(({ publisherOptions  }) => publisherOptions);

// when using an specific property of an state or state derived value, prefer to use selectors.
// SomeComponent.tsx
const allowVideo = usePublisherOptions((options) => options.allowVideo);
```

- **Rule:** For `react-global-state-hooks` context, store names must use the `$` suffix (for example `dialog$`), and must not use the `Context` suffix in variable names.
- **Rule:** File names for context definitions must use the `Context` suffix (for example `dialogContext.tsx`).

**Violation:**

```tsx
// Bad
const dialogContext = createContext(...);
```

**Correct:**

```tsx
// Good
const dialog$ = createContext(...);
```

**Violation (file name):**

```tsx
// Bad
// dialog$.tsx
```

**Correct:**

```tsx
// Good
// dialogContext.tsx
```

---

# Root Element, Visibility & Layout Behavior

These rules define how the **root element** of a reusable component must behave for layout, styling, and customization.

- **Rule:** Reusable components must allow 100% customization of the root element via props (`className`, `style`, other DOM props).

**Violation:**

```tsx
// Bad: no way to customize root element
export const Button: React.FC = ({ children }) => {
    return (
        <button className="vera-button">
            ...
        </button>
    );
};
```

**Correct:**

```tsx
// Good: Allows full customization of root element
export const Button: React.FC<PropsWithChildren<ComponentProps<'button'>>> = 
    ({ className, onClick, children, ...props }) => {
        return (
            <button className={classNames('vera-button', className)} {...props}>
            ...
            </button>
        );
    };
```

- **Rule:** Root elements must not contain "hidden" layout hacks such as margins or paddings that affect how the component is placed in its surroundings.

**Violation:**

```tsx
// Bad: root element has hidden spacing that breaks reuse
export const UserCard = () => {
    return (
        <div style={{
                // We don't know where this component will be used, having a margin here
                // forces unwanted spacing in some contexts
                marginBottom: 20,
            }}
        >
            ...
        </div>
    );
};
```

**Correct (spacing owned by parent):**

```tsx
// Good: root element is neutral, caller controls spacing
// UserCard can be placed anywhere without unexpected spacing
export const UserList = ({ users }) => {
  return (
    <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        // padding is okay here cause it's internal to the form and necessary for the desired layout
        padding: '10px'
    }}>
        {users.map((user, index) => (
            // UserCard should not have extra margin so the parent/orchestrator can control spacing
            <UserCard key={index} {...user} />
        ))}
    </div>
  );
}
```

- **Rule:** Reusable components must never conditionally return `null`. Visibility must be controlled by the parent/orchestrator.
- **Rule:** If a component is present in JSX, it must render something (even if visually "empty"); parent controls whether to render the component at all.

**Violation:**

```tsx
// Bad: component sometimes returns null
export const SomeComponent = ({ ... }) => {
    const isVisible = someLogic(...);
    return isVisible ? <button className="primary-button" {...props} /> : null;
};

// If a component is declared on the JSX tree, it should always render.
// Bad: the component sometimes returns null but the orchestrator has no idea about it
<Container>
    <SomeComponent ... />
</Container>
```

**Correct (parent controls visibility):**

```tsx
// Good: parent/orchestrator controls visibility
const Component1 = ({ ... }) => {
    const isVisible = someLogic(...);

    return (
        // Good: parent/orchestrator controls visibility
        // Is visible at first glance that SomeComponent may or may not render
        // SomeComponent logic is actually simpler because it doesn't need to handle visibility internally
        <Container>
            {isVisible && <SomeComponent ... />}
        </Container>
    );
};
```

**Correct (component + hook pair):**

```tsx
// Good: Sometimes you may want to have a combo of ReusableComponent + Hook to handle visibility logic
export const useShouldShowSomeComponent = (...): boolean => {
    const isVisible = someLogic(...);
    return isVisible;
};

// then:

import { SomeComponent, useShouldShowSomeComponent } from './SomeComponent';

export const Component1 = ({ ... }) => {
    const isVisible = useShouldShowSomeComponent(...);

    return (
        <Container>
            {isVisible && <SomeComponent ... />}
        </Container>
    );
};
```

---

# Styling Standards

These are the rules for styling the project and its libraries.

- **Rule:** Prefer Tailwind CSS over MUI `sx` prop or inline styles.
- **Rule:** Do not use the MUI `sx` prop for styling unless there is a very strong justification (and it should be considered a violation by default).
- **Rule:** Avoid runtime-heavy styling systems (Emotion, runtime theme recomputes) when Tailwind can be used instead.
- **Rule:** Use MUI components as structural primitives, but style them with Tailwind classes.

Rationale (kept as background, not rules):

- MUI `sx` and Emotion create style objects and generate CSS at runtime, impacting performance.
- Tailwind uses precompiled CSS with minimal runtime overhead.
- Tailwind is more familiar to contributors and easier to theme.
- MUI themes can trigger global re-renders; Tailwind is static.

- **Rule:** MUI `Grid` is banned in favor of Tailwind grid/flex utilities.
- **Rule:** Do not use Tailwind `group` classes, as they break the atomic, predictable nature of Tailwind.

**Violation (group classes):**

```css
// Bad: using groups
.vera-button {
  @apply rounded-full font-medium transition active:opacity-80;
}
```

```tsx
// Bad: using groups
<button className="vera-button group" />
```

**Correct (using tailwind-variants):**

```tsx
// good: using tailwind-variants
import { tv } from 'tailwind-variants';
 
const Button = ({ size, variant }) => {
    return (
        <button className={button({ variant, size })}>
            Click me
        </button>
    );
};

const button = tv({
  base: 'rounded-sm font-medium transition active:opacity-80',

  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-500',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100'
    },

    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3'
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});

export default Button;

// Usage
// Variants are semantic and predictable
<Button variant="primary" size="md" />
```

- **Rule:** Variants are allowed and encouraged to change style "flavor".
- **Rule:** Configuration-based rendering that changes structure/behavior is banned.

---

# Spacing & Layout Ownership

- **Rule:** Do not use margins or paddings on components to define spacing **between** layout items.
- **Rule:** Layout components (parents) are responsible for spacing between children via flex/grid `gap` utilities.

**Violation:**

```tsx
// Bad: using margin to space items is unacceptable
// This creates unpredictable layouts difficult to maintain or modify
// adding/removing items could break the layout and force to create huge refactors
<div className="flex flex-row">
  <Item style={{ marginLeft: 10, marginRight: 10 }} />
  <Item style={{ marginLeft: 10 }} />
  <Item style={{ marginLeft: 10, marginRight: 10 }} />
</div>
```

**Correct:**

```tsx
// Good: use flex/grid gap utilities to define spacing between items
// In this way the layout is predictable and easy to modify
// adding/removing items won't break the layout
<div className="flex flex-row gap-4">
  <Item />
  <Item />
  <Item />
</div>
```

- **Rule:** Components must not introduce unexpected external spacing (margins) on their root element. Parent/orchestrator must control spacing.

**Violation:**

```tsx
// Bad: component forces external spacing on siblings
export function UserCard() {
  return <Card style={{ marginBottom: 20 }}>...</Card>;
}
```

**Correct:**

```tsx
// Good: parent controls spacing, UserCard is neutral
<Stack spacing={3}>
  <UserCard />
  <UserCard />
</Stack>
```

**Another correct example:**

```tsx
// Bad: reusable component forces spacing on siblings
export function UserCard() {
  return <Card style={{ marginBottom: 20 }}>...</Card>;
}

// Good: parent controls spacing
<Stack spacing={3}>
  <UserCard />
  <UserCard />
</Stack>
```

---

# Internal Component Design & Composition

- **Rule:** Avoid configuration-based rendering (complex boolean props that drastically change structure or behavior).
- **Rule:** Prefer composition patterns (children, named subcomponents) over prop-based configuration.

**Violation (configuration-based layout):**

```tsx
// Bad: complex conditional rendering based on props or children customization
// This pattern makes the mental model incredibly complex and hard to maintain cause there is too much combinations and uncertainty on how a component will look like
const PageLayout = ({ showHeader, showFooter, HeaderStyles, footerBackground, children }) => {
  return (
    <div>
      {showHeader && <Header styles={HeaderStyles} />}
      <main>{children}</main>
      {showFooter && <Footer styles={{
        background: footerBackground,
      }} />}
    </div>
  );
};
```

**Correct (composition-based layout):**

```tsx
// Good: prefer composition over configuration
const PageLayout = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  const header = childrenArray.find(child => child.type.displayName === 'Header') || null;
  const main = childrenArray.find(child => child.type.displayName === 'Main') || null;
  const footer = childrenArray.find(child => child.type.displayName === 'Footer') || null;

  return (
    <div>
      {header}
      <main>{main}</main>
      {footer}
    </div>
  );
};

PageLayout.Header = HeaderWrapper;
PageLayout.Main = MainWrapper;
PageLayout.Footer = FooterWrapper;

// Usage
// This pattern is predictable, easy to read and maintain, and allows full customization of each section
<PageLayout>
  <PageLayout.Header>
    <CustomHeaderContent />
  </PageLayout.Header>
  
  <PageLayout.Main>...</PageLayout.Main>

  <PageLayout.Footer >
    <CustomFooterContent />
  </PageLayout.Footer >
</PageLayout>
```

**Violation (config-based video view):**

```tsx
// Bad: config based rendering creates unpredictable combinations
const VideoView = ({ showControls, controlsPosition, children }) => {
  return (
    <div className="video-view">
      <video>...</video>
      {showControls && (
        <div className={`controls controls-\${controlsPosition}`}>
          <button>Mute</button>
          <button>End Call</button>
        </div>
      )}
    </div>
  );
};
```

**Correct (composition with reusable building blocks):**

```tsx
// Good: prefer composition with reusable building blocks
const VideoView = ({ children, ...props }) => {
  const childrenArray = React.Children.toArray(children);
  const controls = pickChild(childrenArray, VideoViewRegions.Controls);

    return (
        <video$.Provider>
            <div className="video-view" {...props}>
                <video>...</video>
                {controls}
            </div>
        </video$.Provider>
    );
};

VideoView.Controls = ControlsWrapper;
VideoView.MuteButton = MuteButton;
VideoView.EndCallButton = EndCallButton;

export default VideoView;

// Usage
<VideoView>
  <VideoView.Controls>
    <VideoView.MuteButton />
    <VideoView.EndCallButton />
    <button>Custom Button</button>
  </VideoView.Controls>
</VideoView>
```

- **Rule:** When using composition, internal elements must be exposed as properties of the main component (e.g. `PageLayout.Header`, `VideoView.Controls`) to keep the API discoverable.
- **Rule:** Do not combine composition with heavy configuration-based rendering or noisy prop drilling to customize internal elements.

- **Rule:** A reusable component may define its **internal layout** (flex/grid, internal padding) but must not impose external spacing.
- **Rule:** Internal spacing should be defined using gap/padding where appropriate and limited to the component’s internal layout.

**Correct internal structure example:**

```tsx
// Good internal structure
export function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
      <Typography>{label}</Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}
```

---

# Conditional Rendering Rules

- **Rule:** Do not use `style.display = 'none'` to hide components.
- **Rule:** If you need to hide a component while preserving its state, use `Activity` with `mode` instead of conditional display CSS.

**Violation:**

```tsx
// Bad: using style.display = 'none' to hide component
<div style={{ display: isVisible ? 'block' : 'none' }}>
    <SomeComponent />
</div>
```

**Correct:**

```tsx
// Good: using React.Activity to hide component while preserving state
<Activity mode={isVisible ? 'visible' : 'hidden'}>
    <SomeComponent />
</Activity>
```

- **Rule:** `Activity` will trigger effect cleanups but preserve component state while hidden.
- **Rule:** `Activity` is particularly useful for heavy components or ones that require expensive initialization (video/audio components).

---

# React Hooks Rules & Effect Usage

These rules define how reusable hooks must be written.

- **Rule:** Prefer at most one plain `useEffect` per hook/component.
- **Rule:** If more than one effect is needed, split logic into smaller custom hooks to give each effect a clear semantic purpose.

**Violation (multiple effects in one hook):**

```tsx
// Bad: multiple useEffect inside a hook
// this is bad cause developers need to read and understand all the effects to understand the hook/component behavior
const useComplexLogic = () => {
    useEffect(() => {
        // effect 1
    }, [deps1]);

    useEffect(() => {
        // effect 2
    }, [deps2]);
};
```

**Correct (single effect per helper hook):**

```tsx
// Good: single useEffect per hook/component
// this is good cause each hook/component has a single responsibility and its behavior is clear at first glance
type CleanupFunction = () => void;

// simple hook uses useEffect to access component lifecycle
export const useWindowEvent = (event: string, handler: (e) => void) => {
 const handlerWrapper = useEffectEvent(handler);

  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener(event, handlerWrapper, abortController);

    return () => abortController.abort();
  }, [event]);
}
```

**Correct (composing small hooks):**

```tsx
// Good: semantic small hooks
// instead of having random use effects now we have semantic small hooks
export const useIsOnline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useWindowEvent('online', () => setIsOnline(true));
    useWindowEvent('offline', () => setIsOnline(false));

    return isOnline;
};
```

```tsx
// Good: complex logic is split into multiple simple hooks
const useComplexLogic = () => {
    const isOnline = useIsOnline();

    useWindowEvent('resize', () => {
        // handle resize
    });

    return ...;
};
```

- **Rule:** Reactive effect architectures are banned.
  - Effects must be used only for component lifecycle, not as a state reaction graph for side effects like fetching.

**Violation (reactive effect fetching):**

```tsx
// Bad: useEffect used for side effects
// Bad: useEffect used as a "state reaction graph" for fetching
// Side effects are difficult to track and reason about, side effects could also get chained which makes it even more complex and unreliable.
const Component = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ search: '', sortBy: 'date' });
    const [page, setPage] = useState(1);

    // Bad: Implicit side effect, developers need to read the whole effect to understand what's happening
    useEffect(() => {
        setIsLoading(true);

        fetchItems({ filters, page }).then(result => {
            setItems(result.items);
            setIsLoading(false);
        });
    }, [filters, page]);

    const handleSearchChange = (value: string) => {
        // is not implicit what's happening after changing the filters
        setFilters(prev => ({ ...prev, search: value }));
    };

    return (
        ...
    );
};
```

**Correct (explicit linear flow):**

```tsx
// Good: linear code no reactive effects
const Component = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ search: '', sortBy: 'date' });
    const [page, setPage] = useState(1);

    const loadItems = useCallback(async (nextFilters: Filters, nextPage: number) => {
        setIsLoading(true);

        const result = await fetchItems({ filters: nextFilters, page: nextPage });
        
        setItems(result.items);
        setIsLoading(false);
    }, []);

    // Initial load, this is component lifecycle not a reaction to state changes
    // useOnMountEffect make the effect intention clear and semantically explicit
    useOnMountEffect(() => {
        loadItems(filters, page);
    });

    // Good stable callback for children props wont trigger shallow compare differences
    const handleSearchChange = useStableCallback((value: string) => {
        const nextFilters = { ...filters, search: value };

        setFilters(nextFilters);
        setPage(1);
        
        // what happens after changing the filters is explicit
        loadItems(nextFilters, 1);
    });

    const handleNextPage = useStableCallback(() => {
        const nextPage = page + 1;

        setPage(nextPage);

        // is clear and easy to identify why we are loading items
        // developers can trace easily the call stack
        loadItems(filters, nextPage);
    });

    return (
        ...
    );
};
```