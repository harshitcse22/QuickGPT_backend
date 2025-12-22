import Stripe from "stripe"
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response)=>{    
    const sig = request.headers["stripe-signature"]

    let event;

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        console.log("✅ Webhook signature verified. Event type:", event.type)
    } catch (error) {
        console.error("❌ Webhook signature verification failed:", error.message)
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":{
                const session = event.data.object;
                const {transactionId, appId} = session.metadata;

                console.log("Processing checkout.session.completed for transaction:", transactionId)

                if(appId && transactionId){
                    const transaction = await Transaction.findOne({_id: transactionId, isPaid: false})

                    if(!transaction){
                        console.log("⚠️ Transaction not found or already paid:", transactionId)
                        return response.status(200).json({received: true, message: "Transaction not found or already paid"})
                    }

                    // update credits in user account 
                    const userUpdate = await User.updateOne({_id: transaction.userId}, {$inc: {credits: transaction.credits}})
                    console.log("✅ Credits updated for user:", transaction.userId, "Added:", transaction.credits, "Modified:", userUpdate.modifiedCount)

                    // update credit payment status
                    transaction.isPaid = true;
                    await transaction.save();
                    console.log("✅ Transaction marked as paid:", transactionId)
                    
                    return response.status(200).json({received: true, success: true})
                }else{
                    console.log("❌ Missing metadata - appId:", appId, "transactionId:", transactionId)
                    return response.status(200).json({received: true, message: "Ignored event: Invalid metadata"})
                }
                break;
            }
                
            
            default:
                console.log("⚠️ Unhandled event type:", event.type)
                return response.status(200).json({received: true})
        }
    } catch (error) {
        console.error("❌ Webhook processing error:", error.message, error.stack)
        return response.status(500).send("Internal Server error")        
    }
}