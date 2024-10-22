// URLs das APIs
const weatherApiUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=0313d39117e818dd945043a1cc830e8b&units=metric&q=';
const geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
const geoApiKey = '0313d39117e818dd945043a1cc830e8b';

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
        const response = await fetch(`${weatherApiUrl}&q=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (data && data.main) {
            displayWeatherData(data);
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
        const response = await fetch(`${geoApiUrl}${encodeURIComponent(city)}&appid=${geoApiKey}`);
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
    view.setCenter(ol.proj.fromLonLat([lon, lat])); // Corrigido para lon, lat
    view.setZoom(10);
}

// Função para exibir dados da previsão do tempo
function displayWeatherData(weather) {
    document.getElementById('city-name').textContent = weather.name; // Atualizado para usar 'name'
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(); // Data atual
    document.getElementById('temp-current').textContent = weather.main.temp; // Temperatura atual
    document.getElementById('temp-max').textContent = weather.main.temp_max; // Máxima
    document.getElementById('temp-min').textContent = weather.main.temp_min; // Mínima
    document.getElementById('weather-description').textContent = weather.weather[0].description; // Descrição do clima
    document.getElementById('rain-prob').textContent = 'N/A'; // Dados de chuva podem não estar disponíveis
    document.getElementById('moon-phase').textContent = 'N/A'; // Dados da fase da lua não disponíveis

    // Ícones
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`; // Ícone do clima
    document.getElementById('moon-icon').src = ''; // Não disponível

    // Previsão (não implementado aqui, você pode adicionar se necessário)
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
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = show ? 'flex' : 'none';
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
