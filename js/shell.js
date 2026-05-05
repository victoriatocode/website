/* shell.js — shared interactivity for all subpages */
(function () {
    const mBtn = document.getElementById('mBtn');
    const nav = document.getElementById('nav');
    if (mBtn && nav) {
        mBtn.addEventListener('click', () => nav.classList.toggle('open'));
    }
})();
