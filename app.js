// Preserve the authored Bunny video embeds when filtering the portfolio.
const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('#project-grid .project');
filters.forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    filters.forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(project => {
      project.hidden = button.dataset.filter !== 'all' && !project.dataset.category.split(' ').includes(button.dataset.filter);
    });
  });
});
document.querySelectorAll('.project iframe').forEach(frame => {
  frame.title = frame.closest('.project').querySelector('h3').textContent;
});
