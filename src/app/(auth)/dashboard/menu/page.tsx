'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button, 
  LoadingSpinner, 
  EmptyState,
  Modal,
  Input,
  ImageUpload
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { useRealtimeProducts } from '@/hooks/use-realtime-products'
import type { Product } from '@/types'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Coffee, 
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Package,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  category: z.string().min(1, 'Category is required'),
  lead_time_hours: z.number().min(0, 'Lead time must be 0 or greater'),
  image_url: z.string().optional(),
})

type ProductForm = z.infer<typeof productSchema>

export default function AdminMenuPage() {
  const { isAdmin, loading: authLoading, profile } = useAuth()
  const { products, loading, refetch } = useRealtimeProducts()
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cost: 0,
      category: '',
      lead_time_hours: 48,
      image_url: '',
    },
  })

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    return cats.sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesAvailability = !showAvailableOnly || product.available
      
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [products, searchTerm, selectedCategory, showAvailableOnly])

  // Calculate stats
  const stats = useMemo(() => {
    const total = products.length
    const available = products.filter(p => p.available).length
    const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0
    const totalProfit = products.reduce((sum, p) => sum + (p.price - p.cost), 0)
    
    return { total, available, avgPrice, totalProfit }
  }, [products])

  // Show loading while auth or profile is still loading
  if (authLoading || !profile) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Menu Management" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  // Only show access denied after profile is loaded and user is not admin
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="p-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </MainLayout>
    )
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    form.reset({
      name: '',
      description: '',
      price: 0,
      cost: 0,
      category: categories[0] || '',
      lead_time_hours: 48,
      image_url: '',
    })
    setShowModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      cost: product.cost,
      category: product.category,
      lead_time_hours: product.lead_time_hours || 48,
      image_url: product.image_url || '',
    })
    setShowModal(true)
  }

  const handleToggleAvailability = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !product.available }),
      })

      if (!response.ok) {
        throw new Error('Failed to update availability')
      }

      toast.success(`${product.name} ${!product.available ? 'enabled' : 'disabled'}`)
      refetch()
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      toast.success(`${product.name} deleted`)
      refetch()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleBulkToggle = async (enable: boolean) => {
    const productsToUpdate = filteredProducts.filter(p => p.available !== enable)
    
    if (productsToUpdate.length === 0) {
      toast('No products to update')
      return
    }

    if (!confirm(`${enable ? 'Enable' : 'Disable'} ${productsToUpdate.length} products?`)) {
      return
    }

    try {
      await Promise.all(
        productsToUpdate.map(product =>
          fetch(`/api/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ available: enable }),
          })
        )
      )

      toast.success(`${productsToUpdate.length} products ${enable ? 'enabled' : 'disabled'}`)
      refetch()
    } catch (error) {
      console.error('Error bulk updating:', error)
      toast.error('Failed to update products')
    }
  }

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true)
    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update product')
        }

        toast.success('Product updated successfully')
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create product')
        }

        toast.success('Product created successfully')
      }
      
      setShowModal(false)
      refetch()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Menu Management" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout isAdmin>
      <PageHeader 
        title="Menu Management" 
        description={`Manage your bakery menu • ${stats.total} products • ${stats.available} available`}
      >
        <Button onClick={handleAddProduct} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </PageHeader>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Available</p>
                  <p className="text-2xl font-bold text-green-900">{stats.available}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg Price</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.avgPrice)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Total Margin</p>
                  <p className="text-2xl font-bold text-amber-900">{formatCurrency(stats.totalProfit)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className={showAvailableOnly ? 'bg-green-50 text-green-700 border-green-300' : ''}
                >
                  {showAvailableOnly ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                  Available Only
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggle(true)}
                  disabled={filteredProducts.length === 0}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Enable All
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggle(false)}
                  disabled={filteredProducts.length === 0}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Disable All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={searchTerm || selectedCategory !== 'all' || showAvailableOnly ? Filter : Coffee}
            title={searchTerm || selectedCategory !== 'all' || showAvailableOnly ? "No matching products" : "No products yet"}
            description={searchTerm || selectedCategory !== 'all' || showAvailableOnly ? "Try adjusting your search or filters" : "Add your first product to get started"}
            action={searchTerm || selectedCategory !== 'all' || showAvailableOnly ? undefined : {
              label: "Add Product",
              onClick: handleAddProduct
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={`transition-all hover:shadow-lg ${!product.available ? 'opacity-60 bg-gray-50' : ''}`}>
                {/* Product Image */}
                {product.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className={product.image_url ? 'pt-4' : ''}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {product.name}
                        {!product.available && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Tag className="h-3 w-3 mr-1" />
                          {product.category}
                        </Badge>
                        <Badge variant={product.available ? 'default' : 'secondary'} className={
                          product.available ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600'
                        }>
                          {product.available ? 'Available' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Price:
                      </span>
                      <span className="font-semibold">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost:</span>
                      <span className="text-muted-foreground">{formatCurrency(product.cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Profit:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(product.price - product.cost)}
                        <span className="text-xs ml-1">
                          ({((product.price - product.cost) / product.price * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    {product.lead_time_hours && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Lead time:
                        </span>
                        <span>{product.lead_time_hours}h</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAvailability(product)}
                      className={`flex-1 ${product.available ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-300' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'}`}
                    >
                      {product.available ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product)}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g., Traditional Sourdough Loaf"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
            disabled={submitting}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <ImageUpload
              value={form.watch('image_url')}
              onChange={(imageUrl) => form.setValue('image_url', imageUrl)}
              onRemove={() => form.setValue('image_url', '')}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...form.register('description')}
              className="w-full p-3 border rounded-xl resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your product..."
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="15.00"
              {...form.register('price', { valueAsNumber: true })}
              error={form.formState.errors.price?.message}
              disabled={submitting}
            />
            <Input
              label="Cost ($)"
              type="number"
              step="0.01"
              placeholder="5.25"
              {...form.register('cost', { valueAsNumber: true })}
              error={form.formState.errors.cost?.message}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                {...form.register('category')}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              >
                <option value="">Select category</option>
                <option value="Breads">Breads</option>
                <option value="Sweet Treats">Sweet Treats</option>
                <option value="Sandwich Breads">Sandwich Breads</option>
                <option value="Tallow Products">Tallow Products</option>
                <option value="Seasonal">Seasonal</option>
              </select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>

            <Input
              label="Lead Time (hours)"
              type="number"
              placeholder="48"
              {...form.register('lead_time_hours', { valueAsNumber: true })}
              error={form.formState.errors.lead_time_hours?.message}
              disabled={submitting}
            />
          </div>

          {/* Profit calculation preview */}
          {form.watch('price') > 0 && form.watch('cost') >= 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Profit per item:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(form.watch('price') - form.watch('cost'))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit margin:</span>
                  <span className="font-semibold text-green-700">
                    {((form.watch('price') - form.watch('cost')) / form.watch('price') * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}