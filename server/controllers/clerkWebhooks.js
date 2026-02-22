import User from "../models/User.js"
import pkg from "svix"
const { Webhook } = pkg

const clerkWebhooks = async (req, res) => {
  try {
    // Clerk webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Required Svix headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    if (!headers["svix-id"] || !headers["svix-signature"]) {
      return res.status(400).send("Missing Svix headers")
    }

    // IMPORTANT: req.body must be RAW buffer
    const payload = req.body

    // Verify webhook
    const evt = wh.verify(payload, headers)

    const data = evt.data
    const type = evt.type

    console.log("🔔 Clerk Event:", type)

    // Common user data
    const userData = {
      _id: data.id, // Clerk user_xxx
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      email: data.email_addresses?.[0]?.email_address || "",
      image: data.image_url || "",
    }

    // Handle events
    if (type === "user.created" || type === "user.updated") {
      await User.findByIdAndUpdate(
        data.id,
        userData,
        {
          upsert: true, // create if not exists
          new: true,
          setDefaultsOnInsert: true,
        }
      )

      console.log("✅ User synced:", data.id)
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id)
      console.log("🗑 User deleted:", data.id)
    }

    return res.status(200).json({ success: true })
  } 
  catch (error) {
    console.error("❌ Clerk Webhook Error:", error.message)
    return res.status(400).json({ success: false, message: error.message })
  }
}

export default clerkWebhooks
