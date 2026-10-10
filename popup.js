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

        // 4. Build the 3-column table programmatically
        const table = document.createElement('table');

        // Create Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['#', 'URL', 'Visits'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create Body
        const tbody = document.createElement('tbody');

        top10.forEach(([url, data], index) => {
            const visit_count = data.visit_count ?? 0;
            const tr = document.createElement('tr');

            // Index column
            const tdIndex = document.createElement('td');
            tdIndex.textContent = index + 1;
            tr.appendChild(tdIndex);

            // URL column with a safe anchor element
            const tdUrl = document.createElement('td');
            const a = document.createElement('a');
            a.href = url;
            a.textContent = url;
            a.target = '_blank';
            a.title = url;
            tdUrl.appendChild(a);
            tr.appendChild(tdUrl);

            // Visits column
            const tdVisits = document.createElement('td');
            tdVisits.textContent = visit_count;
            tr.appendChild(tdVisits);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        // Clear the container and append the new table safely
        container.replaceChildren(table);

    } catch (error) {
        console.error("Error reading storage:", error);
        container.innerHTML = "<p>No stored history found.</p>";
    }
});