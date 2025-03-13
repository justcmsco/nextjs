# JustCMS Next.js Integration

A simple, type-safe integration for [JustCMS](https://justcms.co) in your Next.js project. This integration provides a single client that wraps the JustCMS public API endpoints, making it easy to fetch categories, pages, and menus.

## Features

- **TypeScript Support:** Fully typed structures for API responses.
- **Single Client:** All JustCMS API calls are encapsulated in one client.
- **Easy Integration:** Configure your API token and project ID via environment variables.
- **Flexible Endpoints:** Supports fetching categories, pages (with filtering and pagination), a page by its slug, a menu by its ID, and layouts by ID or multiple IDs.

## Installation

1. **Add the Client File:**

   Copy the [lib/justCms.ts](./lib/justCms.ts) file into your project's `lib` directory (or any directory of your choice).

2. **Install Dependencies:**

   Ensure your project is set up for TypeScript and is using Next.js. If not, follow the [Next.js installation guide](https://nextjs.org/docs).

## Configuration

Supply your JustCMS API token and project ID via environment variables. Create a `.env.local` file in the root of your Next.js project and add the following:

```env
NEXT_PUBLIC_JUSTCMS_TOKEN=YOUR_JUSTCMS_API_TOKEN
NEXT_PUBLIC_JUSTCMS_PROJECT=YOUR_JUSTCMS_PROJECT_ID
```

- **NEXT_PUBLIC_JUSTCMS_TOKEN:** Your JustCMS API token for authentication.
- **NEXT_PUBLIC_JUSTCMS_PROJECT:** Your JustCMS project ID.

## Usage

The integration is provided as a single client. Import it into any component or page and call its functions to fetch data from JustCMS.

### Example Page Component

Below is a simple example that fetches and displays categories on a Next.js page:

```typescript
import { GetStaticProps } from 'next';
import { createJustCmsClient, Category } from '../lib/justCms';

interface CategoriesPageProps {
  categories: Category[];
}

export default function CategoriesPage({ categories }: CategoriesPageProps) {
  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.slug}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const justCms = createJustCmsClient(yourToken, yourProjectId);
  const categories = await justCms.getCategories();
  return {
    props: { categories },
    revalidate: 60, // Revalidate at most once per minute
  };
};
```

### Available Functions

The client provides the following functions:

#### \`getCategories()\`

Fetches all categories for your project.

```typescript
const categories = await justCms.getCategories();
// Returns: Category[]
```

#### \`getPages(params?: { filters?: PageFilters; start?: number; offset?: number })\`

Fetches pages with optional filtering and pagination.

```typescript
// Get all pages
const pages = await justCms.getPages();

// Get pages from a specific category
const categoryPages = await justCms.getPages({
  filters: { category: { slug: 'blog' } }
});

// Get paginated pages
const paginatedPages = await justCms.getPages({
  start: 0,
  offset: 10,
});
```

#### \`getPageBySlug(slug: string, version?: string)\`

Fetches detailed information about a specific page by its slug.

```typescript
const page = await justCms.getPageBySlug('about-us');
// Returns: PageDetail
```

#### \`getMenuById(id: string)\`

Fetches a menu and its items by its unique identifier.

```typescript
const menu = await justCms.getMenuById('main-menu');
// Returns: Menu
```

#### `getLayoutById(id: string)`

Fetches a single layout by its unique identifier.

```typescript
const layout = await justCms.getLayoutById('footer');
// Returns: Layout
```

#### `getLayoutsByIds(ids: string[])`

Fetches multiple layouts at once by specifying their IDs in an array.

```typescript
const layouts = await justCms.getLayoutsByIds(['footer', 'header']);
// Returns: Layout[]
```

### Utility Functions

In addition to API calls, the client provides several utility functions to help you work with JustCMS data:

#### \`isBlockHasStyle(block: ContentBlock, style: string)\`

Checks if a content block includes a specific style (case-insensitive).

```typescript
const isHighlighted = justCms.isBlockHasStyle(block, 'highlight');
// Returns: boolean
```

#### \`getLargeImageVariant(image: Image)\`

Retrieves the large variant of an image (assumed to be the second variant).

```typescript
const largeImage = justCms.getLargeImageVariant(page.coverImage);
// Returns: ImageVariant
```

#### \`getFirstImage(block: ImageBlock)\`

Retrieves the first image from an image block.

```typescript
const firstImage = justCms.getFirstImage(imageBlock);
// Returns: Image
```

#### \`hasCategory(page: PageDetail, categorySlug: string)\`

Determines if a page belongs to a specific category.

```typescript
const isBlogPost = justCms.hasCategory(page, 'blog');
// Returns: boolean
```

## API Endpoints Overview

The client wraps the following JustCMS API endpoints:

- **Get Categories:** Retrieve all categories for your project.
- **Get Pages:** Retrieve pages with optional filtering (by category slug) and pagination.
- **Get Page by Slug:** Retrieve detailed information about a specific page.
- **Get Menu by ID:** Retrieve a menu and its items by its unique identifier.
- **Get Layout by ID:** Retrieve a single layout by its unique identifier.
- **Get Layouts by IDs:** Retrieve multiple layouts at once by specifying their IDs.

For more details on each endpoint, refer to the [JustCMS Public API Documentation](https://justcms.co/api).
