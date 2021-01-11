
// var mymap = L.map('mapid').setView([51.505, -0.09], 13);

var citySearch;
var APIkey = '&appid=b865f41381116a1623ed3e8d3d5517ce';
var weatherAPI = 'https://api.openweathermap.org/data/2.5/weather?';
var uviAPI = 'https://api.openweathermap.org/data/2.5/uvi?lat=';
var forecastAPI = 'https://api.openweathermap.org/data/2.5/forecast?q=';
var units = '&units=imperial';
var getWeatherIcon = 'http://openweathermap.org/img/wn/';
var searchHistoryArr = [];

$(document).ready(function () {
  init();

  function init() {
    search();
    $('#current-forecast').hide();
    $('#five-day-forecast-container').hide();
    $('#search-history-container').hide();
    $('#error-div').hide();
    displayHistory();
    clearHistory();
    clickHistory();
  }

  function search() {
    $('#submitResults').on('click', function () {
      citySearch = $('#search-input')
        .val()
        .trim();

      if (citySearch === '') {
        return;
      }
      $('#search-input').val('');
      getWeather(citySearch);
    });
  }

  function getWeather(search) {
    var queryURL = weatherAPI + 'q=' + search + units + APIkey;

    $.ajax({
      url: queryURL,
      method: 'GET',
      statusCode: {
        404: function () {
          $('#current-forecast').hide();
          $('#five-day-forecast-container').hide();
          $('#error-div').show();
        }
      }
    }).then(function (response) {
      $('#error-div').hide();
      $('#current-forecast').show();
      $('#five-day-forecast-container').show();

      var results = response;
      var name = results.name;
      var temperature = Math.floor(results.main.temp);
      var humidity = results.main.humidity;
      var windSpeed = results.wind.speed;
      var date = new Date(results.dt * 1000).toLocaleDateString('en-US');
      var weatherIcon = results.weather[0].icon;
      var weatherIconURL = getWeatherIcon + weatherIcon + '.png';

      storeHistory(name);

      $('#city-name').text(name + ' (' + date + ') ');
      $('#weather-image').attr('src', weatherIconURL);
      $('#temperature').html('<b>Temperature: </b>' + temperature + ' °F');
      $('#humidity').html('<b>Humidity: </b>' + humidity + '%');
      $('#wind-speed').html('<b>Wind Speed: </b>' + windSpeed + ' MPH');

      var lat = response.coord.lat;
      var lon = response.coord.lon;
      var uviQueryURL = uviAPI + lat + '&lon=' + lon + APIkey;

      $.ajax({
        url: uviQueryURL,
        method: 'GET'
      }).then(function (uviResponse) {
        var uviResults = uviResponse;
        var uvi = uviResults.value;
        $('#uv-index').html(
          '<b>UV Index: </b>' +
          '<span class="badge badge-pill badge-light" id="uvi-badge">' +
          uvi +
          '</span>'
        );
        if (uvi <= 3) {
          $('#uvi-badge').css('background-color', 'green');
        } else if (uvi <= 6) {
          $('#uvi-badge').css('background-color', 'yellow');
        } else if (uvi <= 8) {
          $('#uvi-badge').css('background-color', 'orange');
        } else if (uvi <= 11) {
          $('#uvi-badge').css('background-color', 'red');
        } else {
          $('#uvi-badge').css('background-color', 'blueviolet');
        }
      });

      var cityName = name;
      var countryCode = response.sys.country;
      var forecastQueryURL =
        forecastAPI + cityName + ',' + countryCode + units + APIkey;

      $.ajax({
        url: forecastQueryURL,
        method: 'GET'
      }).then(function (forecastResponse) {
        var forecastResults = forecastResponse;
        var forecastArr = [];

        for (var i = 5; i < 40; i += 8) {
          var forecastObj = {};
          var forecastResultsDate = forecastResults.list[i].dt_txt;
          var forecastDate = new Date(forecastResultsDate).toLocaleDateString(
            'en-US'
          );
          var forecastTemp = forecastResults.list[i].main.temp;
          var forecastHumidity = forecastResults.list[i].main.humidity;
          var forecastIcon = forecastResults.list[i].weather[0].icon;

          forecastObj['list'] = {};
          forecastObj['list']['date'] = forecastDate;
          forecastObj['list']['temp'] = forecastTemp;
          forecastObj['list']['humidity'] = forecastHumidity;
          forecastObj['list']['icon'] = forecastIcon;

          forecastArr.push(forecastObj);
        }

        for (var j = 0; j < 5; j++) {
          var forecastArrDate = forecastArr[j].list.date;
          var forecastIconURL =
            getWeatherIcon + forecastArr[j].list.icon + '.png';
          var forecastArrTemp = Math.floor(forecastArr[j].list.temp);
          var forecastArrHumidity = forecastArr[j].list.humidity;

          $('#date-' + (j + 1)).text(forecastArrDate);
          $('#weather-image-' + (j + 1)).attr('src', forecastIconURL);
          $('#temp-' + (j + 1)).text(
            'Temp: ' + Math.floor(forecastArrTemp) + ' °F'
          );
          $('#humidity-' + (j + 1)).text(
            'Humidity: ' + forecastArrHumidity + '%'
          );
        }
        $('#weather-container').show();
      });
    })
  }


$(document).ready(function () {

  let lng;
  let lat;
  let map;

  //original arrays

  let beach = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "16.7705° S, 145.6717° E", "43.4832° N, 1.5586° W", "4.3715° S, 55.8272° E", "43.2677° N, 6.6407° E"];
  let mountain = ["50.1163° N, 122.9574° W", "47.0502° N, 8.3093° E", "39.1911° N, 106.8175° W", "42.6287° N, 0.1127° W", "1.6650° S, 78.6589° W", "47.5622° N, 13.6493° E", "46.6406° N, 11.6849° E", "44.2795° N, 73.9799° W", "36.2710° N, 136.8986° E", "61.8350° N, 6.8066° E"];
  let city = ["48.8566° N, 2.3522° E", "41.9028° N, 12.4964° E", "51.5074° N, 0.1278° W", "40.7128° N, 74.0060° W", "13.7563° N, 100.5018° E", "22.3193° N, 114.1694° E", "25.2048° N, 55.2708° E", "1.3521° N, 103.8198°", "55.7558° N, 37.6173° E", "52.3676° N, 4.9041° E"];
  let countyside = ["44.4654° N, 72.6874° W", "56.6228° N, 6.0723° W", "8.5069° S, 115.2625° E", "54.0469° N, 6.1902° W", "", "", "", "", "", ""];

  //climate arrays
  let cBeach = ["50.2246° N, 3.7846° W", "43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E", "47.5622° N, 13.6493° E",];
  //let wBeach = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E"];
  let hBeach = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "16.7705° S, 145.6717° E", "4.3715° S, 55.8272° E"];
  let cMountain = ["50.1163° N, 122.9574° W", "47.0502° N, 8.3093° E", "39.1911° N, 106.8175° W", "42.6287° N, 0.1127° W", "47.5622° N, 13.6493° E", "46.6406° N, 11.6849° E", "44.2795° N, 73.9799° W", "36.2710° N, 136.8986° E", "61.8350° N, 6.8066° E"];
  //let wMountain = ["39.1911° N, 106.8175° W",];
  let hMountain = ["21.8733° N, 159.4542° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "4.3715° S, 55.8272° E", "1.6650° S, 78.6589° W",];
  let cCity = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E", "47.0502° N, 8.3093° E", "51.5074° N, 0.1278° W", "42.6287° N, 0.1127° W", "47.5622° N, 13.6493° E",];
  //let wCity = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E", "51.5074° N, 0.1278° W"];
  let hCity = ["22.9871° S, 43.2048° W", "1.6650° S, 78.6589° W", "47.5622° N, 13.6493° E"];
  let cCountry = ["50.2246° N, 3.7846° W", "47.5622° N, 13.6493° E", "46.6406° N, 11.6849° E", "44.2795° N, 73.9799° W", "36.2710° N, 136.8986° E", "61.8350° N, 6.8066° E"];
  //let wCountrry = ["43.2677° N, 6.6407° E"];
  let hCountry = ["4.3715° S, 55.8272° E", "47.5622° N, 13.6493° E", "46.6406° N, 11.6849° E", "44.2795° N, 73.9799° W", "36.2710° N, 136.8986° E"];
  //cost arrays
  let cheap = ["20.7370° N, 86.9688° W", "25.5070° N, 76.6321° W",];
  let budget = ["20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "22.9871° S, 43.2048° W"];
  let expensive = ["21.8733° N, 159.4542° W", "16.5414° S, 151.7376° W",];
  //things to do arrays
  let shopping = ["50.2246° N, 3.7846° W", "22.9871° S, 43.2048° W"];
  let nightlife = ["22.9871° S, 43.2048° W"];
  let liveMusic = ["20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W"];
  let museums = ["50.2246° N, 3.7846° W"];
  let hiking = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W"];
  let biking = ["21.8733° N, 159.4542° W", "50.2246° N, 3.7846° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W"];
  let romantic = ["20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "16.5414° S, 151.7376° W"];
  let waterAdventure = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W"];

  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: 8,
    });
  }
  let queryURL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=burgers%20NewSmyrnaBeach&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyBpsko6mY2gC8yhiv3pQsX0X2axGTXKrE0"
  // ajax request
  $.ajax({ url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(queryURL), method: 'GET' }).then(function (data) { console.log(data.contents) });
  initMap();

})


    // var unirest = require("unirest");

    // var req = unirest("GET", "https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php");

    // req.query({
    //     "location": "New York"
    // });

    // req.headers({
    //     "x-rapidapi-key": "fe2e4d049cmshb5133f4f7dbb862p1c13b1jsn15281d51fcfa",
    //     "x-rapidapi-host": "devru-latitude-longitude-find-v1.p.rapidapi.com",
    //     "useQueryString": true
    // });


    // req.end(function (res) {
    //     if (res.error) throw new Error(res.error);

    //     console.log(res.body);
    // });





























  let cBeach = ["50.2246° N, 3.7846° W", "43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E"];
  //let wBeach = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E"];
  let hBeach = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "16.7705° S, 145.6717° E", "4.3715° S, 55.8272° E"];
  let cMountain = ["50.1163° N, 122.9574° W", "47.0502° N, 8.3093° E", "39.1911° N, 106.8175° W", "42.6287° N, 0.1127° W",];
  //let wMountain = ["39.1911° N, 106.8175° W",];
  let hMountain = ["21.8733° N, 159.4542° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "4.3715° S, 55.8272° E"];
  let cCity = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E", "47.0502° N, 8.3093° E", "51.5074° N, 0.1278° W", "42.6287° N, 0.1127° W"];
  //let wCity = ["43.4832° N, 1.5586° W", "43.2677° N, 6.6407° E", "51.5074° N, 0.1278° W"];
  let hCity = ["22.9871° S, 43.2048° W"];
  let cCountry = ["50.2246° N, 3.7846° W"];
  //let wCountrry = ["43.2677° N, 6.6407° E"];
  let hCountry = ["4.3715° S, 55.8272° E"];

  

 
  
    let lng = "-34.397";

    let beach = ["21.8733° N, 159.4542° W", "20.7370° N, 86.9688° W", "50.2246° N, 3.7846° W", "25.5070° N, 76.6321° W", "16.5414° S, 151.7376° W", "22.9871° S, 43.2048° W", "16.7705° S, 145.6717° E", "43.4832° N, 1.5586° W", "4.3715° S, 55.8272° E", "43.2677° N, 6.6407° E"];
    let mountain = ["50.1163° N, 122.9574° W", "47.0502° N, 8.3093° E", "39.1911° N, 106.8175° W", "42.6287° N, 0.1127° W", "1.6650° S, 78.6589° W", "47.5622° N, 13.6493° E", "46.6406° N, 11.6849° E", "44.2795° N, 73.9799° W", "36.2710° N, 136.8986° E", "61.8350° N, 6.8066° E"];
    let city = ["48.8566° N, 2.3522° E", "41.9028° N, 12.4964° E", "51.5074° N, 0.1278° W", "40.7128° N, 74.0060° W", "13.7563° N, 100.5018° E", "22.3193° N, 114.1694° E", "25.2048° N, 55.2708° E", "1.3521° N, 103.8198°", "55.7558° N, 37.6173° E", "52.3676° N, 4.9041° E"];
    let countyside = ["44.4654° N, 72.6874° W", "56.6228° N, 6.0723° W", "8.5069° S, 115.2625° E", "54.0469° N, 6.1902° W", "", "", "", "", "", ""];





  
    

  

// 	// When users click or enter the search button app will start to browse the cities
//   $(".search-button").on("click", loadCityFromSearch);
  
//   function loadCityFromSearch(e) {
//     e.preventDefault();
    
//     let city = "";
//     city = $("#searchId").val();
//    //remove white space from both front and ends of cities

//     var cityTrim = city.trim();
    
//     if (
//       cityTrim !== "" &&
//       typeof cityTrim === "string" &&
//       cityTrim.toLowerCase().match(/^[a-z ]+$/)
//     ) {
//       // call function to display all city data
//       loadCityData(city);
//       $("#searchId").val("");
//     } else {
//       //remove the invalid input entered by user
//       $("#searchId").val("");
//       // send an error message through the placeholder attr
//       $("#searchId").removeAttr("placeholder");
//       //message through the modal
//       showModal("Invalid city", "Please enter a valid city name");
//       //	And class to change the placeholder color
//       $("#searchId").addClass("placeColor");
//     }
//   }
// })
// function loadCityWeather(activeCityData) {
// 	$("#icon").empty();
// 	//API key
// 	var key = "";
//   //HOW many Days forecast user wants? 2? 5?
  
// 	var days = 2;
	
// 	var queryUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${activeCityData.place_name}&days=${days}`;

// 	$.getJSON(queryUrl, function (json) {
// 		var cityName = json.location.name;
// 		var date = new Date(json.location.localtime).toDateString();
// 		var iconUrl = "https:" + json.forecast.forecastday[0].day.condition.icon;
// 		var uv = json.current.uv;

// 		//display the json data on the page
// 		$("#icon").append(`<img src="${iconUrl}">`);
// 		$("#current-city").html(`${cityName}`);
// 		$("#current-date").text(`${date}`);
// 		$("#temp").text(" " + json.current.temp_f + " °F");
// 		$("#humidity").text(" " + json.current.humidity + " %");
// 		$("#uv-index").text("  " + uv);
// 	});
// }
