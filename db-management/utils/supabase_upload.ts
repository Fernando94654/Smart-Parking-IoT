import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
const fs = require('fs');

dotenv.config()

// Create Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment variables')
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

// Upload file using standard upload
export async function uploadFile(file: Buffer, filePath: string) {
  const { data, error } = await supabase.storage.from('images').upload(filePath, file)
  if (error) {
    // Handle error
    console.error('Error uploading file:', error)
  }
  return {
    path: data?.path,
    publicURL: supabase.storage.from('bucket_name').getPublicUrl(filePath).data.publicUrl
  }
}

const filePath = "received_image.jpg"
const image = fs.readFileSync(filePath);

const fileBuffer = Buffer.from(image);

const result = uploadFile(fileBuffer, 'uploads/received_image.jpg');