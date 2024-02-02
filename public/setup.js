const ws = new WebSocket('ws://localhost:3001'); // match port above
ws.addEventListener('close', event => {
  console.log('setup.js: event =', event);
  // This assumes the server will restart and create a new WebSocket server.
  setTimeout(() => {
    console.log('setup.js: reloading');
    window.location.reload();
  }, 500); // gives the server time to restart
});

// TODO: This only works on devices with a mouse.
// TODO: To enable touch functionality, add touch event listeners.

const sortableList = document.querySelector('.sortable-list');

// TODO: Call this every time the list changes!
function listChanged() {
  setTimeout(() => {
    const items = sortableList.querySelectorAll('.item');
    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        console.log('setup.js dragstart: item =', item);
        // Adding dragging class to item after a delay
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      // Removing dragging class from item on dragend event
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });
  }, 0);
}

const handleDragOver = e => {
  e.preventDefault();

  // Get the items being dragged.
  const draggingItem = document.querySelector('.dragging');

  // Get all the items not being dragged.
  let siblings = [...sortableList.querySelectorAll('.item:not(.dragging)')];

  // Find the sibling after where the dragging item should be placed.
  let nextSibling = siblings.find(sibling => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });

  // Insert the dragging item before the found sibling.
  sortableList.insertBefore(draggingItem, nextSibling);
};

sortableList.addEventListener('dragover', handleDragOver);

sortableList.addEventListener('dragenter', e => e.preventDefault());
