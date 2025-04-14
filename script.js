const API_KEY = '75d133666b5b4c2392083556251404';
const BASE_URL = 'http://api.weatherapi.com/v1/current.json';

// 주요 도시들의 위치 정보
const cities = [
    { name: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.9780 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
    { name: 'Delhi', country: 'IN', lat: 28.7041, lng: 77.1025 },
    { name: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173 },
    { name: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
    { name: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },
    { name: 'Rome', country: 'IT', lat: 41.9028, lng: 12.4964 },
    { name: 'Madrid', country: 'ES', lat: 40.4168, lng: -3.7038 }
];

// 날씨 코드에 따른 이모지 매핑
const emojiMap = {
    '01d': '☀️', // 맑은 날
    '01n': '🌙', // 맑은 밤
    '02d': '⛅', // 약간 흐린 낮
    '02n': '☁️', // 약간 흐린 밤
    '03d': '☁️', // 흐린 날
    '03n': '☁️', // 흐린 밤
    '04d': '☁️', // 매우 흐린 날
    '04n': '☁️', // 매우 흐린 밤
    '09d': '🌧️', // 가벼운 비
    '09n': '🌧️', // 가벼운 비
    '10d': '🌦️', // 비
    '10n': '🌧️', // 비
    '11d': '⛈️', // 뇌우
    '11n': '⛈️', // 뇌우
    '13d': '❄️', // 눈
    '13n': '❄️', // 눈
    '50d': '🌫️', // 안개
    '50n': '🌫️'  // 안개
};

let map;
let markers = [];

// 샘플 날씨 기록 데이터
const sampleWeatherHistory = [
    { time: '09:00', temp: 22, weather: '☀️', humidity: 45 },
    { time: '12:00', temp: 25, weather: '⛅', humidity: 40 },
    { time: '15:00', temp: 24, weather: '🌤️', humidity: 42 },
    { time: '18:00', temp: 21, weather: '🌥️', humidity: 48 },
    { time: '21:00', temp: 19, weather: '☁️', humidity: 52 }
];

// 지도 초기화
function initMap() {
    map = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 도시 마커 추가
    cities.forEach(city => {
        const marker = L.marker([city.lat, city.lng])
            .addTo(map)
            .bindPopup(`<div class="popup-content">${city.name}</div>`);
        
        marker.on('click', () => {
            document.getElementById('cityInput').value = city.name;
            getWeather();
        });
        
        markers.push(marker);
    });
}

// 현재 날짜와 시간을 포맷팅하는 함수
function formatDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('ko-KR', options);
}

// 날씨 기록 테이블 업데이트
function updateWeatherHistory() {
    const historyTable = document.getElementById('weatherHistory');
    historyTable.innerHTML = '';
    
    sampleWeatherHistory.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.time}</td>
            <td>${record.temp}°C</td>
            <td>${record.weather}</td>
            <td>${record.humidity}%</td>
        `;
        historyTable.appendChild(row);
    });
}

// 날씨 정보 가져오기
async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('도시 이름을 입력해주세요');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&aqi=no`);
        const data = await response.json();

        if (response.ok) {
            updateWeatherUI(data);
            updateWeatherHistory(); // 날씨 기록 업데이트
            // 해당 도시의 마커로 지도 이동
            const cityData = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
            if (cityData) {
                map.setView([cityData.lat, cityData.lng], 5);
            }
        } else {
            throw new Error(data.error.message);
        }
    } catch (error) {
        alert('날씨 정보를 가져오는데 실패했습니다: ' + error.message);
    }
}

// UI 업데이트
function updateWeatherUI(data) {
    const location = document.getElementById('location');
    const date = document.getElementById('date');
    const temperature = document.getElementById('temperature');
    const weatherEmoji = document.getElementById('weatherEmoji');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const clouds = document.getElementById('clouds');
    const description = document.getElementById('description');

    // 위치 정보 업데이트
    location.textContent = `${data.location.name}, ${data.location.country}`;
    
    // 날짜 업데이트
    const currentDate = new Date(data.location.localtime);
    date.textContent = currentDate.toLocaleDateString('ko-KR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 온도 업데이트
    temperature.textContent = Math.round(data.current.temp_c);

    // 날씨 이모지 업데이트
    const weatherCode = data.current.condition.code;
    weatherEmoji.textContent = getWeatherEmoji(weatherCode);

    // 상세 정보 업데이트
    humidity.textContent = `${data.current.humidity}%`;
    wind.textContent = `${data.current.wind_kph} km/h`;
    clouds.textContent = `${data.current.cloud}%`;
    description.textContent = data.current.condition.text;
}

// 날씨 코드에 따른 이모지 반환
function getWeatherEmoji(code) {
    const emojiMap = {
        1000: '☀️', // 맑음
        1003: '⛅', // 약간 흐림
        1006: '☁️', // 흐림
        1009: '☁️', // 흐림
        1030: '🌫️', // 안개
        1063: '🌦️', // 비 조금
        1066: '🌨️', // 눈 조금
        1069: '🌨️', // 진눈깨비
        1072: '🌨️', // 진눈깨비
        1087: '⛈️', // 뇌우
        1114: '🌨️', // 눈
        1117: '🌨️', // 눈보라
        1135: '🌫️', // 안개
        1147: '🌫️', // 안개
        1150: '🌧️', // 이슬비
        1153: '🌧️', // 이슬비
        1168: '🌧️', // 이슬비
        1171: '🌧️', // 이슬비
        1180: '🌦️', // 비 조금
        1183: '🌧️', // 비
        1186: '🌧️', // 비
        1189: '🌧️', // 비
        1192: '🌧️', // 비
        1195: '🌧️', // 비
        1198: '🌧️', // 비
        1201: '🌧️', // 비
        1204: '🌨️', // 진눈깨비
        1207: '🌨️', // 진눈깨비
        1210: '🌨️', // 눈
        1213: '🌨️', // 눈
        1216: '🌨️', // 눈
        1219: '🌨️', // 눈
        1222: '🌨️', // 눈
        1225: '🌨️', // 눈
        1237: '🌨️', // 눈
        1240: '🌦️', // 비 조금
        1243: '🌧️', // 비
        1246: '🌧️', // 비
        1249: '🌨️', // 진눈깨비
        1252: '🌨️', // 진눈깨비
        1255: '🌨️', // 눈
        1258: '🌨️', // 눈
        1261: '🌨️', // 진눈깨비
        1264: '🌨️', // 진눈깨비
        1273: '⛈️', // 뇌우
        1276: '⛈️', // 뇌우
        1279: '⛈️', // 뇌우
        1282: '⛈️'  // 뇌우
    };

    return emojiMap[code] || '❓';
}

// 페이지 로드 시 초기 날씨 기록 표시
document.addEventListener('DOMContentLoaded', () => {
    updateWeatherHistory();
});

// 엔터 키로 검색 가능하도록 설정
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// 초기 로드 시 지도 초기화 및 서울 날씨 표시
window.addEventListener('load', () => {
    initMap();
    document.getElementById('cityInput').value = 'Seoul';
    getWeather();
});
