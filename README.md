# Red Bus Scraper

## Description

This project is a web scraper built using Node.js and Puppeteer that extracts bus details from the Red Bus website. It retrieves information such as bus names, types, starting and reaching times, durations, ratings, and prices for routes from Bangalore to Visakhapatnam. The extracted data is then saved to an Excel file with a timestamped filename.

## Features

- Scrapes bus details including names, types, timings, durations, ratings, and prices.
- Automatically scrolls the webpage to load all available buses.
- Outputs the data to an Excel file with customizable formatting.
- Timestamped filenames for organized data management.

## Requirements

- Node.js (v12 or later)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/soubhagya2001/RedBus-Timings-NodeJs.git
   cd red-bus-scraper

2. Install the required dependencies:

   ```bash
   npm install puppeteer xlsx

## Usage
- Open the scrape.js file in a code editor.
- Modify the url variable if needed to scrape different routes.
- Run the script:

   ```bash
   node RedBus.js
- The scraped bus details will be saved in an Excel file named Red_Bus_Details_DD-mm-yyyy_HH-MM.xlsx in the project directory.

## Example Output 
The output Excel file contains the following columns:

Name: Name of the bus operator
Type: Type of the bus
Start Time: Departure time
Reach Time: Arrival time
Duration: Total travel duration
Rating: Bus rating
Price: Ticket price
