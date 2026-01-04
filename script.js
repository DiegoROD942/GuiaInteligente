let map;
let service;
let markers = [];

/* =========================
   INICIALIZAÇÃO
========================= */
window.addEventListener("load", () => {
  if (typeof google !== "undefined") {
    console.log("Google Maps carregado com sucesso");
  } else {
    console.error("Erro ao carregar Google Maps");
  }
});

/* =========================
   FUNÇÃO PRINCIPAL
========================= */
function gerarRoteiro() {
  const destino = document.getElementById("destino").value;
  const estilo = document.getElementById("estilo").value;

  if (!destino || !estilo) {
    alert("Preencha pelo menos o destino e o estilo de viagem.");
    return;
  }

  inicializarMapa(destino);
}

/* =========================
   GOOGLE MAPS
========================= */
function inicializarMapa(destino) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: destino }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;

      map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 14,
      });

      document.getElementById("map").style.display = "block";

      limparMarcadores();
      adicionarMarcador(location, "Destino");

      service = new google.maps.places.PlacesService(map);

      buscarRestaurantes(location);
      buscarPontosTuristicos(location);
    } else {
      alert("Não foi possível localizar o destino.");
    }
  });
}

function buscarRestaurantes(location) {
  const request = {
    location,
    radius: 2000,
    type: ["restaurant"],
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.slice(0, 5).forEach((place) => {
        adicionarMarcador(place.geometry.location, place.name);
      });
    }
  });
}

function buscarPontosTuristicos(location) {
  const request = {
    location,
    radius: 3000,
    type: ["tourist_attraction"],
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.slice(0, 5).forEach((place) => {
        adicionarMarcador(place.geometry.location, place.name);
      });
    }
  });
}

function adicionarMarcador(position, title) {
  const marker = new google.maps.Marker({
    map,
    position,
    title,
  });

  markers.push(marker);
}

function limparMarcadores() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}
