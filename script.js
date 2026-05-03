document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.ingredient-card');
    const dropZone = document.getElementById('drop-zone');
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

    // Custom Pointer Drag implementation
    let isDragging = false;
    let dragClone = null;
    let currentDraggedIngredient = null;
    let dropZoneRect = null;

    cards.forEach(card => {
        const img = card.querySelector('img');
        
        // Prevent default native dragging if any remains
        img.addEventListener('dragstart', e => e.preventDefault());
        
        img.addEventListener('pointerdown', (e) => {
            // ONLY allow dragging the sequential active ingredient
            if (card.dataset.ingredient !== ORDER[currentStepIndex]) return;
            
            e.preventDefault(); 
            
            dropZoneRect = dropZone.getBoundingClientRect();
            
            isDragging = true;
            currentDraggedIngredient = card.dataset.ingredient;
            
            dragClone = document.createElement('img');
            dragClone.src = img.src;
            dragClone.style.position = 'fixed';
            dragClone.style.pointerEvents = 'none'; 
            dragClone.style.zIndex = '99999';
            dragClone.style.opacity = '1';
            
            // Enlarge by 15%
            dragClone.style.width = (img.clientWidth * 1.15) + 'px';
            dragClone.style.height = 'auto';
            
            dragClone.style.transform = 'translate(-50%, -50%)';
            dragClone.style.left = e.clientX + 'px';
            dragClone.style.top = e.clientY + 'px';
            
            document.body.appendChild(dragClone);
            
            // Visually indicate source is being dragged
            img.style.opacity = '0.4';
        });
    });

    document.addEventListener('pointermove', (e) => {
        if (!isDragging || !dragClone) return;
        
        dragClone.style.left = e.clientX + 'px';
        dragClone.style.top = e.clientY + 'px';
        
        if (
            e.clientX >= dropZoneRect.left &&
            e.clientX <= dropZoneRect.right &&
            e.clientY >= dropZoneRect.top &&
            e.clientY <= dropZoneRect.bottom
        ) {
            dropZone.classList.add('drag-over');
        } else {
            dropZone.classList.remove('drag-over');
        }
    });

    document.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        
        if (dropZone.classList.contains('drag-over')) {
            if (currentDraggedIngredient && !activeIngredients.has(currentDraggedIngredient)) {
                addIngredient(currentDraggedIngredient);
            }
        }
        
        if (dragClone) {
            document.body.removeChild(dragClone);
            dragClone = null;
        }
        
        // Reset source image opacity
        cards.forEach(card => {
            card.querySelector('img').style.opacity = '1';
        });
        
        dropZone.classList.remove('drag-over');
        isDragging = false;
        currentDraggedIngredient = null;
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
