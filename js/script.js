let apiKey = 'xttvZ1Z1SnbXsD7xJB7kWsX7oTqeqZWY';

// ___________________________Карусель с трендовыми gif__________________________

let trendLength = 20;
let trendGiphyAPI = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${trendLength}`;
// let trendGiphyAPI = `https://api.giphy.com/v1/gifs/MZoBUfHfHcMz6D6t3n?api_key=${apiKey}`;


let trendSlidesContainer = document.querySelector('.trending__slides');
let forwardBtn = document.querySelector('.trending__btn--forward'),
    backBtn = document.querySelector('.trending__btn--back');

let trendSliderWidth = document.querySelector('.trending__slider-window').offsetWidth;;
let visibleSliderWidth = trendSliderWidth;;

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
      img.src = json.data[i].images.fixed_height.url;
      img.setAttribute('data-title', json.data[i].title);
      img.setAttribute('data-id', json.data[i].id);
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
let requestString;

let searchGiphyAPI = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&limit=${searchLimit}`;

let searchForm = document.querySelector('.search__form'),
    searchField = document.querySelector('.search__query-field'),
    searchResultHeader = document.querySelector('.search-results__header'),
    serchResultsContainer = document.querySelector('.search-results__container'),
    showMoreBtn = document.querySelector('.search-results__show-more'),
    searchResultCols = document.querySelectorAll('.search-results__col'),
    searchResultCol1 = document.querySelector('.search-results__col--1'),
    searchResultCol2 = document.querySelector('.search-results__col--2'),
    searchResultCol3 = document.querySelector('.search-results__col--3'),
    searchResultCol4 = document.querySelector('.search-results__col--4'),
    searchResultCol5 = document.querySelector('.search-results__col--5');

function showSearchResults(event) {
  event.preventDefault();
  
  if (searchField.value == '') {
    alert('Введите запрос!');
    searchField.focus();
    return;
  }

  requestString = searchField.value;
  
  queryString = `&q=${requestString}`;
  requestGifs(queryString, '', event.target);

}

function requestGifs(queryString, stringOffset, target) {
  let i = 0,
      currentCol = 0;

  fetch(searchGiphyAPI + queryString + stringOffset)
  .then(response => response.json())
  .then(json => {
    for (i; i < searchLimit; i++) {

      let img = document.createElement('img');
      img.src = json.data[i].images.fixed_height.url;
      
      if (i == 0 && stringOffset == '') {

        for (let i = 0; i < searchResultCols.length; i++) {
          while (searchResultCols[i].firstChild) {
            searchResultCols[i].removeChild(searchResultCols[i].firstChild);
          }
        }

        searchResultHeader.style.display = 'none';
        showMoreBtn.style.display = 'none';
        
      }

      img.className = 'search-results__item';
      img.setAttribute('data-title', json.data[i].title);
      img.setAttribute('data-id', json.data[i].id);
      // serchResultsContainer.append(img);
      if (currentCol == searchResultCols.length) currentCol = 0;
      searchResultCols[currentCol].append(img);

      currentCol++;

    }

    if (target == searchForm) {
      showSerchResultsContainerElements(true);
    }
    
  })
  .catch( (error) => {
    console.log(error.message);
    if (i == 0 && target == searchForm) {
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
  searchResultHeader.textContent = 'Результаты по запросу: ' + requestString;
  searchField.value = '';
}

function showMoreGifs(event) {
  searchOffset += searchLimit;

  let stringOffset = `&offset=${searchOffset}`;

  requestGifs(`&q=${searchResultHeader.textContent.slice(23)}`, stringOffset, event.target) // 'Результаты по запросу: ' - 23 символа (крайний индекс 22), с 23 идет текст запроса
}

function getSearchResultsItemMarginBottom() {

  let searchResultsItems = document.querySelectorAll('.search-results__item'),
      widthOfCol = serchResultsContainer.offsetWidth * 0.192; // 19.2% ширина колонки

  if (searchResultsItems.length != 0) {

    if (serchResultsContainer.offsetWidth < 1000) {
      let mb = (serchResultsContainer.offsetWidth - widthOfCol * 5)/4 + 'px'; // 5 - кол-во колонок, 4 - кол-во промежутков между колонками.

      for (let i = 0; i < searchResultsItems.length; i++) {
        searchResultsItems[i].style.marginBottom = mb;
      }      
    } else {

      if (getComputedStyle(searchResultsItems[0]).marginBottom != '0.625em') {

        for (let i = 0; i < searchResultsItems.length; i++) {
          searchResultsItems[i].style.marginBottom = '0.625em';
        }

      }

    }

  }

}

searchForm.addEventListener('submit', showSearchResults);
showMoreBtn.addEventListener('click', showMoreGifs);
window.addEventListener('resize', getSearchResultsItemMarginBottom);

// ___________________________Прикрепление формы поиска к верху окна__________________________

let searchDiv = document.querySelector('.search');
let topOfsearchForm = searchForm.getBoundingClientRect().top;
let isHandled = false;

function setTopWindowWidth() {
  let topWindow = document.querySelector('.topWindow');
  if (!topWindow) return;
  topWindow.style.width = getComputedStyle(document.querySelector('.trending__header')).width;
}

function setSearchDivWidth() {
  let documentWidth = document.documentElement.clientWidth;
  
  if (documentWidth <= 480) {
    searchDiv.style.width = '100%';
  }
}

window.addEventListener('resize', setTopWindowWidth);
window.addEventListener('resize', setSearchDivWidth);
window.addEventListener('scroll', () => {
  let windowScroll = pageYOffset;

  if (windowScroll > topOfsearchForm) {
    
    searchDiv.classList.add('topWindow');
    setTopWindowWidth();
    
  } else {
    
    searchDiv.classList.remove('topWindow');
    searchDiv.style.width = '100%';

  }
});



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
    let gifId = event.target.getAttribute('data-id');
    let idGiphyApi = `https://api.giphy.com/v1/gifs/${gifId}?api_key=${apiKey}`;
    
    fetch(idGiphyApi)
    .then(response => response.json())
    .then(json => {
      let fullScreenImgHeight = +json.data.images.original.height;
      let fullScreenImgWidth = +json.data.images.original.width;
      
      fullScreenImg = document.createElement('img')
      fullScreenImg.src = json.data.images.original.url;
      fullScreenImg.className = 'full-screen__img';
      fullScreenTitle.textContent = event.target.getAttribute('data-title') == '' ? 'БЕЗ НАЗВАНИЯ' : event.target.getAttribute('data-title').toUpperCase();
      
      let coef = fullScreenImgWidth / fullScreenImgHeight;
    
      fullScreenImg.height = fullScreenImgHeight > 400 ? 400 : fullScreenImgHeight;
      fullScreenImg.width = fullScreenImg.height * coef; 

      fullScreenPopup.style.height = fullScreenImg.height + 50 + 'px';
      fullScreenPopup.style.width = fullScreenImg.width + 'px';

      fullScreenImgWrap.append(fullScreenImg);
      document.body.style.overflow = 'hidden';

      fullScreenCloseBtn.addEventListener('click', (event) => {

        fullScreenImg.remove();
        fullScreen.style.display = 'none';
        document.body.style.overflow = '';
        fullScreenPopup.style.height = 0;

      });
      
    })
    .catch( () => {
      alert('Изображение не найдено!')
    })

  }
}

main.addEventListener('click', enlargeImage);