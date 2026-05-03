document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.ingredient-card');
    const mainBowlImage = document.getElementById('mainBowlImage');
    const undoBtn = document.getElementById('undoBtn');

    // Expected order of ingredients to generate the correct filename
    const ORDER = [
        "ONION",
        "JALAPENO",
        "OLIVE",
        "CAPSICUM",
        "ALOO PATTY",
        "CHIPOTLE SAUCE",
        "BIRYANI SAUCE"
    ];

    let activeIngredients = new Set();
    let actionHistory = []; // to support Undo
    let currentStepIndex = 0; // Tracks the sequential step

    // Initialize UI
    updateUI();
    updateBowlImage();

    // Click to add for sequential UI
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const ingredient = card.dataset.ingredient;
            
            // Only allow clicking the currently active sequential ingredient
            if (ingredient === ORDER[currentStepIndex]) {
                addIngredient(ingredient);
            }
        });
    });

    undoBtn.addEventListener('click', () => {
        if (actionHistory.length > 0) {
            const lastIngredient = actionHistory.pop();
            activeIngredients.delete(lastIngredient);
            currentStepIndex--;
            updateBowlImage();
            updateUI();
        }
    });

    function addIngredient(ingredient) {
        activeIngredients.add(ingredient);
        actionHistory.push(ingredient);
        currentStepIndex++;
        updateBowlImage();
        updateUI();
    }

    function updateBowlImage() {
        const sortedActive = ORDER.filter(ing => activeIngredients.has(ing));
        
        let filename = 'RICE BOWL';
        if (sortedActive.length > 0) {
            filename += ', ' + sortedActive.join(', ');
        }
        filename += '.png';

        mainBowlImage.src = `assets/${filename}`;

        mainBowlImage.onerror = () => {
            console.warn(`Image not found: ${filename}, falling back to base bowl.`);
        };
    }

    function updateUI() {
        if (actionHistory.length > 0) {
            undoBtn.style.display = 'block';
        } else {
            undoBtn.style.display = 'none';
        }

        cards.forEach(card => {
            const ingredient = card.dataset.ingredient;
            
            // Reset classes
            card.classList.remove('active', 'done', 'disabled');
            
            if (activeIngredients.has(ingredient)) {
                // Already added
                card.classList.add('done');
            } else if (ingredient === ORDER[currentStepIndex]) {
                // The current required step
                card.classList.add('active');
            } else {
                // Future step
                card.classList.add('disabled');
            }
        });
    }

    // Quantity selector logic
    const qtySpan = document.querySelector('.quantity-selector span');
    const [minusBtn, plusBtn] = document.querySelectorAll('.qty-btn');
    let qty = 1;

    minusBtn.addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            qtySpan.textContent = qty;
        }
    });

    plusBtn.addEventListener('click', () => {
        qty++;
        qtySpan.textContent = qty;
    });
});
