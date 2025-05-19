console.log("app.js loaded");

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

async function loadFeaturedPets() {
  const container = document.getElementById('featured-pets-container');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading pets...</p>';
  const pets = await fetchData('/api/pets?limit=6');

  if (!pets) {
    container.innerHTML = '<p class="no-results">Failed to load pets. Please try again.</p>';
    return;
  }

  if (pets.length === 0) {
    container.innerHTML = '<p class="no-results">No pets available at this time.</p>';
    return;
  }

  container.innerHTML = '';
  pets.forEach(pet => createPetCard(pet, container));
}

function createPetCard(pet, container) {
  const card = document.createElement('div');
  card.className = 'pet-card';

  const photoUrl = pet.photos?.[0]?.url || 'placeholder.jpg';

  card.innerHTML = `
    <img src="${photoUrl}" alt="${pet.name}" onerror="this.src='placeholder.jpg'">
    <div class="pet-info">
      <h3>${pet.name || 'Unnamed Pet'}</h3>
      <p class="pet-meta">${pet.breed || 'Unknown breed'} • ${pet.age || 'Unknown age'}</p>
      <p class="pet-location">${pet.location || 'Location not specified'}</p>
      <button class="view-btn" data-id="${pet.id}">View Details</button>
    </div>
  `;

  container.appendChild(card);
}

function setupSearchForm() {
  const searchForm = document.getElementById('search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('pet-type').value;
    const location = document.getElementById('location').value;

    if (!type && !location) {
      alert("Please enter at least one search criteria");
      return;
    }

    window.location.href = `search.html?type=${encodeURIComponent(type)}&location=${encodeURIComponent(location)}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedPets();
  setupSearchForm();

  const container = document.getElementById('featured-pets-container');
  if (container) {
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-btn')) {
        const petId = e.target.dataset.id;
        window.location.href = `pet-details.html?id=${petId}`;
      }
    });
  }
});