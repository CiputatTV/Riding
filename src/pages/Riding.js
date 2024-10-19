import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Riding.css';
import { useNavigate } from 'react-router-dom';

// Perbaiki masalah ikon default Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RATE_PER_KM = 5000; // Tarif IDR 5000 per km

function LocationMarker({ setIsLoggedIn }) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchPosition, setSearchPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [cost, setCost] = useState(null);
  const [userInputAddress, setUserInputAddress] = useState('');
  const map = useMap();
  const navigate = useNavigate();

  const locateUser = useCallback(() => {
    console.log("Locating user...");
    map.locate({setView: true, maxZoom: 16});

    map.on('locationfound', async function(e) {
      setPosition(e.latlng);
      setAccuracy(e.accuracy);
      map.flyTo(e.latlng, 16);
      const address = await getAddress(e.latlng);
      setUserInputAddress(address);
    });

    map.on('locationerror', function(e) {
      console.log(e.message);
      setUserInputAddress('Unable to get location. Please enter your address manually.');
    });
  }, [map]);

  const calculateDistance = useCallback((pos1, pos2) => {
    const distanceInMeters = pos1.distanceTo(pos2);
    const distanceInKm = (distanceInMeters / 1000) * 1.3; // Faktor koreksi 1.3
    setDistance(distanceInKm.toFixed(2));
    calculateCost(distanceInKm);
  }, []);

  useEffect(() => {
    locateUser();
  }, [map, locateUser]);

  useEffect(() => {
    if (position && searchPosition) {
      calculateDistance(position, searchPosition);
    }
  }, [position, searchPosition, calculateDistance]);

  const getAddress = useCallback(async (latlng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not found';
    }
  }, []);

  const handleUserAddressInput = async (e) => {
    e.preventDefault();
    const result = await searchForAddress(userInputAddress);
    if (result) {
      setPosition(result);
      const address = await getAddress(result);
      setUserInputAddress(address);
    }
  };

  const handleDestinationAddressInput = async (e) => {
    e.preventDefault();
    const result = await searchForAddress(searchAddress);
    if (result) {
      setSearchPosition(result);
      const address = await getAddress(result);
      setSearchAddress(address);
    }
  };

  const searchForAddress = async (addressToSearch) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToSearch)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const latlng = L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
        map.flyTo(latlng, 16);
        return latlng;
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
    return null;
  };

  const calculateCost = (distanceInKm) => {
    const totalCost = distanceInKm * RATE_PER_KM;
    // Membulatkan ke atas ke ribuan terdekat
    const roundedCost = Math.ceil(totalCost / 1000) * 1000;
    setCost(roundedCost.toLocaleString('id-ID')); // Format angka dengan pemisah ribuan
  };

  const handleOpangSearch = () => {
    // Implementasi logika pencarian Opang di sini
    console.log("Mencari Opang...");
    // Misalnya, Anda bisa menampilkan alert atau memulai proses pencarian
    alert("Fitur pencarian Opang sedang dalam pengembangan.");
  };

  const handleNewSearch = () => {
    setSearchAddress('');
    setSearchPosition(null);
    setDistance(null);
    setCost(null);
    // Opsional: Reset posisi peta ke lokasi pengguna
    if (position) {
      map.flyTo(position, 16);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      {position && (
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: async (e) => {
              const marker = e.target;
              const newPos = marker.getLatLng();
              setPosition(newPos);
              const address = await getAddress(newPos);
              setUserInputAddress(address);
            },
          }}
        >
          <Popup>
            You are here (within {accuracy ? accuracy.toFixed(0) : 'unknown'} meters)
            <br />
            {userInputAddress}
            <br />
            Latitude: {position.lat.toFixed(4)}
            <br />
            Longitude: {position.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}
      {searchPosition && (
        <Marker
          position={searchPosition}
          draggable={true}
          eventHandlers={{
            dragend: async (e) => {
              const marker = e.target;
              const newPos = marker.getLatLng();
              setSearchPosition(newPos);
              const address = await getAddress(newPos);
              setSearchAddress(address);
            },
          }}
        >
          <Popup>{searchAddress}</Popup>
        </Marker>
      )}
      <div className="info-panel">
        <form onSubmit={handleUserAddressInput}>
          <input 
            type="text" 
            value={userInputAddress} 
            onChange={(e) => setUserInputAddress(e.target.value)}
            className="input-field"
            placeholder="Enter your address"
          />
          
        </form>
        <form onSubmit={handleDestinationAddressInput}>
          <input 
            type="text" 
            value={searchAddress} 
            onChange={(e) => setSearchAddress(e.target.value)}
            className="input-field"
            placeholder="Alamat Tujuan Anda"
          />
          <button type="submit" className="button">
            Tentukan 
          </button>
        </form>
        <div className="result-info">
          <div className="result-item tarif">
            <span>Rp {cost}</span>
          </div>
          <div className="result-item jarak">
            ({distance} km)
          </div>
        </div>
        <button onClick={handleOpangSearch} className="opang-button">
          Mencari Opang
        </button>
      </div>
      <button onClick={locateUser} className="refresh-icon" title="Refresh Location">
        <i className="fas fa-location-arrow"></i>
      </button>
      <button onClick={handleLogout} className="logout-icon" title="Logout">
        <i className="fas fa-sign-out-alt"></i>
      </button>
      <button onClick={handleNewSearch} className="new-search-icon" title="New Search">
        <i className="fas fa-search"></i>
      </button>
    </>
  );
}

function App({ setIsLoggedIn }) {
  return (
    <div className="map-container">
      <MapContainer 
        center={[-6.2088, 106.8456]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker setIsLoggedIn={setIsLoggedIn} />
      </MapContainer>
    </div>
  );
}

export default App;
