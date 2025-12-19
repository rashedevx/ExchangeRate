const API_KEY = "b80abdbdbb46437258a6d3af";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

const elements = {
    fromCurrency: document.getElementById("from-currency"),
    toCurrency: document.getElementById("to-currency"),
    amount: document.getElementById("amount"),
    targetAmount: document.getElementById("target-amount"),
    exchangeRateValue: document.getElementById("exchange-rate-value"),
    updateTime: document.getElementById("update-time"),
    swapBtn: document.getElementById("swap-btn"),
    loader: document.getElementById("loader"),
    fromCodeDisp: document.getElementById("from-code"),
    toCodeDisp: document.getElementById("to-code"),
    themeBtn: document.getElementById("theme-toggle"),
    errorContainer: document.getElementById("error-container"),
    errorMessage: document.getElementById("error-message")
};

// 1. Initial State & Data Fetching
async function initialize() {
    try {
        const response = await fetch(`${BASE_URL}/codes`);
        const data = await response.json();
        
        if (data.result === "success") {
            populateDropdowns(data.supported_codes);
            attachEventListeners();
            await performConversion();
            setTimeout(() => elements.loader.classList.add("hidden"), 800);
        } else {
            throw new Error("Failed to fetch codes");
        }
    } catch (err) {
        showError("Currency service unavailable. Check your connection.");
    }
}

function populateDropdowns(codes) {
    codes.forEach(([code, name]) => {
        const opt1 = new Option(`${code} - ${name}`, code);
        const opt2 = new Option(`${code} - ${name}`, code);
        
        if (code === "BDT") opt1.selected = true;
        if (code === "USD") opt2.selected = true;
        
        elements.fromCurrency.add(opt1);
        elements.toCurrency.add(opt2);
    });
}

// 2. Core Conversion Logic
async function performConversion() {
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;
    const amount = elements.amount.value || 0;

    // Visual feedback
    elements.fromCodeDisp.innerText = from;
    elements.toCodeDisp.innerText = to;
    elements.targetAmount.style.opacity = "0.5";

    try {
        const response = await fetch(`${BASE_URL}/pair/${from}/${to}/${amount}`);
        const data = await response.json();

        if (data.result === "success") {
            const result = data.conversion_result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            elements.targetAmount.innerText = result;
            elements.targetAmount.style.opacity = "1";
            
            elements.exchangeRateValue.innerText = `1 ${from} = ${data.conversion_rate.toFixed(4)} ${to}`;
            elements.updateTime.innerText = new Date(data.time_last_update_utc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            hideError();
        }
    } catch (err) {
        showError("Live rate fetch failed.");
    }
}

// 3. UI Interactions
function attachEventListeners() {
    elements.amount.addEventListener("input", debounce(performConversion, 500));
    elements.fromCurrency.addEventListener("change", performConversion);
    elements.toCurrency.addEventListener("change", performConversion);

    elements.swapBtn.addEventListener("click", () => {
        const temp = elements.fromCurrency.value;
        elements.fromCurrency.value = elements.toCurrency.value;
        elements.toCurrency.value = temp;
        performConversion();
    });

    elements.themeBtn.addEventListener("click", toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Save preference
    elements.themeBtn.innerHTML = newTheme === "dark" ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// In your initialize function, add:
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

// Helpers
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function showError(msg) {
    elements.errorMessage.innerText = msg;
    elements.errorContainer.classList.remove("hidden");
}

function hideError() {
    elements.errorContainer.classList.add("hidden");
}

initialize();