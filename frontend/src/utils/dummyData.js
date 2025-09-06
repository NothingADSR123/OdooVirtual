// Dummy product data for development
export const DUMMY_PRODUCTS = [
  {
    id: 'dummy-1',
    title: 'iPhone 13 Pro - Excellent Condition',
    description: 'Barely used iPhone 13 Pro in pristine condition. Includes original box, charger, and screen protector already applied. No scratches or dents.',
    price: 699,
    category: 'electronics',
    condition: 'excellent',
    location: 'San Francisco, CA',
    tags: ['smartphone', 'apple', 'unlocked'],
    sellerId: 'dummy-seller-1',
    sellerName: 'Sarah Johnson',
    sellerEmail: 'sarah@example.com',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-2',
    title: 'Vintage Leather Armchair',
    description: 'Beautiful vintage leather armchair from the 1970s. Some wear on the arms but adds to the character. Very comfortable and sturdy.',
    price: 450,
    category: 'furniture',
    condition: 'good',
    location: 'Brooklyn, NY',
    tags: ['vintage', 'leather', 'retro'],
    sellerId: 'dummy-seller-2',
    sellerName: 'Mike Chen',
    sellerEmail: 'mike@example.com',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-3',
    title: 'MacBook Air M1 - Like New',
    description: 'MacBook Air with M1 chip, 8GB RAM, 256GB SSD. Used for only 6 months. Perfect for students or professionals. Includes original packaging.',
    price: 850,
    category: 'electronics',
    condition: 'excellent',
    location: 'Austin, TX',
    tags: ['laptop', 'apple', 'macbook', 'm1'],
    sellerId: 'dummy-seller-3',
    sellerName: 'Emma Davis',
    sellerEmail: 'emma@example.com',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-4',
    title: 'Designer Handbag Collection',
    description: 'Authentic designer handbags in excellent condition. Includes dust bags and authenticity cards. Perfect for fashion enthusiasts.',
    price: 320,
    category: 'fashion',
    condition: 'excellent',
    location: 'Los Angeles, CA',
    tags: ['designer', 'handbag', 'luxury', 'authentic'],
    sellerId: 'dummy-seller-4',
    sellerName: 'Jessica Wilson',
    sellerEmail: 'jessica@example.com',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-5',
    title: 'Acoustic Guitar - Yamaha FG830',
    description: 'Beautiful Yamaha acoustic guitar in great condition. Perfect for beginners or experienced players. Includes case and picks.',
    price: 180,
    category: 'music',
    condition: 'good',
    location: 'Seattle, WA',
    tags: ['guitar', 'yamaha', 'acoustic', 'music'],
    sellerId: 'dummy-seller-5',
    sellerName: 'David Rodriguez',
    sellerEmail: 'david@example.com',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-6',
    title: 'Vintage Camera Collection',
    description: 'Collection of vintage film cameras including Canon AE-1 and Nikon FM. All in working condition. Perfect for photography enthusiasts.',
    price: 275,
    category: 'electronics',
    condition: 'good',
    location: 'Portland, OR',
    tags: ['camera', 'vintage', 'film', 'photography'],
    sellerId: 'dummy-seller-6',
    sellerName: 'Alex Thompson',
    sellerEmail: 'alex@example.com',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-7',
    title: 'Gaming Setup - Complete Bundle',
    description: 'Complete gaming setup including mechanical keyboard, gaming mouse, headset, and mousepad. Perfect for competitive gaming.',
    price: 220,
    category: 'electronics',
    condition: 'excellent',
    location: 'Denver, CO',
    tags: ['gaming', 'keyboard', 'mouse', 'setup'],
    sellerId: 'dummy-seller-7',
    sellerName: 'Ryan Martinez',
    sellerEmail: 'ryan@example.com',
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-8',
    title: 'Antique Wooden Dining Table',
    description: 'Beautiful antique oak dining table that seats 6. Some minor wear but structurally sound. Perfect for family gatherings.',
    price: 680,
    category: 'furniture',
    condition: 'good',
    location: 'Boston, MA',
    tags: ['dining table', 'antique', 'oak', 'wooden'],
    sellerId: 'dummy-seller-8',
    sellerName: 'Lisa Anderson',
    sellerEmail: 'lisa@example.com',
    images: [
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-9',
    title: 'Professional Art Supplies Set',
    description: 'Complete set of professional art supplies including paints, brushes, canvases, and easel. Perfect for artists of all levels.',
    price: 150,
    category: 'art',
    condition: 'like-new',
    location: 'Chicago, IL',
    tags: ['art', 'painting', 'supplies', 'professional'],
    sellerId: 'dummy-seller-9',
    sellerName: 'Maria Garcia',
    sellerEmail: 'maria@example.com',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-10',
    title: 'Vintage Vinyl Record Collection',
    description: 'Amazing collection of vintage vinyl records from the 60s-80s. Includes classics from The Beatles, Pink Floyd, and more.',
    price: 180,
    category: 'collectibles',
    condition: 'good',
    location: 'Nashville, TN',
    tags: ['vinyl', 'records', 'music', 'vintage'],
    sellerId: 'dummy-seller-10',
    sellerName: 'James Wilson',
    sellerEmail: 'james@example.com',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-11',
    title: 'Mountain Bike - Trek 3500',
    description: 'Trek 3500 mountain bike in great condition. Perfect for trails and city riding. Recently serviced with new tires.',
    price: 380,
    category: 'sports',
    condition: 'good',
    location: 'Boulder, CO',
    tags: ['bike', 'mountain bike', 'trek', 'cycling'],
    sellerId: 'dummy-seller-11',
    sellerName: 'Chris Taylor',
    sellerEmail: 'chris@example.com',
    images: [
      'https://images.unsplash.com/photo-1544191696-15693072e0b5?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'dummy-12',
    title: 'Designer Winter Coat',
    description: 'Luxury designer winter coat in excellent condition. Warm and stylish, perfect for cold weather. Size Medium.',
    price: 250,
    category: 'fashion',
    condition: 'excellent',
    location: 'Minneapolis, MN',
    tags: ['coat', 'winter', 'designer', 'fashion'],
    sellerId: 'dummy-seller-12',
    sellerName: 'Sophie Brown',
    sellerEmail: 'sophie@example.com',
    images: [
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop'
    ],
    status: 'available',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  }
];

// Function to add dummy data to the product service (for development)
export const addDummyProducts = async (productService) => {
  try {
    console.log('Adding dummy products...');
    for (const product of DUMMY_PRODUCTS) {
      // Check if product already exists
      try {
        await productService.getProductById(product.id);
        console.log(`Product ${product.id} already exists, skipping...`);
      } catch (error) {
        // Product doesn't exist, add it
        await productService.createProduct(product, product.id);
        console.log(`Added dummy product: ${product.title}`);
      }
    }
    console.log('Dummy products added successfully!');
  } catch (error) {
    console.error('Error adding dummy products:', error);
  }
};