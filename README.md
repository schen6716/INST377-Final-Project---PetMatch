# INST377-Final-Project---PetMatch
# PetMatch Adoption Platform

## Description
PetMatch is a centralized platform connecting potential pet adopters with shelters and rescue organizations. The application allows users to search for adoptable pets based on various criteria (breed, age, location) and view detailed profiles of available animals.

## Target Browsers
- Desktop: Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Android Chrome

## Link to Developer Manual
[Developer Manual](#developer-manual)

## Developer Manual

### Installation
1. Clone the repository: `git clone [your-repo-url]`
2. Install dependencies: `npm install`
3. Create a `.env` file with your API keys:


### Running the Application
1. Start the server: `npm start`
2. Open `http://localhost:3000` in your browser

### Testing
Run tests with: `npm test`

### API Endpoints
#### GET /api/pets
- Returns a list of adoptable pets
- Parameters: 
- `location` (optional): Filter by location
- `type` (optional): Filter by pet type (dog, cat, etc.)

#### POST /api/favorites
- Saves a pet to user's favorites
- Requires:
- `petId`: ID of the pet to save
- `userId`: ID of the user

### Known Bugs & Future Development
- Known Issues:
- Pagination not fully implemented
- Mobile responsiveness needs improvement

- Roadmap:
- Implement user accounts
- Add messaging system between adopters and shelters
- Expand filter options