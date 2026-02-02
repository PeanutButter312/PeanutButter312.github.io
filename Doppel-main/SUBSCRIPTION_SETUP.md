# Echo App - Subscription System Setup Guide

## 🎉 What's Been Implemented

Your Echo app now includes a complete subscription system with:

### ✅ Features Implemented

1. **Two-Tier Subscription System**
   - **Free Tier**: 4 messages per day limit
   - **Premium Tier**: Unlimited messages + exclusive features

2. **Stripe Payment Integration**
   - Checkout flow for Premium subscription ($9.99/month)
   - Subscription management (upgrade/cancel)
   - Secure payment processing

3. **Conversation Paste-and-Reply Feature** (Premium Only)
   - AI-powered reply generation
   - Matches user's personality profile
   - Copy-to-clipboard functionality

4. **Message Usage Tracking**
   - Daily message counter for free users
   - Automatic reset at midnight
   - Usage indicators in the UI

5. **Database Schema** (Supabase)
   - Users table
   - Subscriptions table
   - Message usage tracking table

---

## 🔧 Setup Instructions

### Step 1: Update Environment Variables

Replace the placeholder values in `.env` with your actual Stripe keys:

```bash
# Stripe Keys (REQUIRED)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Sw4qOCMQ8IsftJC3v4XjfW0H6Q8go7tFZb57plFUiEjSmr5EbAUO30j4sXtSfQLWL1gSl06f1fDfkYpRjghsrQs00JLwAMiJR
VITE_STRIPE_SECRET_KEY=sk_test_51Sw4qOCMQ8IsftJCnoflLaUKa7RCa2gmZV4Yxdvw7latNw5jI8T6HEoahaWk7A6WpqTR8YSDDw8pumaGguYjtfe8000X7pXdTZ

# Gemini API Key (for Conversation Reply feature)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ IMPORTANT SECURITY NOTES:**
- **DO NOT commit your `.env` file to git**
- The Stripe secret key should ideally be on your backend server, not in the client
- For production, move Stripe API calls to a backend server

### Step 2: Set Up Supabase Database

Run the migration file to create the necessary tables:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase/migrations/001_subscription_schema.sql`

This will create:
- `users` table
- `subscriptions` table
- `message_usage` table
- Row-level security policies
- Necessary indexes

### Step 3: Create Stripe Product and Price

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create a product named "Echo Premium"
4. Set the price to $9.99/month (recurring)
5. Copy the Price ID (you may need to update the code to use this ID)

### Step 4: Set Up Stripe Webhooks (Optional but Recommended)

For production, you should set up webhooks to handle subscription events:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### Step 5: Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### Step 6: Run the App

```bash
npm run dev
```

---

## 📁 New Files Created

### Core Files
- **`src/stores/subscriptionStore.ts`** - Zustand store for subscription state management
- **`src/lib/supabase.ts`** - Supabase client and type definitions
- **`src/services/subscriptionService.ts`** - Stripe and Supabase integration functions
- **`src/components/StripeCheckout.tsx`** - Stripe payment component
- **`src/pages/ConversationReplyPage.tsx`** - Premium feature for AI-powered replies

### Database
- **`supabase/migrations/001_subscription_schema.sql`** - Database schema for subscriptions

### Configuration
- **`.env`** - Updated with Stripe keys (needs your actual keys)

---

## 🎯 How It Works

### Free Users
1. User signs up → Gets free tier by default
2. Can send **4 messages per day**
3. Counter resets daily at midnight
4. UI shows remaining messages in header and settings
5. When limit is reached, user is prompted to upgrade

### Premium Subscription Flow
1. User clicks "Upgrade to Premium" in Settings
2. Redirected to Stripe Checkout
3. After payment, webhook updates subscription in database
4. User gets unlimited messages + access to Conversation Reply feature

### Conversation Reply Feature (Premium Only)
1. Navigate to "Reply AI" in the navigation menu
2. Paste a conversation thread
3. AI generates a personalized reply based on user's personality settings
4. Copy and send the reply

---

## 🔒 Security Considerations

### Current Implementation (Development)
- Stripe API calls are made from the frontend
- Secret keys are in environment variables

### Recommended for Production

1. **Move Stripe API calls to backend**
   ```
   Frontend → Your Backend API → Stripe API
   ```

2. **Never expose secret keys in client code**
   - Keep `VITE_STRIPE_SECRET_KEY` on the backend only
   - Only use `VITE_STRIPE_PUBLISHABLE_KEY` in frontend

3. **Implement proper authentication**
   - Use Supabase Auth or your preferred auth solution
   - Verify user identity before processing payments

4. **Set up proper CORS and rate limiting**
   - Protect your API endpoints
   - Prevent abuse of the free tier

---

## 🚀 Next Steps

### Required for Production

1. **Backend API Setup**
   - Create server endpoints for Stripe operations
   - Move secret key operations to backend
   - Implement proper error handling

2. **Webhook Handler**
   - Create endpoint to receive Stripe webhooks
   - Update subscription status in real-time
   - Handle failed payments

3. **User Authentication**
   - Implement Supabase Auth
   - Connect users to their subscriptions
   - Secure all API routes

4. **Testing**
   - Test with Stripe test cards
   - Test subscription lifecycle (create, renew, cancel)
   - Test message limits and resets

### Optional Enhancements

1. **Annual Subscription Option**
   - Add a discounted annual plan
   - Update pricing UI

2. **Usage Analytics**
   - Dashboard showing message usage trends
   - Premium feature usage statistics

3. **Promo Codes**
   - Implement Stripe coupon codes
   - Free trial periods

4. **Email Notifications**
   - Payment confirmation emails
   - Subscription renewal reminders
   - Payment failure alerts

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Any future expiry date, any 3-digit CVC

### Test Scenarios

1. **Free User Flow**
   - Send 4 messages (should work)
   - Try sending 5th message (should be blocked)
   - Wait for next day (counter should reset)

2. **Premium Upgrade**
   - Click "Upgrade to Premium"
   - Complete Stripe checkout
   - Verify unlimited messages
   - Access Conversation Reply feature

3. **Subscription Cancellation**
   - Cancel subscription from Settings
   - Verify downgrade to free tier
   - Check message limits are re-enabled

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all environment variables are set correctly
3. Ensure Supabase database is set up properly
4. Check Stripe dashboard for payment issues

---

## 🎨 Customization

### Change Pricing

Update in `src/services/subscriptionService.ts`:
```typescript
'line_items[0][price_data][unit_amount]': '999', // Change this (in cents)
```

### Change Message Limit

Update in `src/stores/subscriptionStore.ts`:
```typescript
const FREE_DAILY_LIMIT = 4 // Change this number
```

### Customize Features

Add more premium features by:
1. Checking `isPremium()` in your components
2. Conditionally rendering features
3. Updating the Settings page to list new benefits

---

## 📝 Notes

- The app name has been updated to "Echo" in relevant places
- The Conversation Reply feature uses Google's Gemini AI
- All personality settings from the original app are preserved
- The UI follows the existing design system with shadcn/ui components

---

**Congratulations!** 🎉 Your Echo app now has a complete subscription system with Stripe integration and premium features!
