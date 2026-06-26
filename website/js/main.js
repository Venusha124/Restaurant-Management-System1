document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Fetch and display menu
    const fetchMenu = async () => {
        if (!document.getElementById('menuGrid')) return;
        try {
            const [dishesRes, categoriesRes] = await Promise.all([
                fetch('/api/dishes'),
                fetch('/api/categories')
            ]);
            
            const dishes = await dishesRes.json();
            const categories = await categoriesRes.json();
            
            renderMenu(dishes, categories);
        } catch (error) {
            console.error('Error fetching menu:', error);
            document.getElementById('menuGrid').innerHTML = '<p class="error">Failed to load menu. Please try again later.</p>';
        }
    };

    const renderMenu = (dishes, categories) => {
        const filtersContainer = document.getElementById('categoryFilters');
        const gridContainer = document.getElementById('menuGrid');
        
        // Render Category Filters
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat.id;
            btn.textContent = cat.name;
            btn.addEventListener('click', () => filterMenu(cat.id, btn));
            filtersContainer.appendChild(btn);
        });

        // Render Dishes
        window.allDishes = dishes;
        window.allCategories = categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
        
        renderDishesGrid(dishes);
    };

    const filterMenu = (categoryId, btnElement) => {
        // Update active class
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
        
        const filtered = categoryId === 'all' 
            ? window.allDishes 
            : window.allDishes.filter(d => d.category_id === categoryId);
            
        renderDishesGrid(filtered);
    };
    
    // Make filterMenu global so the "All" button can work if we attach an event
    const allFilterBtn = document.querySelector('[data-filter="all"]');
    if (allFilterBtn) {
        allFilterBtn.addEventListener('click', function() {
            filterMenu('all', this);
        });
    }

    const renderDishesGrid = (dishes) => {
        const gridContainer = document.getElementById('menuGrid');
        gridContainer.innerHTML = '';
        
        if (dishes.length === 0) {
            gridContainer.innerHTML = '<p>No dishes found for this category.</p>';
            return;
        }

        dishes.forEach(dish => {
            const catName = window.allCategories[dish.category_id] || dish.category_id;
            
            const card = document.createElement('div');
            card.className = 'dish-card fade-in-up';
            
            const imageHtml = dish.image 
                ? `<img src="${dish.image}" alt="${dish.name}" class="dish-img" onerror="this.outerHTML='<div class=\\'dish-img-placeholder\\'><i class=\\'fa-solid fa-utensils\\'></i></div>'">` 
                : `<div class="dish-img-placeholder"><i class="fa-solid fa-utensils"></i></div>`;
                
            card.innerHTML = `
                ${imageHtml}
                <div class="dish-content">
                    <div class="dish-header">
                        <h3 class="dish-title">${dish.name}</h3>
                        <span class="dish-price">$${dish.price.toFixed(2)}</span>
                    </div>
                    <span class="dish-category">${catName}</span>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    };

    // Handle Reservation Submission
    const reservationForm = document.getElementById('reservationForm');
    const statusMsg = document.getElementById('reservationStatus');

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(reservationForm);
            const data = Object.fromEntries(formData.entries());
            
            const submitBtn = reservationForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            statusMsg.className = 'status-msg hidden';

            try {
                const response = await fetch('/api/public/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    statusMsg.textContent = 'Reservation request submitted successfully! We will contact you soon to confirm.';
                    statusMsg.className = 'status-msg success';
                    reservationForm.reset();
                } else {
                    statusMsg.textContent = result.error || 'Failed to submit reservation.';
                    statusMsg.className = 'status-msg error';
                }
            } catch (error) {
                statusMsg.textContent = 'An error occurred. Please try again.';
                statusMsg.className = 'status-msg error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Reservation';
            }
        });
    }

    // Theme Toggle Logic
    const themeBtn = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('ascendia_theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        icon.classList.replace('fa-sun', 'fa-moon');
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        if (body.classList.contains('light-mode')) {
            localStorage.setItem('ascendia_theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            localStorage.setItem('ascendia_theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    // Fetch and render Venues
    const fetchVenues = async () => {
        if (!document.getElementById('venuesGrid')) return;
        try {
            const res = await fetch('/api/public/event-rooms');
            const rooms = await res.json();
            renderVenues(rooms);
        } catch (error) {
            console.error('Error fetching venues:', error);
            document.getElementById('venuesGrid').innerHTML = '<p class="error">Failed to load venues.</p>';
        }
    };

    const renderVenues = (rooms) => {
        const grid = document.getElementById('venuesGrid');
        grid.innerHTML = '';
        
        if (rooms.length === 0) {
            grid.innerHTML = '<p>No event rooms are currently available.</p>';
            return;
        }

        rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'venue-card fade-in-up';
            // Placeholder since no specific images were provided
            const placeholderImg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            
            card.innerHTML = `
                <img src="${placeholderImg}" alt="${room.name}" class="venue-img">
                <div class="venue-content">
                    <div class="venue-header">
                        <h3 class="venue-title">${room.name}</h3>
                        <span class="venue-price">$${room.price_per_day}/day</span>
                    </div>
                    <div class="venue-capacity">
                        <i class="fa-solid fa-users"></i> Up to ${room.capacity} guests
                    </div>
                    <button class="btn btn-outline btn-block" onclick="prefillReservation('${room.name}')">Book Venue</button>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    window.prefillReservation = (roomName) => {
        document.querySelector('input[name="event_name"]').value = 'Booking: ' + roomName;
        document.getElementById('reservations').scrollIntoView();
    };

    // Handle Waitlist Submission
    const waitlistForm = document.getElementById('waitlistForm');
    const waitlistStatus = document.getElementById('waitlistStatus');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(waitlistForm);
            const data = Object.fromEntries(formData.entries());
            
            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Joining...';
            waitlistStatus.className = 'status-msg hidden';

            try {
                const response = await fetch('/api/public/waitlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    waitlistStatus.textContent = 'You have successfully joined the waitlist! We will notify you when your table is ready.';
                    waitlistStatus.className = 'status-msg success';
                    waitlistForm.reset();
                } else {
                    waitlistStatus.textContent = result.error || 'Failed to join waitlist.';
                    waitlistStatus.className = 'status-msg error';
                }
            } catch (error) {
                waitlistStatus.textContent = 'An error occurred. Please try again.';
                waitlistStatus.className = 'status-msg error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join Waitlist';
            }
        });
    }

    // Initialize
    fetchMenu();
    fetchVenues();
});
