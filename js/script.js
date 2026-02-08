const preview = document.getElementById("preview");
const tabs = document.querySelectorAll(".btn");
const glass = document.querySelector(".glass");

const editors = {
    html: document.getElementById("html"),
    css: document.getElementById("css"),
    js: document.getElementById("js")
};

const lineNumbers = document.querySelector(".line-numbers");

/* ローカルストレージ復元 */
for (let key in editors) {
    editors[key].value = localStorage.getItem(key) || "";
}

/* プレビュー反映 */
function run() {
    preview.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>${editors.css.value}</style>
</head>
<body>
${editors.html.value}
<script>${editors.js.value}<\/script>
</body>
</html>
`;
    for (let key in editors) {
        localStorage.setItem(key, editors[key].value);
    }
}

/* 行番号更新 */
function updateLineNumbers() {
    const activeEditor = document.querySelector(".txt-area.active");
    if (!activeEditor) return;
    const lines = activeEditor.value.split("\n").length;
    lineNumbers.innerHTML = "";
    for (let i = 1; i <= lines; i++) {
        const span = document.createElement("span");
        span.textContent = i;
        lineNumbers.appendChild(span);
    }
    lineNumbers.scrollTop = activeEditor.scrollTop;
}

/* スクロール同期 */
Object.values(editors).forEach(e => {
    e.addEventListener("scroll", () => {
        if (e.classList.contains("active")) {
            lineNumbers.scrollTop = e.scrollTop;
        }
    });
});

/* 入力イベント */
Object.values(editors).forEach(e => {
    e.addEventListener("input", () => {
        run();
        updateLineNumbers();
    });
});

/* タブ切替 */
tabs.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".btn.active")?.classList.remove("active");
        btn.classList.add("active");

        Object.values(editors).forEach(e => e.classList.remove("active"));
        const target = editors[btn.dataset.tab];
        target.classList.add("active");

        updateLineNumbers();

        const rect = btn.getBoundingClientRect();
        const parentRect = btn.parentElement.getBoundingClientRect();
        glass.style.width = `${rect.width}px`;
        glass.style.height = `${rect.height}px`;
        glass.style.transform = `translate(${rect.left - parentRect.left}px, ${rect.top - parentRect.top}px)`;
    });
});

/* 初期ロード */
window.addEventListener("load", () => {
    run();
    updateLineNumbers();

    const activeTab = document.querySelector(".btn.active");
    const rect = activeTab.getBoundingClientRect();
    const parentRect = activeTab.parentElement.getBoundingClientRect();
    glass.style.width = `${rect.width}px`;
    glass.style.height = `${rect.height}px`;
    glass.style.transform = `translate(${rect.left - parentRect.left}px, ${rect.top - parentRect.top}px)`;
});

const clr = document.querySelectorAll(".clr-ing");

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function ClrHTML(code) {
    code = escapeHTML(code);
    // タグ内の class / id を水色
    code = code.replace(/(class|id)=(".*?")/g, `<span class="clr-attr">$1=$2</span>`);
    // タグ <> 青
    code = code.replace(/(&lt;\/?[\w\s\-]+&gt;)/g, `<span class="clr-tag">$1</span>`);
    // "" 内文字列オレンジ
    code = code.replace(/(".*?")/g, `<span class="clr-string">$1</span>`);
    return code;
}

function updateClr(edita) {
    const pre = edita.previousElementSibling; // Clr
    if (edita.id === "html") {
        pre.innerHTML = ClrHTML(edita.value);
    } else {
        pre.textContent = edita.value; // CSS / JS はプレーンでとりあえず
    }
}

/* textarea入力時に更新 */
Object.values(edita).forEach(e => {
    e.addEventListener("input", () => {
        updateClr(e);
    });
});

/* 初期ロード */
Object.values(edita).forEach(e => updateClr(e));
