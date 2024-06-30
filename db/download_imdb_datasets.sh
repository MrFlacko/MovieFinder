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

# Preprocess specific TSV file for testing mode
preprocess_files_testing() {
    echo -e "${BLUE}Starting preprocessing of TSV file for testing...${NC}"
    cd databases
    preprocess_file "name.basics.tsv"
    cd ..
    echo -e "${GREEN}Preprocessing of TSV file for testing completed.${NC}"
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

    table_name="name_basics"
    echo -e "${YELLOW}Importing name.basics.tsv into $table_name...${NC}"
    {
        echo ".mode tabs"
        echo ".import name.basics.tsv $table_name"
    } | sqlite3 ../imdb.db 2>> import_errors.log

    if [[ $? -eq 0 ]]; then
        sqlite3 ../imdb.db <<EOF
COMMIT;
PRAGMA journal_mode = DELETE;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;
EOF
        echo -e "${GREEN}Data import into SQLite database completed in $(( $(date +%s) - $start_time )) seconds${NC}"
    else
        echo -e "${RED}Error importing name.basics.tsv, aborting...${NC}"
        sqlite3 ../imdb.db "ROLLBACK;"
        echo -e "${RED}Import aborted. Check import_errors.log for details.${NC}"
    fi

    cd ..
    echo -e "${GREEN}All datasets have been downloaded, extracted, preprocessed, and imported into imdb.db.${NC}"
}


# Main script execution
if [[ "$1" == "--testing" ]]; then
    echo -e "${YELLOW}Running in testing mode, only processing name.basics...${NC}"
    install_required_tools
    download_datasets "$1"
    preprocess_files_testing
    import_to_sqlite
else
    install_required_tools
    download_datasets "$1"
    preprocess_files
    import_to_sqlite
fi
