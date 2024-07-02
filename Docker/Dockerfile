# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:18.17.0

# Create and change to the app directory.
WORKDIR /app

# Run git to clone the repository.
RUN git clone https://github.com/MrFlacko/MovieFinder.git /app/MovieFinder

# Change to the cloned directory
WORKDIR /app/MovieFinder

# Install dependencies.
RUN npm install

# Install additional dependencies for database setup
RUN apt-get update && apt-get install -y wget unzip pv sqlite3 parallel

# Change to the db directory and run the database setup script
WORKDIR /app/MovieFinder/db
RUN chmod +x download_imdb_datasets.sh && ./download_imdb_datasets.sh

# Expose the port the app runs on
EXPOSE 3000

# Change back to the app directory
WORKDIR /app/MovieFinder

# Run the web service on container startup.
CMD [ "npm", "run", "dev" ]
