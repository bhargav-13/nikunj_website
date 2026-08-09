import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ywyfosiwolumkvdzobhs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eWZvc2l3b2x1bWt2ZHpvYmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNjc1NDEsImV4cCI6MjEwMTg0MzU0MX0.AL36HWl1IQMdyN9WAG0nIxQEFvOn8nSGi4dUBNkRUBg'

export const supabase = createClient(supabaseUrl, supabaseKey)
