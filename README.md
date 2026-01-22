# 👻 Ghost OS

**The Internet Now Has a Voice**

A futuristic single-page website for Ghost OS - the voice operating system that lets businesses control all their tools by voice and makes those tools talk to each other.

## 🚀 Features

- Futuristic dark theme with purple/blue neon accents
- Animated voice waveform and particle effects
- Early Access and Developer waitlist forms
- **Dual submission**: Forms send to both email AND Supabase database
- Google Analytics tracking (G-Y8DH4VS3LV)
- Contact: gulfcoastradar@gmail.com
- Form submissions: cybercheckinc@gmail.com

## 📂 Files

- `index.html` - Main website
- `styles.css` - All styling
- `script.js` - Form handling & animations
- `SUPABASE-SETUP.md` - Instructions for connecting to Supabase database
- `vercel.json` - Vercel static site configuration
- `.vercelignore` - Files to exclude from deployment

## 🗄️ Supabase Integration

Ghost OS forms now integrate with your Supabase admin dashboard:

1. Leads are sent to BOTH email (instant notifications) AND Supabase (centralized database)
2. All platform leads are stored in one table: `platform_leads`
3. View and manage leads from your existing admin dashboard
4. See [SUPABASE-SETUP.md](SUPABASE-SETUP.md) for complete setup instructions

**Quick Setup:**
1. Get your Supabase URL and Anon Key from https://app.supabase.com
2. Update `LEAD_CONFIG` in `script.js`
3. Run the SQL from SUPABASE-SETUP.md to create the table
4. Done! Forms now save to your database

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Set Framework Preset to "Other"
4. Deploy!

© 2024 Ghost OS. All rights reserved. Patent Pending.
