// Store publications globally for filtering
let allPublications = [];
let activeFilter = null;

// Fetch publications JSON and render with new formatting
document.addEventListener('DOMContentLoaded', function(){
  const container = document.getElementById('pub-list');
  if(!container) return;

  const candidates = ['data/publications_auto.json','data/publications.json'];

  function renderData(data, filter = null){
    allPublications = data;
    
    // Sort by year descending, then by id descending
    let sorted = data.sort((a, b) => {
      if(b.year !== a.year) return b.year - a.year;
      return b.id - a.id;
    });

    // Apply filter if active
    if(filter) {
      sorted = sorted.filter(pub => 
        pub.research_areas && pub.research_areas.includes(filter)
      );
    }

    container.innerHTML = '';
    const ul = document.createElement('ol');
    // render in the attached HTML's style
    ul.className = 'pub-list';
    // set counter to number of publications + 1 so descending numbers start correctly
    try{ ul.style.counterReset = 'pub-counter ' + (sorted.length + 1); }catch(e){}

    sorted.forEach((pub, idx) => {
      const li = document.createElement('li');
      li.className = 'pub-item';
      
      const content = document.createElement('div');
      content.style.width = '100%';

      // Main publication info using markup similar to attached HTML
      const mainSpan = document.createElement('span');

      // Authors: bold "Park" occurrences to match attached style
      if(pub.authors) {
        const authorsSpan = document.createElement('span');
        // highlight surname Park
        const authorsHtml = pub.authors.replace(/\bPark\b/g, '<span class="pub-highlight">Park</span>');
        authorsSpan.innerHTML = authorsHtml + '. ';
        mainSpan.appendChild(authorsSpan);
      }

      // Title in italics, link to detail page when id present
      if(pub.title) {
        const titleEm = document.createElement('em');
        titleEm.textContent = pub.title;

        if(pub.id !== undefined && pub.id !== null) {
          const a = document.createElement('a');
          const href = 'publications/' + encodeURIComponent(String(pub.id)) + '.html';
          a.setAttribute('href', href);
          a.appendChild(titleEm);
          // add trailing period and space
          mainSpan.appendChild(a);
          mainSpan.appendChild(document.createTextNode('. '));
        } else {
          titleEm.textContent += '. ';
          mainSpan.appendChild(titleEm);
        }
      }

      // Citation
      if(pub.citation) {
        const citDiv = document.createElement('span');
        citDiv.textContent = pub.citation;
        if(pub.doi) citDiv.textContent += ' doi: ' + pub.doi;
        mainSpan.appendChild(citDiv);
      }

      content.appendChild(mainSpan);
      
      // Research area tags
      if(pub.research_areas && pub.research_areas.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'research-tags';
        tagsDiv.style.marginTop = '0.4rem';
        
        pub.research_areas.forEach(area => {
          const tag = document.createElement('span');
          tag.className = 'research-tag';
          tag.textContent = area;
          tag.style.cursor = 'pointer';
          tag.onclick = (e) => {
            e.preventDefault();
            filterByResearchArea(area);
          };
          tagsDiv.appendChild(tag);
        });
        
        content.appendChild(tagsDiv);
      }
      
      li.appendChild(content);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  // expose renderer so other scripts can call it
  window.renderPublications = renderData;

  (async function(){
    let loaded = false;
    for(const path of candidates){
      try{
        const resp = await fetch(path);
        if(!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        renderData(data);
        loaded = true;
        break;
      }catch(e){
        console.warn('Could not load', path, e);
      }
    }
    if(!loaded){
      container.textContent = 'Failed to load publications.';
      console.error('No publications file found:', candidates);
    }
  })();
});

// global filter function used by left-sidebar and tags
function filterByResearchArea(area) {
  activeFilter = activeFilter === area ? null : area;

  // Update research areas styling in left sidebar
  const researchAreaItems = document.querySelectorAll('.research-area-item');
  researchAreaItems.forEach(item => {
    if(item.textContent.trim() === area) {
      item.classList.toggle('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Re-render publications with filter (if on page)
  const pubContainer = document.getElementById('pub-list');
  if(pubContainer && typeof window.renderPublications === 'function') {
    window.renderPublications(allPublications, activeFilter);
  }

  // Also tell conferences renderer to update if present
  if(typeof window.renderConferences === 'function') {
    window.renderConferences(window.allConferences || [], activeFilter);
  }
}

// Make filter function available globally
window.filterByResearchArea = filterByResearchArea;
