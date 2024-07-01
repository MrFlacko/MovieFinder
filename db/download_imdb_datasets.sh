#!/bin/bash

# Colors for echo
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure required tools are installed
install_required_tools() {
    echo -e "${BLUE}Checking for required tools...${NC}"
    for tool in wget pv sqlite3 parallel; do
        command -v $tool >/dev/null || { echo -e "${YELLOW}Installing $tool...${NC}"; sudo apt-get install -y $tool; }
    done
    echo -e "${GREEN}All required tools are installed.${NC}"
}

# Define datasets and their URLs
datasets=(
    "title.basics"
    "title.akas"
    "title.principals"
    "title.ratings"
    "title.crew"
    "title.episode"
    "name.basics"
)
base_url="https://datasets.imdbws.com/"

# Download and extract datasets if needed
download_datasets() {
    echo -e "${BLUE}Starting dataset download...${NC}"
    mkdir -p databases

    cd databases
    if [[ "$1" == "--testing" ]]; then
        datasets=("name.basics")
    fi

    for dataset in "${datasets[@]}"; do
        filename="$dataset.tsv"
        url="${base_url}${dataset}.tsv.gz"
        if [[ "$1" == "--redownload" || ! -f "$filename" ]]; then
            echo -e "${YELLOW}Downloading $filename...${NC}"
            wget -qO- "$url" | pv -s $(wget --spider "$url" 2>&1 | grep Length | awk '{print $2}') | gunzip > "$filename"
        else
            echo -e "${GREEN}$filename already exists, skipping download.${NC}"
        fi
    done

    cd ..
    echo -e "${GREEN}Dataset download and extraction completed.${NC}"
}

# Create SQLite database schema
create_sqlite_schema() {
    echo -e "${BLUE}Creating SQLite database schema...${NC}"
    sqlite3 databases/imdb.db <<EOF
DROP TABLE IF EXISTS title_basics;
DROP TABLE IF EXISTS title_akas;
DROP TABLE IF EXISTS title_principals;
DROP TABLE IF EXISTS title_ratings;
DROP TABLE IF EXISTS title_crew;
DROP TABLE IF EXISTS title_episode;
DROP TABLE IF EXISTS name_basics;

CREATE TABLE name_basics (
    nconst TEXT PRIMARY KEY,
    primaryName TEXT,
    birthYear INTEGER,
    deathYear INTEGER,
    primaryProfession TEXT,
    knownForTitles TEXT
);

CREATE TABLE title_basics (
    tconst TEXT PRIMARY KEY,
    titleType TEXT,
    primaryTitle TEXT,
    originalTitle TEXT,
    isAdult INTEGER,
    startYear INTEGER,
    endYear INTEGER,
    runtimeMinutes INTEGER,
    genres TEXT
);

CREATE TABLE title_akas (
    titleId TEXT,
    ordering INTEGER,
    title TEXT,
    region TEXT,
    language TEXT,
    types TEXT,
    attributes TEXT,
    isOriginalTitle INTEGER
);

CREATE TABLE title_principals (
    tconst TEXT,
    ordering INTEGER,
    nconst TEXT,
    category TEXT,
    job TEXT,
    characters TEXT
);

CREATE TABLE title_ratings (
    tconst TEXT PRIMARY KEY,
    averageRating REAL,
    numVotes INTEGER
);

CREATE TABLE title_crew (
    tconst TEXT PRIMARY KEY,
    directors TEXT,
    writers TEXT
);

CREATE TABLE title_episode (
    tconst TEXT PRIMARY KEY,
    parentTconst TEXT,
    seasonNumber INTEGER,
    episodeNumber INTEGER
);
EOF
    echo -e "${GREEN}SQLite database schema created.${NC}"
}

# Import data into SQLite database using bulk inserts
import_to_sqlite() {
    echo -e "${BLUE}Starting import of data into SQLite database...${NC}"
    cd databases

    start_time=$(date +%s)
    echo -e "${YELLOW}Setting PRAGMA settings for faster imports...${NC}"
    sqlite3 imdb.db <<EOF
PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;
PRAGMA foreign_keys = OFF;
PRAGMA threads = 4;
EOF

    if [[ "$1" == "--testing" ]]; then
        datasets=("name.basics")
    fi

    for dataset in "${datasets[@]}"; do
        table=$(echo "$dataset" | sed 's/\./_/g')
        file="${PWD}/${dataset}.tsv"
        echo -e "${YELLOW}Importing ${file} into $table...${NC}"

        # Import the data
        {
            echo ".mode tabs"
            echo ".import \"$file\" $table"
        } | sqlite3 imdb.db 2>> import_errors.log

        # Check if the import command succeeded
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}Data import for $table completed.${NC}"
        else
            echo -e "${RED}Error importing ${file}, aborting...${NC}"
            cat import_errors.log
            exit 1
        fi
    done

    sqlite3 imdb.db <<EOF
PRAGMA journal_mode = DELETE;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;
EOF

    end_time=$(date +%s)
    duration=$(( end_time - start_time ))
    echo -e "${GREEN}Data import into SQLite database completed in $duration seconds${NC}"

    cd ..
    echo -e "${GREEN}All datasets have been downloaded, extracted, preprocessed, and imported into imdb.db.${NC}"
}

# Main execution
install_required_tools
download_datasets $1
create_sqlite_schema
import_to_sqlite $1
