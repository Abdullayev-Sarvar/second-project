"use strict";
const $overlay = document.querySelector("#overlay");
const $modal = document.querySelector("#modal");
const $incomeBtn = document.querySelector("#incomeBtn");
const $expenseBtn = document.querySelector("#expenseBtn");
const $closeBtn = document.querySelector("#closeBtn");
const $transactionForm = document.querySelector("#transactionForm");
const $alertError = document.querySelector("#alertError");
const $transactionList = document.querySelector("#transactionList");
const $transactionContainer = document.querySelector(".transaction-container"); // Ensure this selector matches your transaction container element
const url = new URL(location.href);
const ALL_TRANSACTIONS = JSON.parse(localStorage.getItem("transactions")) || [];
const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get('modal') || "";
};
const checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm?.querySelector("select");
    if (!$overlay || !$transactionForm || !$select) {
        console.error("Missing elements in the DOM");
        return;
    }
    if (openModal === "income") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else if (openModal === "expense") {
        $overlay.classList.remove("hidden");
        $select.classList.remove("hidden");
    }
    else {
        $overlay.classList.add("hidden");
    }
};
class Transaction {
    transactionName;
    transactionType;
    transactionAmount;
    type;
    date;
    constructor(transactionName, transactionAmount, transactionType, type) {
        this.transactionName = transactionName;
        this.transactionType = transactionType;
        this.transactionAmount = transactionAmount;
        this.type = type;
        this.date = new Date().getTime();
    }
}
const createNewTransaction = (e) => {
    e.preventDefault();
    let timeOut = null;
    function showToast() {
        if ($alertError) {
            $alertError.classList.remove("hidden");
            timeOut = setTimeout(() => {
                $alertError.classList.add("hidden");
                console.log("finished");
            }, 3000);
        }
    }
    if (!$transactionForm) {
        console.error("Transaction form not found");
        return;
    }
    const inputs = Array.from($transactionForm.querySelectorAll("input, select"));
    const values = inputs.map((input) => {
        if (input.type === "number") {
            return +input.value;
        }
        return input.value ? input.value : undefined;
    });
    if (values.every((value) => typeof value === "string" ? value?.trim().length > 0 : value && value > 0)) {
        const newTransaction = new Transaction(...values, getCurrentQuery());
        ALL_TRANSACTIONS.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));
        window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
        renderTransactionList();
        checkModalOpen();
    }
    else {
        if (timeOut) {
            clearTimeout(timeOut);
        }
        showToast();
    }
};
const renderTransactionList = () => {
    if (!$transactionList) {
        console.error("Transaction list element not found");
        return;
    }
    $transactionList.innerHTML = ""; // Clear previous list
    ALL_TRANSACTIONS.forEach((transaction) => {
        const listItem = document.createElement("li");
        listItem.className = "p-4 border border-gray-200 rounded-lg flex justify-between items-center";
        const transactionDetails = document.createElement("div");
        transactionDetails.className = "flex flex-col";
        const name = document.createElement("span");
        name.className = "font-bold text-lg";
        name.textContent = transaction.transactionName;
        const type = document.createElement("span");
        type.className = "text-gray-500";
        type.textContent = transaction.transactionType || "N/A";
        const date = document.createElement("span");
        date.className = "text-gray-400 text-sm";
        date.textContent = new Date(transaction.date).toLocaleDateString();
        transactionDetails.appendChild(name);
        transactionDetails.appendChild(type);
        transactionDetails.appendChild(date);
        const amount = document.createElement("span");
        amount.className = transaction.type === "income" ? "text-green-500 font-bold" : "text-red-500 font-bold";
        amount.textContent = `${transaction.transactionAmount} UZS`;
        listItem.appendChild(transactionDetails);
        listItem.appendChild(amount);
        $transactionList.appendChild(listItem);
    });
    if (ALL_TRANSACTIONS.length > 2) {
        $transactionContainer?.classList.add("expanded");
    }
    else {
        $transactionContainer?.classList.remove("expanded");
    }
};
renderTransactionList();
$incomeBtn?.addEventListener("click", () => {
    url.searchParams.set("modal", "income");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$expenseBtn?.addEventListener("click", () => {
    url.searchParams.set("modal", "expense");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$closeBtn?.addEventListener("click", () => {
    window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
    checkModalOpen();
});
checkModalOpen();
$transactionForm?.addEventListener("submit", createNewTransaction);
