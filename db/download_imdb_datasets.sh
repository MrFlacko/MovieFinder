#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure required tools are installed
install_required_tools() {
    echo -e "${BLUE}Checking for required tools...${NC}"
    command -v wget >/dev/null || { echo -e "${YELLOW}Installing wget...${NC}"; sudo apt-get install -y wget; }
    command -v pv >/dev/null || { echo -e "${YELLOW}Installing pv...${NC}"; sudo apt-get install -y pv; }
    command -v sqlite3 >/dev/null || { echo -e "${YELLOW}Installing sqlite3...${NC}"; sudo apt-get install -y sqlite3; }
    command -v parallel >/dev/null || { echo -e "${YELLOW}Installing parallel...${NC}"; sudo apt-get install -y parallel; }
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
    mkdir -p databases && cd databases

    for dataset in "${datasets[@]}"; do
        filename="$dataset.tsv"
        url="${base_url}${dataset}.tsv.gz"
        [[ "$1" == "--redownload" ]] || [[ ! -f "$filename" ]] && {
            echo -e "${YELLOW}Downloading $filename...${NC}"
            wget -qO- "$url" | pv -s $(wget --spider "$url" 2>&1 | grep Length | awk '{print $2}') | gunzip > "$filename"
        } || echo -e "${GREEN}$filename already exists, skipping download.${NC}"
    done

    cd ..
    echo -e "${GREEN}Dataset download and extraction completed.${NC}"
}

# Preprocess a single TSV file to handle special characters and adjust column counts
preprocess_file() {
    file=$1
    echo -e "${BLUE}Preprocessing $file...${NC}"
    start_time=$(date +%s)
    total_lines=$(wc -l < "$file")
    tmp_file=$(mktemp)

    # Determine the expected number of columns based on the file name
    case "$file" in
        *name.basics.tsv)
            expected_columns=6
            ;;
        *title.basics.tsv)
            expected_columns=9
            ;;
        *title.akas.tsv)
            expected_columns=8
            ;;
        *title.principals.tsv)
            expected_columns=6
            ;;
        *title.ratings.tsv)
            expected_columns=3
            ;;
        *title.crew.tsv)
            expected_columns=3
            ;;
        *title.episode.tsv)
            expected_columns=4
            ;;
        *)
            echo -e "${RED}Unknown file type: $file${NC}"
            return 1
            ;;
    esac

    awk -v expected_columns="$expected_columns" 'BEGIN {FS=OFS="\t"} {
        if (NF > expected_columns) {
            NF = expected_columns
        } else if (NF < expected_columns) {
            for (i = NF + 1; i <= expected_columns; i++) {
                $i = ""
            }
        }
    } 1' "$file" | pv -l -s "$total_lines" > "$tmp_file"

    if [[ -s "$tmp_file" ]]; then
        mv "$tmp_file" "$file"
        echo -e "${GREEN}Finished preprocessing $file in $(( $(date +%s) - $start_time )) seconds${NC}"
    else
        echo -e "${RED}Error processing $file: temp file is empty or does not exist${NC}"
        rm -f "$tmp_file"
    fi
}

# Preprocess TSV files to handle special characters
preprocess_files() {
    echo -e "${BLUE}Starting preprocessing of TSV files...${NC}"
    cd databases

    # Export function for use by parallel
    export -f preprocess_file

    # Find all .tsv files and process them in parallel
    find . -name '*.tsv' | parallel preprocess_file

    cd ..
    echo -e "${GREEN}Preprocessing of TSV files completed.${NC}"
}

# Create SQLite database schema
create_sqlite_schema() {
    echo -e "${BLUE}Creating SQLite database schema...${NC}"
    sqlite3 imdb.db <<EOF
DROP TABLE IF EXISTS title_basics;
DROP TABLE IF EXISTS title_akas;
DROP TABLE IF EXISTS title_principals;
DROP TABLE IF EXISTS title_ratings;
DROP TABLE IF EXISTS title_crew;
DROP TABLE IF EXISTS title_episode;
DROP TABLE IF EXISTS name_basics;

CREATE TABLE title_basics (
    tconst TEXT PRIMARY KEY,
    titleType TEXT,
    primaryTitle TEXT,
    originalTitle TEXT,
    isAdult INTEGER,
    startYear TEXT,
    endYear TEXT,
    runtimeMinutes TEXT,
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
    characters TEXT,
    PRIMARY KEY (tconst, ordering, nconst)
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

CREATE TABLE name_basics (
    nconst TEXT PRIMARY KEY,
    primaryName TEXT,
    birthYear TEXT,
    deathYear TEXT,
    primaryProfession TEXT,
    knownForTitles TEXT
);
EOF
    echo -e "${GREEN}SQLite database schema created.${NC}"
}

# Import data into SQLite database using bulk inserts
import_to_sqlite() {
    echo -e "${BLUE}Starting import of data into SQLite database...${NC}"
    cd databases

    create_sqlite_schema

    start_time=$(date +%s)
    echo -e "${YELLOW}Setting PRAGMA settings for faster imports...${NC}"
    sqlite3 ../imdb.db <<EOF
PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
EOF

    for dataset in "${datasets[@]}"; do
        table_name="${dataset//./_}"
        echo -e "${YELLOW}Importing $dataset.tsv into $table_name...${NC}"
        {
            echo ".mode tabs"
            echo ".import $dataset.tsv $table_name"
        } | sqlite3 ../imdb.db 2> import_errors.log || {
            echo -e "${RED}Error importing $dataset.tsv, retrying...${NC}"
            {
                echo ".mode tabs"
                echo ".import $dataset.tsv $table_name"
            } | sqlite3 ../imdb.db 2>> import_errors.log
        }
    done

    sqlite3 ../imdb.db <<EOF
COMMIT;
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

# Main script execution
install_required_tools
download_datasets "$1"
preprocess_files
import_to_sqlite
