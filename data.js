async function loadRentalHistory() {
  try {
      const res = await fetch('http://localhost:5000/api/rentals');
      const rentals = await res.json();

      const rentalsList = document.getElementById('rentalsList');
      rentalsList.innerHTML = rentals
          .map(rental => `
              <div class="rental-card">
                  <p><strong>Name:</strong> ${rental.name}</p>
                  <p><strong>Phone:</strong> ${rental.phone}</p>
                  <p><strong>Email:</strong> ${rental.email}</p>
                  <p><strong>Date:</strong> ${rental.rentalDate}</p>
                  <p><strong>Days:</strong> ${rental.numberOfDays}</p>
              </div>
          `)
          .join('');
  } catch (err) {
      console.error('Failed to load rentals:', err);
  }
}

// Ensure this runs when the browser window has loaded
window.onload = loadRentalHistory;