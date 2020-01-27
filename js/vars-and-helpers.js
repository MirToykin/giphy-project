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

