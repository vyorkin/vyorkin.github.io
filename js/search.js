(function () {
  var FUSE_CDN = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.mjs';
  var overlay = null;
  var input = null;
  var results = null;
  var fuse = null;
  var indexData = null;

  function createOverlay() {
    var btn = document.querySelector('.search-toggle');
    var placeholder = (btn && btn.dataset.searchPlaceholder) || 'Search posts...';
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML =
      '<div class="search-container">' +
        '<div class="search-header">' +
          '<i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>' +
          '<input type="text" class="search-input" placeholder="' + placeholder + '" autocomplete="off" />' +
          '<span class="search-hint">esc</span>' +
        '</div>' +
        '<ul class="search-results"></ul>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('.search-input');
    results = overlay.querySelector('.search-results');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });

    input.addEventListener('input', function () {
      doSearch(input.value);
    });

  }

  function openSearch() {
    if (!overlay) createOverlay();
    overlay.classList.add('active');
    input.value = '';
    results.innerHTML = '';
    input.focus();
    loadIndex();
  }

  function closeSearch() {
    if (overlay) {
      if (input) input.blur();
      overlay.classList.remove('active');
    }
  }

  function loadIndex() {
    if (indexData) return;
    fetch('/index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        indexData = data;
        return import(FUSE_CDN);
      })
      .then(function (mod) {
        var Fuse = mod.default;
        fuse = new Fuse(indexData, {
          keys: [
            { name: 'title', weight: 2 },
            { name: 'tags', weight: 1.5 },
            { name: 'summary', weight: 1 }
          ],
          threshold: 0.3,
          includeScore: true
        });
        if (input.value) doSearch(input.value);
      });
  }

  function doSearch(query) {
    if (!fuse || !query) {
      results.innerHTML = '';
      return;
    }
    var hits = fuse.search(query, { limit: 10 });
    results.innerHTML = hits
      .map(function (h) {
        return '<li><a href="' + h.item.url + '">' + h.item.title + '</a></li>';
      })
      .join('');
  }

  function handleEscape(e) {
    console.log('handleEscape', e.type, e.key, 'overlay active:', overlay && overlay.classList.contains('active'));
    if ((e.key === 'Escape' || e.code === 'Escape') && overlay && overlay.classList.contains('active')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeSearch();
      console.log('closeSearch called');
      return true;
    }
    return false;
  }

  document.addEventListener('keydown', function (e) {
    console.log('keydown capture:', e.key, e.code);
    if (handleEscape(e)) return;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (overlay && overlay.classList.contains('active')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  }, true);

  document.addEventListener('keyup', function (e) {
    handleEscape(e);
  }, true);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.search-toggle');
    if (btn) {
      e.preventDefault();
      openSearch();
    }
  });
})();
