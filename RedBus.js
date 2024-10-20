const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

const url =
  "https://www.redbus.in/bus-tickets/bangalore-to-visakhapatnam?fromCityName=Bangalore&fromCityId=122&srcCountry=IND&toCityName=Visakhapatnam&toCityId=248&destCountry=IND&onward=20-Oct-2024&opId=0&busType=Any";

async function scrapeBusDetails() {
  const browser = await puppeteer.launch({
    args: ["--disable-http2"],
  });
  const page = await browser.newPage();

  try {
    // Set the user agent
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    // Go to the specified URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Scroll down to load more buses
    let previousHeight;
    while (true) {
      const currentHeight = await page.evaluate("document.body.scrollHeight");
      if (currentHeight === previousHeight) break;
      previousHeight = currentHeight;

      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds
    }

    // Extract bus details using the correct selectors
    const busDetails = await page.evaluate(() => {
      const buses = Array.from(
        document.querySelectorAll(".travels.lh-24.f-bold.d-color")
      );
      const types = Array.from(
        document.querySelectorAll(".bus-type.f-12.m-top-16.l-color.evBus")
      );
      const startTimes = Array.from(
        document.querySelectorAll(".dp-time.f-19.d-color.f-bold")
      );
      const reachTimes = Array.from(
        document.querySelectorAll(".bp-time.f-19.d-color.disp-Inline")
      );
      const durations = Array.from(
        document.querySelectorAll(".dur.l-color.lh-24")
      );
      const ratings = Array.from(
        document.querySelectorAll(".lh-18.rating span")
      );
      const fareElements = Array.from(
        document.querySelectorAll(".fare.d-block")
      );

      return buses.map((bus, index) => {
        const startTime = startTimes[index]?.innerText.trim() || "N/A";
        const reachTime = reachTimes[index]?.innerText.trim() || "N/A";
        const duration = durations[index]?.innerText.trim() || "N/A";
        const rating = ratings[index]?.innerText.trim() || "N/A";

        // Find the price from the outer div class .fare.d-block and remove "INR"
        const price =
          fareElements[index]?.innerText.trim().replace(/INR/g, "").trim() ||
          "N/A";

        return {
          name: bus.innerText.trim(),
          type: types[index]?.innerText.trim() || "N/A",
          startTime,
          reachTime,
          duration,
          rating,
          price,
        };
      });
    });

    // Prepare data for Excel
    const worksheet = xlsx.utils.json_to_sheet(busDetails);

    // Set column widths
    const colWidths = [
      { wpx: 200 }, // Name
      { wpx: 250 }, // Type
      { wpx: 100 }, // Start Time
      { wpx: 100 }, // Reach Time
      { wpx: 100 }, // Duration
      { wpx: 80 }, // Rating
      { wpx: 100 }, // Price
    ];
    worksheet["!cols"] = colWidths;

    // Style headers
    const headers = [
      "Name",
      "Type",
      "Start Time",
      "Reach Time",
      "Duration",
      "Rating",
      "Price",
    ];
    headers.forEach((header, index) => {
      const cell = worksheet[xlsx.utils.encode_cell({ r: 0, c: index })]; // Header row
      cell.v = header.toUpperCase(); // Set header value
      cell.s = {
        fill: {
          fgColor: { rgb: "FFFF00" }, // Yellow background for headers
        },
        font: {
          bold: true,
          color: { rgb: "000000" }, // Black text
        },
        alignment: {
          horizontal: "center",
        },
      };
    });

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Bus Details");

    // Generate timestamp in DD-mm-yyyy_HH-MM format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${day}-${month}-${year}_${hours}-${minutes}`;

    const filename = `Red_Bus_Details_${timestamp}.xlsx`;

    // Write to Excel file
    xlsx.writeFile(workbook, filename);
    console.log(`Bus details saved to ${filename}`);
  } catch (error) {
    console.error("Error fetching the data:", error);
  } finally {
    await browser.close();
  }
}

scrapeBusDetails();
