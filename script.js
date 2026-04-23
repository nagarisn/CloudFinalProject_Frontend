const BACKEND_URL = "retail-fastapi-ss-acgxdhamh2dybjeg.eastus2-01.azurewebsites.net";

let topProductsChart, basketChart, churnChart;

function registerUser() {
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!username || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    localStorage.setItem("portalUsername", username);
    localStorage.setItem("portalEmail", email);
    localStorage.setItem("portalPassword", password);

    alert("Registration successful. Please login.");
    window.location.href = "index.html";
}

function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const savedUser = localStorage.getItem("portalUsername");
    const savedPass = localStorage.getItem("portalPassword");

    if (username === savedUser && password === savedPass) {
        window.location.href = "portal.html";
    } else {
        alert("Invalid username or password.");
    }
}

function loadPortalUser() {
    const username = localStorage.getItem("portalUsername");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    const el = document.getElementById("welcomeUser");
    if (el) el.innerText = username;
}

function logoutUser() {
    window.location.href = "index.html";
}

async function searchHouseholdData() {
    const id = document.getElementById("householdId").value.trim();

    if (!id) {
        alert("Please enter a Household ID.");
        return;
    }

    const response = await fetch(`${BACKEND_URL}/household/${id}`);
    const data = await response.json();
    const results = data.results;

    if (!results || results.length === 0) {
        document.getElementById("searchOutput").innerHTML = "<p>No results found for this household ID.</p>";
        return;
    }

    let html = `
        <table>
            <tr>
                <th>HSHD_NUM</th>
                <th>Basket</th>
                <th>Date</th>
                <th>Product</th>
                <th>Department</th>
                <th>Commodity</th>
                <th>Spend</th>
                <th>Units</th>
            </tr>
    `;

    results.forEach(row => {
        html += `
            <tr>
                <td>${row.HSHD_NUM}</td>
                <td>${row.BASKET_NUM}</td>
                <td>${new Date(row.DATE).toLocaleDateString()}</td>
                <td>${row.PRODUCT_NUM}</td>
                <td>${row.DEPARTMENT}</td>
                <td>${row.COMMODITY}</td>
                <td>${Number(row.SPEND).toFixed(2)}</td>
                <td>${row.UNITS}</td>
            </tr>
        `;
    });

    html += "</table>";
    document.getElementById("searchOutput").innerHTML = html;
}

async function loadDashboard() {
    try {
        const id = document.getElementById("dashboardHouseholdId").value.trim();

        if (!id) {
            alert("Enter Household ID");
            return;
        }

        const dashboardRes = await fetch(`${BACKEND_URL}/dashboard/${id}`);
        const dashboardData = await dashboardRes.json();

        document.getElementById("totalSpend").innerText = "Total Spend: $" + dashboardData.total_spend.toFixed(2);
        document.getElementById("totalBaskets").innerText = "Total Baskets: " + dashboardData.total_baskets;
        document.getElementById("totalItems").innerText = "Total Items: " + dashboardData.total_items;
        document.getElementById("avgSpend").innerText = "Avg Spend: $" + dashboardData.avg_spend.toFixed(2);
        document.getElementById("totalUnits").innerText = "Total Units: " + dashboardData.total_units;

        const topRes = await fetch(`${BACKEND_URL}/top-products/${id}`);
        const topData = await topRes.json();

        let html = "<ul>";
        topData.forEach(item => {
            html += `<li>${item.COMMODITY} - $${Number(item.total_spend).toFixed(2)}</li>`;
        });
        html += "</ul>";
        document.getElementById("topProducts").innerHTML = html;

        const labels = topData.map(i => i.COMMODITY);
        const values = topData.map(i => Number(i.total_spend));

        if (topProductsChart) topProductsChart.destroy();

        topProductsChart = new Chart(document.getElementById("topProductsChart"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Spend",
                    data: values
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        const basketRes = await fetch(`${BACKEND_URL}/basket-analysis`);
        const basketData = await basketRes.json();

        let basketHtml = "<table><tr><th>Commodity</th><th>Count</th><th>Spend</th></tr>";
        basketData.forEach(item => {
            basketHtml += `<tr>
                <td>${item.COMMODITY}</td>
                <td>${item.purchase_count}</td>
                <td>$${Number(item.total_spend).toFixed(2)}</td>
            </tr>`;
        });
        basketHtml += "</table>";
        document.getElementById("basketAnalysis").innerHTML = basketHtml;

        const bLabels = basketData.map(i => i.COMMODITY);
        const bValues = basketData.map(i => Number(i.purchase_count));

        if (basketChart) basketChart.destroy();

        basketChart = new Chart(document.getElementById("basketChart"), {
            type: "pie",
            data: {
                labels: bLabels,
                datasets: [{
                    label: "Purchase Count",
                    data: bValues,
                    backgroundColor: [
                        "#2563eb",
                        "#16a34a",
                        "#f59e0b",
                        "#ef4444",
                        "#9333ea",
                        "#06b6d4",
                        "#84cc16",
                        "#f97316",
                        "#14b8a6",
                        "#8b5cf6"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right"
                    }
                }
            }
        });

        const churnRes = await fetch(`${BACKEND_URL}/churn-summary`);
        const churnData = await churnRes.json();

        let churnHtml = "<table><tr><th>ID</th><th>Basket</th><th>Spend</th><th>Risk</th></tr>";
        churnData.forEach(item => {
            churnHtml += `<tr>
                <td>${item.HSHD_NUM}</td>
                <td>${item.basket_count}</td>
                <td>$${Number(item.total_spend).toFixed(2)}</td>
                <td>${item.churn_risk}</td>
            </tr>`;
        });
        churnHtml += "</table>";
        document.getElementById("churnSummary").innerHTML = churnHtml;

        const riskCounts = {
            "High Risk": 0,
            "Medium Risk": 0,
            "Low Risk": 0
        };

        churnData.forEach(item => {
            const risk = String(item.churn_risk).trim();
            if (riskCounts[risk] !== undefined) {
                riskCounts[risk]++;
            }
        });

        if (churnChart) churnChart.destroy();

        churnChart = new Chart(document.getElementById("churnChart"), {
            type: "bar",
            data: {
                labels: ["High Risk", "Medium Risk", "Low Risk"],
                datasets: [{
                    label: "Number of Households",
                    data: [
                        riskCounts["High Risk"],
                        riskCounts["Medium Risk"],
                        riskCounts["Low Risk"]
                    ],
                    backgroundColor: ["#dc2626", "#facc15", "#16a34a"],
                    
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        
                        ticks: {
                            maxRotation: 45,
                            minRotation: 30
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Check backend.");
    }
}

async function uploadDataFile() {
    const fileInput = document.getElementById("dataFile");

    if (!fileInput.files.length) {
        alert("Please choose a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const response = await fetch(`${BACKEND_URL}/upload-data`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    document.getElementById("uploadMessage").innerText = result.message;
}