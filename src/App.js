import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCity, setLastCity] = useState("");

  const API_KEY = "baafa7b40bbfb9de729f56357e802f2d";

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    // Particle animation (unchanged)
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");

    let particles = [];
    const numParticles = 50;
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function createParticles() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 3 + 1,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5
        });
      }
    }
    createParticles();

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      update();
      requestAnimationFrame(draw);
    }

    function update() {
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
      });
    }

    draw();
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getWeather = async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;
    if (trimmedCity.toLowerCase() === lastCity.toLowerCase()) return; // Avoid re-fetch if same city

    try {
      setError("");
      setLoading(true);
      setWeather(null);
      setForecast([]);

      // Fetch both at once
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&units=metric&appid=${API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${trimmedCity}&units=metric&appid=${API_KEY}`
        )
      ]);

      if (!currentRes.ok) throw new Error("City not found");
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setWeather(currentData);
      const dailyData = forecastData.list.filter((_, idx) => idx % 8 === 0);
      setForecast(dailyData);
      setLastCity(trimmedCity);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <canvas id="particles"></canvas>
      <div className="app">
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <h1 className="title">Weather App</h1>
        <div className="search-form">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
          />
          <button onClick={getWeather}>Search</button>
        </div>

        {loading && <p className="loading">Loading weather...</p>}
        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-widget">
            <h2>{weather.name}</h2>
            <p className="desc">{weather.weather[0].description}</p>
            <p>{Math.round(weather.main.temp)}°C</p>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast-container">
            {forecast.map((day, i) => (
              <div key={i} className="forecast-card">
                <p>
                  {new Date(day.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short"
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>{Math.round(day.main.temp)}°C</p>
                <p className="desc">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
