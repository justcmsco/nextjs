/**
 * JustCMS Next.js Integration Client
 *
 * Provides functions for fetching JustCMS data:
 *  - getCategories()
 *  - getPages()
 *  - getPageBySlug()
 *  - getMenuById()
 *  - getLayoutById()
 *  - getLayoutsByIds()
 *
 * The API token and project ID are taken either from the optional parameters
 * or from the environment variables:
 *   NEXT_PUBLIC_JUSTCMS_TOKEN and NEXT_PUBLIC_JUSTCMS_PROJECT.
 */

// Type declarations for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_JUSTCMS_TOKEN?: string;
      NEXT_PUBLIC_JUSTCMS_PROJECT?: string;
    }
  }
}

/**
 * Categories
 */
export interface Category {
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

/**
 * Image types
 */
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export interface Image {
  alt: string;
  variants: ImageVariant[];
}

/**
 * Pages
 */
export interface PageSummary {
  title: string;
  subtitle: string;
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface PagesResponse {
  items: PageSummary[];
  total: number;
}

/**
 * Content Blocks for a single page
 */
export interface HeaderBlock {
  type: 'header';
  styles: string[];
  header: string;
  subheader: string | null;
  size: string;
}

export interface ListBlock {
  type: 'list';
  styles: string[];
  options: {
    title: string;
    subtitle?: string | null;
  }[];
}

export interface EmbedBlock {
  type: 'embed';
  styles: string[];
  url: string;
}

export interface ImageBlock {
  type: 'image';
  styles: string[];
  images: {
    alt: string;
    variants: ImageVariant[];
  }[];
}

export interface CodeBlock {
  type: 'code';
  styles: string[];
  code: string;
}

export interface TextBlock {
  type: 'text';
  styles: string[];
  text: string;
}

export interface CtaBlock {
  type: 'cta';
  styles: string[];
  text: string;
  url: string;
  description?: string | null;
}

export interface CustomBlock {
  type: 'custom';
  styles: string[];
  blockId: string;
  [key: string]: any;
}

export type ContentBlock =
  | HeaderBlock
  | ListBlock
  | EmbedBlock
  | ImageBlock
  | CodeBlock
  | TextBlock
  | CtaBlock
  | CustomBlock;

export interface PageDetail {
  title: string;
  subtitle: string;
  meta: {
    title: string;
    description: string;
  };
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Menus
 */
export interface MenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  styles: string[];
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

/**
 * Layouts
 */
export interface LayoutItem {
  label: string;
  description: string;
  uid: string;
  type: 'text' | 'html' | 'boolean' | 'svg';
  value: string | boolean;
}

export interface Layout {
  id: string;
  name: string;
  items: LayoutItem[];
}

export interface PageFilters {
  category: {
    slug: string;
  };
}

/**
 * Creates a JustCMS client for Next.js.
 *
 * @param apiToken - Optional API token. If not provided, uses process.env.NEXT_PUBLIC_JUSTCMS_TOKEN.
 * @param projectIdParam - Optional project ID. If not provided, uses process.env.NEXT_PUBLIC_JUSTCMS_PROJECT.
 *
 * @returns An object with methods to interact with the JustCMS API.
 */
export function createJustCmsClient(apiToken?: string, projectIdParam?: string) {
  const token = apiToken || process.env.NEXT_PUBLIC_JUSTCMS_TOKEN;
  const projectId = projectIdParam || process.env.NEXT_PUBLIC_JUSTCMS_PROJECT;

  if (!token) {
    throw new Error('JustCMS API token is required');
  }
  if (!projectId) {
    throw new Error('JustCMS project ID is required');
  }

  // Base URL for JustCMS public API
  const BASE_URL = 'https://api.justcms.co/public';

  /**
   * Helper: Makes a GET request to a JustCMS endpoint.
   *
   * @param endpoint - The endpoint (e.g. 'pages' or 'menus/main').
   * @param queryParams - Optional query parameters.
   *
   * @returns Parsed JSON response.
   */
  async function get<T>(endpoint: string = '', queryParams?: Record<string, any>): Promise<T> {
    const url = new URL(`${BASE_URL}/${projectId}${endpoint ? '/' + endpoint : ''}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JustCMS API error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Retrieves all categories.
   */
  async function getCategories(): Promise<Category[]> {
    const data = await get<CategoriesResponse>();
    return data.categories;
  }

  /**
   * Retrieves pages with optional filtering and pagination.
   *
   * @param params - Filtering and pagination parameters.
   */
  async function getPages(params?: {
    filters?: PageFilters;
    start?: number;
    offset?: number;
  }): Promise<PagesResponse> {
    const query: Record<string, any> = {};
    if (params?.filters?.category?.slug) {
      query['filter.category.slug'] = params.filters.category.slug;
    }
    if (params?.start !== undefined) {
      query['start'] = params.start;
    }
    if (params?.offset !== undefined) {
      query['offset'] = params.offset;
    }
    return get<PagesResponse>('pages', query);
  }

  /**
   * Retrieves a single page by its slug.
   *
   * @param slug - The page slug.
   * @param version - Optional version parameter (e.g. 'draft').
   */
  async function getPageBySlug(slug: string, version?: string): Promise<PageDetail> {
    const query: Record<string, any> = {};
    if (version) {
      query['v'] = version;
    }
    return get<PageDetail>(`pages/${slug}`, query);
  }

  /**
   * Retrieves a single menu by its ID.
   *
   * @param id - The menu ID.
   */
  async function getMenuById(id: string): Promise<Menu> {
    return get<Menu>(`menus/${id}`);
  }

  /**
   * Retrieves a single layout by its ID.
   *
   * @param id - The layout ID.
   */
  async function getLayoutById(id: string): Promise<Layout> {
    return get<Layout>(`layouts/${id}`);
  }

  /**
   * Retrieves multiple layouts by their IDs.
   *
   * @param ids - Array of layout IDs.
   */
  async function getLayoutsByIds(ids: string[]): Promise<Layout[]> {
    return get<Layout[]>(`layouts/${ids.join(';')}`);
  }

  /**
   * Utility: Checks if a content block has a specific style (case-insensitive).
   *
   * @param block - The content block.
   * @param style - The style to check.
   */
  function isBlockHasStyle(block: { styles: string[] }, style: string): boolean {
    return block.styles.map((s: string) => s.toLowerCase()).includes(style.toLowerCase());
  }

  /**
   * Utility: Gets the large image variant (assumes the second variant is large).
   *
   * @param image - The image object.
   */
  function getLargeImageVariant(image: Image): ImageVariant {
    return image.variants[1];
  }

  /**
   * Utility: Retrieves the first image from an image block.
   *
   * @param block - The image block.
   */
  function getFirstImage(block: { images: any[] }) {
    return block.images[0];
  }

  /**
   * Utility: Checks if a page has a specific category.
   *
   * @param page - The page details.
   * @param categorySlug - The category slug to check.
   */
  function hasCategory(page: PageDetail, categorySlug: string): boolean {
    return page.categories.map((category) => category.slug).includes(categorySlug);
  }

  return {
    getCategories,
    getPages,
    getPageBySlug,
    getMenuById,
    getLayoutById,
    getLayoutsByIds,
    isBlockHasStyle,
    getLargeImageVariant,
    getFirstImage,
    hasCategory,
  };
}
