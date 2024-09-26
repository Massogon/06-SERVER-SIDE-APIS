// Event listener for city search form submission
document.getElementById('city-search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior
    const city = document.getElementById('city-search').value.trim(); // Get city from input, trim spaces
    if (city) {
        getCoordinates(city)
            .then(coords => {
                // Use coordinates to fetch weather and forecast data
                return Promise.all([
                    fetchWeather(coords.latitude, coords.longitude),
                    fetchForecast(coords.latitude, coords.longitude)
                ]);
            })
            .then(([weatherData, forecastData]) => {
                // Display both current weather and forecast
                showWeatherData(weatherData);
                showForecastData(forecastData);
                saveCity(city); // Save city to history
                loadSavedCities(); // Update saved cities list
            })
            .catch(error => console.error('Error fetching data:', error)); // Handle any errors
    }
});

// OpenWeather API key
const apiKey = 'c40bc87fb6ed785048bfb31784923f48';

// Get coordinates for a given city
function getCoordinates(city) {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('City not found');
            }
            return { latitude: data[0].lat, longitude: data[0].lon };
        });
}

// Fetch current weather data
function fetchWeather(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    return fetch(apiUrl).then(response => response.json());
}

// Fetch 5-day forecast data
function fetchForecast(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    return fetch(apiUrl).then(response => response.json());
}

// Display current weather data
function showWeatherData(data) {
    const weatherCard = document.getElementById('current-weather-card');
    const iconCode = data.weather[0].icon; // Get the icon code from the API response
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`; // Construct the icon URL

    weatherCard.innerHTML = `
        <h3>${data.name} (Current)</h3>
        <img src="${iconUrl}" alt="${data.weather[0].description}">
        <p>Temperature: ${data.main.temp}°F</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} mph</p>
    `;
}

// Display 5-day forecast
function showForecastData(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Create an array to hold the forecasts for the next five days
    const dailyForecast = [];

    // Track which days have been processed
    const processedDates = new Set();

    // Loop through the forecast list and select one forecast per day, ideally the one closest to noon (12:00 PM)
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const hour = new Date(forecast.dt * 1000).getHours();

        // Only add the forecast if it's close to noon (between 11 AM and 1 PM) or it's the first forecast for the day
        if (hour >= 11 && hour <= 13 && !processedDates.has(date)) {
            dailyForecast.push(forecast);
            processedDates.add(date); // Mark this date as processed
        }
    });

    // If for some reason there are not exactly 5 forecasts, limit to 5
    dailyForecast.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const temp = forecast.main.temp;
        const condition = forecast.weather[0].description;
        const iconCode = forecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-item');
        forecastCard.innerHTML = `
            <h4>${date}</h4>
            <img src="${iconUrl}" alt="${condition}">
            <p>Temp: ${temp}°F</p>
            <p>${condition}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

// Save city to local storage
function saveCity(city) {
    const savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
    if (!savedCities.includes(city)) {
        savedCities.push(city);
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
    }
}

// Load saved cities and display them
function loadSavedCities() {
    const savedCitiesList = document.getElementById('saved-cities-list');
    savedCitiesList.innerHTML = ''; // Clear existing cities
    const savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
    savedCities.forEach(city => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.classList.add('city-btn');
        cityButton.addEventListener('click', () => {
            document.getElementById('city-search').value = city;
            document.getElementById('city-search-form').dispatchEvent(new Event('submit'));
        });
        savedCitiesList.appendChild(cityButton);
    });
}

// Load saved cities on page load
window.addEventListener('load', loadSavedCities);

// === Guess the Number Game ===
let randomNumber = Math.floor(Math.random() * 100) + 1;
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const resultMessage = document.getElementById('result-message');

guessButton.addEventListener('click', () => {
    const userGuess = parseInt(guessInput.value);
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        resultMessage.textContent = 'Enter a number between 1 and 100.';
        resultMessage.style.color = 'red';
    } else if (userGuess === randomNumber) {
        resultMessage.textContent = 'You got it!';
        resultMessage.style.color = 'green';
        guessButton.disabled = true;
    } else if (userGuess < randomNumber) {
        resultMessage.textContent = 'Too low!';
        resultMessage.style.color = 'orange';
    } else {
        resultMessage.textContent = 'Too high!';
        resultMessage.style.color = 'orange';
    }
});

// Function to reset the game
function resetGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    guessInput.value = '';
    guessButton.disabled = false;
    resultMessage.textContent = '';
}
