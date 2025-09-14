// Global state
let rooms = [];
let bookings = [];
let floors = [];
let departments = [];
let dashboardData = {};

// API Base URL
const API_BASE = '';

// Utility functions
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    });
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the section
    if (sectionName === 'dashboard') {
        loadDashboard();
    } else if (sectionName === 'rooms') {
        loadRooms();
    } else if (sectionName === 'bookings') {
        loadBookings();
    }
}

// API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        dashboardData = await apiCall('/dashboard/overview');
        updateDashboardStats();
        loadTodayBookings();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function updateDashboardStats() {
    document.getElementById('total-rooms').textContent = dashboardData.totalRooms || 0;
    document.getElementById('active-bookings').textContent = dashboardData.activeBookings || 0;
    
    const freeRooms = dashboardData.roomsByStatus?.find(r => r.status === 'FREE')?.count || 0;
    const maintenanceRooms = dashboardData.roomsByStatus?.find(r => r.status === 'MAINTENANCE')?.count || 0;
    
    document.getElementById('available-rooms').textContent = freeRooms;
    document.getElementById('maintenance-rooms').textContent = maintenanceRooms;
}

async function loadTodayBookings() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const bookingsData = await apiCall(`/dashboard/bookings-summary`);
        
        const todayBookings = bookingsData.todayBookings || [];
        const container = document.getElementById('today-bookings');
        
        if (todayBookings.length === 0) {
            container.innerHTML = '<p>No bookings for today</p>';
            return;
        }
        
        container.innerHTML = todayBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-info">
                    <strong>${booking.user}</strong>
                    <span class="room-name">${booking.room} (Floor ${booking.room.floor.number})</span>
                </div>
                <div class="booking-time">
                    ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}
                </div>
                <div class="booking-status status-${booking.status.toLowerCase()}">
                    ${booking.status}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load today bookings:', error);
    }
}

// Load floors and departments
async function loadFloors() {
    try {
        floors = await apiCall('/floors');
        populateFloorDropdowns();
    } catch (error) {
        console.error('Failed to load floors:', error);
    }
}

async function loadDepartments() {
    try {
        departments = await apiCall('/departments');
        populateDepartmentDropdowns();
    } catch (error) {
        console.error('Failed to load departments:', error);
    }
}

