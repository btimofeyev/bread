import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminUser } from '@/lib/auth/admin-check'

export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated and has admin privileges
    const adminCheck = await verifyAdminUser()
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Please upload images smaller than 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `product_${timestamp}_${randomString}.${fileExtension}`

    // Convert file to buffer for upload
    const buffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(buffer)

    // Upload to Supabase Storage using service client
    const { error } = await serviceSupabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = serviceSupabase.storage
      .from('products')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      imageUrl: publicUrlData.publicUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('Unexpected error uploading image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated and has admin privileges
    const adminCheck = await verifyAdminUser()
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 })
    }

    // Delete from Supabase Storage
    const { error } = await serviceSupabase.storage
      .from('products')
      .remove([fileName])

    if (error) {
      console.error('Storage delete error:', error)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error deleting image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}