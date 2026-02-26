const preview = document.getElementById("preview");
const tabs = document.querySelectorAll(".btn");
const glass = document.querySelector(".glass");

const edita = {
    html: document.getElementById("html"),
    css: document.getElementById("css"),
    js: document.getElementById("js")
};

const lineNumbers = document.querySelector(".line-numbers");

/* --------------------
   iframe
-------------------- */

function run() {
    preview.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>${edita.css.value}</style>
</head>
<body>
${edita.html.value}
<script>${edita.js.value}<\/script>
</body>
</html>
`;
    Object.keys(edita).forEach(k =>
        localStorage.setItem(k, edita[k].value)
    );
}

/* --------------------
   折り返し対応 行番号
-------------------- */

function updateLineNumbers() {
    const textarea = document.querySelector(".txt-area.active");
    if (!textarea) return;

    const lineNumbers = document.querySelector(".line-numbers");
    lineNumbers.innerHTML = "";

    const style = getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);

    const lines = textarea.value.split("\n");

    lines.forEach((line, index) => {
        const dummy = document.createElement("div");
        dummy.style.position = "absolute";
        dummy.style.visibility = "hidden";
        dummy.style.width = textarea.clientWidth + "px";
        dummy.style.font = style.font;
        dummy.style.whiteSpace = "pre-wrap";
        dummy.textContent = line;
        document.body.appendChild(dummy);

        const count = Math.max(1, Math.round(dummy.clientHeight / lineHeight));
        document.body.removeChild(dummy);

        for (let i = 0; i < count; i++) {
            const span = document.createElement("span");
            span.textContent = i === 0 ? index + 1 : "";
            lineNumbers.appendChild(span);
        }
    });

    lineNumbers.scrollTop = textarea.scrollTop;
}

/* --------------------
   スクロール同期
-------------------- */

Object.values(edita).forEach(area => {
    area.addEventListener("scroll", () => {
        if (area.classList.contains("active")) {
            lineNumbers.scrollTop = area.scrollTop;
        }
    });
});

/* --------------------
   入力更新
-------------------- */

Object.values(edita).forEach(area => {
    area.value = localStorage.getItem(area.id) || "";

    area.addEventListener("input", () => {
        run();
        updateLineNumbers();
    });
});

/* --------------------
   タブ切替 + glass
-------------------- */

tabs.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".btn.active")?.classList.remove("active");
        btn.classList.add("active");

        Object.values(edita).forEach(e => e.classList.remove("active"));
        edita[btn.dataset.tab].classList.add("active");

        updateLineNumbers();

        const rect = btn.getBoundingClientRect();
        const parent = btn.parentElement.getBoundingClientRect();

        glass.style.width = rect.width + "px";
        glass.style.height = rect.height + "px";
        glass.style.transform =
            `translate(${rect.left - parent.left}px, ${rect.top - parent.top}px)`;
    });
});

/* --------------------
   Tabインデント
-------------------- */

Object.values(edita).forEach(area => {
    area.addEventListener("keydown", e => {
        if (e.key !== "Tab") return;

        e.preventDefault();

        const start = area.selectionStart;
        const end = area.selectionEnd;
        const tab = "  ";

        if (e.shiftKey) {
            if (area.value.substring(start - tab.length, start) === tab) {
                area.value =
                    area.value.slice(0, start - tab.length) +
                    area.value.slice(end);
                area.selectionStart = area.selectionEnd = start - tab.length;
            }
            return;
        }

        area.value =
            area.value.slice(0, start) +
            tab +
            area.value.slice(end);

        area.selectionStart = area.selectionEnd = start + tab.length;
    });
});

Object.values(edita).forEach(area => {
    area.addEventListener("keydown", e => {
        const start = area.selectionStart;
        const end = area.selectionEnd;
        const value = area.value;

        // ショートカットは shiftKey と keyCode / key を組み合わせ
        if (e.shiftKey && e.key === '"') {
            e.preventDefault();
            area.value = value.slice(0, start) + '""' + value.slice(end);
            area.selectionStart = area.selectionEnd = start + 1;
            return;
        }
        if (e.shiftKey && e.key === '(') {
            e.preventDefault();
            area.value = value.slice(0, start) + "()" + value.slice(end);
            area.selectionStart = area.selectionEnd = start + 1;
            return;
        }
        if (e.shiftKey && e.key === '{') {
            e.preventDefault();
            area.value = value.slice(0, start) + "{}" + value.slice(end);
            area.selectionStart = area.selectionEnd = start + 1;
            return;
        }

        // command+/ でコメント
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
            e.preventDefault();
            let sel = area.value.slice(area.selectionStart, area.selectionEnd);
            let ins = '';

            if (area.id === 'html') ins = `<!-- ${sel} -->`;
            else if (area.id === 'css') ins = `/* ${sel} */`;
            else if (area.id === 'js') ins = `// ${sel}`;

            area.value = area.value.slice(0, area.selectionStart) + ins + area.value.slice(area.selectionEnd);
            area.selectionStart = area.selectionEnd = area.selectionStart + ins.length;
        }
    });
});


/* --------------------
   初期化
-------------------- */

window.addEventListener("load", () => {
    run();
    updateLineNumbers();

    const active = document.querySelector(".btn.active");
    const rect = active.getBoundingClientRect();
    const parent = active.parentElement.getBoundingClientRect();

    glass.style.width = rect.width + "px";
    glass.style.height = rect.height + "px";
    glass.style.transform =
        `translate(${rect.left - parent.left}px, ${rect.top - parent.top}px)`;
});
