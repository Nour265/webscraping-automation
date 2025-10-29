const csvUrl = "https://raw.githubusercontent.com/Nour265/webscraping-automation/main/bitcoin_hourly_data.csv";

async function fetchCsvData() {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    createTable(rows);
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    document.getElementById("data-container").innerHTML =
      `<p style="color: red;">Failed to load data. Check console for details.</p>`;
  }
}

/**
 * Proper CSV parser that handles commas inside quotes.
 */
function parseCSV(text) {
  const rows = [];
  let current = "";
  let row = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"'; // escaped quote
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if (char === "\n" && !insideQuotes) {
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows.filter(r => r.length);
}

/**
 * Render the HTML table
 */
function createTable(rows) {
  let html = `
    <table>
      <thead>
        <tr>${rows[0].map(header => `<th>${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .slice(1)
          .map(
            r =>
              `<tr>${r
                .map(c => `<td>${sanitizeValue(c)}</td>`)
                .join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>`;

  document.getElementById("data-container").innerHTML = html;
}

/**
 * Remove stray quotes and extra whitespace
 */
function sanitizeValue(value) {
  return value.replace(/^"|"$/g, "").trim();
}

window.addEventListener("DOMContentLoaded", fetchCsvData);
