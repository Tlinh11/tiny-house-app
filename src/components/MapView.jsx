import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon asset paths for Leaflet in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({
  buildings = [],
  selectedBuildingId = null,
  onSelectBuilding = null,
  height = '450px',
  zoom = 13,
  center = [21.0100, 105.8100], // Default Hanoi central coordinates
  interactive = true,
  showControls = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Format price display into Millions VND
  const formatPriceShort = (price) => {
    if (!price || price === Infinity) return 'Liên hệ';
    return (price / 1000000).toFixed(1) + 'tr';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not existing
    if (!mapInstanceRef.current) {
      const initialCenter = selectedBuildingId && buildings.length
        ? (() => {
          const b = buildings.find(item => item.id === selectedBuildingId || item.code === selectedBuildingId);
          return b && b.latitude && b.longitude ? [b.latitude, b.longitude] : center;
        })()
        : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: showControls,
        scrollWheelZoom: interactive,
        dragging: interactive,
      });

      // Add CartoDB Positron high quality vector tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!buildings || buildings.length === 0) return;

    const bounds = L.latLngBounds();

    buildings.forEach(building => {
      if (!building.latitude || !building.longitude) return;

      const isSelected = selectedBuildingId && (building.id === selectedBuildingId || building.code === selectedBuildingId);
      const isTiny = building.isTiny;

      // Custom divIcon matching reference design system
      const iconHtml = `
        <div class="map-price-pin ${isTiny ? 'tiny-pin' : 'partner-pin'} ${isSelected ? 'active-pin' : ''}">
          <div class="pin-badge">${isTiny ? '★ Tiny' : 'Đối tác'}</div>
          <div class="pin-price">${formatPriceShort(building.minPrice)}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([building.latitude, building.longitude], { icon: customIcon }).addTo(map);

      // Popup Content Card
      const popupHtml = `
        <div style="width: 220px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; position: relative;">
            <img src="${building.coverImage}" alt="${building.code}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; left: 6px; background: ${isTiny ? '#E8920A' : '#1E293B'}; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${isTiny ? 'Tòa Tiny' : 'Tòa Đối tác'}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0F172A;">${building.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B; line-height: 1.3;">📍 ${building.address}</p>
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 8px; margin-top: 6px;">
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #E8920A;">
                ${(building.minPrice / 1000000).toFixed(1)} tr <span style="font-size: 10px; color: #64748B; font-weight: 400;">/tháng</span>
              </div>
              <div style="font-size: 10px; color: #10B981; font-weight: 600;">${building.vacantRoomsCount || 1} phòng trống</div>
            </div>
            
            <div style="display: flex; gap: 4px;">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${building.latitude},${building.longitude}"
                target="_blank"
                rel="noreferrer"
                title="Chỉ đường Google Maps"
                style="background: #0F172A; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;"
              >
                🗺️ Maps
              </a>
              <button 
                id="map-btn-${building.id}" 
                style="background: #E8920A; color: #ffffff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
              >
                Chi tiết →
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle marker popup open & button click
      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`map-btn-${building.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectBuilding) onSelectBuilding(building.id);
            };
          }
        }, 50);
      });

      marker.on('click', () => {
        if (onSelectBuilding) onSelectBuilding(building.id);
      });

      bounds.extend([building.latitude, building.longitude]);
      markersRef.current.push(marker);
    });

    // Auto fit bounds if viewing list of multiple buildings
    if (buildings.length > 1 && !selectedBuildingId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (selectedBuildingId) {
      const selectedBuilding = buildings.find(b => b.id === selectedBuildingId || b.code === selectedBuildingId);
      if (selectedBuilding && selectedBuilding.latitude && selectedBuilding.longitude) {
        map.setView([selectedBuilding.latitude, selectedBuilding.longitude], 15);
      }
    }

    // Force tile recalculation after layout render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [buildings, selectedBuildingId, zoom]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Custom Styles */}
      <style>{`
        .custom-leaflet-marker {
          background: none !important;
          border: none !important;
        }
        .map-price-pin {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: 20px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          border: 1.5px solid #ffffff;
          user-select: none;
        }
        .map-price-pin:hover {
          transform: scale(1.15);
          z-index: 1000 !important;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }
        .tiny-pin {
          background: linear-gradient(135deg, #E8920A 0%, #D97706 100%);
        }
        .partner-pin {
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
        }
        .active-pin {
          transform: scale(1.18);
          border: 2px solid #10B981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4) !important;
        }
        .pin-badge {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          opacity: 0.9;
          line-height: 1;
        }
        .pin-price {
          font-size: 12px;
          font-weight: 900;
          line-height: 1.1;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 4px !important;
          box-shadow: 0 8px 24px rgba(15,23,42,0.18) !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
