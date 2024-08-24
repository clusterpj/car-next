import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise
    const db = client.db("car_rental_db")
    
    const collection = db.collection("test")
    const result = await collection.insertOne({ test: "Hello, MongoDB!" })
    
    res.status(200).json({ message: "Connected successfully to MongoDB", result })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Unable to connect to MongoDB' })
  }
}