FROM node:18.17.0

# Install dependencies
RUN apt-get update && apt-get install -y wget unzip pv sqlite3 parallel git nano

# Create the app directory
RUN mkdir -p /app/MovieFinder

# Set the initial working directory
WORKDIR /app

# Clone the repository initially to set up dependencies
RUN git clone https://github.com/MrFlacko/MovieFinder.git MovieFinder

# Set the working directory to the cloned repository
WORKDIR /app/MovieFinder

# Install Node.js dependencies
RUN npm install

# Install additional dependencies for database setup
WORKDIR /app/MovieFinder/db
RUN chmod +x download_imdb_datasets.sh && ./download_imdb_datasets.sh --testing

# Expose the port the app runs on
EXPOSE 3000

# Set the entry point to always reclone the repository and preserve the databases directory and .env.local file
ENTRYPOINT ["/bin/sh", "-c", "\
mkdir -p /app/tmp && \
if [ -d /app/MovieFinder/db/databases ]; then \
  mv /app/MovieFinder/db/databases /app/tmp/; \
fi && \
if [ -f /app/MovieFinder/.env.local ]; then \
  mv /app/MovieFinder/.env.local /app/tmp/; \
fi && \
rm -rf /app/MovieFinder && \
cd /app && \
git clone https://github.com/MrFlacko/MovieFinder.git MovieFinder && \
if [ -d /app/tmp/databases ]; then \
  mv /app/tmp/databases /app/MovieFinder/db/databases; \
fi && \
if [ -f /app/tmp/.env.local ]; then \
  mv /app/tmp/.env.local /app/MovieFinder/.env.local; \
fi && \
cd /app/MovieFinder && \
npm install && \
npm run dev"]