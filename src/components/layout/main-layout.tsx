'use client'

import { ReactNode } from 'react'
import { Navigation } from './navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MainLayoutProps {
  children: ReactNode
  showNavigation?: boolean
  isAdmin?: boolean
  className?: string
}

export function MainLayout({ 
  children, 
  showNavigation = true, 
  isAdmin = false,
  className 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-artisan scroll-smooth-ios">
      <main className={cn(
        'relative min-h-screen',
        showNavigation && 'pb-24', // Account for bottom navigation
        className
      )}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      {showNavigation && <Navigation isAdmin={isAdmin} />}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function PageHeader({ 
  title, 
  description, 
  children, 
  className,
  showBackButton = false,
  onBack
}: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 400 }}
      className={cn(
        'sticky top-0 z-40 glass-artisan border-b border-wheat-200/50 dark:border-crust-700/50 safe-area-top',
        className
      )}
    >
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 rounded-xl bg-white/50 dark:bg-crust-800/50 border border-wheat-200/50 dark:border-crust-700/50 text-wheat-700 dark:text-wheat-300 hover:bg-white/70 dark:hover:bg-crust-800/70 transition-all duration-200 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-3xl font-bold tracking-tight text-gradient-artisan"
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-muted-foreground mt-2 text-sm"
                >
                  {description}
                </motion.p>
              )}
            </div>
          </div>
          {children && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wheat-300/30 to-transparent" />
    </motion.div>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('px-4 py-6', className)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-wheat-800 dark:text-wheat-200">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

export default MainLayout