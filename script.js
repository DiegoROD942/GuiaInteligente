let map, service, directionsService, directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -22.9068, lng: -43.1729 },
    zoom: 13
  });

  service = new google.maps.places.PlacesService(map);
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });
}

function criarRoteiro() {
  const destino = document.getElementById("destino").value;
  const ambiente = document.getElementById("ambiente").value;
  const restaurante = document.getElementById("restaurante").value;
  const dias = document.getElementById("dias").value;

  if (!destino) {
    alert("Informe o destino");
    return;
  }

  document.getElementById("formulario").style.display = "none";
  document.getElementById("map").style.display = "block";

  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: destino }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      map.setCenter(location);
      buscarLocais(location, ambiente || "tourist_attraction", dias, restaurante);
    } else {
      alert("Destino não encontrado");
    }
  });
}

function buscarLocais(location, tipoAmbiente, dias, tipoRestaurante) {
  const quantidade = dias === "1" ? 4 : dias === "3" ? 6 : 8;

  service.nearbySearch({
    location,
    radius: 4000,
    type: [tipoAmbiente]
  }, (results, status) => {
    if (status === "OK") {
      buscarRestaurantes(location, results.slice(0, quantidade), tipoRestaurante);
    }
  });
}

function buscarRestaurantes(location, pontos, tipoRestaurante) {
  service.nearbySearch({
    location,
    radius: 4000,
    type: [tipoRestaurante || "restaurant"]
  }, (res, status) => {
    if (status === "OK") {
      const locais = [...pontos, ...res.slice(0, 2)];
      gerarRota(locais);
    }
  });
}

function gerarRota(locais) {
  const waypoints = locais.slice(1, locais.length - 1).map(l => ({
    location: l.geometry.location,
    stopover: true
  }));

  directionsService.route({
    origin: locais[0].geometry.location,
    destination: locais[locais.length - 1].geometry.location,
    waypoints,
    travelMode: "DRIVING"
  }, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    }
  });
}
