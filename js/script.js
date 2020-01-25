let apiKey = 'xttvZ1Z1SnbXsD7xJB7kWsX7oTqeqZWY';

let currentCol;

let searchForm = document.querySelector('.search__form');

//___________________________Вспомогательные функции___________________________
function getColIndex(cols) {
  for (let j = 0; j < cols.length - 1; j++) {
    if (cols[j].children.length > cols[j + 1].children.length && getComputedStyle(cols[j + 1]).display != 'none') return j + 1;
  }
  return 0;
}
        
function insertImages(cols, img) {
  if (getComputedStyle(cols[currentCol]).display != 'none') {
    cols[currentCol].append(img);
  } 
}

function setBlockHeight(cols, gifMarginBottom) {
  let blockHeight = 0;

  for (let i = 0; i < cols.length; i++) {
    if (getComputedStyle(cols[i]).display != 'none') {
      let gifsHeightSum = 0;
      let widthOfCol = cols[i].offsetWidth;
      for (let j = 0; j < cols[i].children.length; j++) {
        gifsHeightSum += widthOfCol / cols[i].children[j].getAttribute('data-coef');
        if (j != cols[i].children.length - 1) gifsHeightSum += gifMarginBottom;
      }
      if (gifsHeightSum > blockHeight) blockHeight = gifsHeightSum;
    }
  }
  
  return blockHeight;
}

