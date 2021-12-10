const pokedex = document.getElementById("pokedex");

const fetchPokemons = () => {
  const promises = [];
  for (let i = 1; i <= 896; i++) {
    const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    promises.push(
      fetch(url)
        .then((res) => res.json())
        .then((pokemon) => ({
          ...pokemon,
          images: {
            sprite: pokemon.sprites["front_default"],
            shiny: pokemon.sprites["front_shiny"],
          },
          type: pokemon.types.map((type) => type.type.name).join(", "),
          // gen: pokemon.game_indices.map((type) => type.type.name).join(", "),
        }))
    );
  }
  return Promise.all(promises);
};

function displayAllPokemons(pokemons) {
  for (const pokemon of pokemons) {
    displayPokemon(pokemon);
  }

  document.querySelectorAll(".cartepkm").forEach((element) =>
    element.addEventListener("click", (event) => {
      const id = getPokeId(event.target);
      document
        .querySelector(`.cartepkm-shiny[data-pokeid="${id}"]`)
        .classList.toggle("cartepkm-image");
    })
  );
}

function getPokeId(element) {
  let id = element.getAttribute("data-pokeid");
  if (!id) id = getPokeId(element.parentElement);
  return id;
}

function displayPokemon(pokemon) {
  const html = `<li class="cartepkm" data-pokeid="${pokemon.id}">
  <div class="cartebgr">
  <img class="cartepkm-image" src="${pokemon.images.sprite}"/>
  <img class="cartepkm-shiny" data-pokeid="${pokemon.id}" src="${pokemon.images.shiny}"/>
  <h2 class="cartepkm-title">${pokemon.id} - ${pokemon.name}</h2>
  <p class="cartepkm-subtitle">Type: ${pokemon.type}</p>
  <p class="cartepkm-subtitle">Poids et taille: ${pokemon.height}m ${pokemon.weight}kg</p>
  </div>
  </li>`;
  pokedex.innerHTML += html;
}

document.addEventListener(`DOMContentLoaded`, () => {
  fetchPokemons().then((pokemons) => {
    displayAllPokemons(pokemons);
  });
});
