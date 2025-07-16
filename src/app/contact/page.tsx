'use client'

import { useState } from 'react'
import { MainLayout, Container, PageHeader } from '@/components/layout/main-layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ArrowRight,
  Wheat,
  Send,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <MainLayout isAdmin={isAdmin}>
      <PageHeader 
        title="Contact Us"
        description="Get in touch with our artisan bakery team"
        showBackButton
        onBack={() => router.back()}
      />

      <div className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gradient-artisan mb-6">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Have questions about our bread, special orders, or pickup times? 
                  We&apos;d love to hear from you!
                </p>
              </motion.div>

              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: "Location",
                    content: "Local Pickup",
                    description: "Serving our community"
                  },
                  {
                    icon: Clock,
                    title: "Ordering",
                    content: "Online Only",
                    description: "All orders require advance notice"
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    content: "hello@artisansourdough.com",
                    description: "We respond within 24 hours"
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    content: "Available for special orders",
                    description: "Leave a message and we'll call back"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    className="flex items-start gap-4 p-4 rounded-2xl glass-card group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-wheat-100 to-sourdough-100 dark:from-wheat-900/30 dark:to-sourdough-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6 text-wheat-700 dark:text-wheat-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-wheat-800 dark:text-wheat-200 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium text-foreground">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="p-6 rounded-3xl bg-gradient-warm border border-wheat-200/50 dark:border-crust-700/50"
              >
                <h3 className="text-lg font-semibold text-wheat-800 dark:text-wheat-200 mb-4">
                  Ready to Order?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Browse our fresh bread selection and place your order for pickup.
                </p>
                <Button
                  onClick={() => router.push('/menu')}
                  className="w-full bg-gradient-to-r from-wheat-600 to-crust-600 hover:from-wheat-700 hover:to-crust-700 text-white rounded-xl h-11"
                >
                  <Wheat className="h-4 w-4 mr-2" />
                  View Menu
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="glass-card p-8 rounded-3xl"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-wheat-800 dark:text-wheat-200 mb-2">
                    Send us a Message
                  </h2>
                  <p className="text-muted-foreground">
                    Questions about our products, special orders, or just want to say hello?
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-sage-600 dark:text-sage-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-wheat-800 dark:text-wheat-200 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-wheat-800 dark:text-wheat-200 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-wheat-200 dark:border-crust-600 bg-white/50 dark:bg-crust-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-wheat-500 focus:border-transparent transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-wheat-800 dark:text-wheat-200 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-wheat-200 dark:border-crust-600 bg-white/50 dark:bg-crust-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-wheat-500 focus:border-transparent transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-wheat-800 dark:text-wheat-200 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-wheat-200 dark:border-crust-600 bg-white/50 dark:bg-crust-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-wheat-500 focus:border-transparent transition-all duration-200"
                        placeholder="What can we help you with?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-wheat-800 dark:text-wheat-200 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-wheat-200 dark:border-crust-600 bg-white/50 dark:bg-crust-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-wheat-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Tell us about your question or special order request..."
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-wheat-600 to-crust-600 hover:from-wheat-700 hover:to-crust-700 text-white rounded-xl h-12 text-lg font-semibold"
                        loading={isSubmitting}
                      >
                        <Send className="h-5 w-5 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </Container>

        {/* FAQ Section */}
        <Container className="mt-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gradient-artisan mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quick answers to common questions about our artisan sourdough bread.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  question: "How far in advance should I order?",
                  answer: "Most breads require 48 hours notice due to our fermentation process. Sweet treats and rolls may have shorter lead times."
                },
                {
                  question: "Do you offer delivery?",
                  answer: "Currently we offer pickup only from our local bakery. We&apos;ll contact you when your order is ready."
                },
                {
                  question: "Can you accommodate special dietary needs?",
                  answer: "Our traditional sourdough is naturally easier to digest. Contact us about specific allergen concerns or custom orders."
                },
                {
                  question: "How should I store my bread?",
                  answer: "Store in a paper bag at room temperature for 2-3 days, or slice and freeze for longer storage. Avoid plastic bags."
                },
                {
                  question: "Do you offer wholesale or catering?",
                  answer: "Yes! We can provide larger quantities for events or restaurants. Contact us to discuss your needs and timing."
                },
                {
                  question: "What makes your sourdough different?",
                  answer: "We use traditional 48-hour fermentation, organic flour, and maintain our starter daily for authentic flavor and improved digestibility."
                }
              ].map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl glass-card"
                >
                  <h3 className="text-lg font-semibold text-wheat-800 dark:text-wheat-200 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </div>
    </MainLayout>
  )
}