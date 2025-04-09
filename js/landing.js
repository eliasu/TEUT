window.addEventListener("DOMContentLoaded", (event) => {

   // Get the zoom levels from the map element's attributes (without 'data-' prefix)
   const mapElement = document.querySelector("#map");
   const initialZoom = parseInt(mapElement.getAttribute("initialzoom"), 10) || 6; // Default to 6 if not set
   const styleUrl = mapElement.getAttribute("map_style_url");

   const bounds = new mapboxgl.LngLatBounds();
   const markers = new Map(); // Store markers for easy reference


   // The value for 'accessToken' begins with 'pk...'
   mapboxgl.accessToken = 'pk.eyJ1IjoiZWlsZWUiLCJhIjoiY203MXcwYzE3MDJzbjJrc2U2NXJvdnhpdSJ9.JD2SHZ83QNAMt_KZeO7ZXA';

   const map = new mapboxgl.Map({
      container: 'map',
      style: styleUrl,
      center: [-87.661557, 41.893748],
      zoom: 10.7
   });

   map.addControl(new mapboxgl.FullscreenControl());

   // ad markers and popups
   document.querySelectorAll(".map_item").forEach(item => {
      const lng = parseFloat(item.getAttribute("lng"));
      const lat = parseFloat(item.getAttribute("lat"));
      const classname = mapElement.getAttribute("classname") || 'test-class';
      
      const map_modal = item.querySelector(".map_modal");
      const modalContent = map_modal?.innerHTML || "<p>No content available</p>";

      if (!isNaN(lng) && !isNaN(lat)) {
         // Create a popup and insert the copied content
         const popup = new mapboxgl.Popup({ offset: 32, maxWidth: '18rem' })
            .setHTML(modalContent) // Copy inner content into the popup
            .addClassName(classname); // Dynamic class
         
         // create a HTML element for each feature
         const el = document.createElement('div');
         el.className = 'map_modal_marker';
         
         // Create a marker
         const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup) // Attach the popup
            .addTo(map);

         // Store marker and popup for later reference
         markers.set(item, { marker, popup });

         // Move map to the marker when the popup opens
         popup.on('open', () => {
            map.flyTo({
               center: [lng, lat],
               padding: { bottom: 220 },
               essential: true
            });
         });

         bounds.extend([lng, lat]);
      } else {
         console.warn("Invalid coordinates for:", item);
      }

      // add popup interaction
      item.addEventListener("click", () => {
         const data = markers.get(item);
         
         if (data) {
            const { marker, popup } = data;

            // Fly to the clicked pin and wait for the flyTo to finish
            map.flyTo({
               center: marker.getLngLat(),
               padding: { bottom: 220 },
               essential: true
            });
            
            // remove all already opened popups
            const popups = document.getElementsByClassName("mapboxgl-popup");

            if (popups.length) {
               popups[0].remove();
            }

            // Wait for the 'moveend' event after flyTo animation is finished
            map.once('moveend', () => {
               // After the flyTo animation finishes, open the popup
               popup.addTo(map);
            });
         }
      });

      // remove the item from DOM
      map_modal.remove();

   });

   // Adjust map view to fit all markers initially and avoid fade effect
   if (!bounds.isEmpty()) {
      // Set the initial position and zoom without the fade
      map.jumpTo({
         center: bounds.getCenter(),
         padding: { bottom: 220 },
         zoom: initialZoom // Use the initial zoom level from the #map element
      });
   }
});