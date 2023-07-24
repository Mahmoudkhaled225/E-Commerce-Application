import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function createCheckoutSession({
        paymentMethodTypes = ['card'],
        mode = 'payment',
        customerEmail = '',
        metadata = {},
        cancelUrl = process.env.CANCEL_URL,
        successUrl = process.env.SUCCESS_URL,
        discounts = [],
        lineItems = [],
    }) {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethodTypes,
        mode,
        customer_email: customerEmail,
        metadata,
        cancel_url: cancelUrl,
        success_url: successUrl,
        discounts,
        line_items: lineItems,
    })

    return session
}

export default createCheckoutSession