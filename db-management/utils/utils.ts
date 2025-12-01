import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import FormData from "form-data";

// Create Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment variables')
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

// Fuction to upload image to supabase storage
export async function uploadImage(file: Buffer, filePath: string) {
  const { data, error } = await supabase.storage.from('images').upload(filePath, file)
  if (error) {
    console.error('Error uploading file:', error)
  }
  return {
    path: data?.path,
    publicURL: supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl
  }
}

// Function to call text detection service
export async function getTextFromImage(buffer: Buffer) {
    const form = new FormData();
    form.append("file", buffer, { filename: "image.jpg", contentType: "image/jpeg" });

    try {
        const response = await axios.post("http://localhost:8001/text-detection", form, {
            headers: form.getHeaders()
        });
        return response.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error calling text detection service:", err.message);
        }
    }
}
