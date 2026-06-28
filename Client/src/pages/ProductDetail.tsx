import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'

const product = {
  id: '1',
  name: 'Ramón el carismático',
  description: 'Hermoso ramo de rosas eternas que nunca se marchitan. Perfecto para regalar en cualquier ocasión especial. Cada rosa es preservada individualmente para mantener su belleza por años.',
  price: 45000,
  stock: 12,
  category: 'Flores',
  images: [
    'https://placehold.co/600x600/49b8a7/ffffff?text=Ramón+1',
    'https://placehold.co/600x600/3d9e8f/ffffff?text=Ramón+2',
    'https://placehold.co/600x600/328478/ffffff?text=Ramón+3',
  ],
  rating: 4.5,
  reviews: [
    { id: '1', user: 'María', rating: 5, comment: 'Excelente producto, muy bonito', date: '2026-05-15' },
    { id: '2', user: 'Carlos', rating: 4, comment: 'Bueno calidad, llegó a tiempo', date: '2026-05-10' },
  ],
}

export default function ProductDetail() {
  const { id: _id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <img
              src={product.images[currentImage]}
              alt={`${product.name} - Imagen ${currentImage + 1}`}
              className="w-full aspect-square object-cover"
            />
            <span className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-3 py-1.5 rounded-full">
              {product.category}
            </span>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((i) => (i === 0 ? product.images.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImage((i) => (i === product.images.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'}
                  className={star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews.length} reseñas)</span>
          </div>
          <p className="text-4xl font-bold text-primary mb-6">
            ${product.price.toLocaleString()}
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Agregar al carrito
            </button>
            <button className="p-3 border-2 border-gray-200 rounded-lg text-gray-400 hover:text-accent hover:border-accent transition-colors">
              <Heart size={24} />
            </button>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Reseñas</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{review.user}</span>
                    <span className="text-sm text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= review.rating ? 'currentColor' : 'none'}
                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
