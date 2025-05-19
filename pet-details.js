document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');
  
    if (!petId) {
      window.location.href = 'index.html';
      return;
    }
  
    await loadPetDetails(petId);
  });
  
  async function loadPetDetails(petId) {
    const loadingElement = document.getElementById('pet-loading');
    const contentElement = document.getElementById('pet-content');
  
    try {
      const pet = await fetchData(`/api/pets?limit=100`);
      const selectedPet = pet?.find(p => p.id === petId);
      if (!selectedPet) throw new Error('Pet not found');
  
      document.getElementById('pet-name').textContent = selectedPet.name;
      document.getElementById('pet-breed').textContent = selectedPet.breed;
      document.getElementById('pet-age').textContent = selectedPet.age;
      document.getElementById('pet-gender').textContent = selectedPet.gender;
      document.getElementById('pet-location').textContent = selectedPet.location;
      document.getElementById('pet-description').textContent = selectedPet.description;
  
      const photosContainer = document.getElementById('pet-photos');
      photosContainer.innerHTML = '';
  
      if (selectedPet.photos.length > 0) {
        selectedPet.photos.forEach(photo => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.innerHTML = `<img src="${photo.url}" alt="${selectedPet.name}">`;
          photosContainer.appendChild(slide);
        });
      } else {
        photosContainer.innerHTML = `
          <div class="swiper-slide">
            <img src="placeholder.jpg" alt="No photo available">
          </div>
        `;
      }
  
      new Swiper('.swiper-container', {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      });
  
      if (selectedPet.shelterId) {
        const shelter = await fetchData(`/api/shelters/${selectedPet.shelterId}`);
        if (shelter) {
          const shelterElement = document.getElementById('shelter-details');
          shelterElement.innerHTML = `
            <h4>${shelter.name}</h4>
            ${shelter.address ? `<p>${shelter.address}<br>${shelter.city}, ${shelter.state} ${shelter.zip}</p>` : ''}
            ${shelter.phone ? `<p>Phone: ${shelter.phone}</p>` : ''}
            ${shelter.email ? `<p>Email: ${shelter.email}</p>` : ''}
            ${shelter.website ? `<p>Website: <a href="${shelter.website}" target="_blank">${shelter.website}</a></p>` : ''}
            ${shelter.about ? `<div class="shelter-about"><p>${shelter.about}</p></div>` : ''}
          `;
        }
      }
  
      loadingElement.classList.add('hidden');
      contentElement.classList.remove('hidden');
    } catch (error) {
      loadingElement.innerHTML = `
        <p class="error">Error loading pet details.</p>
        <a href="index.html" class="btn">Return to Home</a>
      `;
      console.error('Error loading pet details:', error);
    }
  }
  
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