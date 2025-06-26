// Team list sorting and shuffling
window.addEventListener("DOMContentLoaded", () => {
   const teamList = document.querySelector('#team_list');
   if (!teamList) return;

   const teamItems = Array.from(teamList.querySelectorAll('.team_item'));
   if (teamItems.length === 0) return;

   // Separate sorted and unsorted items
   const sortedItems = [];
   const unsortedItems = [];

   teamItems.forEach(item => {
      const sortValue = item.getAttribute('data-sort');
      const sortNum = parseInt(sortValue, 10);
      if (!isNaN(sortNum)) {
         sortedItems.push({
            el: item,
            sort: sortNum
         });
      } else {
         unsortedItems.push(item);
      }
   });


   // Sort the sortedItems by their sort value (ascending)
   sortedItems.sort((a, b) => a.sort - b.sort);

   // Shuffle the unsortedItems (Fisher-Yates)
   for (let i = unsortedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unsortedItems[i], unsortedItems[j]] = [unsortedItems[j], unsortedItems[i]];
   }

   // Clear the team list and append sorted, then shuffled items
   teamList.innerHTML = '';
   sortedItems.forEach(obj => teamList.appendChild(obj.el));
   unsortedItems.forEach(item => teamList.appendChild(item));
});