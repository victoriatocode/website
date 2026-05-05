// Minimal JS: fill year and add any small interactivity later
document.addEventListener('DOMContentLoaded', function(){
  var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
});
