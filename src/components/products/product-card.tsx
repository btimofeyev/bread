'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button, Card, CardContent } from '@/components/ui'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency, cn } from '@/lib/utils'
import type { Product } from '@/types'
import { Plus, Minus, ShoppingCart, Clock, Wheat } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const cartItem = items.find(item => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    if (!product.available) return
    
    setIsAdding(true)
    try {
      addItem(product, 1)
      toast.success(`Added ${product.name} to cart`)
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setTimeout(() => setIsAdding(false), 300)
    }
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 0) return
    updateQuantity(product.id, newQuantity)
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'breads':
        return 'from-wheat-100 to-sourdough-100 dark:from-wheat-900/20 dark:to-sourdough-900/20'
      case 'sweet treats':
        return 'from-crust-100 to-wheat-100 dark:from-crust-900/20 dark:to-wheat-900/20'
      case 'sandwich breads':
        return 'from-sourdough-100 to-sage-100 dark:from-sourdough-900/20 dark:to-sage-900/20'
      default:
        return 'from-wheat-100 to-sourdough-100 dark:from-wheat-900/20 dark:to-sourdough-900/20'
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={cn(
        "group h-full overflow-hidden border-0 artisan-shadow-lg transition-all duration-500 interactive-lift touch-manipulation",
        "glass-card"
      )}>
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <div className={cn(
            "aspect-[4/3] relative overflow-hidden bg-gradient-to-br",
            getCategoryColor(product.category)
          )}>
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-700",
                  isHovered ? "scale-110" : "scale-100"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  className="p-4 rounded-full bg-white/50 dark:bg-crust-800/50"
                >
                  <Wheat className="h-12 w-12 text-wheat-600 dark:text-wheat-400" />
                </motion.div>
              </div>
            )}
            
            {/* Availability Overlay */}
            {!product.available && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-white font-semibold bg-crust-900/90 px-4 py-2 rounded-full border border-white/20"
                >
                  Out of Stock
                </motion.span>
              </motion.div>
            )}

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="px-3 py-1 rounded-full bg-white/90 dark:bg-crust-900/90 backdrop-blur-sm border border-wheat-200/50 dark:border-crust-700/50"
              >
                <span className="text-xs font-medium text-wheat-700 dark:text-wheat-300">
                  {product.category}
                </span>
              </motion.div>
            </div>

            {/* Cart Quantity Badge */}
            {quantity > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 bg-crust-600 text-white text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center border-2 border-white/50 artisan-shadow"
              >
                {quantity}
              </motion.div>
            )}
          </div>
        </div>
        
        <CardContent className="p-5 space-y-4">
          {/* Product Info */}
          <div className="space-y-3">
            <motion.h3 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="font-bold text-lg leading-tight text-wheat-900 dark:text-wheat-100 line-clamp-2"
            >
              {product.name}
            </motion.h3>
            
            {product.description && (
              <motion.p 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              >
                {product.description}
              </motion.p>
            )}
            
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center justify-between"
            >
              <span className="text-2xl font-bold text-gradient-artisan">
                {formatCurrency(product.price)}
              </span>
              
              {product.lead_time_hours && product.lead_time_hours > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-sage-50 dark:bg-sage-900/20 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>{product.lead_time_hours}h</span>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Cart Actions */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            {quantity === 0 ? (
              <Button
                onClick={handleAddToCart}
                disabled={!product.available || isAdding}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-wheat-600 to-crust-600 hover:from-wheat-700 hover:to-crust-700",
                  "text-white shadow-lg hover:shadow-xl",
                  "disabled:from-gray-400 disabled:to-gray-500",
                  isAdding && "animate-pulse"
                )}
                loading={isAdding}
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </motion.div>
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-wheat-50 to-sourdough-50 dark:from-wheat-900/20 dark:to-sourdough-900/20 border border-wheat-200/50 dark:border-crust-700/50">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateQuantity(quantity - 1)}
                      className="h-8 w-8 rounded-full bg-white dark:bg-crust-800 border border-wheat-300 dark:border-crust-600 flex items-center justify-center hover:bg-wheat-50 dark:hover:bg-crust-700 transition-colors touch-manipulation"
                    >
                      <Minus className="h-4 w-4 text-wheat-700 dark:text-wheat-300" />
                    </motion.button>
                    
                    <span className="font-bold text-lg min-w-[2rem] text-center text-wheat-800 dark:text-wheat-200">
                      {quantity}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-full bg-white dark:bg-crust-800 border border-wheat-300 dark:border-crust-600 flex items-center justify-center hover:bg-wheat-50 dark:hover:bg-crust-700 transition-colors touch-manipulation"
                    >
                      <Plus className="h-4 w-4 text-wheat-700 dark:text-wheat-300" />
                    </motion.button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-lg font-bold text-wheat-800 dark:text-wheat-200">
                      {formatCurrency(product.price * quantity)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}