FROM node:18.17.0

# Install dependencies
RUN apt-get update && apt-get install -y wget unzip pv sqlite3 parallel git

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
RUN chmod +x download_imdb_datasets.sh && ./download_imdb_datasets.sh

# Expose the port the app runs on
EXPOSE 3000

# Set the entry point to always reclone the repository and preserve the databases directory
ENTRYPOINT ["/bin/sh", "-c", "\
if [ -d /app/MovieFinder/db/databases ]; then \
  mkdir -p /app/tmp && \
  mv /app/MovieFinder/db/databases /app/tmp/; \
fi && \
rm -rf /app/MovieFinder && \
cd /app && \
git clone https://github.com/MrFlacko/MovieFinder.git MovieFinder && \
if [ -d /app/tmp/databases ]; then \
  mv /app/tmp/databases /app/MovieFinder/db/databases; \
fi && \
cd /app/MovieFinder && \
npm install && \
npm run dev"]
