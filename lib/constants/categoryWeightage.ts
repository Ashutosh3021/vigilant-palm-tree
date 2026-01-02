// Fixed category weightages that never change
export const CATEGORY_WEIGHTAGES: Record<string, number> = {
  "DSA - I": 20,
  "DSA - II": 15,
  "GYM": 3,
  "CLASSES AND ACADEMICS": 5,
  "NO FAP": 2,
  "UPGRADE": 10,
  "STATISTICS": 5,
  "MATH": 10,
  "COACHING": 15,
  "OTHER": 5,
  "MISCELLANEOUS": 5,
  "JOURNAL": 5,
};

// Validate that all weights sum to 100%
const totalWeight = Object.values(CATEGORY_WEIGHTAGES).reduce((sum, weight) => sum + weight, 0);
if (totalWeight !== 100) {
  console.warn(`Warning: Category weights total ${totalWeight}%, not 100%. This may cause scoring issues.`);
}

/**
 * Get the weight for a specific category
 * @param category The category name
 * @returns The weight percentage (0-100), or 0 if category not found
 */
export function getCategoryWeight(category: string): number {
  const normalizedCategory = category.toUpperCase();
  return CATEGORY_WEIGHTAGES[normalizedCategory] || 0;
}

/**
 * Get all available categories
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_WEIGHTAGES);
}

/**
 * Get all categories with their weights
 * @returns Array of objects containing category and weight
 */
export function getAllCategoryWeights(): { category: string; weight: number }[] {
  return Object.entries(CATEGORY_WEIGHTAGES).map(([category, weight]) => ({
    category,
    weight,
  }));
}