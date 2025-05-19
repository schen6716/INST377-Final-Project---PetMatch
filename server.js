require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'active',
    env: {
      API_KEY_SET: !!process.env.RESCUE_GROUPS_API_KEY
    }
  });
});

// Pets endpoint
app.get('/api/pets', async (req, res) => {
    try {
      const { limit = 6, type, location } = req.query;
      
      const response = await axios.post('https://api.rescuegroups.org/v5/public/animals/search', {
        data: {
          filters: [
            { fieldName: "animalStatus", operation: "equals", criteria: "Available" },
            ...(type ? [{ fieldName: "animalSpecies", operation: "equals", criteria: type }] : []),
            ...(location ? [{ fieldName: "animalLocationDistance", operation: "radius", criteria: { miles: 25, postalcode: location } }] : [])
          ],
          limit: parseInt(limit)
        }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESCUE_GROUPS_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 10000
      });
  
      const pets = response.data.data.map(animal => ({
        id: animal.id,
        name: animal.attributes.name || 'Unknown',
        type: animal.attributes.species,
        breed: animal.attributes.breedPrimary || 'Mixed',
        age: animal.attributes.ageGroup || 'Unknown',
        gender: animal.attributes.sex,
        description: animal.attributes.descriptionText || 'No description available',
        photos: animal.relationships.pictures?.data?.map(pic => ({
          id: pic.id,
          url: `https://rescuegroups.org${pic.attributes.original.url}`
        })) || [],
        shelterId: animal.relationships.orgs?.data[0]?.id,
        location: animal.attributes.locationCitystate || 'Location not specified'
      }));
  
      res.json(pets);
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch pets' });
    }
  });

// Shelter details
app.get('/api/shelters/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://api.rescuegroups.org/v5/public/orgs/${req.params.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RESCUE_GROUPS_API_KEY}`
      }
    });

    const org = response.data.data;
    res.json({
      id: org.id,
      name: org.attributes.name,
      email: org.attributes.email,
      phone: org.attributes.phone,
      address: org.attributes.street,
      city: org.attributes.city,
      state: org.attributes.state,
      zip: org.attributes.postalcode,
      website: org.attributes.website,
      about: org.attributes.about
    });
  } catch (error) {
    console.error('Failed to fetch shelter details:', error.message);
    res.status(500).json({ error: 'Failed to fetch shelter details' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});