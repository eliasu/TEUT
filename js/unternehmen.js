window.addEventListener("DOMContentLoaded", () => {
   // Team list sorting and shuffling
   shuffleTeam();

   // Set the active link in the navigation
   setNavigationHighlighting();

   // Set the active link in the navigation for the home page
   setProjekteLinks();
});

function shuffleTeam() {
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
}

function setNavigationHighlighting(inTeam) {
   const currentPath = window.location.pathname;
   // Only run on /unternehmen
   if (currentPath !== '/unternehmen') return;

   const mainLink = document.querySelector('a[href="/unternehmen"]');
   const teamLink = document.querySelector('a[href="/unternehmen#team"]');
   const teamContain = document.getElementById('team-contain');

   if (!mainLink || !teamLink || !teamContain) return;

   function setNavState(inTeam) {
      if (inTeam) {
         mainLink.classList.remove('w--current');
         teamLink.classList.add('w--current');
      } else {
         teamLink.classList.remove('w--current');
         mainLink.classList.add('w--current');
      }
   }

   // Initial state: highlight main link
   setNavState(false);

   const observer = new IntersectionObserver(
      (entries) => {
         entries.forEach(entry => {
            setNavState(entry.isIntersecting);
         });
      },
      {
         root: null,
         rootMargin: '0px 0px 0% 0px', // Adjust as needed
         threshold: 0.1
      }
   );

   observer.observe(teamContain);
}