// ___________________________Карусель с трендовыми gif__________________________
(() => {
  let trendLength = 20;
  let trendGiphyAPI = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${trendLength}`;

  let trendSlidesContainer = document.querySelector('.trending__slides');
  let trendSlidesContainerHeight;
  let forwardBtn = document.querySelector('.trending__btn--forward'),
      backBtn = document.querySelector('.trending__btn--back');
  let trendingHeader = document.querySelector('.trending__header');

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
  let trendingCols = document.querySelectorAll('.trending__col');
  let trendItemMarginBottom;
  let coef;

  let btnTransitionTime = parseFloat(getComputedStyle(document.querySelector('.trending__btn')).transitionDuration) * 1000;

  function getTrendingGifs() {
    let screenWidth = window.innerWidth;

    fetch(trendGiphyAPI)
    .then(response => response.json())
    .then(json => {
      for (let index = 0; index < trendLength; index++) {

        let img = document.createElement('img');
        img.src = json.data[index].images.fixed_height.url;
        img.setAttribute('data-title', json.data[index].title);
        img.setAttribute('data-id', json.data[index].id);
        img.className = 'trending__slide';
        coef = json.data[index].images.original.width/json.data[index].images.original.height;
        img.setAttribute('data-coef', coef);

        if (screenWidth <= 767) {
          currentCol = getColIndex(trendingCols);
          insertImages(trendingCols, img);
        } else {
          trendSlidesContainer.append(img);
        }

        trendSlidesWidths.push(coef * slideHeight + slideMarginRight);
      }

      setTrendingMobileMarginBottom();

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
  
  function setTrendingMobileMarginBottom() {
    if (window.innerWidth <= 767) {
      let trends = document.querySelectorAll('.trending__slide');

      if (getComputedStyle(trendingCols[2]).display == 'none') { // ширина экрана <= 480px
        for (let i = 0; i < trends.length; i++) {
          trendItemMarginBottom = trendSlidesContainer.offsetWidth * 0.01;
          trends[i].style.marginBottom = trendItemMarginBottom  + 'px';
        }
      } else {
        for (let i = 0; i < trends.length; i++) {
          trendItemMarginBottom = trendSlidesContainer.offsetWidth * 0.005;
          trends[i].style.marginBottom = trendItemMarginBottom  + 'px';
        }
      }
    }
  }
  
  function setTrendingHeader() {
    if (window.innerWidth <= 767) {
      if (getComputedStyle(trendSlidesContainer).height == '0px') {
        trendingHeader.textContent = 'Показать трендовые Gif';
      } else {
        trendingHeader.textContent = 'Скрыть трендовые Gif';
      }
      
      trendingHeader.addEventListener('click', handleClickAtTrendingHeader);
    } else {
      trendingHeader.removeEventListener('click', handleClickAtTrendingHeader);
      trendingHeader.textContent = 'Трендовые Gif';
    }
  }

  function handleClickAtTrendingHeader() {

    if (getComputedStyle(trendSlidesContainer).height == '0px') {

      trendSlidesContainerHeight = setBlockHeight(trendingCols, trendItemMarginBottom) + 'px';
      trendSlidesContainer.style.height = trendSlidesContainerHeight;
      trendingHeader.textContent = 'Скрыть трендовые Gif';
    } else {
      trendSlidesContainer.style.height = '0px';
      trendingHeader.textContent = 'Показать трендовые Gif';
    }
  }

  function resizeReplaceTrends() {

    if (window.innerWidth > 767) {
      trendSliderWidth = document.querySelector('.trending__slider-window').offsetWidth;
      visibleSliderWidth = trendSliderWidth;

      if (trendingCols[0].hasChildNodes() || trendingCols[1].hasChildNodes() || trendingCols[2].hasChildNodes()) { // переход с моб. версии на полноэкр.
        trendSlidesContainer.style.height = 'auto';

        let interval = setInterval(() => {
          trendSlidesWidths = []; // нужно заново заполнять массив ширин, т.к. после моб. вер. меняется порядок трендовых гиф.

          for (let i = 0; i < trendingCols.length; i++) {
            for (let j = 0; j < trendingCols[i].children.length; ) { // j не наращивается, т.к. длина коллекции постоянно убывает
              let trendImg = trendingCols[i].children[j];
              trendSlidesContainer.append(trendImg);
              trendSlidesWidths.push(trendImg.getAttribute('data-coef') * slideHeight + slideMarginRight);
            }
          }

          if (trendSlidesContainer.children.length == trendLength + 3) {
            clearInterval(interval); // + 3 т.к. детьми 
            // данного элемента помимо трендовых гиф являются еще 3 колонки, используемые в моб. версии
            return;
          } 
        }, 0);
      } else {
        return;
      }
    } else {
      if (trendSlidesContainer.children.length == 3) { // ресайз в пределах моб. версии
        if (getComputedStyle(trendingCols[2]).display == 'none' && trendingCols[2].hasChildNodes()) { // кол-во столбцов уменьшилось
          let interval = setInterval(() => {
            if (!trendingCols[2].hasChildNodes()) {
              clearInterval(interval);
              return;
            }
    
            let imgsForReplace = trendingCols[2].children;
        
            for (let i = 0; i < imgsForReplace.length; i++) {
    
              currentCol = getColIndex(trendingCols);
              insertImages(trendingCols, imgsForReplace[i]);
              trendSlidesContainerHeight = setBlockHeight(trendingCols, trendItemMarginBottom) + 'px';
    
              if (getComputedStyle(trendSlidesContainer).height != '0px') {
                trendSlidesContainer.style.height = trendSlidesContainerHeight;
              }
    
            }
          }, 0)
    
        } else if (getComputedStyle(trendingCols[2]).display == 'block' && !trendingCols[2].hasChildNodes()) { //кол-во столбцов увеличилось
          let numOfImgsToReplace = Math.floor(trendLength / 3); // 3 - кол-во столбцов после увеличения
    
          let interval = setInterval(() => {
            if (trendingCols[2].children.length == numOfImgsToReplace) {
              clearInterval(interval);
              return;
            }
    
            let col_0LastIndex = trendingCols[0].children.length - 1;
            let col_0NewLastIndex;
            let col_1LastIndex = trendingCols[1].children.length - 1;
            let col_1NewLastIndex;
    
            if (numOfImgsToReplace % 2 == 0) {
    
              col_0NewLastIndex = trendingCols[0].children.length - 1 - numOfImgsToReplace / 2;
              col_1NewLastIndex = trendingCols[1].children.length - 1 - numOfImgsToReplace / 2;
    
            } else {
    
              col_0NewLastIndex = trendingCols[0].children.length - 1 - Math.ceil(numOfImgsToReplace / 2);
              col_1NewLastIndex = trendingCols[1].children.length - 1 - Math.floor(numOfImgsToReplace / 2);
    
            }
    
            for (let i = col_0LastIndex; i >  col_0NewLastIndex; i--) {
              trendingCols[2].append(trendingCols[0].children[i]);
            }
    
            for (let i = col_1LastIndex; i >  col_1NewLastIndex; i--) {
              trendingCols[2].append(trendingCols[1].children[i]);
            }
    
            trendSlidesContainerHeight = setBlockHeight(trendingCols, trendItemMarginBottom) + 'px';
              
            if (getComputedStyle(trendSlidesContainer).height != '0px') {
              trendSlidesContainer.style.height = trendSlidesContainerHeight;
            }
          }, 0)
        } else {
          return;
        }
      } else {
        let trendGifs = document.querySelectorAll('.trending__slide');

        for (let i = 0; i < trendGifs.length; i++) {
          currentCol = getColIndex(trendingCols);
          insertImages(trendingCols, trendGifs[i]);
        }
      }
    }
  }
  
  setTrendingHeader();
  getTrendingGifs();
  window.addEventListener('resize', setTrendingMobileMarginBottom);
  window.addEventListener('resize', () => {
    trendSlidesContainerHeight = setBlockHeight(trendingCols, trendItemMarginBottom) + 'px';

    if (getComputedStyle(trendSlidesContainer).height != '0px' && trendSlidesContainer.children.length == 3) { // 3 - кол-во столбцов в моб. версии
      trendSlidesContainer.style.height = trendSlidesContainerHeight;
    }
  });
  window.addEventListener('resize', setTrendingHeader);
  window.addEventListener('resize', resizeReplaceTrends);

})();

// ___________________________форма поиска и поисковая выдача__________________________
(() => {
  let searchLimit = 10,
    searchOffset = 0;

  let queryString;
  let requestString;
  let coef;

  let searchGiphyAPI = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&limit=${searchLimit}`;

  let searchField = document.querySelector('.search__query-field'),
      searchResultHeader = document.querySelector('.search-results__header'),
      serchResultsContainer = document.querySelector('.search-results__container'),
      showMoreBtn = document.querySelector('.search-results__show-more'),
      searchResultCols = document.querySelectorAll('.search-results__col'),
      numOfVisibleCols = getNumOfVisibleCols(),
      searchResultsItemMarginBottom;

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
    serchResultsContainer.style.borderBottom = '1px solid #fff';

  }

  function clearCols(cols) {
    for (let j = 0; j < cols.length; j++) {
      while (cols[j].firstChild) {
        cols[j].removeChild(cols[j].firstChild);
      }
    }
  }

  function requestGifs(queryString, stringOffset, target) {
    let i = 0;

    fetch(searchGiphyAPI + queryString + stringOffset)
    .then(response => response.json())
    .then(json => {
      for (i; i < searchLimit; i++) {

        let img = document.createElement('img');
        img.src = json.data[i].images.fixed_height.url;

        if (i == 0 && stringOffset == '') {

          // for (let j = 0; j < searchResultCols.length; j++) {
          //   while (searchResultCols[j].firstChild) {
          //     searchResultCols[j].removeChild(searchResultCols[j].firstChild);
          //   }
          // }
          clearCols(searchResultCols);

          searchResultHeader.style.display = 'none';
          showMoreBtn.style.display = 'none';

        }

        img.className = 'search-results__item';
        img.setAttribute('data-title', json.data[i].title);
        img.setAttribute('data-id', json.data[i].id);
        coef = json.data[i].images.original.width/json.data[i].images.original.height;
        img.setAttribute('data-coef', coef);

        currentCol = getColIndex(searchResultCols);
        insertImages(searchResultCols, img);

      }
      setSearchResultsItemMarginBottom();
      // serchResultsContainer.style.height = setBlockHeight(searchResultCols, searchResultsItemMarginBottom) + 'px';
      // не помню для чего нужно, не удалять пока наверняка не буду уверен, что это не нужно

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
    jumpToSearchResults();
    searchField.value = '';
  }

  function jumpToSearchResults() {
    let trendingSlider = document.querySelector('.trending__slider');
    trendingSliderBottom = trendingSlider.getBoundingClientRect().bottom;
    window.scrollBy(0, trendingSliderBottom - parseFloat(getComputedStyle(document.querySelector('.search')).height));
  }

  function showMoreGifs(event) {
    searchOffset += searchLimit;

    let stringOffset = `&offset=${searchOffset}`;

    requestGifs(`&q=${searchResultHeader.textContent.slice(23)}`, stringOffset, event.target) // 'Результаты по запросу: ' - 23 символа (крайний индекс 22), с 23 идет текст запроса
  }

  function getNumOfVisibleCols() {
    let numOfCols = 0;

    for (let i = 0; i < searchResultCols.length; i++) {
      if (getComputedStyle(searchResultCols[i]).display != 'none') {
        numOfCols++;
      }
    }

    return numOfCols;
  }

  function setSearchResultsItemMarginBottom() {
    let searchResultsItems = document.querySelectorAll('.search-results__item');

    if (searchResultsItems.length == 0) return;

    let mb;
    let numOfCols = getNumOfVisibleCols();

    switch(numOfCols) {
      case 5:
        mb = serchResultsContainer.offsetWidth  * 0.00625;// 0.00625 = (offsetWidth - 19.5% * 5)/4 - отношение ширины 
        //пространства между колонками к общей ширине контейнера их содержащего
        break;
      case 4: 
        mb = serchResultsContainer.offsetWidth  * 0.006666;
        break;
      case 3:
        mb = serchResultsContainer.offsetWidth  * 0.005;
        break;
      case 2:
        mb = serchResultsContainer.offsetWidth  * 0.01;
    }

    searchResultsItemMarginBottom = mb;
    for (let i = 0; i < searchResultsItems.length; i++) {
      searchResultsItems[i].style.marginBottom = mb + 'px';
    }
  }

  function resizeReplaceSearchResults() {
    let numOfCols = getNumOfVisibleCols();

    if (numOfCols == numOfVisibleCols) {
      return;
    } else {
      numOfVisibleCols = numOfCols;

      let searchResults = document.querySelectorAll('.search-results__item');

      clearCols(searchResultCols);

      for (let i = 0; i < searchResults.length; i++) {
        currentCol = getColIndex(searchResultCols);
        insertImages(searchResultCols, searchResults[i]);
      }
    }
  }

  searchForm.addEventListener('submit', showSearchResults);
  showMoreBtn.addEventListener('click', showMoreGifs);
  window.addEventListener('resize', setSearchResultsItemMarginBottom);
  window.addEventListener('resize', resizeReplaceSearchResults)

})();

// ___________________________Прикрепление формы поиска к верху окна__________________________
(() => {
  let searchDiv = document.querySelector('.search');
  let topOfsearchForm = searchForm.getBoundingClientRect().top;
  let isHandled = false;

  function setTopWindowWidth() {
    let topWindow = document.querySelector('.topWindow');
    if (!topWindow) return;
    topWindow.style.width = getComputedStyle(document.querySelector('.trending__header')).width;
  }

  function setSearchDivWidth() {
    let documentWidth = window.innerWidth;

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
})();

// ___________________________увеличение изображения при клике__________________________
(() => {
  let main = document.querySelector('main');
  let fullScreen = document.querySelector('.full-screen');
  let fullScreenImgWrap = document.querySelector('.full-screen__img-wrap');
  let fullScreenCloseBtn = document.querySelector('.full-screen__close-btn');
  let fullScreenTitle = document.querySelector('.full-screen__title');
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
        fullScreenTitle.textContent = event.target.getAttribute('data-title') === '' ? 'БЕЗ НАЗВАНИЯ' : event.target.getAttribute('data-title').toUpperCase();

        let coef = fullScreenImgWidth / fullScreenImgHeight;
        let screenWidth = window.innerWidth;
        let screenHeight = document.documentElement.clientHeight;

        if (screenWidth < 768) {

          if (screenWidth <= screenHeight) {
            fullScreenImg.width = fullScreenImgWidth > screenWidth * 0.9 ? screenWidth * 0.9 : fullScreenImgWidth;
            fullScreenImg.height = fullScreenImg.width / coef;
          } else {
            fullScreenImg.height = fullScreenImgHeight > screenHeight * 0.9 ? screenHeight * 0.9 : fullScreenImgHeight
            fullScreenImg.width = fullScreenImg.height * coef;
          }

        } else {

          fullScreenImg.height = fullScreenImgHeight > 400 ? 400 : fullScreenImgHeight;
          fullScreenImg.width = fullScreenImg.height * coef; 

        }

        
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
})();

