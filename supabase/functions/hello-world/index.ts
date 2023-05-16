import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const csv = require('csv-parser');
const fs = require('fs');

const supabaseUrl = 'https://dtitoxucemfuyomtyssn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aXRveHVjZW1mdXlvbXR5c3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM4OTM2NDksImV4cCI6MTk5OTQ2OTY0OX0.ug8lhguaVAgqS1Ln8JrF_ng1ho6EI7hzt3Ugmp5pH4g';
console.log("Hello from Functions!")

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      supabaseUrl, supabaseKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing required input data' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    } else {
      const stream = supabaseClient.storage
        .from('demo')
        .download(url)
        .pipe(csv());
        const rows = [];
      stream.on('data', (data) => {
        rows.push(data);
        console.log(data);
        
      });

      stream.on('end', () => {
        // Process the rows or perform any desired operations
        console.log('CSV file read successfully:', rows);
        res.status(200).json({ data: rows });
      });

      stream.on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });

      const data = {
        data: req,
        message: `Hello ${url}!`,
      }

      return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

