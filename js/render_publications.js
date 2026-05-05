// Fetch publications JSON and render grouped by year with continuous numbering in reverse chronological order
document.addEventListener('DOMContentLoaded', function(){
  const container = document.getElementById('pub-list');
  if(!container) return;

  // Try auto-structured publications first, then fall back to standard file
  const candidates = ['data/publications_auto.json','data/publications.json'];

  function renderData(data){
    // Sort all items by year descending, then by id descending
    const sorted = data.sort((a, b) => {
      if(b.year !== a.year) return b.year - a.year;
      return b.id - a.id;
    });

    // group by year descending
    const byYear = {};
    sorted.forEach(item => {
      const y = item.year || 'Unknown';
      (byYear[y] ||= []).push(item);
    });
    const years = Object.keys(byYear).sort((a,b)=>{
      if(a === 'Unknown') return 1;
      if(b === 'Unknown') return -1;
      return b - a;
    });

    let counter = 1;
    years.forEach(year => {
      const hYear = document.createElement('h3');
      hYear.className = 'pub-year';
      hYear.textContent = year;
      container.appendChild(hYear);

      const list = document.createElement('ol');
      list.className = 'pub-year-list';
      list.start = counter;
      byYear[year].forEach(pub => {
        const li = document.createElement('li');
        li.className = 'pub-item';
        // citation pieces
        const authors = document.createElement('div');
        authors.className = 'pub-authors';
        if(pub.authors) authors.textContent = pub.authors + '. ';
        const title = document.createElement('div');
        title.className = 'pub-title';
        title.textContent = (pub.title || '') + (pub.title ? '. ' : '');
        const journal = document.createElement('div');
        journal.className = 'pub-journal';
        journal.textContent = (pub.citation || '') + (pub.doi ? (' doi: ' + pub.doi) : '');

        if(authors.textContent) li.appendChild(authors);
        if(title.textContent) li.appendChild(title);
        if(journal.textContent) li.appendChild(journal);
        list.appendChild(li);
      });
      counter += byYear[year].length;
      container.appendChild(list);
    });
  }

  // Try files in order
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
        // try next
      }
    }
    if(!loaded){
      container.textContent = 'Failed to load publications.';
      console.error('No publications file found among candidates:', candidates);
    }
  })();
});
