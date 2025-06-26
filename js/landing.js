window.addEventListener("DOMContentLoaded", (event) => {
   initMap();
   setNavigationHighlighting();
});

function initMap() {
// Constants for better maintainability
   const CONFIG = {
      DEFAULT_ZOOM: 6,
      DEFAULT_CENTER: [-87.661557, 41.893748],
      DEFAULT_ZOOM_LEVEL: 10.7,
      FLYTO_PADDING: { bottom: 220 },
      BOUNDS_PADDING: { top: 75, bottom: 75, left: 75, right: 75 },
      POPUP_OFFSET: 32,
      POPUP_MAX_WIDTH: '18rem'
   };

   // Get the zoom levels from the map element's attributes (without 'data-' prefix)
   const mapElement = document.querySelector("#map");
   
   if (!mapElement) {
      console.error("Map container '#map' not found");
      return;
   }

   const initialZoom = parseInt(mapElement.getAttribute("initialzoom"), 10) || CONFIG.DEFAULT_ZOOM;
   const styleUrl = mapElement.getAttribute("mapstyle");

   if (!styleUrl) {
      console.error("Map style URL not provided");
      return;
   }

   const bounds = new mapboxgl.LngLatBounds();
   const markers = new Map(); // Store markers for easy reference
   const filterBounds = new Map(); // Store bounds for each filter

   // The value for 'accessToken' begins with 'pk...'
   mapboxgl.accessToken = 'pk.eyJ1IjoiZWlsZWUiLCJhIjoiY203MXcwYzE3MDJzbjJrc2U2NXJvdnhpdSJ9.JD2SHZ83QNAMt_KZeO7ZXA';

   const map = new mapboxgl.Map({
      container: 'map',
      style: styleUrl,
      center: CONFIG.DEFAULT_CENTER,
      zoom: CONFIG.DEFAULT_ZOOM_LEVEL
   });

   map.addControl(new mapboxgl.FullscreenControl());

   // Cache DOM elements for better performance
   const mapItems = document.querySelectorAll(".map_item");
   const classname = mapElement.getAttribute("classname") || 'test-class';

   // Helper function to remove existing popups
   const removeExistingPopups = () => {
      const popups = document.getElementsByClassName("mapboxgl-popup");
      Array.from(popups).forEach(popup => popup.remove());
   };

   // Helper function to validate coordinates
   const isValidCoordinates = (lng, lat) => {
      return !isNaN(lng) && !isNaN(lat) && 
             lng >= -180 && lng <= 180 && 
             lat >= -90 && lat <= 90;
   };

   // Add markers and popups
   mapItems.forEach(item => {
      const lng = parseFloat(item.getAttribute("lng"));
      const lat = parseFloat(item.getAttribute("lat"));
      const filter = item.getAttribute("data-filter");
      
      const map_modal = item.querySelector(".map_modal");
      const modalContent = map_modal?.innerHTML || "<p>No content available</p>";

      if (!isValidCoordinates(lng, lat)) {
         console.warn("Invalid coordinates for:", item, `lng: ${lng}, lat: ${lat}`);
         return;
      }

      try {
         // Create a popup and insert the copied content
         const popup = new mapboxgl.Popup({ 
            offset: CONFIG.POPUP_OFFSET, 
            maxWidth: CONFIG.POPUP_MAX_WIDTH 
         })
            .setHTML(modalContent)
            .addClassName(classname);
         
         // create a HTML element for each feature
         const el = document.createElement('div');
         el.className = 'map_modal_marker';
         
         // Create a marker
         const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);

         // Store marker and popup for later reference
         markers.set(item, { marker, popup });

         // Move map to the marker when the popup opens
         popup.on('open', () => {
            map.flyTo({
               center: [lng, lat],
               padding: CONFIG.FLYTO_PADDING,
               essential: true
            });
         });

         bounds.extend([lng, lat]);

         // Add to filter bounds if filter exists
         if (filter) {
            if (!filterBounds.has(filter)) {
               filterBounds.set(filter, new mapboxgl.LngLatBounds());
            }
            filterBounds.get(filter).extend([lng, lat]);
         }
      } catch (error) {
         console.error("Error creating marker for item:", item, error);
      }

      // add popup interaction
      item.addEventListener("click", () => {
         const data = markers.get(item);
         
         if (data) {
            const { marker, popup } = data;

            // Fly to the clicked pin and wait for the flyTo to finish
            map.flyTo({
               center: marker.getLngLat(),
               padding: CONFIG.FLYTO_PADDING,
               essential: true
            });
            
            // remove all already opened popups
            removeExistingPopups();

            // Wait for the 'moveend' event after flyTo animation is finished
            map.once('moveend', () => {
               // After the flyTo animation finishes, open the popup
               popup.addTo(map);
            });
         }
      });

      // remove the item from DOM
      if (map_modal) {
         map_modal.remove();
      }
   });

   // Add filter click handlers
   const filterElements = document.querySelectorAll('[data-filter-button]');
   filterElements.forEach(filterElement => {
      const filterValue = filterElement.getAttribute("data-filter-button");
      
      if (filterValue && filterBounds.has(filterValue)) {
         filterElement.addEventListener("click", () => {
            const bounds = filterBounds.get(filterValue);
            
            if (!bounds.isEmpty()) {
               map.fitBounds(bounds, {
                  padding: CONFIG.BOUNDS_PADDING
               });
            }
         });
      }
   });

   // Add clear/reset functionality
   const clearElements = document.querySelectorAll('[filter="reset"]');
   clearElements.forEach(clearElement => {
      clearElement.addEventListener("click", () => {
         // Reset to show all markers
         if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
               padding: CONFIG.BOUNDS_PADDING
            });
         }
      });
   });

   // Adjust map view to fit all markers initially and avoid fade effect
   if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
         padding: CONFIG.BOUNDS_PADDING
      });
   }
}

function setNavigationHighlighting() {
   const currentPath = window.location.pathname;
   // Only run on /
   if (currentPath !== '/') return;

   const mainLink = document.querySelector('a[href="/"]');
   const projekteLink = document.querySelector('a[href="/#projekte"]');
   const projekteContain = document.getElementById('projekte-contain');

   if (!mainLink || !projekteLink || !projekteContain) return;

   function setNavState(inProjekte) {
      if (inProjekte) {
         mainLink.classList.remove('w--current');
         projekteLink.classList.add('w--current');
      } else {
         projekteLink.classList.remove('w--current');
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

   observer.observe(projekteContain);
}