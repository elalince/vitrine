(function () {
    const modal = document.getElementById('modal');
    const sheetTitle = document.getElementById('sheetTitle');
    const sheetBody = document.getElementById('sheetBody');
    const sheetNum = document.getElementById('sheetNum');
    const modalBack = document.getElementById('modalBack');
    const sheetClose = document.getElementById('sheetClose');
    const sheetBack = document.getElementById('sheetBack');
    const items = Array.from(document.querySelectorAll('.carousel__item'));

    if (!modal || !sheetTitle || !sheetBody || !sheetNum || !modalBack || !sheetClose || items.length === 0) {
        return;
    }

    const getCurrentLang = () => {
        const primaryLangLink = document.querySelector('.lang a[data-lang-role="primary"]');
        if (primaryLangLink && primaryLangLink.dataset.lang) {
            return primaryLangLink.dataset.lang;
        }

        return 'fr';
    };

    const openModal = (item) => {
        const lang = getCurrentLang();
        const title = item.getAttribute(`data-modal-title-${lang}`) || item.getAttribute('data-modal-title') || 'Cap Solutions';
        const body = item.getAttribute(`data-modal-body-${lang}`) || item.getAttribute('data-modal-body') || '';
        const number = item.getAttribute('data-modal-num') || '';

        sheetTitle.textContent = title;
        sheetBody.innerHTML = body;
        sheetNum.textContent = number;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
    };

    modalBack.addEventListener('click', closeModal);
    sheetClose.addEventListener('click', closeModal);

    if (sheetBack) {
        sheetBack.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });

    items.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openModal(item);
        });
    });
})();
