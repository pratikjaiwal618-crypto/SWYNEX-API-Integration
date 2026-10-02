# SWYNEX API Integration — GlobeScope

## Task 3
GlobeScope is a responsive country explorer built with HTML, CSS and JavaScript.

### Features
- REST Countries API v5
- Secure local browser API-key input (key is not included in GitHub code)
- Loads up to all available free-plan country records using pagination
- Real country flag images
- Search
- Region filter
- Population/name sorting
- Country details modal
- Loading and error states
- Refresh
- Light/dark theme
- Responsive desktop/tablet/mobile layout

### Official API
https://restcountries.com/docs/countries

The current Countries API uses:
`https://api.restcountries.com/countries/v5`

Requests use:
`Authorization: Bearer YOUR_API_KEY`

The free plan supports up to 100 records per request, so the app automatically requests additional pages when `data.meta.more` is true.

### Run
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Right-click `index.html` → Open with Live Server.
4. Paste your REST Countries API key into the **API Connection** box.
5. Click **Save & Connect**.
6. Search for **India** to verify the API.
7. Test filters, sorting, View details, Refresh and mobile layout.

### Security
The API key is stored only in browser localStorage and is NOT hard-coded in this repository. Never paste your private API key into GitHub or send it in chat.

### Flag images
The app first uses the API's `flag.url_png`. If unavailable, it uses the official REST Countries flag CDN based on the ISO alpha-2 code.

### SWYNEX
Recommended repository name:
`SWYNEX-API-Integration`
