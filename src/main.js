import './style.css';

const apiKey = import.meta.env.VITE_API_KEY;

//Use to convert city name to coordinates
async function fetchCityCoordinates(city) {
    try {
        if (city.trim() === '') throw new Error('Please enter a city name');
        //fetch coordinates
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${apiKey}`);

        //parse json
        const data = await response.json();

        //check if status is ok
        if (data.status !== "OK" || !response.ok) throw new Error('City not found');

        //extract lat and lng
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
    } catch (error) {
        alert(error);
        throw error;
    }
}

//Use to fetch weather data
async function fetchCurrentWeather(lat, lng) {
    try {
        //fetch current weather data
        const response = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}`);

        //check if response is ok
        if (!response.ok) throw new Error('Could not fetch current weather data');
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error);
        throw error;
    } 2
}

//Use to fetch hourly forecast data
async function fetchHourlyForecast(lat, lng) {
    try {
        //fetch hourly forecast data
        const response = await fetch(`https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&hours=5`);

        //check if response is ok
        if (!response.ok) throw new Error('Could not fetch hourly forecast data');
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error);
        throw error;
    }
}

//Weather Condition Checker
function weatherCondition(condition) {
    condition = condition.toUpperCase();
    switch (true) {
        case condition.includes('CLEAR'):
            return 'Clear';
        case condition.includes('CLOUDY'):
            return 'Cloudy';
        case condition.includes('WINDY'):
            return 'Windy';
        case condition.includes('THUNDERSTORM'):
            return 'Thunderstorm';
        case condition.includes('SNOW') || condition.includes('HAIL'):
            return 'Snowy';
        case condition.includes('RAIN') || condition.includes('SHOWERS'):
            return 'Rainy';
        default:
            return 'Unknown';
    }
}

function formatToLocalTime(time, timezone) {
    time = new Date(time);
    return time.toLocaleString('en-US', {
        timeStyle: 'short',
        hour12: false,
        timeZone: timezone,
    });
}
//Use to display current weather data
function displayCurrentWeather(data) {
    //Select DOM elements
    const conditionIconBox = document.querySelector('.weather-box .weather .condition-box img');
    const conditionTextBox = document.querySelector('.weather-box .weather h2.condition');
    const temperatureBox = document.querySelector('.weather-box .weather .temp span');
    const humidityBox = document.querySelector('.weather-box .weather .extra-box .humidity span');
    const windSpeedBox = document.querySelector('.weather-box .weather .extra-box .wind-speed span');

    //Update DOM elements with data
    conditionIconBox.src = `src/assets/${weatherCondition(data.weatherCondition.type).toLowerCase()}.png`;
    conditionTextBox.textContent = `${weatherCondition(data.weatherCondition.type)}`;
    temperatureBox.textContent = `${data.temperature.degrees}`;
    humidityBox.textContent = `${data.relativeHumidity}`;
    windSpeedBox.textContent = `${data.wind.speed.value}`;
}

//Use to display hourly forecast data
function displayHourlyForecast(data) {
    //Select DOM elements
    const hourlyForecastCard = document.querySelectorAll('.hourly-forecast-box .card');
    hourlyForecastCard.forEach((card, index) => {
        const tempBox = card.querySelector('.temp span');
        const conditionIconBox = card.querySelector('.condition-box img');
        const timeBox = card.querySelector('.time');

        //Get hourly forecast data
        const forecastData = data.forecastHours[index + 1];

        //Update DOM elements with data
        tempBox.textContent = forecastData.temperature.degrees;
        conditionIconBox.src = `src/assets/${weatherCondition(forecastData.weatherCondition.type).toLowerCase()}.png`;
        timeBox.textContent = formatToLocalTime(forecastData.interval.startTime, data.timeZone.id);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
            const [currentWeatherData, hourlyForecastData] = await Promise.all([
                fetchCurrentWeather(lat, lng),
                fetchHourlyForecast(lat, lng)
            ]);
            
            document.startViewTransition(() => {
                displayCurrentWeather(currentWeatherData);
                displayHourlyForecast(hourlyForecastData);
            });
        }
        catch (error) {
            console.error('Error fetching weather data:', error);
        }
    });

    //Add event listener to search button
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', async (e) => {
        const cityInputBox = document.querySelector('#city-input');
        const city = cityInputBox.value;

        try {
            const { lat, lng } = await fetchCityCoordinates(city);

            const [currentWeatherData, hourlyForecastData] = await Promise.all([
                fetchCurrentWeather(lat, lng),
                fetchHourlyForecast(lat, lng)
            ]);

            document.startViewTransition(() => {
                displayCurrentWeather(currentWeatherData);
                displayHourlyForecast(hourlyForecastData);
            });
        }
        catch (error) {
            cityInputBox.value = '';
        }
    });
});