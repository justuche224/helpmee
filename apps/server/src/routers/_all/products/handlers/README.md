# Store Products API Handler

## Overview

The `get-products.ts` handler provides a robust and optimized API endpoint for fetching products with intelligent recommendation capabilities, advanced filtering, and fair distribution algorithms.

## Features

### 🎯 Smart Recommendation System

- **Location-Based Prioritization**: Products from stores in user's location (city → state → country)
- **Category Preferences**: Products from user's preferred store categories
- **Fair Distribution**: Prevents single stores from dominating results
- **Intelligent Fallback**: Gracefully falls back to other stores when needed

### 🔍 Advanced Filtering & Sorting

- **Pagination**: Full support for `limit`, `page`, and `offset`
- **Price Range**: Filter by `minPrice` and `maxPrice`
- **Category Filter**: Filter by specific `categoryId`
- **Stock Status**: Option to show only in-stock items (`inStockOnly`)
- **Multiple Sort Options**:
  - `price_asc` - Price low to high
  - `price_desc` - Price high to low
  - `rating` - Highest rated first
  - `newest` - Latest products first
  - `random` - Shuffled results

### ⚡ Performance Optimizations

- **Parallel Data Fetching**: User location and preferences fetched simultaneously
- **Efficient Database Queries**: Optimized joins and proper use of indexes
- **Smart Limits**: Prevents over-fetching with reasonable constraints
- **Selective Loading**: Only loads approved stores and relevant data

## API Schema

### Input Parameters

```typescript
{
  limit?: number;          // 1-100, default: 20
  page?: number;           // min: 1, default: 1
  offset?: number;         // min: 0, optional
  getRecommended?: boolean; // default: false
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'random'; // default: 'newest'
  categoryId?: string;     // filter by store category
  minPrice?: number;       // minimum product price
  maxPrice?: number;       // maximum product price
  inStockOnly?: boolean;   // default: true
}
```

### Response Format

```typescript
{
  products: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;          // decimal as string
    quantity: number;
    unit: ProductUnit;
    inStock: boolean;
    badge?: string;
    sku?: string;
    weight?: string;
    dimensions?: string;
    storeId: string;
    storeName: string;
    storeSlug: string;
    averageRating: number;
    ratingCount: number;
    primaryImage?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    offset: number;
    total?: number;
  };
}
```

## Algorithm Flow

### Standard Product Fetching (`getRecommended: false`)

1. Apply filters (category, price range, stock status)
2. Join products with stores and ratings
3. Apply sorting preference
4. Return paginated results

### Recommended Product Fetching (`getRecommended: true`)

```typescript
graph TD
    A[getRecommended: true] --> B[Fetch User Data]
    B --> C[Get Location-Based Stores]
    C --> D[Get Products from Location Stores]
    D --> E{Remaining Limit?}
    E -->|Yes| F[Get Category-Based Stores]
    F --> G[Get Products from Category Stores]
    G --> H{Still Need More?}
    H -->|Yes| I[Get Products from Other Stores]
    I --> J[Distribute Products Fairly]
    E -->|No| J
    H -->|No| J
    J --> K[Return Final Results]
```

1. **Fetch User Context**: Get user location and preferred categories in parallel
2. **Location-Based Priority**:
   - Find stores in user's location (city → state → country)
   - Get products from these stores (60% of limit)
3. **Category-Based Priority**:
   - Find stores matching user's preferred categories
   - Exclude already selected stores
   - Get products from category stores (80% of remaining limit)
4. **Fallback Strategy**:
   - Get products from other approved stores
   - Fill remaining slots
5. **Fair Distribution**:
   - Distribute products across multiple stores
   - Prevent single-store dominance

## Fair Distribution Algorithm

The distribution algorithm ensures no single store overwhelms the results:

```typescript
// Calculate max products per store
const maxProductsPerStore = Math.floor(limit / totalStores);

// Distribute fairly across stores
stores.forEach((storeId) => {
  const storeProducts = getProductsForStore(storeId);
  const productsToAdd = storeProducts.slice(0, maxProductsPerStore);
  results.push(...productsToAdd);
});

// Fill remaining slots with best remaining products
if (remainingSlots > 0) {
  results.push(...remainingProducts.slice(0, remainingSlots));
}
```

## Database Optimization

### Indexes Used

- `idx_product_store_id` - Fast store-based filtering
- `idx_product_in_stock` - Stock status filtering
- `idx_product_price` - Price range queries
- `idx_store_status` - Approved stores only
- `idx_store_category_id` - Category filtering

### Query Optimization

- **Selective Joins**: Only joins necessary tables
- **Proper Grouping**: Handles rating aggregation efficiently
- **Filter Early**: Applies WHERE conditions before joins where possible
- **Limit Propagation**: Uses LIMIT at database level to reduce data transfer

## Usage Examples

### Basic Product Listing

```typescript
const response = await getProducts({
  limit: 20,
  page: 1,
  sortBy: "newest",
});
```

### Recommended Products with Filters

```typescript
const response = await getProducts({
  limit: 30,
  getRecommended: true,
  categoryId: "electronics",
  minPrice: 10,
  maxPrice: 500,
  sortBy: "rating",
});
```

### Price Range Search

```typescript
const response = await getProducts({
  limit: 50,
  minPrice: 100,
  maxPrice: 1000,
  sortBy: "price_asc",
  inStockOnly: true,
});
```

## Performance Considerations

### Best Practices

- Use reasonable `limit` values (20-50 for optimal performance)
- Enable `getRecommended` for personalized user experiences
- Use `inStockOnly: true` for better user experience
- Consider caching results for frequently accessed data

### Monitoring Points

- Query execution times
- Number of stores participating in recommendations
- Distribution fairness across stores
- Cache hit rates (if implemented)

## Error Handling

The handler includes robust error handling for:

- Invalid input parameters (validated by Zod schema)
- Database connection issues
- Empty result sets
- User authentication failures

## Security

- **Authentication Required**: Uses `protectedProcedure`
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Uses parameterized queries
- **Access Control**: Only returns products from approved stores

## Future Enhancements

### Potential Improvements

- **Caching Layer**: Redis caching for frequently accessed products
- **Search Functionality**: Full-text search across product names and descriptions
- **Inventory Tracking**: Real-time stock level updates
- **A/B Testing**: Different recommendation algorithms
- **Analytics**: Track user engagement with recommended products
- **Geolocation**: Distance-based store prioritization
- **Machine Learning**: AI-powered product recommendations

### Performance Optimizations

- Database connection pooling
- Query result caching
- Background data pre-processing
- CDN integration for product images
