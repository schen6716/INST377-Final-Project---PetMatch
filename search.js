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

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || '';
    const location = params.get('location') || '';
  
    if (type) document.getElementById('pet-type').value = type;
    if (location) document.getElementById('location').value = location;
  
    await performSearch(type, location);
  });
  
  async function performSearch(type, location) {
    const container = document.getElementById('pets-container');
    const mapElement = document.getElementById('map');
  
    container.innerHTML = '<p class="loading">Searching for pets...</p>';
    let query = '';
    if (type) query += `type=${encodeURIComponent(type)}&`;
    if (location) query += `location=${encodeURIComponent(location)}&`;
  
    const pets = await fetchData(`/api/pets?${query}limit=20`);
  
    if (!pets || pets.length === 0) {
      container.innerHTML = '<p class="no-results">No pets found matching your criteria.</p>';
      return;
    }
  
    container.innerHTML = '';
    pets.forEach(pet => {
      const card = createPetCard(pet);
      container.appendChild(card);
      card.querySelector('.view-btn').addEventListener('click', () => {
        window.location.href = `pet-details.html?id=${pet.id}`;
      });
    });
  
    if (mapElement && typeof L !== 'undefined') {
      initMap(pets);
    }
  }
  
  function createPetCard(pet) {
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
  
    return card;
  }
  
  function initMap(pets) {
    const map = L.map('map').setView([39.8283, -98.5795], 4);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    pets.forEach(pet => {
      if (pet.location && pet.location.includes(',')) {
        const [city, state] = pet.location.split(',').map(s => s.trim());
        const coords = getApproximateCoordinates(state);
        L.marker(coords).addTo(map).bindPopup(`<b>${pet.name}</b><br>${pet.breed}<br>${pet.location}`);
      }
    });
  }
  
  function getApproximateCoordinates(state) {
    const stateCoords = {
      'CA': [36.7783, -119.4179],
      'TX': [31.9686, -99.9018],
      'NY': [43.2994, -74.2179],
      'FL': [27.6648, -81.5158],
      'IL': [40.6331, -89.3985]
    };
    return stateCoords[state] || [39.8283, -98.5795];
  }