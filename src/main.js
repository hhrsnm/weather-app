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
        const locationName = data.results[0].formatted_address;
        return { lat, lng, locationName };
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
    }
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
function displayCurrentWeather(data, locationName) {
    //Select DOM elements
    const locationBox = document.querySelector('.weather-box .location');
    const conditionIconBox = document.querySelector('.weather-box .weather .condition-box img');
    const conditionTextBox = document.querySelector('.weather-box .weather h2.condition');
    const temperatureBox = document.querySelector('.weather-box .weather .temp span');
    const humidityBox = document.querySelector('.weather-box .weather .extra-box .humidity span');
    const windSpeedBox = document.querySelector('.weather-box .weather .extra-box .wind-speed span');

    //Update DOM elements with data
    locationBox.textContent = `${locationName}`;
    conditionIconBox.src = `/assets/${weatherCondition(data.weatherCondition.type).toLowerCase()}.png`;
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
        conditionIconBox.src = `/assets/${weatherCondition(forecastData.weatherCondition.type).toLowerCase()}.png`;
        timeBox.textContent = formatToLocalTime(forecastData.interval.startTime, data.timeZone.id);
    });
}

//Function to fetch and display weather data
async function fetchAndDisplayWeather(city) {
    const { lat, lng, locationName } = await fetchCityCoordinates(city);
    const [currentWeatherData, hourlyForecastData] = await Promise.all([
        fetchCurrentWeather(lat, lng),
        fetchHourlyForecast(lat, lng)
    ]);

    document.startViewTransition(() => {
        displayCurrentWeather(currentWeatherData, locationName);
        displayHourlyForecast(hourlyForecastData);
    });
}

//Loader Animations Functions
function showLoader() {
    document.querySelector('.weather-box').style.visibility = 'hidden';
    document.querySelector('.loader').style.display = 'flex';
}
function hideLoader() {
    document.querySelector('.weather-box').style.visibility = 'visible';
    document.querySelector('.loader').style.display = 'none';
}

//Main
document.addEventListener('DOMContentLoaded', async () => {
    //Fetch default city's weather data on load
    try {
        await fetchAndDisplayWeather('New York');
    } catch (error) {
        console.warn(error);
    }
    finally {
        hideLoader();
    }

    //Add event listener to search button
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', async (e) => {
        const cityInputBox = document.querySelector('#city-input');
        const city = cityInputBox.value;
        showLoader();

        try {
            await fetchAndDisplayWeather(city);
            cityInputBox.value = '';
        }
        catch (error) {
            cityInputBox.value = '';
        }
        finally {
            hideLoader();
        }
    });
});