const express = require("express");
const router = express.Router();

const stripe = require("stripe")(
  "sk_test_51IaNZlCILXbg6WUSrunHuSSL8Pr50JLnnOWNqOuESBqw6y1m5TLXQKIt3AWITKrSia762fviBnQczSMCFe9pS45A00hvLpQytJ"
);

const beatPrice = 1399;
router.post("/create-payment-intent", async (req, res) => {
  const customer = await stripe.customers.create({
    description: "My First Test Customer (created for API docs)",
    name: req.name,
    email: req.email,
    phone: req.number,
  });
  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: beatPrice,
      currency: "USD",
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      message: error.response,
    });
  }
});

router.get("/secret", async (req, res) => {
  const intent = res.json({ client_secret: intent.client_secret }); // ... Fetch or create the PaymentIntent
});

module.exports = router;
