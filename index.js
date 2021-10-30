const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ctn6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {

    try {
        await client.connect();
        console.log('connected to db');
        const database = client.db("Travel_place");
        const placeCollection = database.collection("Places");
        const bookingCollection = database.collection('bookings');

        //GET API

        app.get('/places', async(req,res)=>{
            const cursor = placeCollection.find({});
            const places = await cursor.toArray();
            res.send(places);
        });

        // get signle order Item 

        app.get('/places/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const place = await placeCollection.findOne(query);
            res.send(place);
        });

        // make Collection of bookings
        app.post('/bookings', async(req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
            
        });

        // get a single user bookings

        app.get('/bookings/:email',async(req,res)=>{
            const email = req.params.email;
            const result = await bookingCollection.find({Email:email}).toArray();
            res.json(result);
        });

        //get all bookings

        app.get('/bookings',async(req,res)=>{
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings)
        });

        // find one place id for delete

        app.delete('/bookings/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id:Object(id)};
            const result = await bookingCollection.deleteOne(query);
            console.log('deleting user with id',id);
            console.log(result);
            res.json(result);
        });

        //Update
        app.put('/bookings/:id', async(req,res)=>{
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = {_id:Object(id)};
            const updateDoc = {
                $set:{
                    status: updatedBooking.status,
                }
            }
            const result = await bookingCollection.updateOne(filter,updateDoc);
            console.log('updating user with id',id);
            console.log(result);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log('node is running on the port', port);
})