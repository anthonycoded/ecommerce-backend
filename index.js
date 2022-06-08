let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
require("dotenv").config();
const errorHandler = require("./middleware/error");
// const stripe = require("stripe")(
//   "sk_test_51IaNZlCILXbg6WUSrunHuSSL8Pr50JLnnOWNqOuESBqw6y1m5TLXQKIt3AWITKrSia762fviBnQczSMCFe9pS45A00hvLpQytJ"
// );
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.use(
  cors({
    allowedHeaders: ["authorization", "Content-Type", "set-cookie"], // you can change the headers
    exposedHeaders: ["authorization", "set-cookie"], // you can change the headers
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://jaysworld-cb39f.web.app",
    ],
    methods: "GET,POST,DELETE",
    preflightContinue: false,
    credentials: true,
  })
);
// Express Route
const authRoute = require("./routes/auth");
const productRoute = require("./routes/products");
const userRoute = require("./routes/user.js");
//const checkoutRoute = require("./routes/checkout.route.js");

app.use(express.json());

app.use("/public", express.static("public"));
app.use("/product", productRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);
//app.use("/checkout", checkoutRoute);

const port = process.env.PORT || 8081; //server port
const uri =
  "mongodb+srv://admin:2Swisshype@cluster0.nfeazsb.mongodb.net/?retryWrites=true&w=majority;"; //mongoDB uri

const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  console.log("Connected to DB");
  //console.log(err);
});

app.listen(port, () => console.log(`server is running on ${port}`));

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: req.body.title,
//             },
//             unit_amount: req.body.price,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: "http://localhost:3000/lease",
//       cancel_url: "https://example.com/cancel",
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       sucess: "false",
//       message: error.message,
//     });
//   }
// });
