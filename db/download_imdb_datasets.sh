#!/bin/bash

# Ensure required tools are installed
install_required_tools() {
    echo "Checking for required tools..."
    command -v wget >/dev/null || { echo "Installing wget..."; sudo apt-get install -y wget; }
    command -v pv >/dev/null || { echo "Installing pv..."; sudo apt-get install -y pv; }
    command -v sqlite3 >/dev/null || { echo "Installing sqlite3..."; sudo apt-get install -y sqlite3; }
    command -v parallel >/dev/null || { echo "Installing parallel..."; sudo apt-get install -y parallel; }
    echo "All required tools are installed."
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
    echo "Starting dataset download..."
    mkdir -p databases && cd databases

    for dataset in "${datasets[@]}"; do
        filename="$dataset.tsv"
        url="${base_url}${dataset}.tsv.gz"
        [[ "$1" == "--redownload" ]] || [[ ! -f "$filename" ]] && {
            echo "Downloading $filename..."
            wget -qO- "$url" | pv -s $(wget --spider "$url" 2>&1 | grep Length | awk '{print $2}') | gunzip > "$filename"
        } || echo "$filename already exists, skipping download."
    done

    cd ..
    echo "Dataset download and extraction completed."
}

# Preprocess a single TSV file to handle special characters and adjust column counts
preprocess_file() {
    file=$1
    echo "Preprocessing $file..."
    start_time=$(date +%s)
    total_lines=$(wc -l < "$file")
    tmp_file=$(mktemp)
    awk 'BEGIN {FS=OFS="\t"} {for(i=1; i<=NF; i++) gsub(/"/, "", $i); if(NF<3) $3=""} 1' "$file" | pv -l -s "$total_lines" > "$tmp_file"
    if [[ -s "$tmp_file" ]]; then
        mv "$tmp_file" "$file"
        echo "Finished preprocessing $file in $(( $(date +%s) - $start_time )) seconds"
    else
        echo "Error processing $file: temp file is empty or does not exist"
        rm -f "$tmp_file"
    fi
}

# Preprocess TSV files to handle special characters
preprocess_files() {
    echo "Starting preprocessing of TSV files..."
    cd databases

    # Export function for use by parallel
    export -f preprocess_file

    # Find all .tsv files and process them in parallel
    find . -name '*.tsv' | parallel preprocess_file

    cd ..
    echo "Preprocessing of TSV files completed."
}

# Create SQLite database schema
create_sqlite_schema() {
    echo "Creating SQLite database schema..."
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

CREATE TABLE name_basics (
    nconst TEXT PRIMARY KEY,
    primaryName TEXT,
    birthYear TEXT,
    deathYear TEXT,
    primaryProfession TEXT,
    knownForTitles TEXT
);
EOF
    echo "SQLite database schema created."
}

# Import data into SQLite database
import_to_sqlite() {
    echo "Starting import of data into SQLite database..."
    cd databases

    create_sqlite_schema

    start_time=$(date +%s)
    echo "Setting PRAGMA journal_mode to OFF..."
    sqlite3 imdb.db "PRAGMA journal_mode = OFF;"
    echo "Beginning transaction..."
    sqlite3 imdb.db "BEGIN TRANSACTION;"

    for dataset in "${datasets[@]}"; do
        table_name="${dataset//./_}"
        echo "Importing $dataset.tsv into $table_name..."
        sqlite3 imdb.db ".mode tabs" ".import $dataset.tsv $table_name"
    done

    echo "Committing transaction..."
    sqlite3 imdb.db "COMMIT;"
    end_time=$(date +%s)
    duration=$(( end_time - start_time ))
    echo "Data import into SQLite database completed in $duration seconds"

    cd ..
    echo "All datasets have been downloaded, extracted, preprocessed, and imported into imdb.db."
}

# Main script execution
install_required_tools
download_datasets "$1"
preprocess_files
import_to_sqlite
