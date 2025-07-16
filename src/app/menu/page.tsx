'use client'

import { useState } from 'react'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CartButton } from '@/components/cart/cart-button'
import { ProductCardSkeleton, EmptyState } from '@/components/ui'
import { NoSSR } from '@/components/no-ssr'
import { useRealtimeProducts } from '@/hooks/use-realtime-products'
import { Coffee } from 'lucide-react'

export default function MenuPage() {
  const { products: allProducts, loading } = useRealtimeProducts()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Filter to only show available products
  const products = allProducts.filter(p => p.available)

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="Menu" />
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Menu" 
        description="Fresh artisan sourdough bread"
      >
        <NoSSR>
          <CartButton />
        </NoSSR>
      </PageHeader>

      <div className="p-4">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Coffee}
            title="No products available"
            description="Check back later for fresh bread options"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <NoSSR key={product.id} fallback={<ProductCardSkeleton />}>
                <ProductCard product={product} />
              </NoSSR>
            ))}
          </div>
        )}
      </div>

      <NoSSR>
        <CartDrawer />
      </NoSSR>
    </MainLayout>
  )
}