function ProductCard({ product, onAddToCart }) {
  const discount = product.mrp > 0 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md">
      <img src={product.image} alt={product.name} className="w-full h-40 object-contain" />
      
      <p className="font-semibold mt-2 text-sm">{product.name}</p>
      
      {/* Rating */}
      <div className="flex items-center gap-1 text-xs mt-1">
        <span className="bg-green-600 text-white px-1 rounded">⭐{product.rating}</span> 
        <span className="text-gray-500">({product.reviews})</span>
      </div>

      {/* Price + Discount */}
      <div className="flex items-center gap-2 mt-1">
        <p className="font-bold text-lg">₹{product.price}</p>
        {product.mrp > product.price && (
          <>
            <p className="line-through text-gray-400 text-sm">₹{product.mrp}</p>
            <p className="text-green-600 text-xs font-bold">{discount}% off</p>
          </>
        )}
      </div>

      {/* Stock + Delivery */}
      <p className={`text-xs ${product.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
        {product.stock < 5 ? `Only ${product.stock} left` : 'In Stock'}
      </p>
      <p className="text-xs text-gray-500">Delivery by {product.delivery_date}</p>

      {/* Buttons */}
      <button 
        onClick={() => onAddToCart(product)}
        className="w-full bg-yellow-400 py-2 rounded mt-2 font-bold text-sm hover:bg-yellow-500"
      >
        ADD TO CART
      </button>
      <button className="w-full border py-2 rounded mt-1 text-sm">❤️ Wishlist</button>
    </div>
  )
}

export default ProductCard