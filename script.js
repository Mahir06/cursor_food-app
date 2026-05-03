document.addEventListener('DOMContentLoaded', () => {
    const mainBowl = document.getElementById('mainBowl');
    const animationLayer = document.getElementById('animation-layer');
    const ingredientCards = document.querySelectorAll('.ingredient-card');
    const pattyCounter = document.getElementById('patty-counter');
    const countSpan = pattyCounter.querySelector('.count');
    const minusBtn = pattyCounter.querySelector('.minus');
    const plusBtn = pattyCounter.querySelector('.plus');
    const sauceCard = document.querySelector('.sauce-card');

    // Helper function to create flying animation
    function flyElement(startX, startY, endX, endY, content, isAdding) {
        const flyingEl = document.createElement('div');
        flyingEl.className = 'flying-item';
        flyingEl.innerHTML = content;
        
        // Initial state
        flyingEl.style.left = `${startX}px`;
        flyingEl.style.top = `${startY}px`;
        flyingEl.style.transform = `translate(-50%, -50%) scale(${isAdding ? 1 : 0.5})`;
        flyingEl.style.opacity = isAdding ? '1' : '0';
        flyingEl.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        animationLayer.appendChild(flyingEl);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                flyingEl.style.left = `${endX}px`;
                flyingEl.style.top = `${endY}px`;
                flyingEl.style.transform = `translate(-50%, -50%) scale(${isAdding ? 0.5 : 1})`;
                flyingEl.style.opacity = isAdding ? '0' : '1';
            });
        });

        // Cleanup and trigger bowl bounce
        setTimeout(() => {
            flyingEl.remove();
            if (isAdding) {
                bounceBowl();
            }
        }, 600);
    }

    function bounceBowl() {
        mainBowl.classList.remove('bounce');
        // Force reflow
        void mainBowl.offsetWidth;
        mainBowl.classList.add('bounce');
    }

    // Ingredient Cards Click
    ingredientCards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            const emoji = card.dataset.emoji;
            
            // Get coordinates
            const cardRect = card.getBoundingClientRect();
            const bowlRect = mainBowl.getBoundingClientRect();
            
            // Calculate centers relative to viewport (since app-container might have offset, but we are inside it)
            // It's safer to use client rects if animation layer covers the whole screen, but our animation layer is inside main-dish-area.
            // Let's make animation layer fixed to screen for easier coordinates, or compute relative to app-container.
            // Actually, animation-layer is absolute inside main-dish-area.
            // Better to make animation-layer fixed to viewport in JS or calculate carefully.
            
            // Let's change animation layer to fixed in JS for easier rect matching
            animationLayer.style.position = 'fixed';
            animationLayer.style.zIndex = '1000';

            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const bowlCenterX = bowlRect.left + bowlRect.width / 2;
            const bowlCenterY = bowlRect.top + bowlRect.height / 2;

            if (isActive) {
                // Remove: Fly from bowl to card
                card.classList.remove('active');
                flyElement(bowlCenterX, bowlCenterY, cardCenterX, cardCenterY, emoji, false);
            } else {
                // Add: Fly from card to bowl
                card.classList.add('active');
                flyElement(cardCenterX, cardCenterY, bowlCenterX, bowlCenterY, emoji, true);
            }
        });
    });

    // Aloo Patty Counter
    let pattyCount = 1;

    plusBtn.addEventListener('click', () => {
        pattyCount++;
        updatePattyCount();
        
        const btnRect = plusBtn.getBoundingClientRect();
        const bowlRect = mainBowl.getBoundingClientRect();
        
        flyElement(
            btnRect.left + btnRect.width/2, 
            btnRect.top + btnRect.height/2, 
            bowlRect.left + bowlRect.width/2, 
            bowlRect.top + bowlRect.height/2, 
            '🧆', // Fallback emoji for patty if image is hard
            true
        );
    });

    minusBtn.addEventListener('click', () => {
        if (pattyCount > 0) {
            pattyCount--;
            updatePattyCount();
            
            const btnRect = minusBtn.getBoundingClientRect();
            const bowlRect = mainBowl.getBoundingClientRect();
            
            flyElement(
                bowlRect.left + bowlRect.width/2, 
                bowlRect.top + bowlRect.height/2, 
                btnRect.left + btnRect.width/2, 
                btnRect.top + btnRect.height/2, 
                '🧆',
                false
            );
        }
    });

    function updatePattyCount() {
        countSpan.textContent = pattyCount;
    }

    // Sauce Card Toggle
    sauceCard.addEventListener('click', () => {
        const isActive = sauceCard.classList.contains('active');
        const statusDiv = sauceCard.querySelector('.chosen-status');
        const textP = sauceCard.querySelector('.row-text p');
        
        const cardRect = sauceCard.getBoundingClientRect();
        const bowlRect = mainBowl.getBoundingClientRect();
        
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;
        const endX = bowlRect.left + bowlRect.width / 2;
        const endY = bowlRect.top + bowlRect.height / 2;

        if (isActive) {
            sauceCard.classList.remove('active');
            statusDiv.style.opacity = '0';
            textP.textContent = '0 options chosen';
            flyElement(endX, endY, startX, startY, '🥣', false);
        } else {
            sauceCard.classList.add('active');
            statusDiv.style.opacity = '1';
            textP.textContent = '1 option chosen';
            flyElement(startX, startY, endX, endY, '🥣', true);
        }
    });
});
