// URLs das APIs
const weatherApiUrl = 'https://api.hgbrasil.com/weather?key=SUA_CHAVE';
const geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
const geoApiKey = 'SUA_CHAVE_GEOCODING';

// Inicialização do mapa com OpenLayers
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-47.9292, -15.7801]), // Centro inicial no Brasil
    zoom: 4,
  }),
});

// Função para buscar previsão do tempo
async function fetchWeatherData(city) {
  try {
    showLoadingIndicator(true);
    const response = await fetch(`${weatherApiUrl}&city_name=${city}`);
    const data = await response.json();
    if (data && data.results) {
      displayWeatherData(data.results);
      cacheCity(city);
    } else {
      alert('Cidade não encontrada. Tente novamente.');
    }
  } catch (error) {
    alert('Erro ao buscar dados da previsão do tempo. Verifique sua conexão.');
  } finally {
    showLoadingIndicator(false);
  }
}

// Função para buscar coordenadas da cidade
async function fetchCityCoordinates(city) {
  try {
    showLoadingIndicator(true);
    const response = await fetch(`${geoApiUrl}${city}&appid=${geoApiKey}`);
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      moveMapToCity(lat, lon);
    } else {
      alert('Localização não encontrada. Verifique o nome da cidade.');
    }
  } catch (error) {
    alert('Erro ao buscar coordenadas da cidade. Verifique sua conexão.');
  } finally {
    showLoadingIndicator(false);
  }
}

// Função para mover o mapa para a cidade encontrada
function moveMapToCity(lat, lon) {
  const view = map.getView();
  view.setCenter(ol.proj.fromLonLat([lon, lat]));
  view.setZoom(10);
}

// Função para exibir dados da previsão do tempo
function displayWeatherData(weather) {
  document.getElementById('city-name').textContent = weather.city;
  document.getElementById('current-date').textContent = weather.date;
  document.getElementById('temp-current').textContent = weather.temp;
  document.getElementById('temp-max').textContent = weather.forecast[0].max;
  document.getElementById('temp-min').textContent = weather.forecast[0].min;
  document.getElementById('weather-description').textContent = weather.description;
  document.getElementById('rain-prob').textContent = weather.rain_prob;
  document.getElementById('moon-phase').textContent = weather.moon_phase;

  // Ícones
  document.getElementById('weather-icon').src = `url_do_icone_clima_${weather.condition_slug}.png`;
  document.getElementById('moon-icon').src = `url_do_icone_lua_${weather.moon_phase}.png`;

  displayForecast(weather.forecast);
}

// Função para exibir previsão dos próximos 3 dias
function displayForecast(forecast) {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = ''; // Limpa previsões anteriores
  forecast.slice(1, 4).forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.innerHTML = `
      <p>Data: ${day.date}</p>
      <p>Máxima: ${day.max}°C, Mínima: ${day.min}°C</p>
      <p>Clima: ${day.description}</p>
      <p>Chuva: ${day.rain_probability}%</p>
    `;
    forecastDiv.appendChild(dayDiv);
  });
}

// Função para cachear cidades consultadas
function cacheCity(city) {
  const savedCities = document.getElementById('saved-cities');
  if (![...savedCities.options].some(option => option.value === city)) {
    const option = document.createElement('option');
    option.value = city;
    option.text = city;
    savedCities.add(option);
  }
}

// Função para mostrar/ocultar indicador de carregamento
function showLoadingIndicator(show) {
  const loadingIndicator = document.getElementById('loading-indicator'); // Elemento para o indicador
  loadingIndicator.style.display = show ? 'block' : 'none';
}

// Evento do botão de consulta
document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('city-input').value.trim();
  if (city) {
    fetchCityCoordinates(city);
    fetchWeatherData(city);
    document.getElementById('city-input').value = ''; // Limpa o campo após a busca
  } else {
    alert('Por favor, insira o nome de uma cidade.');
  }
});

// Evento para carregar cidades cacheadas
document.getElementById('saved-cities').addEventListener('change', (e) => {
  const city = e.target.value;
  if (city) {
    fetchCityCoordinates(city);
    fetchWeatherData(city);
  }
});
