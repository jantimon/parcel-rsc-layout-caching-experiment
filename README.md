# Parcel RSC Layout Caching Experiment

This proof of concept demonstrates how to optimize React Server Components (RSC) applications by caching the layout shell while streaming client components dynamically.

## Overview

This project showcases:

- **Layout Caching**: Cache the app shell (layout) for better performance
- **Streaming Client Components**: Stream client components while reusing the cached layout
- **Client-Side Navigation**: Seamless routing **without network** requests for the layout
- **RSC with Parcel**: Leverages Parcel's React Server Components support

## How It Works

1. The server caches the app shell (header, footer, and page structure)
2. When a user requests a page, the server immediately responds with the cached layout
3. The specific page content is then streamed into the placeholder in the layout
4. Client-side navigation works without fetching the layout again

## Getting Started

### Prerequisites

- Node.js 18+ recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/parcel-rsc-server-experiment.git
cd parcel-rsc-server-experiment

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm start
```

Visit `http://localhost:3001` in your browser to see the application.

### Production Build

```bash
# Build for production
npm run build

# Start the production server
node dist/server.js
```

## Project Structure

```
├─ package.json
└─ src
   ├─ cache               # Layout caching implementation
   │  ├─ rscCache.tsx     # Cache utility functions
   │  └─ token.ts         # Placeholder token for client content
   ├─ components
   │  ├─ MainLayout.tsx   # Main app shell (cached)
   │  ├─ Page.tsx         # Dynamic page renderer
   │  └─ client.tsx       # Client hydration entry point
   ├─ pages               # Page components
   │  ├─ About.tsx
   │  ├─ Home.tsx
   │  └─ NotFound.tsx
   ├─ router              # Custom routing implementation
   │  ├─ index.js         # Environment detection
   │  ├─ router.browser.ts # Browser-specific router
   │  ├─ router.node.ts   # Server-specific router
   │  └─ router.tsx       # Shared router components
   └─ server.tsx          # Express server setup
```

## Key Technical Features

### Layout Caching

The `getLayout` function in `src/cache/rscCache.tsx` handles caching the app shell. It:

1. Checks if the layout is already cached
2. Renders the layout with Parcel's RSC if not cached
3. Splits the HTML at the placeholder token
4. Returns the HTML before and after the placeholder token

### Streaming Content

In `src/server.tsx`, the server:

1. Immediately sends the cached layout shell (before the placeholder)
2. Renders the specific page component
3. Streams the page content into the placeholder position
4. Finishes the response with the rest of the cached layout (after the placeholder)

## Performance Benefits

This approach offers several performance advantages:

- **Reduced Time to First Byte**: The cached layout can be sent immediately
- **Faster Page Transitions**: Only page content changes during navigation
- **Reduced Server Load**: The layout is rendered once and reused
- **Smaller Network Payloads**: Only the changing content is transferred

## Limitations

One big limitation of the current POC is that the current page javascript
is loaded during the hydration and not initially. This means the page takes
longer to become interactive.

Another big problem is that Parcel does not provide an API to render the markup
of a client component - it always is surrounded by `<script>` and `<link>` tags and even adds a `</body></html>` at the end.
Currently this is extracted with a lot of regex replacements.

Currently only a single layout is possile - in a more sophisticated setup each
route could have its own layout.

## Links

https://parceljs.org/recipes/rsc/