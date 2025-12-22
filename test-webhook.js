// Test script to check webhook configuration
import 'dotenv/config'

console.log('\n=== Stripe Configuration Check ===\n')

console.log('✓ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (starts with: ' + process.env.STRIPE_SECRET_KEY.substring(0, 15) + '...)' : '❌ NOT SET')
console.log('✓ STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set (starts with: ' + process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15) + '...)' : '❌ NOT SET')

console.log('\n=== Important Notes ===\n')
console.log('1. Webhook event changed from "payment_intent.succeeded" to "checkout.session.completed"')
console.log('2. Go to Stripe Dashboard → Developers → Webhooks')
console.log('3. Make sure your webhook endpoint is: https://your-domain.com/api/stripe')
console.log('4. Enable the event: "checkout.session.completed"')
console.log('5. Webhook secret must match STRIPE_WEBHOOK_SECRET in .env')
console.log('\n=== Testing locally? ===\n')
console.log('Use Stripe CLI to forward webhooks:')
console.log('stripe listen --forward-to localhost:4000/api/stripe')
console.log('\nThen use the webhook signing secret from CLI output in your .env file')
console.log('\n')
