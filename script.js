const BASE_URL = "https://678f630149875e5a1a919da0.mockapi.io/";

// State management
let cars = [];
let rentals = [];
const carImages = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1600",
  "https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=1600",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600",
];

// API calls
async function fetchCars() {
  try {
    const response = await fetch(`${BASE_URL}/cars`);
    cars = await response.json();
    updateDashboard();
    renderCars();
  } catch (error) {
    console.error("Error fetching cars:", error);
    alert("Failed to load cars. Please try again.");
  }
}

async function fetchRentals() {
  try {
    const response = await fetch(`${BASE_URL}/rentalData`);
    rentals = await response.json();
    renderRentals();
  } catch (error) {
    console.error("Error fetching rentals:", error);
    alert("Failed to load rentals. Please try again.");
  }
}

async function addCarAPI(carData) {
  try {
    const response = await fetch(`${BASE_URL}/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding car:", error);
    throw new Error("Failed to add car");
  }
}

async function updateCarAPI(carId, carData) {
  try {
    const response = await fetch(`${BASE_URL}/cars/${carId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating car:", error);
    throw new Error("Failed to update car");
  }
}

async function deleteCarAPI(carId) {
  try {
    await fetch(`${BASE_URL}/cars/${carId}`, { method: "DELETE" });
  } catch (error) {
    console.error("Error deleting car:", error);
    throw new Error("Failed to delete car");
  }
}

async function addRentalAPI(rentalData) {
  try {
    const response = await fetch(`${BASE_URL}/rentalData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rentalData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding rental:", error);
    throw new Error("Failed to add rental");
  }
}

async function deleteRentalAPI(rentalId) {
  try {
    await fetch(`${BASE_URL}/rentalData/${rentalId}`, { method: "DELETE" });
  } catch (error) {
    console.error("Error deleting rental:", error);
    throw new Error("Failed to delete rental");
  }
}

// UI Functions
function updateDashboard() {
  document.getElementById("totalCars").textContent = cars.length;
  document.getElementById("availableCars").textContent = cars.filter(car => car.available).length;
  document.getElementById("rentedCars").textContent = cars.filter(car => !car.available).length;
}

function renderCars() {
  const carGrid = document.getElementById("carGrid");
  if (!carGrid) return;

  const filter = document.getElementById("availabilityFilter")?.value || "all";
  const filtered = cars.filter(car =>
    filter === "available" ? car.available : filter === "rented" ? !car.available : true
  );

  carGrid.innerHTML = filtered.length
    ? filtered.map(car => `
      <div class="car-card">
        <img src="${car.image}" alt="${car.model}" onerror="this.src='${carImages[0]}'">
        <div class="car-info">
          <h3>${car.model}</h3>
          <p class="price">$${car.price} per day</p>
          <p class="status ${car.available ? "available" : "rented"}">
            ${car.available ? "● Available" : "● Currently Rented"}
          </p>
          <div class="car-actions">
            <button onclick="${car.available ? `rentCar('${car.id}')` : `returnCar('${car.id}')`}" class="${car.available ? "rent-btn" : "return-btn"}">
              ${car.available ? "Rent Now" : "Return Car"}
            </button>
            <button onclick="deleteCar('${car.id}')" class="delete-btn"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join("")
    : '<p class="no-results">No cars available.</p>';
}

function renderRentals() {
  const list = document.getElementById("rentalsList");
  if (!list) return;
  list.innerHTML = rentals.map(r => `
    <div class="rental-item">
      <div class="rental-info">
        <h3>${r.carModel}</h3>
        <p>Customer: ${r.customerName}</p>
        <p>Phone: ${r.phoneNumber}</p>
        <p>Email: ${r.email}</p>
        <p>Rental Date: ${r.rentalDate}</p>
        <p>Duration: ${r.numberOfDays} days</p>
        <p>Total Price: $${r.totalPrice}</p>
      </div>
      <button onclick="deleteRental('${r.id}')" class="delete-btn">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join("");
}

async function deleteRental(rentalId) {
  if (confirm("Delete this rental record?")) {
    try {
      await deleteRentalAPI(rentalId);
      await fetchRentals();
    } catch {
      alert("Failed to delete rental");
    }
  }
}

// Auth
function validateLogin(e) {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user === "demo" && pass === "1234") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "index.html";
  } else {
    alert("Invalid credentials!");
  }
}

function checkLogin() {
  if (!localStorage.getItem("isLoggedIn") && !location.href.includes("login.html")) {
    location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  location.href = "login.html";
}

// Car operations
async function addCar(e) {
  e.preventDefault();
  const model = document.getElementById("carModel").value;
  const image = document.getElementById("carImage").value || carImages[Math.floor(Math.random() * carImages.length)];
  const price = Number(document.getElementById("carPrice").value);

  try {
    await addCarAPI({ model, image, price, available: true });
    alert(`Car "${model}" added successfully!`);
    e.target.reset();
    closeModal();
    await fetchCars();
  } catch {
    alert("Failed to add car.");
  }
}

function showAddCarModal() {
  document.getElementById("addCarModal").style.display = "block";
}

function closeModal() {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

function rentCar(carId) {
  const car = cars.find(c => c.id === carId);
  if (!car) return;
  if (car.available) {
    const modal = document.getElementById("rentCarModal");
    const form = document.getElementById("rentCarForm");
    form.dataset.carId = carId;
    form.dataset.carPrice = car.price;
    modal.querySelector("h2").innerHTML = `<i class="fas fa-key"></i> Rent ${car.model}`;
    modal.style.display = "block";
  } else {
    returnCar(carId);
  }
}

async function processRental(e) {
  e.preventDefault();
  const f = e.target;
  const carId = f.dataset.carId;
  const car = cars.find(c => c.id === carId);
  if (!car) return;

  const rental = {
    carId,
    carModel: car.model,
    customerName: f.querySelector('[placeholder="Enter customer name"]').value,
    phoneNumber: f.querySelector('[placeholder="Enter phone number"]').value,
    email: f.querySelector('[placeholder="Enter email address"]').value,
    rentalDate: f.querySelector('input[type="date"]').value,
    numberOfDays: parseInt(f.querySelector('[placeholder="Enter number of days"]').value),
  };
  rental.totalPrice = rental.numberOfDays * car.price;
  rental.status = "active";

  try {
    await addRentalAPI(rental);
    await updateCarAPI(carId, { ...car, available: false });
    alert("Rental processed successfully!");
    f.reset();
    closeModal();
    await Promise.all([fetchCars(), fetchRentals()]);
  } catch {
    alert("Rental failed.");
  }
}

async function deleteCar(carId) {
  if (confirm("Delete this car?")) {
    try {
      await deleteCarAPI(carId);
      alert("Car deleted");
      await fetchCars();
    } catch {
      alert("Delete failed");
    }
  }
}

async function returnCar(carId) {
  const car = cars.find(c => c.id === carId);
  if (!car) return;
  if (confirm(`Return ${car.model}?`)) {
    try {
      await updateCarAPI(carId, { ...car, available: true });
      alert("Car returned");
      await Promise.all([fetchCars(), fetchRentals()]);
    } catch {
      alert("Return failed");
    }
  }
}

function searchCars() {
  const term = document.getElementById("searchCars").value.toLowerCase();
  const filter = document.getElementById("availabilityFilter").value;
  const filtered = cars.filter(c => c.model.toLowerCase().includes(term) && (filter === "all" || (filter === "available" ? c.available : !c.available)));
  renderFilteredCars(filtered);
}

function renderFilteredCars(filtered) {
  const carGrid = document.getElementById("carGrid");
  if (!carGrid) return;
  carGrid.innerHTML = filtered.map(car => `
    <div class="car-card">
      <img src="${car.image}" alt="${car.model}" onerror="this.src='${carImages[0]}'">
      <div class="car-info">
        <h3>${car.model}</h3>
        <p class="price">$${car.price} per day</p>
        <p class="status ${car.available ? "available" : "rented"}">${car.available ? "● Available" : "● Rented"}</p>
        <div class="car-actions">
          <button onclick="${car.available ? `rentCar('${car.id}')` : `returnCar('${car.id}')`}" class="${car.available ? "rent-btn" : "return-btn"}">
            ${car.available ? "Rent Now" : "Return Car"}
          </button>
          <button onclick="deleteCar('${car.id}')" class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join("");
}

function redirectToCars() {
  window.location.href = "cars.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  await Promise.all([fetchCars(), fetchRentals()]);
  document.getElementById("addCarForm")?.addEventListener("submit", addCar);
  document.getElementById("rentCarForm")?.addEventListener("submit", processRental);
  document.getElementById("searchCars")?.addEventListener("input", searchCars);
  document.getElementById("availabilityFilter")?.addEventListener("change", searchCars);
});

window.onclick = (e) => {
  if (e.target.className === "modal") closeModal();
};
