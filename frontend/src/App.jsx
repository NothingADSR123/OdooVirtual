import { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // Google Login
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Add product from form
  const addProduct = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Login first!");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "products"), {
        title,
        price: parseFloat(price),
        category,
        sellerId: user.uid,
        createdAt: serverTimestamp(),
      });
      console.log("Product added with ID: ", docRef.id);

      // Clear inputs
      setTitle("");
      setPrice("");
      setCategory("");

      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Fetch products
  // Fetch products for the current user
  const fetchProducts = async (currentUser) => {
    if (!currentUser) {
      setProducts([]);
      return;
    }
    try {
      const q = query(collection(db, "products"), where("sellerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched user products:", productsData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching user products:", err);
    }
  };

  useEffect(() => {
    fetchProducts(user);
  }, [user]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>EcoFinds</h1>

      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}

      <hr />

      {user && (
        <div>
          <h2>Add Product</h2>
          <form onSubmit={addProduct}>
            <input
              type="text"
              placeholder="Product Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <br />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <br />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <br />
            <button type="submit">Add Product</button>
          </form>
        </div>
      )}

      <hr />

      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.title} - ₹{p.price} ({p.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