// Rooms functions
async function loadRooms() {
    try {
        rooms = await apiCall('/rooms');
        displayRooms();
        populateFloorFilter();
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

function displayRooms() {
    const container = document.getElementById('rooms-list');
    
    if (rooms.length === 0) {
        container.innerHTML = '<p>No rooms found</p>';
        return;
    }
    
    container.innerHTML = rooms.map(room => `
        <div class="room-card status-${room.status.toLowerCase()}">
            <div class="room-header">
                <h3>${room.name}</h3>
                <span class="room-status">${room.status}</span>
            </div>
            <div class="room-details">
                <p><i class="fas fa-users"></i> Capacity: ${room.capacity}</p>
                <p><i class="fas fa-layer-group"></i> Floor: ${room.floor.number}</p>
                ${room.description ? `<p><i class="fas fa-info-circle"></i> ${room.description}</p>` : ''}
                <p><i class="fas fa-calendar-check"></i> Active Bookings: ${room.bookings?.length || 0}</p>
                ${room.bookings && room.bookings.length > 0 ? `
                    <div class="current-booking">
                        <p><i class="fas fa-clock"></i> Current Booking:</p>
                        <p><strong>${room.bookings[0].user}</strong> - ${formatTime(room.bookings[0].startTime)} to ${formatTime(room.bookings[0].endTime)}</p>
                    </div>
                ` : ''}
            </div>
            <div class="room-actions">
                <button class="btn btn-sm" onclick="editRoom(${room.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function populateFloorDropdowns() {
    // Populate floor filter
    const floorFilter = document.getElementById('floor-filter');
    floorFilter.innerHTML = '<option value="">All Floors</option>';
    
    floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor.id;
        option.textContent = `Floor ${floor.number} - ${floor.name || 'Unnamed'}`;
        floorFilter.appendChild(option);
    });

    // Populate add room floor dropdown
    const addRoomFloor = document.getElementById('room-floor');
    addRoomFloor.innerHTML = '<option value="">Select a floor</option>';
    
    floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor.id;
        option.textContent = `Floor ${floor.number} - ${floor.name || 'Unnamed'}`;
        addRoomFloor.appendChild(option);
    });

    // Populate edit room floor dropdown
    const editRoomFloor = document.getElementById('edit-room-floor');
    editRoomFloor.innerHTML = '<option value="">Select a floor</option>';
    
    floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor.id;
        option.textContent = `Floor ${floor.number} - ${floor.name || 'Unnamed'}`;
        editRoomFloor.appendChild(option);
    });
}

function populateDepartmentDropdowns() {
    // Populate booking department dropdowns
    const bookingDepartment = document.getElementById('booking-department');
    if (bookingDepartment) {
        bookingDepartment.innerHTML = '<option value="">Select a department</option>';
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            bookingDepartment.appendChild(option);
        });
    }

    const editBookingDepartment = document.getElementById('edit-booking-department');
    if (editBookingDepartment) {
        editBookingDepartment.innerHTML = '<option value="">Select a department</option>';
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            editBookingDepartment.appendChild(option);
        });
    }
}

function populateFloorFilter() {
    // This function is now handled by populateFloorDropdowns
}

function filterRooms() {
    const floorFilter = document.getElementById('floor-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredRooms = rooms;
    
    if (floorFilter) {
        filteredRooms = filteredRooms.filter(room => room.floorId == floorFilter);
    }
    
    if (statusFilter) {
        filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
    }
    
    // Temporarily replace rooms array for display
    const originalRooms = rooms;
    rooms = filteredRooms;
    displayRooms();
    rooms = originalRooms;
}

// Bookings functions
async function loadBookings() {
    try {
        bookings = await apiCall('/bookings');
        displayBookings();
        populateRoomFilter();
    } catch (error) {
        console.error('Failed to load bookings:', error);
    }
}

function displayBookings() {
    const container = document.getElementById('bookings-list');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }
    
    // Debug: Log booking times
    console.log('Displaying bookings with times:', bookings.map(b => ({
        id: b.id,
        user: b.user,
        startTime: b.startTime,
        endTime: b.endTime,
        formattedStart: formatDateTime(b.startTime),
        formattedEnd: formatDateTime(b.endTime)
    })));
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card status-${booking.status.toLowerCase()}">
            <div class="booking-header">
                <h3>${booking.user}</h3>
                <span class="booking-status">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-door-open"></i> Room: ${booking.room.name} (Floor ${booking.room.floor.number})</p>
                <p><i class="fas fa-clock"></i> ${formatDateTime(booking.startTime)} - ${formatDateTime(booking.endTime)}</p>
                ${booking.department ? `<p><i class="fas fa-building"></i> Department: ${booking.department.name}</p>` : ''}
                ${booking.purpose ? `<p><i class="fas fa-info-circle"></i> Purpose: ${booking.purpose}</p>` : ''}
            </div>
            <div class="booking-quick-actions">
                ${booking.status === 'ACTIVE' ? `
                    <button class="booking-quick-btn complete" onclick="quickCompleteBooking(${booking.id})">
                        Complete
                    </button>
                    <button class="booking-quick-btn cancel" onclick="quickCancelBooking(${booking.id})">
                        Cancel
                    </button>
                ` : ''}
            </div>
            <div class="booking-actions">
                <button class="btn btn-sm" onclick="editBooking(${booking.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `).join('');
}

function populateRoomFilter() {
    const roomSelect = document.getElementById('booking-room');
    roomSelect.innerHTML = '<option value="">Select a room</option>';
    
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (Floor ${room.floor.number}) - Capacity: ${room.capacity}`;
        roomSelect.appendChild(option);
    });
}

function filterBookings() {
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('booking-status-filter').value;
    
    let filteredBookings = bookings;
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredBookings = filteredBookings.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate.toDateString() === filterDate.toDateString();
        });
    }
    
    if (statusFilter) {
        filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
    }
    
    // Temporarily replace bookings array for display
    const originalBookings = bookings;
    bookings = filteredBookings;
    displayBookings();
    bookings = originalBookings;
}

// Modal functions
function showAddRoomForm() {
    document.getElementById('add-room-modal').style.display = 'block';
}

function showAddBookingForm() {
    populateRoomFilter();
    document.getElementById('add-booking-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form submissions
document.getElementById('add-room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('room-name').value,
        capacity: parseInt(document.getElementById('room-capacity').value),
        floorId: parseInt(document.getElementById('room-floor').value),
        description: document.getElementById('room-description').value
    };
    
    try {
        await apiCall('/rooms', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Room added successfully!', 'success');
        closeModal('add-room-modal');
        loadRooms();
        document.getElementById('add-room-form').reset();
    } catch (error) {
        console.error('Failed to add room:', error);
    }
});

document.getElementById('add-booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const startTimeInput = document.getElementById('booking-start').value;
    const endTimeInput = document.getElementById('booking-end').value;
    
    console.log('Input times:', { startTimeInput, endTimeInput });
    
    const formData = {
        roomId: parseInt(document.getElementById('booking-room').value),
        user: document.getElementById('booking-user').value,
        departmentId: document.getElementById('booking-department').value ? parseInt(document.getElementById('booking-department').value) : null,
        purpose: document.getElementById('booking-purpose').value,
        startTime: new Date(startTimeInput).toISOString(),
        endTime: new Date(endTimeInput).toISOString()
    };
    
    console.log('Sending times:', { 
        startTime: formData.startTime, 
        endTime: formData.endTime 
    });
    
    try {
        await apiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Booking created successfully!', 'success');
        closeModal('add-booking-modal');
        loadBookings();
        document.getElementById('add-booking-form').reset();
    } catch (error) {
        console.error('Failed to create booking:', error);
    }
});

// Edit form submissions
document.getElementById('edit-room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const roomId = document.getElementById('edit-room-id').value;
    const formData = {
        name: document.getElementById('edit-room-name').value,
        capacity: parseInt(document.getElementById('edit-room-capacity').value),
        floorId: parseInt(document.getElementById('edit-room-floor').value),
        description: document.getElementById('edit-room-description').value,
        status: document.getElementById('edit-room-status').value
    };
    
    try {
        await apiCall(`/rooms/${roomId}`, {
            method: 'PATCH',
            body: JSON.stringify(formData)
        });
        
        showNotification('Room updated successfully!', 'success');
        closeModal('edit-room-modal');
        loadRooms();
    } catch (error) {
        console.error('Failed to update room:', error);
    }
});

document.getElementById('edit-booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookingId = document.getElementById('edit-booking-id').value;
    const formData = {
        roomId: parseInt(document.getElementById('edit-booking-room').value),
        user: document.getElementById('edit-booking-user').value,
        departmentId: document.getElementById('edit-booking-department').value ? parseInt(document.getElementById('edit-booking-department').value) : null,
        purpose: document.getElementById('edit-booking-purpose').value,
        startTime: new Date(document.getElementById('edit-booking-start').value).toISOString(),
        endTime: new Date(document.getElementById('edit-booking-end').value).toISOString(),
        status: document.getElementById('edit-booking-status').value
    };
    
    try {
        await apiCall(`/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify(formData)
        });
        
        showNotification('Booking updated successfully!', 'success');
        closeModal('edit-booking-modal');
        loadBookings();
    } catch (error) {
        console.error('Failed to update booking:', error);
    }
});

