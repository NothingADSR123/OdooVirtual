# Firebase Security Rules Configuration

This document contains the required security rules for both Firestore and Firebase Storage.

## CRITICAL: Firestore Security Rules

**You MUST configure these Firestore rules in Firebase Console → Firestore Database → Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for now (TEMPORARY - for testing)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANT**: The above rules are VERY PERMISSIVE and should only be used for testing. Once everything works, replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products are readable by all, writable by authenticated users
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.sellerId || request.auth.uid == resource.data.userId);
    }
    
    // Categories are readable by all
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Cart items - users can only access their own cart
    match /carts/{cartId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Purchases - users can only access their own purchases
    match /purchases/{purchaseId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null && 
        (request.auth.uid == request.resource.data.buyerId || request.auth.uid == request.resource.data.sellerId);
    }
    
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Firebase Storage Rules

Go to your Firebase Console → Storage → Rules and add these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload product images
    match /product-images/{productId}/{imageId} {
      allow read: if true; // Anyone can read product images
      allow write: if request.auth != null && 
                      request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                      request.resource.contentType.matches('image/.*'); // Only images
    }
    
    // Fallback rule for other files
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Solution 2: Test Storage Connection

You can test if Firebase Storage is working by:

1. Check Firebase Console → Storage to see if the bucket exists
2. Try uploading a small test image
3. Check browser console for specific error messages

## Solution 3: Alternative - Skip Images for Now

The app now supports publishing products without images:
- Users can click "Skip Images" on step 2
- Products can be published without images
- Images can be added later through the "Edit" function

## Current App Improvements

✅ **Image Compression**: Large images are automatically compressed before upload
✅ **Upload Timeout**: 30-second timeout prevents infinite loading
✅ **Individual Upload Handling**: Each image uploads separately with error handling
✅ **Skip Images Option**: Users can publish without images
✅ **Graceful Degradation**: App continues to work even if some images fail

## Next Steps

1. Configure Firebase Storage rules (most important)
2. Test with smaller images first
3. Check Firebase Console for any error logs
4. Consider using a different image hosting service if issues persist