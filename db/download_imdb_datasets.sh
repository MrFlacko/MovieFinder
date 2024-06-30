#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure required tools are installed
install_required_tools() {
    echo -e "${BLUE}Checking for required tools...${NC}"
    for tool in wget pv sqlite3 parallel; do
        command -v $tool >/dev/null || { echo -e "${YELLOW}Installing $tool...${NC}"; sudo apt-get install -y $tool; }
    done
    echo -e "${GREEN}All required tools are installed.${NC}"
}

# Define datasets and base URL
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
        if [[ "$1" == "--redownload" ]] || [[ ! -f "$filename" ]]; then
            echo -e "${YELLOW}Downloading $filename...${NC}"
            wget -qO- "$url" | pv -s $(wget --spider "$url" 2>&1 | grep Length | awk '{print $2}') | gunzip > "$filename"
        else
            echo -e "${GREEN}$filename already exists, skipping download.${NC}"
        fi
    done

    cd ..
    echo -e "${GREEN}Dataset download and extraction completed.${NC}"
}

# Preprocess a single TSV file
preprocess_file() {
    local file=$1
    echo -e "${BLUE}Preprocessing $file...${NC}"
    local tmp_file=$(mktemp)
    local expected_columns

    # Determine the expected number of columns based on the file name
    case "$file" in
        *name.basics.tsv) expected_columns=6 ;;
        *title.basics.tsv) expected_columns=9 ;;
        *title.akas.tsv) expected_columns=8 ;;
        *title.principals.tsv) expected_columns=6 ;;
        *title.ratings.tsv) expected_columns=3 ;;
        *title.crew.tsv) expected_columns=3 ;;
        *title.episode.tsv) expected_columns=4 ;;
        *) echo -e "${RED}Unknown file type: $file${NC}"; return 1 ;;
    esac

    awk -v expected_columns="$expected_columns" 'BEGIN {FS=OFS="\t"} {
        if (NF > expected_columns) NF = expected_columns
        else while (NF < expected_columns) $++NF = ""
    } 1' "$file" > "$tmp_file"

    if [[ -s "$tmp_file" ]]; then
        mv "$tmp_file" "$file"
        echo -e "${GREEN}Finished preprocessing $file${NC}"
    else
        echo -e "${RED}Error processing $file: temp file is empty or does not exist${NC}"
        rm -f "$tmp_file"
    fi
}

# Preprocess all TSV files
preprocess_files() {
    echo -e "${BLUE}Starting preprocessing of TSV files...${NC}"
    cd databases

    # Export function for parallel processing
    export -f preprocess_file

    # Process files in parallel
    find . -name '*.tsv' | parallel preprocess_file

    cd ..
    echo -e "${GREEN}Preprocessing of TSV files completed.${NC}"
}

# Create SQLite database schema
create_sqlite_schema() {
    echo -e "${BLUE}Creating SQLite database schema...${NC}"
    sqlite3 databases/imdb.db <<EOF
DROP TABLE IF EXISTS title_basics, title_akas, title_principals, title_ratings, title_crew, title_episode, name_basics;

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

# Import data into SQLite database
import_to_sqlite() {
    echo -e "${BLUE}Starting import of data into SQLite database...${NC}"
    cd databases

    sqlite3 imdb.db <<EOF
PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;
PRAGMA foreign_keys = OFF;
EOF

    for dataset in "${datasets[@]}"; do
        table="${dataset//./_}"
        file="${PWD}/${dataset}.tsv"
        echo -e "${YELLOW}Importing ${file} into $table...${NC}"

        # Import the data
        {
            echo ".mode tabs"
            echo ".import \"$file\" $table"
        } | sqlite3 imdb.db 2>> import_errors.log

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

    echo -e "${GREEN}Data import into SQLite database completed.${NC}"

    cd ..
    echo -e "${GREEN}All datasets have been downloaded, extracted, preprocessed, and imported into imdb.db.${NC}"
}

# Check the integrity of required files
check_files() {
    echo -e "${BLUE}Checking integrity of required files...${NC}"
    cd databases

    for dataset in "${datasets[@]}"; do
        filename="$dataset.tsv"
        if [[ -f "$filename" ]]; then
            echo -e "${GREEN}$filename exists.${NC}"
        else
            echo -e "${RED}$filename is missing.${NC}"
            return 1
        fi
    done

    cd ..
    echo -e "${GREEN}File integrity check completed.${NC}"
}

# Main script execution
if [[ "$1" == "--testing" ]]; then
    echo -e "${YELLOW}Running in testing mode, only processing name.basics...${NC}"
    install_required_tools
    download_datasets "$1"
    preprocess_name_basics
    create_sqlite_schema
    import_to_sqlite
elif [[ "$1" == "--check" ]]; then
    echo -e "${YELLOW}Running in check mode...${NC}"
    check_files
else
    install_required_tools
    download_datasets "$1"
    preprocess_files
    create_sqlite_schema
    import_to_sqlite
fi

# Display import errors if any
[[ -s databases/import_errors.log ]] && { echo -e "${RED}Import errors:${NC}"; cat databases/import_errors.log; }

# Debugging info
echo -e "${BLUE}Listing databases directory content:${NC}"
ls -l databases
