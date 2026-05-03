document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.ingredient-card');
    const dropZone = document.getElementById('drop-zone');
    const mainBowlImage = document.getElementById('mainBowlImage');
    const undoBtn = document.getElementById('undoBtn');
    
    // The exact order of ingredients in the provided filenames
    const ORDER = [
        'ONION', 
        'JALAPENO', 
        'OLIVE', 
        'CAPSICUM', 
        'ALOO PATTY', 
        'CHIPOTLE SAUCE', 
        'BIRYANI SAUCE'
    ];

    let activeIngredients = new Set();
    let actionHistory = []; // to support Undo

    // Drag and Drop implementation
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.dataset.ingredient);
            e.dataTransfer.effectAllowed = 'copy';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'copy';
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const ingredient = e.dataTransfer.getData('text/plain');
        if (ingredient && !activeIngredients.has(ingredient)) {
            addIngredient(ingredient);
        }
    });

    // Also allow clicking to add for better UX on mobile
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const ingredient = card.dataset.ingredient;
            if (!activeIngredients.has(ingredient)) {
                addIngredient(ingredient);
            }
        });
    });

    undoBtn.addEventListener('click', () => {
        if (actionHistory.length > 0) {
            const lastIngredient = actionHistory.pop();
            activeIngredients.delete(lastIngredient);
            updateBowlImage();
            updateUI();
        }
    });

    function addIngredient(ingredient) {
        activeIngredients.add(ingredient);
        actionHistory.push(ingredient);
        updateBowlImage();
        updateUI();
    }

    function updateBowlImage() {
        // Sort active ingredients based on the ORDER array to match filenames
        const sortedActive = ORDER.filter(ing => activeIngredients.has(ing));
        
        let filename = 'RICE BOWL';
        if (sortedActive.length > 0) {
            filename += ', ' + sortedActive.join(', ');
        }
        filename += '.png';

        // Add a nice fade effect
        mainBowlImage.style.opacity = '0.5';
        setTimeout(() => {
            mainBowlImage.src = `assets/${filename}`;
            mainBowlImage.style.opacity = '1';
        }, 150);

        // Fallback if image doesn't exist (e.g. out of order combinations)
        mainBowlImage.onerror = () => {
            console.warn(`Image not found: ${filename}, falling back to base bowl.`);
            // You could implement a smarter fallback here to the closest valid image
        };
    }

    function updateUI() {
        // Show/hide undo button
        if (actionHistory.length > 0) {
            undoBtn.style.display = 'block';
        } else {
            undoBtn.style.display = 'none';
        }

        // Visually disable cards that are already added
        cards.forEach(card => {
            if (activeIngredients.has(card.dataset.ingredient)) {
                card.style.opacity = '0.4';
                card.draggable = false;
                card.style.cursor = 'default';
            } else {
                card.style.opacity = '1';
                card.draggable = true;
                card.style.cursor = 'grab';
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
