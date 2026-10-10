document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("table-container");

    try {
        // Fetch data from local storage (replace 'historyData' with your actual storage key)
        const result = await browser.storage.local.get("historyData");
        const historyData = result.historyData;

        // Check if data exists and is an array/object
        if (!historyData || (Array.isArray(historyData) && historyData.length === 0)) {
            container.innerHTML = "<p>No stored history found.</p>";
            return;
        }

        let m = new Map(result.historyData);
        const sortedEntries = [...m.entries()].sort(
            (a, b) => b[1].visit_count - a[1].visit_count
        );
        const top10 = sortedEntries.slice(0, 10);

        // 4. Build the HTML 3-column table
        let html = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>URL</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
    `;

        top10.forEach(([url, data], index) => {
            const visit_count = data.visit_count ?? 0;

            html += `
        <tr>
          <td>${index + 1}</td>
          <td><a href="${url}" target="_blank" title="${url}">${url}</a></td>
          <td>${visit_count}</td>
        </tr>
      `;
        });

        html += `
        </tbody>
      </table>
    `;

        container.innerHTML = html;

    } catch (error) {
        console.error("Error reading storage:", error);
        container.innerHTML = "<p>No stored history found.</p>";
    }
});