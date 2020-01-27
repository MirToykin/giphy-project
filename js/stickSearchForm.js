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