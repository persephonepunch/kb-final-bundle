/**
 * Webflow Integration Knowledge Base
 * Main JavaScript - Vanilla JS (no frameworks)
 */

(function() {
  'use strict';

  // ===================================
  // Mobile Menu Toggle
  // ===================================
  function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
      });
    }
  }

  // ===================================
  // Search Functionality
  // ===================================
  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        
        if (query.length > 2) {
          performSearch(query);
        }
      });
    }
  }

  function performSearch(query) {
    // Simple client-side search through page content
    const sections = document.querySelectorAll('.section, .code-section');
    let results = [];
    
    sections.forEach(function(section) {
      const text = section.textContent.toLowerCase();
      if (text.includes(query)) {
        const title = section.querySelector('h2, h3');
        if (title) {
          results.push({
            title: title.textContent,
            element: section
          });
        }
      }
    });
    
    // Highlight search results (simple implementation)
    if (results.length > 0) {
      console.log('Search results:', results);
      // In a full implementation, you would display these results
      // in a dropdown or navigate to the first result
    }
  }

  // ===================================
  // Tabs Functionality
  // ===================================
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and panels
        tabButtons.forEach(function(btn) {
          btn.classList.remove('active');
        });
        tabPanels.forEach(function(panel) {
          panel.classList.remove('active');
        });
        
        // Add active class to clicked button and corresponding panel
        this.classList.add('active');
        const activePanel = document.getElementById('tab-' + tabId);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  // ===================================
  // Copy to Clipboard Functionality
  // ===================================
  function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    copyButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const codeId = this.getAttribute('data-copy');
        const codeElement = document.getElementById('code-' + codeId);
        
        if (codeElement) {
          const code = codeElement.textContent;
          
          // Copy to clipboard
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(function() {
              showCopySuccess(button);
            }).catch(function(err) {
              console.error('Failed to copy:', err);
              fallbackCopy(code, button);
            });
          } else {
            fallbackCopy(code, button);
          }
        }
      });
    });
  }

  function fallbackCopy(text, button) {
    // Fallback method for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      showCopySuccess(button);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textarea);
  }

  function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.classList.add('copied');
    button.innerHTML = '<span class="copy-icon">✓</span> Copied!';
    
    setTimeout(function() {
      button.classList.remove('copied');
      button.innerHTML = originalText;
    }, 2000);
  }

  // ===================================
  // Smooth Scroll for Anchor Links
  // ===================================
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href !== '#' && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            const headerHeight = 64; // Height of sticky header
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // ===================================
  // Highlight Active Section on Scroll
  // ===================================
  function initScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0) return;
    
    window.addEventListener('scroll', function() {
      let currentSection = '';
      
      sections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
          currentSection = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
          link.classList.add('active');
        }
      });
    });
  }

  // ===================================
  // Initialize All Functions
  // ===================================
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSearch();
        initTabs();
        initCopyButtons();
        initSmoothScroll();
        initScrollSpy();
      });
    } else {
      initMobileMenu();
      initSearch();
      initTabs();
      initCopyButtons();
      initSmoothScroll();
      initScrollSpy();
    }
  }

  // Run initialization
  init();

})();
