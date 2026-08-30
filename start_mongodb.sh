#!/bin/bash

echo "Starting MongoDB container..."
sudo docker start mongodb

echo "Waiting for MongoDB to start..."
sleep 5

echo "Connecting to MongoDB shell..."
sudo docker exec -it mongodb mongosh