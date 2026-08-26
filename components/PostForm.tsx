'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import PaywallModal from './PaywallModal'

interface ImageEntry {
  file: File
  preview: string
}

interface PostFormProps {
  userId: string
  postCount: number
  todayPostCount?: number
  freeLimit: number
  platformFee?: number
  maxPostsPerDay?: number
  hasPaidFee: boolean
  requiresApproval: boolean
  initialShowPaywall: boolean
}

type SuccessType = 'live' | 'review'

const STORE_THEMES: Record<string, { bg: string; text: string; icon: string }> = {
  Amazon: { bg: '#ff9900', text: '#111111', icon: '📦' },
  Flipkart: { bg: '#2874f0', text: '#ffffff', icon: '⚡' },
  Meesho: { bg: '#9f2089', text: '#ffffff', icon: '🛍️' },
  Myntra: { bg: '#ff3f6c', text: '#ffffff', icon: '💄' },
}

function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-black">
          {label}
          {required && <span className="ml-1 text-[#6040d1]">*</span>}
        </label>
        {help && <span className="text-xs text-gray-400">{help}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function SuccessView({ type }: { type: SuccessType }) {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16 w-full">
        <div className="rounded-2xl border p-8 text-center bg-white shadow-sm" style={{ borderColor: '#d7d5dc' }}>
          <div className="text-5xl mb-4">{type === 'live' ? '🎉' : '⏳'}</div>
          <h2 className="text-xl font-extrabold text-black">
            {type === 'live' ? 'Your Deal is Live!' : 'Deal Submitted for Moderation'}
          </h2>
          <p className="text-sm mt-2 text-gray-500 leading-relaxed">
            {type === 'live'
              ? 'Your offer is now active on the snapShop homepage deal feed.'
              : 'Our team will review your submission shortly. You will be notified upon approval.'}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/post"
              onClick={() => window.location.reload()}
              className="block w-full py-2.5 rounded-xl text-sm font-bold text-white text-center shadow-xs"
              style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
            >
              + Post Another Deal
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center border"
              style={{ borderColor: '#d7d5dc', color: '#000', textDecoration: 'none' }}
            >
              View Public Deal Feed
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PostForm({
  userId,
  postCount,
  todayPostCount = 0,
  freeLimit,
  platformFee = 249,
  maxPostsPerDay = 10,
  hasPaidFee,
  requiresApproval,
  initialShowPaywall,
}: PostFormProps) {
  const [title, setTitle] = useState('')
  const [images, setImages] = useState<ImageEntry[]>([])
  const [store, setStore] = useState('')
  const [category, setCategory] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [description, setDescription] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessType | null>(null)
  const [showPaywall, setShowPaywall] = useState(initialShowPaywall)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    let oversized = false
    const filtered = Array.from(incoming).filter((f) => {
      if (!f.type.startsWith('image/')) return false
      if (f.size > 5 * 1024 * 1024) {
        oversized = true
        return false
      }
      return true
    })

    if (oversized) {
      setErrors((prev) => ({
        ...prev,
        images: 'Image too large. Maximum 5MB per image.',
      }))
    }

    setImages((prev) => {
      const combined = [...prev]
      for (const file of filtered) {
        if (combined.length >= 5) break
        combined.push({ file, preview: URL.createObjectURL(file) })
      }
      return combined
    })
  }, [])

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return next
    })
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Product title is required'
    if (images.length < 3) errs.images = 'Please upload at least 3 product images'
    if (!store) errs.store = 'Please select a partner store'
    if (!category) errs.category = 'Please select a category'
    if (!offerPrice || Number(offerPrice) <= 0) errs.offerPrice = 'Enter a valid offer price'
    if (!affiliateLink.trim()) {
      errs.affiliateLink = 'Affiliate buy link is required'
    } else if (!/^https?:\/\//i.test(affiliateLink.trim())) {
      errs.affiliateLink = 'Link must start with http:// or https://'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 1. Daily limit check
    if (todayPostCount >= maxPostsPerDay) {
      setErrors({
        submit: `You have reached your daily posting limit of ${maxPostsPerDay} posts per day. Please try again tomorrow.`,
      })
      return
    }

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    if (postCount >= freeLimit && !hasPaidFee) {
      setShowPaywall(true)
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const imageUrls: string[] = []

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i]
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${userId}/${Date.now()}-${i}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`)

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(path)

        imageUrls.push(publicUrl)
      }

      const { error: insertErr } = await supabase.from('products').insert({
        user_id: userId,
        title: title.trim(),
        images: imageUrls,
        offer_price: Number(offerPrice),
        mrp: mrp && Number(mrp) > 0 ? Number(mrp) : null,
        store,
        category,
        affiliate_link: affiliateLink.trim(),
        description: description.trim() || null,
        status: requiresApproval ? 'pending' : 'approved',
      })

      if (insertErr) throw new Error(insertErr.message)

      setSuccess(requiresApproval ? 'review' : 'live')
    } catch (err: unknown) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to post deal.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return <SuccessView type={success} />

  const remainingFree = Math.max(0, freeLimit - postCount)
  const calcDiscount =
    mrp && offerPrice && Number(mrp) > Number(offerPrice)
      ? Math.round((1 - Number(offerPrice) / Number(mrp)) * 100)
      : null

  const activeStoreTheme = STORE_THEMES[store] ?? { bg: '#6040d1', text: '#ffffff', icon: '🛍️' }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Paywall modal */}
          {showPaywall && (
            <PaywallModal
              platformFee={platformFee}
              onClose={() => setShowPaywall(false)}
              onSuccess={() => window.location.reload()}
            />
          )}

          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">Share a Deal 🛍️</h1>
              <p className="text-sm text-gray-500 mt-1">
                Submit a verified price drop to earn referral rewards and community recognition
              </p>
            </div>
            {!hasPaidFee && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#6040d1] bg-[#6040d1]/10 border border-[#6040d1]/20 w-fit">
                ⚡ {remainingFree} Free Post{remainingFree !== 1 ? 's' : ''} Left
              </span>
            )}
          </div>

          {/* 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form (7 cols) */}
            <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 flex flex-col gap-6">
              <div className="rounded-2xl border p-6 bg-white shadow-xs flex flex-col gap-5" style={{ borderColor: '#d7d5dc' }}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b pb-3" style={{ borderColor: '#f2f3fb' }}>
                  Deal Details
                </h2>

                {/* Title */}
                <Field label="Product Title" required error={errors.title} help="Include brand & model name">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pigeon Amaze Plus Electric Kettle 1.5L"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                    style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                  />
                </Field>

                {/* Store & Category Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Store" required error={errors.store}>
                    <select
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                      style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                    >
                      <option value="">Select store</option>
                      <option value="Amazon">📦 Amazon</option>
                      <option value="Flipkart">⚡ Flipkart</option>
                      <option value="Meesho">🛍️ Meesho</option>
                      <option value="Myntra">💄 Myntra</option>
                    </select>
                  </Field>

                  <Field label="Category" required error={errors.category}>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                      style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                    >
                      <option value="">Select category</option>
                      <option value="Mobiles">📱 Mobiles</option>
                      <option value="Electronics">💻 Electronics</option>
                      <option value="Fashion">👗 Fashion</option>
                      <option value="Beauty">💄 Beauty</option>
                      <option value="Home">🏠 Home</option>
                    </select>
                  </Field>
                </div>

                {/* Offer Price & MRP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Offer Price (₹)" required error={errors.offerPrice}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="599"
                        className="w-full rounded-xl border pl-8 pr-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                        style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                      />
                    </div>
                  </Field>

                  <Field label="Original MRP (₹)" error={errors.mrp} help="Optional for discount %">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        placeholder="1299"
                        className="w-full rounded-xl border pl-8 pr-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                        style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                      />
                    </div>
                  </Field>
                </div>

                {/* Affiliate Link */}
                <Field label="Affiliate Buy Link" required error={errors.affiliateLink} help="Must start with http:// or https://">
                  <input
                    type="url"
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    placeholder="https://amzn.to/3xExampleLink"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
                    style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                  />
                </Field>

                {/* Description */}
                <Field label="Deal Description" error={errors.description} help="Coupon codes, bank offers, features">
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details or coupon code highlights..."
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1] resize-none"
                    style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                  />
                </Field>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                    ⚠️ {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition cursor-pointer disabled:opacity-60 shadow-xs"
                  style={{ backgroundColor: '#6040d1' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Uploading Images &amp; Publishing...
                    </span>
                  ) : (
                    '🚀 Publish Deal'
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: Image Upload & Live Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
              {/* Image Upload Box */}
              <div className="rounded-2xl border p-6 bg-white shadow-xs flex flex-col gap-4" style={{ borderColor: '#d7d5dc' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                    Upload Images <span className="text-[#6040d1]">*</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">3 to 5 images</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files) }}
                  className="rounded-xl p-6 text-center cursor-pointer transition select-none flex flex-col items-center justify-center border-2 border-dashed"
                  style={{
                    borderColor: isDragOver ? '#6040d1' : '#d7d5dc',
                    backgroundColor: isDragOver ? '#f2f3fb' : '#fafafa',
                  }}
                >
                  <span className="text-3xl mb-1">📸</span>
                  <p className="text-xs font-bold text-black">Click to upload or drag &amp; drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP (Max 5MB)</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />

                {/* Previews grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map(({ preview }, i) => (
                      <div key={preview} className="relative rounded-lg overflow-hidden border aspect-square" style={{ borderColor: '#d7d5dc' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold bg-black/60 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && <p className="text-xs text-red-600 font-medium">{errors.images}</p>}
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border p-5 bg-white shadow-xs flex flex-col gap-3" style={{ borderColor: '#d7d5dc' }}>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <span>👁️</span> Real-time Card Preview
                </span>

                <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#d7d5dc' }}>
                  <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center">
                    {images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[0].preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-4xl">{activeStoreTheme.icon}</span>
                        <p className="text-xs font-bold uppercase mt-1 opacity-60 text-black">{store || 'Store'} Deal</p>
                      </div>
                    )}

                    {calcDiscount !== null && (
                      <span className="absolute top-2 left-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-md shadow-xs">
                        🔥 {calcDiscount}% OFF
                      </span>
                    )}

                    <span
                      className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md shadow-xs"
                      style={{ backgroundColor: activeStoreTheme.bg, color: activeStoreTheme.text }}
                    >
                      {store || 'Store'}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-black line-clamp-2 min-h-[32px]">
                      {title || 'Your product deal title will appear here...'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-extrabold text-[#6040d1]">
                        ₹{offerPrice ? Number(offerPrice).toLocaleString('en-IN') : '0'}
                      </span>
                      {mrp && Number(mrp) > Number(offerPrice) && (
                        <span className="text-xs line-through text-gray-400">
                          ₹{Number(mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-1 w-full py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 opacity-90"
                      style={{ backgroundColor: activeStoreTheme.bg, color: activeStoreTheme.text }}
                    >
                      Buy on {store || 'Store'} ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
