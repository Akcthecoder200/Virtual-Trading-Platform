# MongoDB Setup Instructions

## Option 1: Install MongoDB Locally

### For Windows:

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### For macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### For Linux (Ubuntu):

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get the connection string
5. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-trading-platform
   ```

## Option 3: Use Docker

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Update .env file:
MONGODB_URI=mongodb://admin:password@localhost:27017/virtual-trading-platform?authSource=admin
```

## Verify MongoDB Connection

After starting MongoDB, test the connection:

```bash
# Using MongoDB shell
mongosh

# Or test with our app
cd backend
npm start
```

The server should show:

```
✅ MongoDB Connected: localhost:27017
```

## Alpha Vantage API Key Setup

1. Go to https://www.alphavantage.co/support/#api-key
2. Get your free API key
3. Update `.env` file:
   ```
   ALPHA_VANTAGE_API_KEY=your-actual-api-key-here
   ```

## Next Steps

Once MongoDB is running:

1. Run `npm start` in the backend directory
2. The server will automatically create the default admin user
3. Test the API endpoints
4. Proceed to Step 3: Database Models & Schema
