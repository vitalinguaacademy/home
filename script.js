	// ==========================================
	// 1 & 2. FETCH DATA & LANGUAGE RENDERER ENGINE
	// ==========================================
	let siteData = {};
	let currentLang = 'en'; 

	// Fetch the JSON file dynamically
	fetch('data.json')
	  .then(response => response.json())
	  .then(data => {
		siteData = data;
		// Render the initial language only AFTER data is successfully loaded
		renderLanguage(currentLang); 
	  })
	  .catch(error => {
		console.error("Error loading the language dictionary:", error);
	  });

	function renderLanguage(lang) {
	  currentLang = lang;
	  document.getElementById('lang-btn').innerText = lang === 'en' ? 'ES' : 'EN';
	  
	  document.querySelectorAll('[data-key]').forEach(el => {
		const key = el.getAttribute('data-key');
		if (siteData[key] && siteData[key][lang]) {
		  el.innerHTML = siteData[key][lang];
		}
	  });
	}

	window.toggleLanguage = function() {
	  const newLang = currentLang === 'en' ? 'es' : 'en';
	  renderLanguage(newLang);
	}

	// Note: Removed the DOMContentLoaded listener calling renderLanguage('en') 
	// because we now call it inside the fetch() promise above, guaranteeing data is ready.

      // ==========================================
      // 3. FULL NAVIGATION ENGINE & EVENT LISTENERS
      // ==========================================
      const circularMenu = document.getElementById('circularMenu');
      const menuIcon = document.getElementById('main-menu-icon');
      const gooeyItems = document.querySelectorAll('#gooey-menu li');
      
      // RESTORED: Full pages array
      const pages = [
        document.getElementById('page-0'), 
        document.getElementById('page-1'),
        document.getElementById('page-2'), 
        document.getElementById('page-3'), 
        document.getElementById('page-4')
      ];
      
      const sectionIcons = ['fa-house', 'fa-award', 'fa-earth-americas', 'fa-language', 'fa-layer-group'];
      const navThemeColors = ['#0b1a2e', '#0b1a2e', '#0b1a2e', '#0b1a2e', '#0b1a2e']; 

      let currentSection = 0; 
      let isAnimating = false; 
      let currentSlide = 1; 
      const totalSlides = 3; 

      document.addEventListener('click', (e) => {
        if (!circularMenu.contains(e.target) && circularMenu.classList.contains('active')) {
          circularMenu.classList.remove('active');
        }
      });

      window.updateMenuState = function(index) {
        document.body.classList.toggle('in-section', index > 0);
        menuIcon.classList.remove(...sectionIcons);
        menuIcon.classList.add(sectionIcons[index]);
        document.documentElement.style.setProperty('--nav-bg', navThemeColors[index]);
        gooeyItems.forEach((li, i) => li.classList.toggle('active', i === (index - 1)));
        
        // Sync side navigation dots
        if(index > 0) {
          for(let i=1; i<=4; i++) {
            const dot = document.getElementById(`g-dot-${i}`);
            if(dot) dot.classList.toggle('active', i === index);
          }
        }
      }

      window.triggerAnimationLock = function() {
        isAnimating = true; 
        setTimeout(() => { isAnimating = false; }, 800); 
      }

      window.executeSlide = function(oldIndex, newIndex, dir) {
        const oldPage = pages[oldIndex];
        const newPage = pages[newIndex];
        if(!newPage || !oldPage) return; 
        
        newPage.style.transition = 'none';
        if (dir === 1) newPage.className = 'page hidden-bottom'; 
        else newPage.className = 'page hidden-top'; 
        void newPage.offsetWidth; 
        
        newPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        oldPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        if (dir === 1) oldPage.className = 'page hidden-top'; 
        else oldPage.className = 'page hidden-bottom'; 
        
        newPage.className = 'page active';
        currentSection = newIndex;
        updateMenuState(currentSection);

        if (currentSection !== 0) changeSlide(1);
      }

      window.openSection = function(index) {
        if (currentSection === index || isAnimating) return;
        triggerAnimationLock(); executeSlide(currentSection, index, 1); 
      }

      window.jumpToSection = function(index) {
        if (currentSection === index || isAnimating) return;
        triggerAnimationLock();
        let dir = index > currentSection ? 1 : -1;
        if (currentSection === 0 && index === 4) dir = -1; 
        if (currentSection === 4 && index === 0) dir = 1;  
        executeSlide(currentSection, index, dir);
      }

      // RESTORED: navScroll Function
      window.navScroll = function(direction) {
        if (isAnimating) return;
        let nextIndex = currentSection + direction;
        if (nextIndex > 4) nextIndex = 0;
        if (nextIndex < 0) nextIndex = 4;
        triggerAnimationLock();
        executeSlide(currentSection, nextIndex, direction);
      }

      function isInteractiveTarget(target) {
        if (!target || typeof target.closest !== 'function') return false;
        const ignore = ['slider-dot', 'floating-btn', 'menu-item', 'close-btn', 'bottom-nav-item', 'circular-menu', 'hp-nav-item', 'lang-toggle', 'lang-toggle-top', 'g-nav-arrow', 'g-nav-dot'];
        return ignore.some(cls => target.closest('.' + cls));
      }

      window.changeSlide = function(slideIndex) {
        currentSlide = slideIndex;
        const activePage = pages[currentSection];
        if (!activePage) return;
        activePage.querySelectorAll('.slider-dot').forEach((dot, index) => dot.classList.toggle('active', index === (slideIndex - 1)));
        activePage.querySelectorAll('.slide').forEach((slide, index) => slide.classList.toggle('active', index === (slideIndex - 1)));
      }

      window.handleSectionClick = function(event, index) {
        if (currentSection === 0) openSection(index);
        else if (currentSection === index && !isAnimating) {
          if (!isInteractiveTarget(event.target)) changeSlide(currentSlide >= totalSlides ? 1 : currentSlide + 1);
        }
      }

      // RESTORED: Swipe Event Listeners
      let touchStartX = 0;
      let touchStartY = 0;

      window.addEventListener('touchstart', (e) => {
        if (isInteractiveTarget(e.target) || isAnimating) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, {passive: false});

      window.addEventListener('touchend', (e) => {
        if (isInteractiveTarget(e.target) || isAnimating) return;
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
          if (Math.abs(dx) > Math.abs(dy)) {
            if (currentSection !== 0) {
              if (dx < 0) { 
                changeSlide(currentSlide >= totalSlides ? 1 : currentSlide + 1);
              } else { 
                changeSlide(currentSlide <= 1 ? totalSlides : currentSlide - 1);
              }
            }
          } else {
            if (dy < 0) navScroll(1);
            else navScroll(-1);
          }
        }
      });

      // RESTORED: Mouse Wheel Scroll
      window.addEventListener('wheel', (e) => {
        if (circularMenu.classList.contains('active')) circularMenu.classList.remove('active');
        if (!isAnimating) {
          if (e.deltaY > 0) navScroll(1);  
          else if (e.deltaY < 0) navScroll(-1); 
        }
      });

      // RESTORED: Keyboard Navigation
      window.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Escape', 'ArrowRight', 'ArrowLeft', 'Enter'].includes(e.key)) {
          if (circularMenu.classList.contains('active')) circularMenu.classList.remove('active');
        }

        if (!isAnimating) {
          if (e.key === 'ArrowDown' || e.key === 'PageDown') navScroll(1); 
          else if (e.key === 'ArrowUp' || e.key === 'PageUp') navScroll(-1); 
          else if (e.key === 'Enter' && currentSection === 0) jumpToSection(1);
          else if (e.key === 'Escape' && currentSection !== 0) jumpToSection(0);
          else if (e.key === 'ArrowRight' && currentSection !== 0) {
            changeSlide(currentSlide >= totalSlides ? 1 : currentSlide + 1);
          }
          else if (e.key === 'ArrowLeft' && currentSection !== 0) {
            changeSlide(currentSlide <= 1 ? totalSlides : currentSlide - 1);
          }
        }
      });
