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
      img.setAttribute('data-title', json.data[i].title);
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

let searchLimit = 10,
    searchOffset = 0;

let queryString;

let searchGiphyAPI = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&limit=${searchLimit}`;

let searchForm = document.querySelector('.search__form'),
    searchField = document.querySelector('.search__query-field'),
    searchResultHeader = document.querySelector('.search-results__header'),
    serchResultsContainer = document.querySelector('.search-results__container'),
    showMoreBtn = document.querySelector('.search-results__show-more');

function showSearchResults(event) {
  event.preventDefault();
  
  if (searchField.value == '') {
    alert('Введите запрос!');
    searchField.focus();
    return;
  }
  
  queryString = `&q=${searchField.value}`;
  requestGifs(queryString, '');

}

function requestGifs(queryString, stringOffset) {
  let i = 0;
  fetch(searchGiphyAPI + queryString + stringOffset)
  .then(response => response.json())
  .then(json => {
    for (i; i < searchLimit; i++) {

      let img = document.createElement('img');
      img.src = json.data[i].images.original.url;
      
      if (i == 0 && stringOffset == '') {
        while (serchResultsContainer.firstChild) {
          serchResultsContainer.removeChild(serchResultsContainer.firstChild);
        }
        
        searchResultHeader.style.display = 'none';
        showMoreBtn.style.display = 'none';
        
      }

      img.className = 'search-results__item';
      img.setAttribute('data-title', json.data[i].title);
      serchResultsContainer.append(img);

    }

    showSerchResultsContainerElements(true);
  })
  .catch( () => {
    if (i == 0 && !serchResultsContainer.firstChild) {
      alert("Ничего не найдено!");
      searchField.value = '';
      searchField.focus();
    } else if (i == 0 && serchResultsContainer.firstChild || i != 0 && showMoreBtn.style.display == 'block') {
      showMoreBtn.style.display = 'none'; 
    } else {
      showSerchResultsContainerElements(false);
    }
  })
}

function showSerchResultsContainerElements(isFull) {
  if (isFull) {
    showMoreBtn.style.display = 'block';
  } else {
    showMoreBtn.style.display = 'none';
  }
  
  searchResultHeader.style.display = 'block';
  searchResultHeader.textContent = 'Результаты по запросу: ' + searchField.value;
  searchField.value = '';
}

function showMoreGifs() {
  searchOffset += searchLimit;

  let stringOffset = `&offset=${searchOffset}`;

  requestGifs(queryString, stringOffset)
}

searchForm.addEventListener('submit', showSearchResults);
showMoreBtn.addEventListener('click', showMoreGifs);

// ___________________________Прикрепление формы поиска к верху окна__________________________

let topOfsearchForm = searchForm.getBoundingClientRect().top;
window.addEventListener('scroll', () => {
  let windowScroll = pageYOffset;
  if (windowScroll > topOfsearchForm) {
    
    searchForm.classList.add('topWindow');
    searchField.classList.add('bgWhite');
    
  } else {
    
    searchForm.classList.remove('topWindow');
    searchField.classList.remove('bgWhite');
    
  }
})

// ___________________________увеличение изображения при клике__________________________

let main = document.querySelector('main');
let fullScreen = document.querySelector('.full-screen');
let fullScreenImgWrap = document.querySelector('.full-screen__img-wrap');
let fullScreenCloseBtn = document.querySelector('.full-screen__close-btn');
let fullScreenTitle = document.querySelector('.full-screen__title');
let fullScreenTitleHeight = parseInt(getComputedStyle(fullScreenTitle).height);
let fullScreenPopup = document.querySelector('.full-screen__popup');
let fullScreenImg;

function enlargeImage(event) {
  if (event.target.className == 'trending__slide' || event.target.className == 'search-results__item') {
  
    fullScreen.style.display = 'block';
    
    fullScreenImg = event.target.cloneNode();
    fullScreenImg.className = 'full-screen__img';
    
    fullScreenTitle.textContent = fullScreenImg.getAttribute('data-title') == '' ? 'БЕЗ НАЗВАНИЯ' : fullScreenImg.getAttribute('data-title').toUpperCase();
    let coef = fullScreenImg.width / fullScreenImg.height;
    
    fullScreenImg.height = fullScreenImg.height > 400 ? 400 : fullScreenImg.height;
    fullScreenImg.width = fullScreenImg.height * coef; 
    
    fullScreenPopup.style.height = fullScreenImg.height + 50 + 'px';
    fullScreenPopup.style.width = fullScreenImg.width + 'px';
    
    fullScreenImgWrap.append(fullScreenImg);
    document.body.style.overflow = 'hidden';
    
    fullScreenCloseBtn.addEventListener('click', (event) => {
      
      fullScreenImg.remove();
      fullScreen.style.display = 'none';
      document.body.style.overflow = '';
      
    });
  
  }
}

main.addEventListener('click', enlargeImage);