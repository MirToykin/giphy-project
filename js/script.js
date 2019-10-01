let apiKey = 'xttvZ1Z1SnbXsD7xJB7kWsX7oTqeqZWY';
let trendLength = 20;
let giphyAPI = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${trendLength}`;
let trendSlidesContainer = document.querySelector('.trending__slides');
let trendSliderWidth = document.querySelector('.trending__slider-window').offsetWidth;
let trendSlidesWidths = []; // в каждом элементе массива 
//будет храниться ширина картинки + ее margin
let slideMarginRight = 10;
let slideHeight = 150;
let sliderOffset = 0;
let previousOffset = 0;
let trendIndex = 0;


function showTrendingGifs() {
  fetch(giphyAPI)
  .then(response => response.json())
  .then(json => {
    for (let i = 0; i < trendLength; i++) {
      let img = document.createElement('img');
      img.src = json.data[i].images.original.url;
      img.className = 'trending__slide';
      trendSlidesContainer.append(img);
      let coef = json.data[i].images.original.width/json.data[i].images.original.height;
      trendSlidesWidths.push(coef);
    }
    trendSlidesWidths = trendSlidesWidths.map((item => item * slideHeight + slideMarginRight));
    document.onclick = function() {
      scroll(getSliderOffset());
    }
    
  })
  .catch(err => console.log(err.message))
}

function getSliderOffset() {
  for (let i = trendIndex; i < trendSlidesWidths.length; i++) {
    if (sliderOffset + trendSlidesWidths[i] > trendSliderWidth) {

      sliderOffset -= trendSlidesWidths[i - 1];
      trendSliderWidth += sliderOffset - previousOffset;
      previousOffset = sliderOffset;
      trendIndex = i - 1;
      return sliderOffset;
      
    } else if (i == trendSlidesWidths.length - 1 && sliderOffset + trendSlidesWidths[i] <= trendSliderWidth) {

    }
    sliderOffset += trendSlidesWidths[i];
  }
}
function scroll(offset) {
  trendSlidesContainer.style.left = -offset + 'px';
}
showTrendingGifs();

// ___________________________поисковая выдача__________________________

