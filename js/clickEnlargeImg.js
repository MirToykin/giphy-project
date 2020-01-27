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