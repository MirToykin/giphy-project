let apiKey = 'xttvZ1Z1SnbXsD7xJB7kWsX7oTqeqZWY';

// ___________________________Карусель с трендовыми gif__________________________

let trendLength = 20;
let trendGiphyAPI = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${trendLength}`;

let trendSlidesContainer = document.querySelector('.trending__slides');
let forwardBtn = document.querySelector('.trending__btn--forward'),
    backBtn = document.querySelector('.trending__btn--back');

let trendSliderWidth = document.querySelector('.trending__slider-window').offsetWidth;
let visibleSliderWidth = trendSliderWidth;
let trendSlidesWidths = [];  // в каждом элементе массива 
//будет храниться ширина картинки + ее margin
let allSlidesWidth;

let slideMarginRight = 10;
let slideHeight = 150;

let forwardOffset = 0,
    backOffset = 0,
    lastOffset;

let trendIndex = 0;

let btnTransitionTime = parseFloat(getComputedStyle(document.querySelector('.trending__btn')).transitionDuration) * 1000;


function showTrendingGifs() {
  fetch(trendGiphyAPI)
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
    
    allSlidesWidth = trendSlidesWidths.reduce((sum, current) => sum + current, 0);
    
    forwardBtn.onclick = function() {
      scroll(getForwardOffset());

      if (getComputedStyle(backBtn).display == 'none') {
        backBtn.style.display = 'block';
        backBtn.style.opacity = '1';
      }
    }

    backBtn.onclick = function() {
      scroll(getBackOffset());

      if (getComputedStyle(forwardBtn).display == 'none') {
        forwardBtn.style.display = 'block';
        forwardBtn.style.opacity = '1';
      }
    }
    
  })
  .catch(err => alert(err.message))
}

function getForwardOffset() {
  lastOffset = forwardOffset;
  
  for (let i = trendIndex; i < trendLength; i++) {
    
    if (forwardOffset + trendSlidesWidths[i] > trendSliderWidth) {
      if (isLastScroll(i - 1, trendSlidesWidths, visibleSliderWidth)) {

        forwardOffset = lastOffset;
        trendSliderWidth = allSlidesWidth;
        
        forwardBtn.style.opacity = '0';
        
        setTimeout(() => {
          forwardBtn.style.display = 'none';
        }, btnTransitionTime);
        
        return allSlidesWidth - visibleSliderWidth;
        
      } else {
        
        forwardOffset -= trendSlidesWidths[i - 1];
        trendSliderWidth = forwardOffset + visibleSliderWidth;
        trendIndex = i - 1;
        return forwardOffset;
        
      }
      
    } 
    forwardOffset += trendSlidesWidths[i];
  }
}

function getBackOffset() {
  let delIndex = trendIndex;
  
  // if (forwardOffset == 0) return;
  
  if (trendSliderWidth == allSlidesWidth) { // последний слайд по 
  //правому краю окна слайдера
    trendSliderWidth = forwardOffset + visibleSliderWidth;
    return lastOffset;
  }
  
  for (let i = trendIndex; i >= 0; i--) {
    
    if (backOffset + trendSlidesWidths[i] > visibleSliderWidth) {

      backOffset -= trendSlidesWidths[delIndex];
      forwardOffset -= backOffset;
      trendSliderWidth = forwardOffset + visibleSliderWidth;
      trendIndex = i + 1;
      backOffset = 0;
      return forwardOffset;

    } else if (i == 0 && backOffset + trendSlidesWidths[i] <= visibleSliderWidth ) {

      forwardOffset = 0;
      trendSliderWidth = visibleSliderWidth;
      backOffset = 0;
      trendIndex = 0;
      
      backBtn.style.opacity = '0';
      
      setTimeout(() => {
        backBtn.style.display = 'none';
      }, btnTransitionTime)
      
      return forwardOffset;

    }
    backOffset += trendSlidesWidths[i];
  }
  
}

function isLastScroll(index, iterable, width) {
  if (index < 0) return;
  
  let iterableWidth = 0;
  
  for (let i = index; i < iterable.length; i++) {
    iterableWidth += iterable[i];
  }
  
  if (iterableWidth <= width) {
    return true;
  }
  
  return false;
}

function scroll(offset) {
  trendSlidesContainer.style.left = -offset + 'px';
}
showTrendingGifs();

// ___________________________форма поиска и поисковая выдача__________________________

let searchLimit = 20,
    searchOffset = 20;

let searchGiphyAPI = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&limit=${searchLimit}`;

let searchForm = document.querySelector('.search__form'),
    searchField = document.querySelector('.search__query-field'),
    serchResultsContainer = document.querySelector('.search-results__container');

searchForm.addEventListener('submit', showSearchResults);

function showSearchResults(event) {
  event.preventDefault();

  let queryString = `&q=${searchField.value}`;
  

      fetch(searchGiphyAPI + queryString)
      .then(response => response.json())
      .then(json => {
        for (let i = 0; i < searchLimit; i++) {

          let img = document.createElement('img');
          img.src = json.data[i].images.original.url;
          img.className = 'search-results__item';
          serchResultsContainer.append(img);

        }
        
        
      })
      .catch(err => alert(err.message))

}
// идея: вынести кнопки управления за окноо слайдера, при наведении делать их фон полупрозрачным, 
// чтобы показать часть следующего изображения, возможно придется сузить окно слайдера
