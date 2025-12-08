# Environment Variables Setup Guide

## 🚀 Quick Setup

### Automated Setup

Run the interactive setup script:

```bash
node scripts/setup-env.js
```

### Manual Setup

1. Copy `.env.example` to `.env`
2. Fill in your PayPal credentials
3. Configure other variables as needed

## 📋 Required Variables

### PayPal Configuration

```env
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_ENVIRONMENT=sandbox  # or 'production'
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

### Security (Auto-generated)

```env
JWT_SECRET=your_32_character_secret
ENCRYPTION_KEY=your_32_character_key
```

## 🔧 Getting PayPal Credentials

### 1. Create PayPal App

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Go to "My Apps & Credentials"
4. Click "Create App"

### 2. Configure App Settings

- **App Name**: Quiz Cristiano
- **Merchant**: Your business account
- **Features**: Accept payments, Subscriptions
- **Return URL**: `https://your-domain.com/payment/success`
- **Cancel URL**: `https://your-domain.com/payment/cancel`

### 3. Get Credentials

- Copy **Client ID** → `PAYPAL_CLIENT_ID`
- Copy **Client Secret** → `PAYPAL_CLIENT_SECRET`

### 4. Create Webhook

1. In your app, go to "Webhooks"
2. Click "Add Webhook"
3. **Webhook URL**: `https://your-domain.com/api/paypal/webhook`
4. **Event types**: Select all payment and subscription events
5. Copy **Webhook ID** → `PAYPAL_WEBHOOK_ID`

## 🌐 Deployment Setup

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all variables from your `.env` file
4. Set appropriate environments (Development/Production)

### Required for Production

```env
NODE_ENV=production
PAYPAL_ENVIRONMENT=production
FORCE_HTTPS=true
ENABLE_CORS_RESTRICTIONS=true
ALLOWED_ORIGINS=https://your-domain.com
```

## 💰 Product Pricing Configuration

### Coin Packages

```env
COINS_100_PRICE_USD=0.99
COINS_100_PRICE_ARS=150
COINS_500_PRICE_USD=4.99
COINS_500_PRICE_ARS=750
# ... etc
```

### Currency Settings

```env
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,ARS
EXCHANGE_RATE_USD_TO_ARS=150.00
```

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use different credentials for development/production**
3. **Rotate secrets regularly**
4. **Use strong, random keys**
5. **Enable HTTPS in production**

## 🧪 Testing Configuration

### Development

```env
PAYPAL_ENVIRONMENT=sandbox
ENABLE_DEV_TOOLS=true
ENABLE_MOCK_PAYMENTS=false
```

### Testing

```env
ENABLE_TEST_WEBHOOKS=true
WEBHOOK_MAX_RETRIES=3
```

## 🚨 Troubleshooting

### Common Issues

**PayPal SDK not loading**

- Check `PAYPAL_CLIENT_ID` is correct
- Verify environment setting matches PayPal app

**Webhook not receiving events**

- Confirm `PAYPAL_WEBHOOK_URL` is accessible
- Check webhook events are enabled in PayPal app
- Verify `PAYPAL_WEBHOOK_ID` matches

**Currency conversion errors**

- Update `EXCHANGE_RATE_USD_TO_ARS`
- Check supported currencies list

### Validation

The system automatically validates configuration on startup:

- ✅ Required variables present
- ✅ PayPal credentials format
- ✅ Security keys length
- ⚠️ Warnings for demo/development values

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with PayPal sandbox first
4. Review PayPal developer documentation
