var searchBtnEl = document.querySelector('#searchBtn');             
var cityListContainerEl = document.querySelector('#cityList');                                                           
var cityWeatherObject = {                                         
    cityName: "",                                                 
    current: {
        date: "",
        iconURL: "",
        temp: "",
        humidity: "",
        windspeed: "",
        uvi: ""
    },
    dailyArray: [{date: "", iconURL: "", temp: "", humidity: ""},   
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""},
    {date: "", iconURL: "", temp: "", humidity: ""}]
}


var buttonClickHandler = function (event) {
  event.preventDefault();
  var cityNameEl = document.querySelector('#cityName');                     

  cityName = cityNameEl.value.trim();      

  if (cityName) {
    cityName = toTitleCase(cityName);      
    getWeatherData(cityName);             
  } else {
    alert('Please enter a valid city name');
  }
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var listContainerClickHandler = function (event) {
    event.preventDefault();
    if (event.target.nodeName === "BUTTON") {
        cityName = event.target.innerHTML;
        cityWeatherObject = JSON.parse(localStorage.getItem(`${cityName}`));
        displayCurrentWeather();
        displayFiveDayForecast();
    }
}


function getWeatherData (cityName) {

    if (localStorage.getItem(`${cityName}`) !== null) {
        cityWeatherObject = JSON.parse(localStorage.getItem(`${cityName}`));
        displayCurrentWeather();
        displayFiveDayForecast();
    } else {
     
        var apiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=1d77611d2911792c9bea5a125b350d8f';

        fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
            response.json().then(function (data) {
            
                cityLat = data[0].lat;     
                cityLon = data[0].lon;      

                var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&units=imperial&exclude=minutely,hourly,alerts&appid=1d77611d2911792c9bea5a125b350d8f';
        
                fetch(apiUrl)
                    .then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {

                            setWeatherObjectVals(cityName, data.current, data.daily[0].uvi);
                            setFiveDayObjectVals(cityName, data.daily);
                            addCityToList(cityName);
                            localStorage.setItem(`${cityName}`, JSON.stringify(cityWeatherObject));
                            displayCurrentWeather();
                            displayFiveDayForecast();
                        });
                    } 
                    })
            });
            }
        })
    }
};


function addCityToList (cityName) {

    var buttonEl = document.createElement('button');
    buttonEl.classList = 'list-group-item list-group-item-action';
    buttonEl.textContent = cityName;
    cityListContainerEl.appendChild(buttonEl);
}


function setWeatherObjectVals (nameofCity, currentWeather, dailyUVI) {
    cityWeatherObject.cityName = nameofCity;
    cityWeatherObject.current.date = moment().format("MM/DD/YY");
    cityWeatherObject.current.iconURL = `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;
    cityWeatherObject.current.temp = "Temperature: " + currentWeather.temp + " \u00B0F";
    cityWeatherObject.current.humidity = "Humidity: " + currentWeather.humidity + "%";
    cityWeatherObject.current.windspeed = "Wind Speed: " + currentWeather.wind_speed + " MPH";
    cityWeatherObject.current.uvi = dailyUVI;
}

function setFiveDayObjectVals (nameofCity, dailyWeatherArray){

 
    for (var i = 1; i < 6; i++) {
        cityWeatherObject.dailyArray[i].date = moment.unix(dailyWeatherArray[i].sunset).format("MM/DD/YY");
        cityWeatherObject.dailyArray[i].iconURL = `http://openweathermap.org/img/w/${dailyWeatherArray[i].weather[0].icon}.png`;
        cityWeatherObject.dailyArray[i].temp = "Temp: " + dailyWeatherArray[i].temp.day + " \u00B0F";
        cityWeatherObject.dailyArray[i].humidity = "Humidity: " + dailyWeatherArray[i].humidity + "%";
    }
}


