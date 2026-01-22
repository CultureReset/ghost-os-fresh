# Ghost OS - Supabase Integration Setup

This guide will help you connect your Ghost OS landing page to your Supabase admin dashboard.

## Overview

Ghost OS forms now support **dual submission**: leads are sent to BOTH:
1. **Email** (via FormSubmit.co) - Instant notifications to your inbox
2. **Supabase** - Stored in your centralized admin dashboard database

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com/
2. Select your project
3. Click **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 2: Update script.js Configuration

Open `script.js` and find the `LEAD_CONFIG` section at the top. Update these values:

```javascript
const LEAD_CONFIG = {
    method: 'dual', // Already set to dual submission

    // ... other settings ...

    // Replace these with your actual Supabase credentials:
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'eyJhbGc...(your-key-here)',
    supabaseTable: 'platform_leads' // Or whatever table name you prefer
};
```

## Step 3: Create Database Table

You need to create a table in your Supabase database to store the leads. Run this SQL in your Supabase SQL Editor:

```sql
-- Create platform_leads table
CREATE TABLE IF NOT EXISTS platform_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    sms_consent BOOLEAN DEFAULT false,
    use_cases TEXT,
    source TEXT NOT NULL, -- 'Early Access Form', 'Developer Waitlist', or 'Contact Form'
    platform TEXT DEFAULT 'Ghost OS',
    url TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted'
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_platform_leads_source ON platform_leads(source);
CREATE INDEX idx_platform_leads_status ON platform_leads(status);
CREATE INDEX idx_platform_leads_platform ON platform_leads(platform);
CREATE INDEX idx_platform_leads_created_at ON platform_leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE platform_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so the form can submit)
CREATE POLICY "Allow anonymous inserts" ON platform_leads
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can view/update (for your admin dashboard)
CREATE POLICY "Allow authenticated select" ON platform_leads
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON platform_leads
    FOR UPDATE
    USING (auth.role() = 'authenticated');
```

## Step 4: Test the Integration

1. Open your Ghost OS landing page
2. Open browser console (F12)
3. Submit a test form (Early Access, Developer, or Contact)
4. Look for these messages in console:
   - `✅ Supabase client initialized`
   - `✅ Lead saved to Supabase`
   - `✅ Lead sent to both email and Supabase`

## Step 5: View Leads in Your Admin Dashboard

Your leads will now appear in your existing admin dashboard under the `platform_leads` table. You can:

- Query all Ghost OS leads: `SELECT * FROM platform_leads WHERE platform = 'Ghost OS'`
- Filter by source: `SELECT * FROM platform_leads WHERE source = 'Early Access Form'`
- View new leads: `SELECT * FROM platform_leads WHERE status = 'new' ORDER BY created_at DESC`

## Data Structure

Each lead submission includes:

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Contact name | "John Doe" |
| `email` | Email address (optional) | "john@example.com" |
| `phone` | Phone number (optional) | "+1234567890" |
| `sms_consent` | SMS opt-in | true/false |
| `use_cases` | Selected use cases | "Automate meetings, Phone calls" |
| `source` | Form type | "Early Access Form" |
| `platform` | Which platform | "Ghost OS" |
| `status` | Lead status | "new" |
| `submitted_at` | Submission time | "2025-01-22T10:30:00Z" |

## Troubleshooting

### "Supabase client not initialized"
- Make sure you updated `supabaseUrl` and `supabaseAnonKey` in `script.js`
- Check browser console for any errors loading the Supabase library

### "Failed to insert row"
- Verify the table exists in your Supabase database
- Check that RLS policies allow anonymous inserts
- Make sure the table name matches `LEAD_CONFIG.supabaseTable`

### Email works but Supabase doesn't
- Check browser console for specific error messages
- Verify your Supabase credentials are correct
- Make sure your Supabase project is not paused

## Security Notes

✅ **Safe to use:**
- The Anon/Public key is safe to use in client-side code
- Row Level Security (RLS) protects your data
- Anonymous users can only INSERT (not read or modify existing data)
- Only authenticated admin users can view/edit leads

🔒 **Never expose:**
- Your Supabase Service Role Key (keep this server-side only)
- Your email passwords or API keys

## Integration with Existing Platforms

This table can be used across ALL your platforms:
- Ghost OS leads → `platform = 'Ghost OS'`
- GCR leads → `platform = 'Gulf Coast Radar'`
- CyberCheck leads → `platform = 'CyberCheck'`
- Other platforms → Set custom `platform` value

All leads flow into one centralized database for easy management!
