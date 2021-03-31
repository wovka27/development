class Menu {
  constructor() {
    this.header   = document.querySelector('header')
    this.burger   = document.querySelector('.header-nav__burger')
    this.nav      = document.querySelector('.header-nav__list')
    this.navItem  = document.querySelectorAll('.header-nav__link')
  }

  menuControl(){
    this.burger.addEventListener('click',this.menuShow.bind(this))
    window.addEventListener('scroll',this.menuFixed.bind(this))
    window.addEventListener('change',this.menuFixed.bind(this))
    this.closeMenu()
    // this.scrollToItem();
  }

  menuShow() {
    this.burger.classList.toggle('active')
    this.nav.classList.toggle('active')
    document.body.classList.toggle('hidden')
  }

  menuFixed() {
    const fixStart = document.querySelector('.about'),
      scrolled = window.pageYOffset,
      bodyStyle = document.body.style;
    if(scrolled >= fixStart.offsetTop) {
      this.header.classList.add('fix');
      bodyStyle.paddingTop = `${this.header.clientHeight}px`;
    } else if(scrolled >= fixStart.scrollTop){
      this.header.classList.remove('fix');
      bodyStyle.paddingTop = null;
    }
  }
  closeMenu(){
    this.navItem.forEach(el=>{
      el.addEventListener('click',()=>{
        if(this.nav.classList.contains('active')) {
        this.burger.classList.remove('active')
        this.nav.classList.remove('active')
        document.body.classList.remove('hidden')
        }
      })
    })
  }

  // scrollToItem(){
  //   let scroll = document.querySelectorAll(`[id*="#"]`);
  //   scroll.forEach(el=>{
  //     if (el) {
  //       el.addEventListener('click', e => {
  //         e.preventDefault();
  //         const elId = this.getAttribute('id');
  //         document.querySelector(elId).scrollIntoView({behavior: 'smooth', block: 'start'})
  //       })
  //     }
  //   })
  // }

  init(){
    this.menuControl()
  }
}
new Menu().init();
class Tabs {
  constructor({tabBtn,tabContent}) {
    this.$btn = document.querySelectorAll(tabBtn)
    this.$content = document.querySelectorAll(tabContent)
  }
  controlTab(){
    this.$btn.forEach(item => item.addEventListener('click', this.selectTab.bind(this)))
  }
  selectTab(e){
    this.$btn.forEach(item => item.classList.remove('active'));
    const self = e.currentTarget
    self.classList.add('active');
    const tabName = self.getAttribute('data-tab-name');
    this.selectTabContent(tabName)
  }
  selectTabContent(tabName){
    this.$content.forEach(
      item => item.classList.contains(tabName) 
      ? item.classList.add('active') 
      : item.classList.remove('active')
    ); 
  }
  init() {
    console.log('Tabs init');
    this.controlTab()
  }
}

;
const GalleryClassList = {
  container: 'gallery',
  line: 'gallery-line',
  slide: 'gallery-slide',
  dots: 'gallery-pagination',
  dot: 'gallery-dot',
  dot_active: 'gallery-dot-active',
  nav: 'gallery-nav',
  btn_left: 'gallery-nav-left',
  btn_right: 'gallery-nav-right'
}

class Gallery {
  constructor(element, option={}) {
    this.containerNode = element;
    this.size = element.childElementCount;
    this.currentSlide = 0;
    this.currentSlideWasChanged = false;
    this.setting = {
      margin: option.margin || 0,
      countShow: option.countShow || 1,
      wheel: option.wheel || false,
      dots: option.dots || false,
      nav: option.nav || false
    };
    this.dotsCount = (this.size + 1) - this.setting.countShow;

    this.manageHTML = this.manageHTML.bind(this);
    this.setParams = this.setParams.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.resizeGallery = this.resizeGallery.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
    this.setStylePosition = this.setStylePosition.bind(this);
    this.clickDots = this.clickDots.bind(this);
    this.moveToLeft = this.moveToLeft.bind(this);
    this.moveToRight = this.moveToRight.bind(this);
    this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
    this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
    this.scrollWheel = this.scrollWheel.bind(this);

    this.manageHTML();
    this.setParams();
    this.setEvents();
  }

