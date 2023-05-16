import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as fs from 'fs';

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
      const csvData = fs.readFileSync(url, 'utf-8');
      const rows = csvData.split('\n').slice(1); // Skip header row

      for (const row of rows) {
        const [email, password] = row.split(',');

        try {
          const { userdata, error } = await supabaseClient.auth.signUp({ email, password });

          if (error) {
            console.error(`Error creating user: ${error.message}`);
          } else {
            console.log(`User created: ${userdata?.email}`);
          }
        } catch (error) {
          console.error(`Error creating user: ${error.message}`);
        }
      }

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

