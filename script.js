document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.ingredient-card');
    const draggableImages = document.querySelectorAll('.ingredient-card img');
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
    draggableImages.forEach(img => {
        img.addEventListener('dragstart', (e) => {
            img.classList.add('dragging');
            e.dataTransfer.setData('text/plain', img.dataset.ingredient);
            e.dataTransfer.effectAllowed = 'copy';
            
            // Set drag image to just the PNG itself without any background
            e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
        });

        img.addEventListener('dragend', () => {
            img.classList.remove('dragging');
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); 
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

    // Allow clicking on the whole card to add for better UX on mobile
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const ingredient = img.dataset.ingredient;
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
        const sortedActive = ORDER.filter(ing => activeIngredients.has(ing));
        
        let filename = 'RICE BOWL';
        if (sortedActive.length > 0) {
            filename += ', ' + sortedActive.join(', ');
        }
        filename += '.png';

        mainBowlImage.style.opacity = '0.5';
        setTimeout(() => {
            mainBowlImage.src = `assets/${filename}`;
            mainBowlImage.style.opacity = '1';
        }, 150);

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

        draggableImages.forEach(img => {
            if (activeIngredients.has(img.dataset.ingredient)) {
                img.style.opacity = '0.3';
                img.draggable = false;
                img.style.cursor = 'default';
                img.parentElement.style.cursor = 'default';
            } else {
                img.style.opacity = '1';
                img.draggable = true;
                img.style.cursor = 'grab';
                img.parentElement.style.cursor = 'pointer';
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
