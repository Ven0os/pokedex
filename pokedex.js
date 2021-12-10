const pokedex = document.getElementById("pokedex");

const fetchPokemon = () => {
  const promises = [];
  for (let i = 1; i <= 15; i++) {
    const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    promises.push(fetch(url).then((res) => res.json()));
  }
  Promise.all(promises).then((results) => {
    const pokemon = results.map((result) => ({
      name: result.name,
      image: result.sprites["front_default"],
      images: result.sprites["front_shiny"],
      type: result.types.map((type) => type.type.name).join(", "),
      id: result.id,
      height: result.height,
      weight: result.weight,
    }));

    displayPokemon(pokemon);
    console.log(results);
  });
};

// Ajouts des cartes au code Html

const displayPokemon = (pokemon) => {
  console.log(pokemon);
  const pokemonHTMLString = pokemon
    .map(
      (pokemon) => `
        <li class="cartepkm" data-pokeid="${pokemon.id}">
        <div class="cartebgr">
        <img class="cartepkm-image" src="${pokemon.image}"/>
            <img class="cartepkm-shiny" data-pokeid="${pokemon.id}" src="${pokemon.images}"/>
            <h2 class="cartepkm-title">${pokemon.id} - ${pokemon.name}</h2>
            <p class="cartepkm-subtitle">Type: ${pokemon.type}</p>
            <p class="cartepkm-subtitle">Poids et taille: ${pokemon.height}m ${pokemon.weight}kg</p>
        </div>
        </li>
    `
    )
    .join("");

  pokedex.innerHTML = pokemonHTMLString;
  let afficherShiny = document.querySelectorAll(".cartepkm");

  afficherShiny.forEach((element) =>
    element.addEventListener("click", (event) => {
      const id = event.target.getAttribute("data-pokeid");
      const cacherShiny = document.querySelector(
        `.cartepkm-shiny[data-pokeid="${id}"]`
      );
      cacherShiny.style.display = "block";
    })
  );
};

fetchPokemon();
