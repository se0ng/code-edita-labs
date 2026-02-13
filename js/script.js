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
        if (!e.shiftKey && e.key.toLowerCase() === 'c' && area.id === 'html') { // class=""
            e.preventDefault();
            area.value = value.slice(0, start) + 'class=""' + value.slice(end);
            area.selectionStart = area.selectionEnd = start + 7;
            return;
        }

        // CSS
        if (!e.shiftKey && area.id === 'css') {
            const twoChars = value.slice(start - 2, start);
            const oneChar = value.slice(start - 1, start);

            switch (twoChars) {
                case 'm0':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'margin: 0;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 8;
                    break;
                case 'p0':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'padding: 0;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 9;
                    break;
                case 'wi':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'width: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 5;
                    break;
                case 'he':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'height: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 6;
                    break;
                case 'df':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'display: flex;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 13;
                    break;
                case 'fd':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'flex-direction: column;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 21;
                    break;
                case 'jc':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'justify-content: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 20;
                    break;
                case 'ai':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'align-items: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 19;
                    break;
                case 'dg':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'display: grid;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 13;
                    break;
                case 'gt':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'grid-template-: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 22;
                    break;
                case 'pi':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'place-items: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 16;
                    break;
                case 'ta':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'text-align: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 16;
                    break;
                case 'pr':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'position: relative;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 17;
                    break;
                case 'pa':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'position: absolute;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 17;
                    break;
                case 'bg':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'background: #;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 12;
                    break;
                case 'cl':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'color: #;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 7;
                    break;
                case 'fz':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'font-size: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 9;
                    break;
                case 'fw':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'font-weight: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 12;
                    break;
                case 'ff':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'font-family: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 11;
                    break;
                case 'va':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'var();' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 2;
                    break;
                case 'br':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'border-radius: ;' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 14;
                    break;
                case 'ur':
                    e.preventDefault();
                    area.value = value.slice(0, start - 2) + 'url("");' + value.slice(end);
                    area.selectionStart = area.selectionEnd = start + 2;
                    break;
            }
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
