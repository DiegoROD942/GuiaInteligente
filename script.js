let map;
let service;
let markers = [];

/* =========================
   CONFIGURAÇÃO DA IA
========================= */
const OPENAI_API_KEY = "SUA_OPENAI_API_KEY_AQUI"; // ⚠️ TROQUE AQUI

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
async function gerarRoteiro() {
  const destino = document.getElementById("destino").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  const orcamento = document.getElementById("orcamento").value;
  const estilo = document.getElementById("estilo").value;
  const gastronomia = document.getElementById("gastronomia").value;
  const interesses = document.getElementById("interesses").value;

  if (!destino || !estilo) {
    alert("Preencha pelo menos o destino e o estilo de viagem.");
    return;
  }

  inicializarMapa(destino);

  const roteiroIA = await gerarRoteiroIA({
    destino,
    inicio,
    fim,
    orcamento,
    estilo,
    gastronomia,
    interesses,
  });

  mostrarResultado(roteiroIA);
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

/* =========================
   IA – GERAR ROTEIRO
========================= */
async function gerarRoteiroIA(dados) {
  const prompt = `
Você é um especialista em planejamento de viagens.

Crie um roteiro completo e organizado por dias com base no perfil abaixo.
Inclua:
- Passeios
- Restaurantes (café, almoço, jantar)
- Sugestão de bairro para hospedagem
- Linguagem clara e amigável

Perfil:
Destino: ${dados.destino}
Datas: ${dados.inicio || "flexível"} até ${dados.fim || "flexível"}
Orçamento: ${dados.orcamento || "médio"}
Estilo: ${dados.estilo}
Gastronomia: ${dados.gastronomia || "livre"}
Interesses: ${dados.interesses || "personalizado"}

Formato a resposta em HTML simples.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

/* =========================
   EXIBIR RESULTADO
========================= */
function mostrarResultado(conteudoIA) {
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  resultado.innerHTML = `
    ✨ <strong>Roteiro Criado por Inteligência Artificial</strong><br><br>
    ${conteudoIA}
  `;
} 