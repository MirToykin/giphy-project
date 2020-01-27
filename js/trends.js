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