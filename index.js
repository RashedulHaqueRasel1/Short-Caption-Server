const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middle Ware

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://short-caption.vercel.app",

        ]
    })
);
app.use(express.json());



const uri = `mongodb+srv://Short-Caption:BNb1Bx6YlsluVk4a@cluster0.fcxten6.mongodb.net/?appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {


        // Mongo DB collection 
        const usersCollection = client.db("Short-Caption").collection("users");
        const captionCollection = client.db("Short-Caption").collection("caption");
        const favoriteCollection = client.db("Short-Caption").collection("favorite");




        // user data save (push) MongoDB with user collection
        app.post('/users', async (req, res) => {
            const users = req.body;
            // USER email check
            const query = { email: users.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "user Already exist ", insertOne: null })
            }
            const result = await usersCollection.insertOne(users);
            res.send(result)
        })


        // Find Users  Data With Email show client side ...
        app.get('/users/:email', async (req, res) => {
            const query = { email: req.params.email }
            const result = await usersCollection.findOne(query);
            res.send(result)
        })




        // all caption see home

        app.get('/allCaption', async (req, res) => {
            const filter = req.query 
            console.log(filter)
            const query = {
                caption : { $regex : filter.search , $options: "i"}
            }
            const result = await captionCollection.find(query).toArray();
            res.send(result)
        })


        // captionAdd data save (push) MongoDB
        app.post('/captionAdd', async (req, res) => {
            const caption = req.body;
            const result = await captionCollection.insertOne(caption);
            res.send(result)
        })


        // DashBoard User contact request Delete 
        app.delete('/caption/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await captionCollection.deleteOne(query);
            res.send(result);
        })





        // Favorite Caption save (push) MongoDB
        app.post('/favorite', async (req, res) => {
            const favorite = req.body;
            const result = await favoriteCollection.insertOne(favorite);
            res.send(result)
        })


        // favorite  Data Show favorite List 
        app.get('/favorite/:email',  async (req, res) => {
            const query = { email: req.params.email }
            const result = await favoriteCollection.find(query).toArray();
            res.send(result);
        })


        
 





        console.log("Short Caption successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("Short Caption Server is running.")

})

app.listen(port, () => {
    console.log(`Short Caption is Running is on port :${port}`)

})