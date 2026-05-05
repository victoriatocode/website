// conferences renderer with filtering support
let allConferences = [];

function renderConferences(data, filter = null){
  allConferences = data;
  window.allConferences = allConferences;

  const container = document.getElementById('conference-list');
  if(!container) return;

  // sort by year desc then id
  let sorted = data.sort((a,b) => {
    if(b.year !== a.year) return b.year - a.year;
    return b.id - a.id;
  });

  if(filter) {
    sorted = sorted.filter(c => c.research_areas && c.research_areas.includes(filter));
  }

  container.innerHTML = '';

  sorted.forEach(conf => {
    const item = document.createElement('div');
    item.className = 'conference-item';
    item.setAttribute('data-research-areas', (conf.research_areas || []).join(','));

    const p = document.createElement('p');
    // Year
    const strongYear = document.createElement('strong');
    strongYear.textContent = conf.year + ':';
    p.appendChild(strongYear);
    p.appendChild(document.createTextNode(' '));

    // Title (linked if id present)
    if(conf.id !== undefined && conf.id !== null) {
      const a = document.createElement('a');
      const href = 'conferences/' + encodeURIComponent(String(conf.id)) + '.html';
      a.setAttribute('href', href);
      const em = document.createElement('em');
      em.textContent = conf.title;
      a.appendChild(em);
      p.appendChild(a);
      p.appendChild(document.createTextNode('. '));
    } else {
      p.appendChild(document.createTextNode(conf.title + '. '));
    }

    // Venue
    const venueSpan = document.createElement('span');
    venueSpan.style.fontStyle = 'italic';
    venueSpan.textContent = conf.venue || '';
    p.appendChild(venueSpan);
    item.appendChild(p);

    if(conf.abstract) {
      const abs = document.createElement('p');
      abs.textContent = conf.abstract;
      item.appendChild(abs);
    }

    if(conf.research_areas && conf.research_areas.length){
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'research-tags';
      conf.research_areas.forEach(area => {
        const tag = document.createElement('span');
        tag.className = 'research-tag';
        tag.textContent = area;
        tag.style.cursor = 'pointer';
        tag.addEventListener('click', (e)=>{
          e.preventDefault();
          if(typeof window.filterByResearchArea === 'function') window.filterByResearchArea(area);
        });
        tagsDiv.appendChild(tag);
      });
      item.appendChild(tagsDiv);
    }

    container.appendChild(item);
  });
}

window.renderConferences = renderConferences;

// auto-load when on conferences page
document.addEventListener('DOMContentLoaded', async function(){
  const container = document.getElementById('conference-list');
  if(!container) return;

  try{
    const resp = await fetch('data/conferences.json');
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    const data = await resp.json();
    renderConferences(data);
  }catch(e){
    console.error('Could not load conferences.json', e);
    container.textContent = 'Failed to load conference list.';
  }

  // attach left-sidebar research area clicks (if present)
  const researchAreaItems = document.querySelectorAll('.research-area-item');
  researchAreaItems.forEach(item => {
    item.addEventListener('click', function(e){
      e.preventDefault();
      const area = this.getAttribute('data-area');
      if(typeof window.filterByResearchArea === 'function') window.filterByResearchArea(area);
    });
  });
});
