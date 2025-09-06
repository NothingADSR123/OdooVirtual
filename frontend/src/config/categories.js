// Product categories for EcoFinds marketplace
export const PRODUCT_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Phones, laptops, gadgets, and electronic devices',
    icon: '📱',
    color: '#124170'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Tables, chairs, sofas, and home furniture',
    icon: '🪑',
    color: '#26667F'
  },
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    description: 'Clothes, shoes, accessories, and fashion items',
    icon: '👕',
    color: '#67C090'
  },
  {
    id: 'books',
    name: 'Books & Media',
    description: 'Books, magazines, DVDs, and educational materials',
    icon: '📚',
    color: '#124170'
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    description: 'Sports equipment, outdoor gear, and fitness items',
    icon: '⚽',
    color: '#26667F'
  },
  {
    id: 'home',
    name: 'Home & Garden',
    description: 'Home decor, kitchen items, and garden supplies',
    icon: '🏠',
    color: '#67C090'
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    description: 'Children toys, board games, and entertainment',
    icon: '🧸',
    color: '#124170'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Car parts, accessories, and automotive supplies',
    icon: '🚗',
    color: '#26667F'
  },
  {
    id: 'art',
    name: 'Art & Crafts',
    description: 'Artwork, craft supplies, and creative materials',
    icon: '🎨',
    color: '#67C090'
  },
  {
    id: 'music',
    name: 'Musical Instruments',
    description: 'Guitars, keyboards, and musical equipment',
    icon: '🎸',
    color: '#124170'
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Watches',
    description: 'Jewelry, watches, and accessories',
    icon: '💍',
    color: '#26667F'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Items that don\'t fit in other categories',
    icon: '📦',
    color: '#67C090'
  }
];

// Product conditions
export const PRODUCT_CONDITIONS = [
  {
    id: 'excellent',
    name: 'Excellent',
    description: 'Like new, minimal signs of use',
    color: '#67C090'
  },
  {
    id: 'good',
    name: 'Good',
    description: 'Well maintained, minor wear',
    color: '#26667F'
  },
  {
    id: 'fair',
    name: 'Fair',
    description: 'Shows wear, fully functional',
    color: '#f59e0b'
  },
  {
    id: 'poor',
    name: 'Poor',
    description: 'Heavy wear, may need repair',
    color: '#ef4444'
  }
];

// Helper functions
export const getCategoryById = (id) => {
  return PRODUCT_CATEGORIES.find(category => category.id === id);
};

export const getConditionById = (id) => {
  return PRODUCT_CONDITIONS.find(condition => condition.id === id);
};

export const getCategoryOptions = () => {
  return PRODUCT_CATEGORIES.map(category => ({
    value: category.id,
    label: category.name,
    icon: category.icon
  }));
};

export const getConditionOptions = () => {
  return PRODUCT_CONDITIONS.map(condition => ({
    value: condition.id,
    label: condition.name,
    description: condition.description
  }));
};

export default {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  getCategoryById,
  getConditionById,
  getCategoryOptions,
  getConditionOptions
};