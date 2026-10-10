let historyMap = new Map();
let saveTimeout = null;
const DEBOUNCED_TIME = 5000

function getSLD(url) {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');

        if (parts.length >= 2) {
            return parts.slice(-2).join('.');
        }
        return hostname;
    } catch (e) {
        return null;
    }
}

function debouncedSave() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
        try {
            const entries = Array.from(historyMap.entries());
            await browser.storage.local.set({ historyData: entries });
        } catch (error) {
        } finally {
            saveTimeout = null;
        }
    }, DEBOUNCED_TIME);
}

async function initializeHistory() {
    try {
        const result = await browser.storage.local.get("historyData");

        if (result.historyData && result.historyData.length > 0) {
            historyMap = new Map(result.historyData);
        } else {
            const results = await browser.history.search({ text: '', startTime: 0, maxResults: 9999999999 })
            results.forEach(item => {
                let sld = getSLD(item.url);
                if (sld != null) {
                    if (historyMap.has(sld)) {
                        const entry = historyMap.get(sld);
                        entry.visit_count += item.visitCount;
                        if (item.lastVisitTime > entry.last_visit_time) {
                            entry.last_visit_time = item.lastVisitTime;
                        }
                    } else {
                        historyMap.set(sld, {
                            sld, visit_count: item.visitCount, last_visit_time: item.lastVisitTime
                        })
                    }
                }
            });
            const entries = Array.from(historyMap.entries());
            await browser.storage.local.set({ historyData: entries });
        }
    } catch (err) {
    }
}

browser.runtime.onInstalled.addListener(initializeHistory);
browser.runtime.onStartup.addListener(initializeHistory);

browser.history.onVisited.addListener(async (historyItem) => {
    const sld = getSLD(historyItem.url);

    if (sld != null) {
        if (historyMap.has(sld)) {
            const entry = historyMap.get(sld);
            entry.visit_count += historyItem.visitCount;
            if (historyItem.lastVisitTime > entry.last_visit_time) {
                entry.last_visit_time = historyItem.lastVisitTime;
            }
        } else {
            historyMap.set(sld, {
                sld, visit_count: historyItem.visitCount, last_visit_time: historyItem.lastVisitTime
            })
        }
    }

    debouncedSave();
});

browser.history.onVisitRemoved.addListener(async (removeInfo) => {
    if (removeInfo.allHistory) {
        historyMap.clear();
        try {
            await browser.storage.local.remove("historyData")
        } catch (err) {
        }
    } else if (removeInfo.urls) {
        removeInfo.urls.forEach(url => {
            let sld = getSLD(url);

            if (sld != null) {
                if (historyMap.has(sld)) {
                    const entry = historyMap.get(sld);
                    entry.visit_count -= 1;
                }
            }
        });
    }
});