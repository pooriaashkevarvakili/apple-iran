# Translation Manager

A lightweight internal translation management tool for editing and consuming UI keyword translations.

The application provides two experiences:

* **Dashboard** — manage translation keys, edit translations, reorder entries, search, import/export, and reset data.
* **Public View** — read-only translation browser with language switching and copy-to-clipboard support.

The project is fully client-side and uses **localStorage as a simulated backend**, with **TanStack Query** handling asynchronous data access, caching, optimistic updates, and rollback.

---

## Tech Stack

| Technology     | Purpose                               |
| -------------- | ------------------------------------- |
| React          | UI framework                          |
| TypeScript     | Type safety                           |
| Vite           | Development server and build tooling  |
| Ant Design     | UI components                         |
| Tailwind CSS   | Utility-first styling                 |
| TanStack Query | Server-state/data management          |
| dnd-kit        | Drag-and-drop and keyboard reordering |
| React Router   | Application routing                   |
| react-icons    | Icons                                 |
| Vitest         | Unit testing                          |
| localStorage   | Client-side persistence               |

> The implementation uses the currently configured package versions in `package.json`.

---

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

```bash
npm install
```

### Start development server

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

### Available scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite development server        |
| `npm run build`     | Type-check and create a production build |
| `npm run typecheck` | Run TypeScript without emitting files    |
| `npm run lint`      | Run ESLint                               |
| `npm run preview`   | Preview the production build             |
| `npm test`          | Run Vitest unit tests                    |

---

## Routes

| Route        | Description                       |
| ------------ | --------------------------------- |
| `/dashboard` | Translation management dashboard  |
| `/public`    | Read-only public translation view |

The dashboard is the default application entry point.

---

## Features

### Dashboard

The management dashboard supports:

* One editable translation column per language
* Inline translation editing
* Commit changes on blur or `Enter`
* Inline keyword-key editing
* Add new translation keys
* Add a translation for a selected language
* Empty translation slots for other languages
* Drag-and-drop keyword reordering
* Keyboard-accessible reordering
* Keyword deletion with confirmation
* Debounced search
* Search across:

  * Translation keys
  * All language translations
* Translation completion percentage
* Progress indicator
* JSON import
* JSON export
* Reset to the bundled seed dataset

### Public View

The public view provides:

* Clean read-only translation cards
* Instant language switching
* Correct `ltr` / `rtl` document direction
* Explicit empty state for missing translations
* Copy keyword key to clipboard
* Persistence of the selected language across reloads

### UI / UX

* Responsive layout
* Ant Design components
* Tailwind CSS utility styling
* Custom `brand` color palette based on `#4f46e5`
* Keyboard-friendly interactions
* Accessible drag-and-drop controls
* Tailwind preflight disabled to avoid conflicts with Ant Design styles

---

## Architecture

The application follows a small layered architecture designed to keep UI components independent from persistence and data manipulation.

```text
src/
├── types.ts
│
├── api/
│   └── datasetApi.ts
│
├── context/
│   ├── DatasetProvider.tsx
│   └── UIProvider.tsx
│
├── utils/
│   ├── datasetOps.ts
│   ├── normalize.ts
│   └── id.ts
│
├── components/
│   └── ...
│
└── pages/
    ├── Dashboard
    └── Public
```

### Responsibilities

#### `types.ts`

Contains the core domain contracts:

* `Dataset`
* `Language`
* `Keyword`

#### `api/datasetApi.ts`

Acts as the application's backend adapter.

It provides asynchronous operations over `localStorage`, including simulated latency.

The UI does not access `localStorage` directly.

This makes replacing the persistence layer with a REST or GraphQL API straightforward.

#### `context/DatasetProvider.tsx`

Provides the application's single source of truth for dataset state.

It exposes:

* `languages`
* `keywords`
* `isLoading`
* `isSaving`
* Dataset mutation actions

Examples include:

* `updateTranslation`
* `updateKeyword`
* `addKeyword`
* `deleteKeyword`
* `reorder`
* `addLanguage`
* `removeLanguage`

TanStack Query manages the underlying cache and mutations.

#### `context/UIProvider.tsx`

Contains UI-only state that does not belong to the dataset itself.

For example:

* Active language in the public view

Keeping this separate prevents UI preferences from becoming part of the persisted dataset.

#### `utils/datasetOps.ts`

Contains pure dataset transformations.

Every operation follows the same contract:

```ts
(Dataset) => Dataset
```

Operations return the original object reference when no change is required.

This allows callers to avoid unnecessary persistence and cache updates.

#### `utils/normalize.ts`

Normalizes data entering the application.

It is used for:

* localStorage data
* Imported JSON
* Seed data

Malformed or incomplete datasets are reconciled into the canonical application shape.

#### `components/`

Presentational components only.

Components do not:

* fetch data
* access localStorage
* perform persistence
* own application-level dataset state

#### `pages/`

Pages compose the providers, hooks, and presentational components into complete application screens.

---

## State Management

The application uses **TanStack Query** as the data-management layer.

The flow is:

```text
UI Action
   │
   ▼
Dataset Operation
   │
   ▼
New Dataset
   │
   ▼
React Query Mutation
   │
   ├── Optimistic Cache Update
   │
   ├── localStorage Persistence
   │
   └── Rollback on Error
```

### Optimistic Updates

Edits are reflected in the UI immediately.

When an operation is triggered:

1. The pure dataset operation produces the next dataset.
2. React Query updates its cache optimistically.
3. The persistence adapter writes the dataset to localStorage.
4. If persistence fails, the previous dataset is restored.

This keeps editing responsive without requiring a real backend.

---

## Data Model

The canonical dataset has the following structure:

```ts
interface Dataset {
  languages: {
    code: string;
    name: string;
    dir: 'ltr' | 'rtl';
  }[];

  keywords: {
    id: string;
    key: string;
    translations: Record<string, string>;
  }[];
}
```

Example:

```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "dir": "ltr"
    },
    {
      "code": "fa",
      "name": "Persian",
      "dir": "rtl"
    }
  ],
  "keywords": [
    {
      "id": "keyword-1",
      "key": "nav.profile",
      "translations": {
        "en": "Profile",
        "fa": "پروفایل"
      }
    }
  ]
}
```

---

## Why This Data Structure?

### Keyword order is represented by array order

There is no separate `order` property.

Reordering is simply:

```ts
array.splice(...)
```

This has several advantages:

* No order-number maintenance
* No renumbering after every drag
* JSON serialization preserves the order naturally
* Reading the dataset does not require an additional sort

The array itself is the ordered representation.

---

### Translations use a language-code map

Translations are represented as:

```ts
translations: Record<string, string>
```

instead of:

```ts
translations: [
  { language: 'en', value: 'Profile' },
  { language: 'fa', value: 'پروفایل' }
]
```

This makes language lookup constant-time:

```ts
keyword.translations[languageCode]
```

It also maps naturally to the dashboard's language columns:

```ts
languages.map(language => (
  keyword.translations[language.code]
))
```

---

### Keywords have stable IDs

Each keyword has a stable `id` separate from its editable `key`.

For e