function displayCurrentWeather () {

    var divContainerEl = document.querySelector('#currentWeather');
    divContainerEl.innerHTML = "";  

    var divCardEl = document.createElement('div');
    divCardEl.classList = 'card';

    var divCardBodyEl = document.createElement('div');
    divCardBodyEl.classList = 'card-body';

    var cityNameDateEl = document.createElement('h3');
    cityNameDateEl.classList = 'card-title';
    var today = cityWeatherObject.current.date;
    cityNameDateEl.textContent = cityWeatherObject.cityName + " (" + today + ")";

    var imgIconEl = document.createElement('img');
    imgIconEl.setAttribute('src', cityWeatherObject.current.iconURL);

    var temperatureEl = document.createElement('p');
    temperatureEl.classList = 'card-text';
    temperatureEl.textContent = cityWeatherObject.current.temp;

    var humidityEl = document.createElement('p');
    humidityEl.classList = 'card-text';
    humidityEl.textContent = cityWeatherObject.current.humidity;

    var windSpeedEl = document.createElement('p');
    windSpeedEl.classList = 'card-text';
    windSpeedEl.textContent = cityWeatherObject.current.windspeed;

    var uvIndexEl = document.createElement('p');
    uvIndexEl.classList = 'card-text';
    uvIndexEl.textContent = "UV Index: ";
    var uvColorEl = document.createElement('span');

    if (cityWeatherObject.current.uvi <= 2) {
        uvColorEl.classList = 'bg-success p-2 text-white'; 
    } else if ((cityWeatherObject.current.uvi >= 2) && (cityWeatherObject.current.uvi < 6)) {
        uvColorEl.classList = 'bg-warning p-2 text-white';  
    } else {
        uvColorEl.classList = 'bg-danger p-2 text-white';  
    }
    uvColorEl.textContent = cityWeatherObject.current.uvi;

    divContainerEl.appendChild(divCardEl);
    divCardEl.appendChild(divCardBodyEl);
    divCardBodyEl.appendChild(cityNameDateEl);
    cityNameDateEl.appendChild(imgIconEl);
    divCardBodyEl.appendChild(temperatureEl);
    divCardBodyEl.appendChild(humidityEl);
    divCardBodyEl.appendChild(windSpeedEl);
    divCardBodyEl.appendChild(uvIndexEl);
    uvIndexEl.appendChild(uvColorEl);
};


function displayFiveDayForecast () {

    var fiveDayContainerRowEl = document.querySelector('#fiveDayContainerRow');
    var fiveDayForecastTitleEl = document.querySelector('#fiveDayForecastTitle');
    fiveDayContainerRowEl.innerHTML = "";
    fiveDayForecastTitleEl.innerHTML = "";
    
    var fiveDayTitleEl = document.createElement('h3');
    fiveDayTitleEl.textContent = "Five Day Forecast: ";
    fiveDayForecastTitleEl.appendChild(fiveDayTitleEl);

    for (var i = 1; i < 6; i++) {

        
        var displayDate = cityWeatherObject.dailyArray[i].date;

        var outerDivEl = document.createElement('div');
        outerDivEl.classList = 'col';
        
        var divCardEl = document.createElement('div');
        divCardEl.classList = 'card fiveDayWidth';

        var divCardBodyEl = document.createElement('div');
        divCardBodyEl.classList = 'card-body bg-primary text-white';

        var h5DateEl = document.createElement('h5');
        h5DateEl.classList = 'card-title';
        h5DateEl.textContent = displayDate;

        var imgIconEl = document.createElement('img');
        imgIconEl.setAttribute('src', cityWeatherObject.dailyArray[i].iconURL);

        var tempEl = document.createElement('p');
        tempEl.classList = 'card-text';
        tempEl.textContent = cityWeatherObject.dailyArray[i].temp;

        var humidEl = document.createElement('p');
        humidEl.classList = 'card-text';
        humidEl.textContent = cityWeatherObject.dailyArray[i].humidity;

        fiveDayContainerRowEl.appendChild(outerDivEl);
        outerDivEl.appendChild(divCardEl);
        divCardEl.appendChild(divCardBodyEl);
        divCardBodyEl.appendChild(h5DateEl);
        divCardBodyEl.appendChild(imgIconEl);
        divCardBodyEl.appendChild(tempEl);
        divCardBodyEl.appendChild(humidEl);

    }
};
searchBtnEl.addEventListener('click', buttonClickHandler);
cityListContainerEl.addEventListener('click', listContainerClickHandler);