  manageHTML() {
    this.containerNode.classList.add(GalleryClassList.container);
    this.containerNode.innerHTML = `<div class="${GalleryClassList.line}">${this.containerNode.innerHTML}</div>
`;
    if(this.setting.dots){
      this.containerNode.insertAdjacentHTML('beforeend',`<div class="${GalleryClassList.dots}"></div>`)
    }
    if(this.setting.nav){
      this.containerNode.insertAdjacentHTML('beforeend',`
        <span class="${GalleryClassList.btn_left}"> < </span>
        <span class="${GalleryClassList.btn_right}"> > </span>
      `)
    }
    
    this.lineNode = this.containerNode.querySelector(`.${GalleryClassList.line}`);
    this.dotsNode = this.containerNode.querySelector(`.${GalleryClassList.dots}`);
    this.slideNodes = Array.from(this.lineNode.children).map((childNode) => 
      wrapElementByDiv({
        element: childNode,
        className: GalleryClassList.slide
      })
    );
      if(this.setting.dots) {
        this.dotsNode.innerHTML = Array.from(Array(this.dotsCount).keys()).map((key) =>(
          `<span class="${GalleryClassList.dot} ${key === this.currentSlide 
          ? GalleryClassList.dot_active : ''}"></span>`
        )).join('');
        this.dotNodes = this.dotsNode.querySelectorAll(`.${GalleryClassList.dot}`);
      }
      if(this.setting.nav){
        this.navLeft = this.containerNode.querySelector(`.${GalleryClassList.btn_left}`);
        this.navRight = this.containerNode.querySelector(`.${GalleryClassList.btn_right}`);
      }
    
  }
  setParams() {
    const coordsContainer = this.containerNode.getBoundingClientRect();
    this.width = coordsContainer.width / this.setting.countShow-this.setting.margin;
    this.maximumX = -this.dotsCount*(this.width + this.setting.margin/this.size);
    this.x = this.currentSlide*(this.width + this.setting.margin);

    this.resetStyleTransition();
    this.lineNode.style.width = `${this.size*(this.width + this.setting.margin)}px`
    this.lineNode.style.paddingLeft = `${-this.setting.margin}px`
    this.lineNode.style.paddingRight = `${-this.setting.margin}px`
    this.setStylePosition();
    Array.from(this.slideNodes).forEach((slideNode) =>{
      slideNode.style.width = `${this.width}px`;
      slideNode.style.marginLeft = `${this.setting.margin}px`
      slideNode.style.marginRight = `${this.setting.margin}px`
    });
  }
  setEvents() {
    window.addEventListener('resize', this.resizeGallery);
    this.lineNode.addEventListener('mousedown', this.startDrag);
    this.lineNode.addEventListener('mouseup', this.stopDrag);
    this.lineNode.addEventListener('touchstart', this.startDrag);
    this.lineNode.addEventListener('touchend', this.stopDrag);
    if(this.setting.wheel){
      this.lineNode.addEventListener('wheel', this.scrollWheel)
    }
    if(this.setting.dots) {
      this.dotsNode.addEventListener('click', this.clickDots);
    }
    if(this.setting.nav){
      this.navRight.addEventListener('click', this.moveToRight);
      this.navLeft.addEventListener('click', this.moveToLeft);
    }


  }
  destroyEvents(){
    window.removeEventListener('resize', this.debouncedResizeGallery);
    this.lineNode.removeEventListener('mousedown', this.startDrag);
    this.lineNode.removeEventListener('mouseup', this.stopDrag);
    this.lineNode.removeEventListener('touchstart', this.startDrag);
    this.lineNode.removeEventListener('touchend', this.stopDrag);
    if(this.setting.dots) {
      this.dotsNode.removeEventListener('click', this.clickDots);
    }

    if(this.setting.nav){
      this.navRight.removeEventListener('click', this.moveToRight);
      this.navLeft.removeEventListener('click', this.moveToLeft);
    }
  }

  resizeGallery(){this.setParams()}

  startDrag(evt){
    this.currentSlideWasChanged = false;
    this.clickX = evt.clientX || evt.touches[0].clientX;
    this.startX = this.x;
    window.addEventListener('mousemove', this.dragging);
    window.addEventListener('touchmove', this.dragging);
    this.resetStyleTransition();
  }
  stopDrag(){
    window.removeEventListener('mousemove', this.dragging);
    window.removeEventListener('touchmove', this.dragging);
    this.changeCurrentSlide();
  }
  dragging(evt){
    this.dragX = evt.clientX || evt.touches[0].clientX;
    const dragShift = this.dragX - this.clickX;
    const easing = dragShift / 50;
    this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing)
    this.setStylePosition();
    
    if(
      dragShift > (this.width / 3) &&
      dragShift > 0 &&
      !this.currentSlideWasChanged &&
      this.currentSlide > 0
    ) {
      this.currentSlideWasChanged = true;
      this.currentSlide -= 1
    }

