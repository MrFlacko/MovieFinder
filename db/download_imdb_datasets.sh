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

# Preprocess the name.basics.tsv file to handle unescaped characters and correct column counts
preprocess_name_basics() {
    file="databases/name.basics.tsv"
    echo -e "${BLUE}Preprocessing $file...${NC}"

    if [[ ! -f "$file" ]]; then
        echo -e "${RED}Error: File $file does not exist.${NC}"
        return 1
    fi

    tmp_file=$(mktemp)

    awk 'BEGIN {FS=OFS="\t"} {
        gsub(/"/, ""); # Remove unescaped double quotes
        if (NF > 6) {
            NF = 6;
        } else if (NF < 6) {
            for (i = NF + 1; i <= 6; i++) {
                $i = "";
            }
        }
    } 1' "$file" > "$tmp_file"

    if [[ -s "$tmp_file" ]]; then
        mv "$tmp_file" "$file"
        echo -e "${GREEN}Finished preprocessing $file${NC}"
    else
        echo -e "${RED}Error processing $file: temp file is empty or does not exist${NC}"
        rm -f "$tmp_file"
    fi
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

# Preprocess specific TSV file for testing mode
preprocess_files_testing() {
    echo -e "${BLUE}Starting preprocessing of TSV file for testing...${NC}"
    file="databases/name.basics.tsv"

    # Add debug check
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}$file file exists.${NC}"
    else
        echo -e "${RED}$file file does not exist.${NC}"
    fi

    preprocess_name_basics
    echo -e "${GREEN}Preprocessing of TSV file for testing completed.${NC}"
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
EOF

    table="name_basics"
    file="${PWD}/name.basics.tsv"
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

# Check the integrity of the required files
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

    # Checksum verification
    for dataset in "${datasets[@]}"; do
        filename="$dataset.tsv"
        checksum=$(md5sum "$filename" | awk '{print $1}')
        echo -e "${YELLOW}Checksum for $filename: $checksum${NC}"
    done

    cd ..
    echo -e "${GREEN}File integrity check completed.${NC}"
}

# Main script execution
if [[ "$1" == "--testing" ]]; then
    echo -e "${YELLOW}Running in testing mode, only processing name.basics...${NC}"
    install_required_tools
    download_datasets "$1"
    preprocess_files_testing
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
if [[ -s databases/import_errors.log ]]; then
    echo -e "${RED}Import errors:${NC}"
    cat databases/import_errors.log
fi

# Debugging info
echo -e "${BLUE}Listing databases directory content:${NC}"
ls -l databases
