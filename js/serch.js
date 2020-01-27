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
        // не удалять пока наверняка не буду уверен, что это не нужно
  
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