// Action functions
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) {
        return;
    }
    
    try {
        await apiCall(`/rooms/${roomId}`, { method: 'DELETE' });
        showNotification('Room deleted successfully!', 'success');
        loadRooms();
    } catch (error) {
        console.error('Failed to delete room:', error);
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        await apiCall(`/bookings/${bookingId}`, { method: 'DELETE' });
        showNotification('Booking cancelled successfully!', 'success');
        loadBookings();
    } catch (error) {
        console.error('Failed to cancel booking:', error);
    }
}

// Edit Room functionality
function editRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Room not found!', 'error');
        return;
    }

    // Populate the edit form
    document.getElementById('edit-room-id').value = room.id;
    document.getElementById('edit-room-name').value = room.name;
    document.getElementById('edit-room-capacity').value = room.capacity;
    document.getElementById('edit-room-floor').value = room.floorId;
    document.getElementById('edit-room-description').value = room.description || '';
    document.getElementById('edit-room-status').value = room.status;

    // Show the modal
    document.getElementById('edit-room-modal').style.display = 'block';
}

// Edit Booking functionality
function editBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        showNotification('Booking not found!', 'error');
        return;
    }

    // Populate the edit form
    document.getElementById('edit-booking-id').value = booking.id;
    document.getElementById('edit-booking-user').value = booking.user;
    document.getElementById('edit-booking-department').value = booking.departmentId || '';
    document.getElementById('edit-booking-purpose').value = booking.purpose || '';
    // Convert UTC times to local time for datetime-local inputs
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    document.getElementById('edit-booking-start').value = formatForInput(startDate);
    document.getElementById('edit-booking-end').value = formatForInput(endDate);
    document.getElementById('edit-booking-status').value = booking.status;

    // Populate room dropdown
    const roomSelect = document.getElementById('edit-booking-room');
    roomSelect.innerHTML = '<option value="">Select a room</option>';
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (Floor ${room.floor.number}) - Capacity: ${room.capacity}`;
        if (room.id === booking.roomId) {
            option.selected = true;
        }
        roomSelect.appendChild(option);
    });

    // Show the modal
    document.getElementById('edit-booking-modal').style.display = 'block';
}

// Quick action functions
async function quickChangeRoomStatus(roomId, status) {
    try {
        await apiCall(`/rooms/${roomId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        
        showNotification(`Room status changed to ${status}!`, 'success');
        loadRooms();
    } catch (error) {
        console.error('Failed to change room status:', error);
    }
}

async function quickCompleteBooking(bookingId) {
    try {
        await apiCall(`/bookings/${bookingId}/complete`, {
            method: 'PATCH'
        });
        
        showNotification('Booking completed successfully!', 'success');
        loadBookings();
    } catch (error) {
        console.error('Failed to complete booking:', error);
    }
}

async function quickCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        await apiCall(`/bookings/${bookingId}`, {
            method: 'DELETE'
        });
        
        showNotification('Booking cancelled successfully!', 'success');
        loadBookings();
    } catch (error) {
        console.error('Failed to cancel booking:', error);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadFloors();
    loadDepartments();
    
    // Set up periodic room status updates
    setInterval(updateRoomStatuses, 30000); // Update every 30 seconds
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

// Function to update room statuses
async function updateRoomStatuses() {
    try {
        await apiCall('/room-status/update', {
            method: 'POST'
        });
        
        // Reload rooms and dashboard to reflect status changes
        await loadRooms();
        await loadDashboard();
    } catch (error) {
        console.error('Failed to update room statuses:', error);
    }
}
