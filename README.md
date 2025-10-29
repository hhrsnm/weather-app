# ☀️ Weather App

This is a responsive weather application built using vanilla JavaScript, HTML, and CSS. It fetches current weather conditions and a multi-hour forecast by utilizing two different Google APIs for coordinate lookups and weather data. The app is designed for speed and reliability using modern asynchronous JavaScript techniques.

---

## 🖥️ Displayed Data & UI

The application features a clean, two-section layout that prioritizes scannability and key weather metrics.

### 1. Current Weather Box

This section provides an immediate overview of the current conditions:

* **Temperature:** Current temperature in degrees (Celsius).
* **Condition:** Human-readable weather type (e.g., **Clear**, **Rainy**, **Cloudy**).
* **Icon:** A dynamic icon corresponding to the current weather condition.
* **Humidity:** Current relative humidity percentage.
* **Wind Speed:** Current wind speed in kilometers per hour.

### 2. Hourly Forecast Cards

This section presents a short-term forecast, typically covering the next 4 hours.

* **Time:** The forecast time, converted to the searched city's local time zone.
* **Temperature:** The predicted temperature for that hour.
* **Icon:** The predicted weather icon for that hour.