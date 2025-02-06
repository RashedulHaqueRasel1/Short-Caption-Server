const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const ip = require("express-ip");
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
app.use(ip().getIpInfoMiddleware);



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
        const visitorsCollection = client.db("Short-Caption").collection("visitors");




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


        // Find Users  Profile With Email show client side ...
        app.get('/users/:email', async (req, res) => {
            const query = { email: req.params.email }
            const result = await usersCollection.findOne(query);
            res.send(result)
        })




        // all caption see home

        app.get('/allCaption', async (req, res) => {

            const result = await captionCollection.find().toArray();
            res.send(result)
        })

        // All caption count
        app.get('/caption-Count', async (req, res) => {
            const count = await captionCollection.estimatedDocumentCount()
            res.send({ count: count })
        })



        app.post('/captionAdd', async (req, res) => {
            const caption = req.body;

            // Find the last caption entry to get the last captionNumber
            const lastCaption = await captionCollection.find().sort({ captionNumber: -1 }).limit(1).toArray();
            let newSerial = 1; // Default serial number for the first caption

            // If there is an existing caption, set the new serial as the last captionNumber + 1
            if (lastCaption.length > 0) {
                newSerial = lastCaption[0].captionNumber + 1;
            }

            // Add the captionNumber (serial number) to the caption
            caption.captionNumber = newSerial;

            // Insert the caption with the serial number
            const result = await captionCollection.insertOne(caption);
            res.send(result);
        });


        // Make Premium Api with Approved Premium Dashboard(Admin) (bioData collection)
        app.patch('/caption/approved/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: 'Approved'
                }
            }
            const result = await captionCollection.updateOne(filter, updateDoc);
            res.send(result)
        })



        // Favorite Caption save (push) MongoDB
        app.post('/favorite', async (req, res) => {
            const favorite = req.body;
            const result = await favoriteCollection.insertOne(favorite);
            res.send(result)
        })


        // favorite  Data Show favorite List 
        app.get('/favorite/:email', async (req, res) => {
            const query = { email: req.params.email }
            const result = await favoriteCollection.find(query).toArray();
            res.send(result);
        })


        // DashBoard User Caption Delete 
        app.delete('/favorite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoriteCollection.deleteOne(query);
            res.send(result);
        })




        // Admin Show All Caption  
        app.get('/adminCaption', async (req, res) => {
            const result = await captionCollection.find().sort({ _id: -1 }).toArray();
            res.send(result);
        })


        // Admin Caption Delete 
        app.delete('/adminCaption/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await captionCollection.deleteOne(query);
            res.send(result);
        })




        // GET: User Visits
        app.get("/get-user-visits", async (req, res) => {
            try {
                const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Get IP Address

                // Check if this IP already visited
                let userData = await visitorsCollection.findOne({ ip: userIP });

                if (!userData) {
                    await visitorsCollection.insertOne({ ip: userIP, visitCount: 1 });

                    // Increase total visitors only for new IPs
                    await visitorsCollection.updateOne(
                        { key: "visitor_count" },
                        { $inc: { totalVisits: 1 } },
                        { upsert: true }
                    );
                }

                res.json({ userIP, visitCount: userData ? userData.visitCount : 1 });
            } catch (error) {
                res.status(500).json({ error: "Server error" });
            }
        });




        // / GET: Total Visitors
        app.get("/get-visits", async (req, res) => {
            try {
                let visitorData = await visitorsCollection.findOne({ key: "visitor_count" });

                res.json({ totalVisits: visitorData ? visitorData.totalVisits : 0 });
            } catch (error) {
                res.status(500).json({ error: "Server error" });
            }
        });




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