const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");

app.use(cors());
app.use(express.json());


const stripe = require("stripe")("sk_test_51NsHzNAnK8BXvyUQMd9Se5f5420DeG2anHROIpOryR4JKDNVQwMHu0Pd2NLiNQRoifXCVT8vAgSZbaXI3ro9Fwby00qfZaDkpm");
let contributions;
const fetchContribution = async () => {
    try{
        const rawData = await fs.promises.readFile("contributions.json");
        contributions = JSON.parse(rawData)
        console.log("cont:",contributions);
    }catch(err){console.log(err)}
}
fetchContribution();
app.post('/create-checkout-session', async(req,res) => {
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Shoes",
                            images:[
                                "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw48acb994/original/110366/110366-023-l-adrenaline-gts-22-mens-cushion-running-shoe.jpg?sw=1388&sh=868&sm=cut&sfrm=png&bgcolor=F1F3F6"
                            ]
                        },
                        unit_amount:2000,
                    },
                    quantity: 1
                 }
            ],
            mode: "payment",
            success_url: "http://localhost:3000?success=true",
            cancel_url: "http://localhost:3000?canceled=true"
        });
        res.json({
            id: session.id
        })
    }
    catch(err){console.log(err)}
});

app.post("/create-payment-intent", async(req,res) => {
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount:4000,
            currency: "usd"
        });
        res.status(200).json({
            client_secret: paymentIntent.client_secret
        })
    }catch (err){console.log(err)}
})


app.post("/api/v1/create-payment-intent", async(req,res) => {
    const { amount } = req.body;
    console.log(amount);
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount:amount * 100,
            currency: "usd"
        });
        res.status(200).json({
            client_secret: paymentIntent.client_secret
        })
    }catch (err){console.log(err)
        res.status(400).json({
            status: "fail",
        });
    }
});

app.get("/api/v1/contributions", (req,res) =>{
    res.status(200).json({
        contributions: contributions.contributions,
    });
});

app.post("/api/v1/contributions", async(req,res) =>{
    try{
        contributions.contributions += parseInt(req.body.amount)

        await fs.promises.writeFile("contributions.json", JSON.stringify(contributions));
        res.status(201).json({
            contributions: contributions.contributions,
        });      
    }catch(err){
        console.log(err) ;
        res.status(400).json({
            status: fail,
    })}

});

app.listen(3001, () => {
    console.log("listening on port 3001");
})
