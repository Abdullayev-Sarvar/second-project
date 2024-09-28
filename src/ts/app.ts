const $overlay = document.querySelector("#overlay") as HTMLDivElement | null;
const $modal = document.querySelector("#modal") as HTMLDivElement | null;
const $incomeBtn = document.querySelector("#incomeBtn") as HTMLButtonElement | null;
const $expenseBtn = document.querySelector("#expenseBtn") as HTMLButtonElement | null;
const $closeBtn = document.querySelector("#closeBtn") as HTMLButtonElement | null;
const $transactionForm = document.querySelector("#transactionForm") as HTMLFormElement | null;
const $alertError = document.querySelector("#alertError") as HTMLDivElement | null;

const url = new URL(location.href);

const ALL_TRANSACTIONS = JSON.parse(localStorage.getItem("transactions") as string) || [];

const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get('modal') || "" as string;
};

const checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm?.querySelector("select") as HTMLSelectElement | null;
    if (!$overlay || !$transactionForm || !$select) {
        console.error("Missing elements in the DOM");
        return;
    }
    if (openModal === "income") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    } else if (openModal === "expense") {
        $overlay.classList.remove("hidden");
        $select.classList.remove("hidden");
    } else {
        $overlay.classList.add("hidden");
    }
};

class Transaction {
    transactionName: string;
    transactionType: string | undefined;
    transactionAmount: number;
    type: string;
    date: number;
    constructor(transactionName: string, transactionAmount: number, transactionType: string | undefined, type: string) {
        this.transactionName = transactionName;
        this.transactionType = transactionType;
        this.transactionAmount = transactionAmount;
        this.type = type;
        this.date = new Date().getTime();
    }
}

const createNewTransaction = (e: Event) => {
    e.preventDefault();

    let timeOut: ReturnType<typeof setTimeout> | null = null;

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

    const inputs = Array.from($transactionForm.querySelectorAll("input, select")) as HTMLInputElement[];
    const values: (string | number | undefined)[] = inputs.map((input) => {
        if (input.type === "number") {
            return +input.value;
        }
        return input.value ? input.value : undefined;
    });
    if (values.every((value) => typeof value === "string" ? value?.trim().length > 0 : value && value > 0)) {
        const newTransaction = new Transaction(...values as [string, number, string | undefined], getCurrentQuery());
        ALL_TRANSACTIONS.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));
        window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
        checkModalOpen();
    } else {
        if (timeOut) {
            clearTimeout(timeOut);
        }
        showToast();
    }
};

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