    if(
      dragShift < -(this.width / 3) &&
      dragShift < 0 &&
      !this.currentSlideWasChanged &&
      this.currentSlide < this.size - this.setting.countShow
    ) {
      this.currentSlideWasChanged = true;
      this.currentSlide += 1
    }
  }
  clickDots(evt){
    const dotNode = evt.target.closest('span')
    if(!dotNode) return
    let dotNum;
    for(let i = 0; i<this.dotNodes.length; i++) {
      if(this.dotNodes[i] === dotNode) {
        dotNum = i;
        break
      };
    }
    if(dotNum === this.currentSlide) return

    const countSwipes = Math.abs(this.currentSlide - dotNum)
    this.currentSlide = dotNum;
    this.changeCurrentSlide(countSwipes);
  }

  moveToLeft(){
    this.currentSlide <= 0
    ? this.currentSlide = this.size - this.setting.countShow
    : this.currentSlide -= 1
    this.changeCurrentSlide();
  }

  moveToRight(){
    this.currentSlide >= this.size - this.setting.countShow 
    ? this.currentSlide = 0
    : this.currentSlide += 1
    this.changeCurrentSlide();
  }

  changeCurrentSlide(countSwipes){
    this.x = -this.currentSlide*(this.width + this.setting.margin);
    this.setStylePosition(countSwipes);
    this.setStyleTransition();
    this.setting.dots ? this.changeActiveDotClass() : 0
  }

  scrollWheel(evt){ 
    evt.wheelDelta < 0 ? this.moveToRight() : this.moveToLeft() 
  }



  changeActiveDotClass(){
    for(let i = 0; i<this.dotNodes.length; i++) {
      this.dotNodes[i].classList.remove(GalleryClassList.dot_active)
    }
    this.dotNodes[this.currentSlide].classList.add(GalleryClassList.dot_active)
  }

  setStylePosition(){
    this.lineNode.style.transform = `translate3d(${this.x}px, 0, 0)`
  }

  setStyleTransition(countSwipes = 1){
    this.lineNode.style.transition = `all ${0.5*countSwipes}s ease 0s`
  }

  resetStyleTransition(){
    this.lineNode.style.transition = 'all 0s ease 0s'
  }
}

function wrapElementByDiv({element, className}) {
  const wrapperNode = document.createElement('div');
  wrapperNode.classList.add(className);

  element.parentNode.insertBefore(wrapperNode, element);
  wrapperNode.appendChild(element)

  return wrapperNode;
}

function debounce(func, time=100){
  let timer;
  return function (event) {
    clearTimeout(timer);
    timer = setTimeout(func, time, event);
  }
};
;

function parallax(selector){
  let w = window.scrollY, p = 0;
  const bg = document.querySelector(selector);
  bg.style.transform = `translateY(${w/2}px)`;
  scrollHome()
}
window.onscroll = ()=> {
  if(!document.querySelector('header').classList.contains('fix')) parallax('.web-dev__bg')
  else return
}


function moveParallax(event) {
  const img = this.querySelector('.works-tabs__item-product img').style
  let x = event.clientX,
    y = event.clientY;
    img.transform = `translate(-${x/60}px,-${y/60}px)`;

}
function resetParallax() {
  const img = this.querySelector('.works-tabs__item-product img').style
  img.transform = `translate(0)`;
}

document.querySelectorAll('.works-tabs__item-product').forEach(item => {
  item.addEventListener('mousemove', moveParallax)
  item.addEventListener('mouseout', resetParallax)
})


const init = document.querySelector('.team-slider-wrapper')
new Gallery(init, {
  margin:10,
  countShow:3,
  dots: true,
  nav:false
})

function scrollHome(){
  const btn = document.querySelector('.scroll-btn'),
  scrollParams = {top: 0, behavior: "smooth"},
  show = () => window.scrollY > 1000 
  ? btn.classList.add('active') 
  : btn.classList.remove('active')
  show()
  btn.addEventListener('click',()=> window.scrollTo(scrollParams))
}

function scrollToItem(){
  let scroll = document.querySelectorAll(`[id*="#"]`);
  const scrollParams = {behavior: 'smooth', block: 'start'}
  for (scl of scroll) {
    if (scl) {
      scl.addEventListener('click', e => {
        e.preventDefault();
        sclId = e.currentTarget.getAttribute('id');
        document.querySelector(sclId).scrollIntoView(scrollParams)
      })
    }
  };
}
scrollToItem()
const tab_class = {
  tabBtn:'.works-tabs__label',
  tabContent:'.works-tabs__item'
}
new Tabs(tab_class).init()


async function getContent(){
  let response = await fetch('content.html', {
    method:'GET',
  })
  const tabContent = document.querySelectorAll('.works-tabs__item-product')
  const content_btn = document.querySelector('.works__btn > a')
  if(response.ok) {
    let result = await response.text()
    content_btn.addEventListener('click', () => {
      tabContent.forEach(item => {
        if(item.parentElement.classList.contains('active')) {
          item.parentElement.insertAdjacentHTML('beforeend', result)
        }
      })
      console.log('hui');
    })
  }
}

getContent()