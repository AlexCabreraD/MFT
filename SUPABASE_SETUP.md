# Supabase Setup Guide (Modern Clerk Integration)

This guide walks through setting up Supabase with Row Level Security (RLS) for the MFT Hour Tracker app using **modern Clerk authentication** (no JWT template required).

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

## 2. Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema-modern.sql`
3. Run the SQL to create tables, indexes, and RLS policies

## 3. No JWT Template Required! 🎉

The modern approach uses Clerk session tokens directly - **no JWT template setup needed**. This is:
- ✅ More secure (no secret sharing)
- ✅ Lower latency 
- ✅ Future-proof
- ✅ Simpler setup

## 4. Verify Setup

1. Start your Next.js app: `npm run dev`
2. Sign in with a test user
3. Check browser Network tab - you should see Supabase requests with Authorization headers
4. Verify data is being saved/loaded correctly

## 5. Troubleshooting

### Error: "Error loading from Supabase: {}"
- Check that environment variables are set correctly
- Verify Clerk JWT template is named exactly "supabase" 
- Check Supabase logs for RLS policy violations

### RLS Policy Issues
- Ensure your Clerk JWT template includes the `sub` claim with user ID
- Check that the user_profiles table has the correct clerk_user_id values
- Test policies in Supabase SQL Editor:
  ```sql
  -- Test if current user can access their profile
  SELECT * FROM user_profiles WHERE clerk_user_id = 'user_123';
  ```

### Network Issues
- Verify Supabase URL and anon key are correct
- Check that your Supabase project is active (not paused)
- Test direct API calls in Postman or curl

## 6. Security Notes

- RLS is enabled on all tables - users can only access their own data
- JWT tokens are short-lived and managed by Clerk
- Never commit your actual environment variables to git
- Use the `.env.local.example` file as a template

## 7. Production Considerations

- Enable email confirmation in Clerk for production
- Set up proper error monitoring (Sentry, etc.)
- Consider implementing data backup strategies
- Monitor Supabase usage and upgrade plan if needed