'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, ShoppingCart, User, BarChart3, LogIn, LogOut, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'react-hot-toast'

interface NavItem {
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
  onClick?: () => void
  requiresAuth?: boolean
}

interface NavigationProps {
  isAdmin?: boolean
  className?: string
}

export function Navigation({ isAdmin = false, className }: NavigationProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { getTotalItems } = useCartStore()
  const cartItems = getTotalItems()
  
  // For future enhancement: Could add order notifications here
  // const { orders } = useCustomerOrders(user?.id)
  // const readyOrders = orders.filter(order => order.status === 'ready').length

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/menu', icon: Menu, label: 'Menu' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItems },
    ...(user 
      ? [{ href: '/profile', icon: User, label: 'Profile', requiresAuth: true }]
      : [{ href: '/auth/login', icon: LogIn, label: 'Sign In' }]
    ),
  ]

  const adminNavItems: NavItem[] = [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/dashboard/menu', icon: Menu, label: 'Menu' },
    { icon: LogOut, label: 'Sign Out', onClick: handleSignOut },
  ]

  const items = isAdmin ? adminNavItems : navItems

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 glass-artisan border-t border-wheat-200/50 dark:border-crust-700/50 safe-area-inset',
      className
    )}>
      <div className="relative">
        {/* Subtle top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wheat-300/50 to-transparent" />
        
        <div className="flex items-center justify-around py-3 px-2">
          {items.map((item, index) => {
            const Icon = item.icon
            const isActive = item.href ? pathname === item.href : false
            const key = item.href || item.label
            
            return (
              <motion.div
                key={key}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                className="relative"
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 tap-highlight-transparent touch-manipulation group',
                      isActive
                        ? 'text-wheat-700 dark:text-wheat-300'
                        : 'text-muted-foreground hover:text-wheat-600 dark:hover:text-wheat-400'
                    )}
                  >
                    <NavItemContent 
                      icon={Icon} 
                      label={item.label} 
                      isActive={isActive} 
                      badge={item.badge}
                    />
                  </Link>
                ) : (
                  <motion.button
                    onClick={item.onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 tap-highlight-transparent touch-manipulation group',
                      'text-muted-foreground hover:text-wheat-600 dark:hover:text-wheat-400'
                    )}
                  >
                    <NavItemContent 
                      icon={Icon} 
                      label={item.label} 
                      isActive={false} 
                      badge={item.badge}
                    />
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

interface NavItemContentProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  badge?: number
}

function NavItemContent({ icon: Icon, label, isActive, badge }: NavItemContentProps) {
  return (
    <>
      {/* Active background with glow */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-br from-wheat-100 to-sourdough-100 dark:from-wheat-900/30 dark:to-sourdough-900/30 rounded-2xl border border-wheat-200/50 dark:border-wheat-700/50"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      
      {/* Hover background */}
      <motion.div
        className="absolute inset-0 bg-wheat-50/50 dark:bg-wheat-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Icon className={cn(
            'h-5 w-5 mb-1 transition-all duration-300',
            isActive 
              ? 'drop-shadow-sm' 
              : 'group-hover:scale-105'
          )} />
        </motion.div>
        
        <span className={cn(
          'text-xs font-medium transition-all duration-300',
          isActive 
            ? 'font-semibold text-wheat-800 dark:text-wheat-200' 
            : 'group-hover:font-medium'
        )}>
          {label}
        </span>
        
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 w-1 h-1 bg-wheat-600 dark:bg-wheat-400 rounded-full"
          />
        )}
      </div>
      
      {/* Badge for cart items */}
      {badge && badge > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-crust-600 text-white text-xs font-semibold h-5 w-5 rounded-full flex items-center justify-center border-2 border-background"
        >
          {badge}
        </motion.div>
      )}
    </>
  )
}

export default Navigation