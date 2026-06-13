
function initHoverCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    const positionClasses = [
        'carousel__item--left-left',
        'carousel__item--left-right',
        'carousel__item--center',
        'carousel__item--right-left',
        'carousel__item--right-right'
    ];

    const getPositionClass = (item) => {
        for (const className of positionClasses) {
            if (item.classList.contains(className)) {
                return className;
            }
        }

        return null;
    };

    carousels.forEach((carousel) => {
        const items = Array.from(carousel.querySelectorAll('.carousel__item'));
        if (items.length < 5) {
            return;
        }

        const hasPositionedItems = items.some((item) => getPositionClass(item));
        if (!hasPositionedItems) {
            return;
        }

        let direction = 0;
        let timeoutId = null;
        const moveDuration = 100;
        const pauseDuration = 700;
        const stepDelay = moveDuration + pauseDuration;
        const zByPosition = {
            'carousel__item--left-left': 3,
            'carousel__item--left-right': 4,
            'carousel__item--center': 5,
            'carousel__item--right-left': 4,
            'carousel__item--right-right': 3
        };
        const zIndexTimers = new WeakMap();
        const zDelayMs = 180;
        const rotate = (step) => {
            const nextPositions = new Map();
            const zDowngrades = [];
            const centerPromotions = [];

            items.forEach((item) => {
                const currentClass = getPositionClass(item);
                if (!currentClass) {
                    return;
                }

                const currentIndex = positionClasses.indexOf(currentClass);
                const nextIndex = (currentIndex + step + positionClasses.length) % positionClasses.length;
                const nextClass = positionClasses[nextIndex];
                nextPositions.set(item, nextClass);

                const currentZ = zByPosition[currentClass] ?? 0;
                const nextZ = zByPosition[nextClass] ?? 0;
                if (nextZ < currentZ) {
                    zDowngrades.push({ item, holdZ: currentZ });
                }

                if (nextClass === 'carousel__item--center' && currentClass !== 'carousel__item--center') {
                    centerPromotions.push(item);
                }
            });

            zDowngrades.forEach(({ item, holdZ }) => {
                const activeTimer = zIndexTimers.get(item);
                if (activeTimer) {
                    clearTimeout(activeTimer);
                }

                item.style.zIndex = String(holdZ);
            });

            centerPromotions.forEach((item) => {
                const activeTimer = zIndexTimers.get(item);
                if (activeTimer) {
                    clearTimeout(activeTimer);
                }

                item.style.zIndex = '9';
            });

            items.forEach((item) => {
                positionClasses.forEach((className) => item.classList.remove(className));
                item.classList.remove('carousel__item--main');
            });

            nextPositions.forEach((nextClass, item) => {
                item.classList.add(nextClass);
                if (nextClass === 'carousel__item--center') {
                    item.classList.add('carousel__item--main');
                }
            });

            zDowngrades.forEach(({ item }) => {
                const timerId = setTimeout(() => {
                    item.style.zIndex = '';
                    zIndexTimers.delete(item);
                }, zDelayMs);
                zIndexTimers.set(item, timerId);
            });

            centerPromotions.forEach((item) => {
                const timerId = setTimeout(() => {
                    item.style.zIndex = '';
                    zIndexTimers.delete(item);
                }, zDelayMs);
                zIndexTimers.set(item, timerId);
            });
        };

        const stopRotation = () => {
            direction = 0;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            items.forEach((item) => {
                const activeTimer = zIndexTimers.get(item);
                if (activeTimer) {
                    clearTimeout(activeTimer);
                    zIndexTimers.delete(item);
                }

                item.style.zIndex = '';
            });
        };

        const scheduleNextStep = () => {
            if (!direction) {
                return;
            }

            timeoutId = setTimeout(() => {
                rotate(direction);
                scheduleNextStep();
            }, stepDelay);
        };

        const startRotation = (newDirection) => {
            if (!newDirection) {
                stopRotation();
                return;
            }

            if (direction === newDirection && timeoutId) {
                return;
            }

            stopRotation();
            direction = newDirection;
            scheduleNextStep();
        };

        const updateDirectionByPointer = (clientX) => {
            const carouselRect = carousel.getBoundingClientRect();
            const centerItem = carousel.querySelector('.carousel__item--center');

            if (centerItem) {
                const centerRect = centerItem.getBoundingClientRect();
                const centerBuffer = Math.min(centerRect.width * 0.04, 24);
                const withinCenter = clientX >= (centerRect.left - centerBuffer) && clientX <= (centerRect.right + centerBuffer);
                if (withinCenter) {
                    stopRotation();
                    return;
                }
            }

            const isLeftZone = clientX < carouselRect.left + carouselRect.width / 2;

            startRotation(isLeftZone ? 1 : -1);
        };

        carousel.addEventListener('mousemove', (event) => {
            updateDirectionByPointer(event.clientX);
        });

        carousel.addEventListener('mouseenter', (event) => {
            updateDirectionByPointer(event.clientX);
        });

        carousel.addEventListener('mouseleave', () => {
            stopRotation();
        });
    });
}

function initLanguageSwitcher() {
    const langRoot = document.querySelector('.lang');
    if (!langRoot) {
        return;
    }

    const links = Array.from(langRoot.querySelectorAll('a[data-lang]'));
    if (links.length < 2) {
        return;
    }

    const primaryLink = links[0];
    const secondaryLink = links[1];
    const frTextNodes = document.querySelectorAll('.carousel__item-text--fr');
    const enTextNodes = document.querySelectorAll('.carousel__item-text--en');
    const frImageNodes = document.querySelectorAll('.carousel__item-image--fr');
    const enImageNodes = document.querySelectorAll('.carousel__item-image--en');

    let currentLang = 'fr';
    let isOpen = false;

    const setNodesVisibility = (nodes, isVisible) => {
        nodes.forEach((node) => {
            node.style.display = isVisible ? '' : 'none';
        });
    };

    const setLanguage = (lang) => {
        const isFr = lang === 'fr';
        setNodesVisibility(frTextNodes, isFr);
        setNodesVisibility(enTextNodes, !isFr);
        setNodesVisibility(frImageNodes, isFr);
        setNodesVisibility(enImageNodes, !isFr);
        currentLang = lang;
    };

    const syncLanguageLinks = () => {
        const secondaryLang = currentLang === 'fr' ? 'en' : 'fr';
        primaryLink.dataset.lang = currentLang;
        secondaryLink.dataset.lang = secondaryLang;
        primaryLink.textContent = currentLang.toUpperCase();
        secondaryLink.textContent = secondaryLang.toUpperCase();
    };

    const closeDropdown = () => {
        isOpen = false;
        langRoot.classList.remove('lang--open');
    };

    const openDropdown = () => {
        isOpen = true;
        langRoot.classList.add('lang--open');
    };

    primaryLink.setAttribute('data-lang-role', 'primary');
    secondaryLink.setAttribute('data-lang-role', 'secondary');

    setLanguage('fr');
    syncLanguageLinks();
    closeDropdown();

    primaryLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (isOpen) {
            closeDropdown();
            return;
        }

        openDropdown();
    });

    secondaryLink.addEventListener('click', (event) => {
        event.preventDefault();
        const nextLang = secondaryLink.dataset.lang;
        if (!nextLang || nextLang === currentLang) {
            closeDropdown();
            return;
        }

        setLanguage(nextLang);
        syncLanguageLinks();
        closeDropdown();
    });

    document.addEventListener('click', (event) => {
        if (!langRoot.contains(event.target)) {
            closeDropdown();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHoverCarousel();
    initLanguageSwitcher();
});
