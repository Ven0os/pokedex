 const pokedexList = document.getElementById('pokedex');
        const searchBar = document.getElementById('searchBar');
        const typeFilters = document.getElementById('typeFilters');
        const loader = document.getElementById('loader');

        let allPokemons = [];
        let currentFilter = 'all';

        const TYPES = [
            'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
            'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
        ];

        const getTypeIcon = (type) => `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`;

        const initTypeFilters = () => {
            const allBtn = document.createElement('button');
            allBtn.className = `type-btn active`;
            allBtn.dataset.type = 'all';
            allBtn.title = 'Tous';
            allBtn.style.color = 'white';
            allBtn.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" style="width: 20px; filter: invert(1)">`;
            allBtn.onclick = () => filterByType('all');
            typeFilters.appendChild(allBtn);

            TYPES.forEach(type => {
                const btn = document.createElement('button');
                btn.className = `type-btn`;
                btn.dataset.type = type;
                btn.title = type;
                btn.style.color = `var(--${type})`;
                btn.innerHTML = `<img src="${getTypeIcon(type)}" alt="${type}">`;
                btn.onclick = () => filterByType(type);
                typeFilters.appendChild(btn);
            });
        };

        const fetchAllPokemons = async () => {
            const cached = localStorage.getItem('pokedex_v3_shiny');
            if (cached) {
                allPokemons = JSON.parse(cached);
                renderPokedex();
                return;
            }

            try {
                const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
                const data = await res.json();

                const detailedResults = [];
                const chunkSize = 50;

                for (let i = 0; i < data.results.length; i += chunkSize) {
                    const chunk = data.results.slice(i, i + chunkSize);
                    const chunkPromises = chunk.map(p => fetch(p.url).then(r => r.json()));
                    const chunkData = await Promise.all(chunkPromises);

                    const mapped = chunkData.map(d => ({
                        id: d.id,
                        name: d.name,
                        image: d.sprites.other['official-artwork'].front_default,
                        shiny: d.sprites.other['official-artwork'].front_shiny,
                        types: d.types.map(t => t.type.name),
                        stats: d.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
                        color: `var(--${d.types[0].type.name})`
                    }));

                    detailedResults.push(...mapped);
                }

                allPokemons = detailedResults;
                localStorage.setItem('pokedex_v3_shiny', JSON.stringify(allPokemons));
                renderPokedex();
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
            }
        };

        const toggleShiny = (event, element) => {
            event.stopPropagation();
            element.closest('.pokemon-card').classList.toggle('is-shiny');
        };

        const renderPokedex = (filterText = '') => {
            if (loader) loader.style.display = 'none';

            const normalizedSearch = filterText.toLowerCase().trim();

            const filtered = allPokemons.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(normalizedSearch) || p.id.toString() === normalizedSearch;
                const matchesType = currentFilter === 'all' || p.types.includes(currentFilter);
                return matchesSearch && matchesType;
            });

            pokedexList.innerHTML = filtered.map(p => `
                <li class="pokemon-card" onclick="this.classList.toggle('active')" style="border-bottom: 4px solid ${p.color}">
                    <div class="shiny-toggle" onclick="toggleShiny(event, this)" title="Voir forme Shiny">✨</div>
                    <span class="pokemon-id">#${p.id.toString().padStart(3, '0')}</span>
                    <div class="img-wrapper">
                        <img class="pokemon-img default-img" src="${p.image}" alt="${p.name}" loading="lazy">
                        <img class="pokemon-img shiny-img" src="${p.shiny}" alt="${p.name} shiny" loading="lazy">
                    </div>
                    <h2 class="pokemon-name">${p.name}</h2>
                    <div class="card-types">
                        ${p.types.map(t => `
                            <span class="type-pill" style="color: var(--${t})">
                                <img src="${getTypeIcon(t)}" alt="${t}">
                                ${t}
                            </span>
                        `).join('')}
                    </div>
                    <div class="stats-container">
                        ${p.stats.map(s => `
                            <div class="stat-row">
                                <span class="stat-label">${s.name.replace('special-', 'sp. ')}</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${(s.value / 255) * 100}%; background: ${p.color}"></div>
                                </div>
                                <span class="stat-value">${s.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </li>
            `).join('');
        };

        const filterByType = (type) => {
            currentFilter = type;
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === type);
            });
            renderPokedex(searchBar.value);
        };

        searchBar.addEventListener('input', (e) => renderPokedex(e.target.value));

        initTypeFilters();
        fetchAllPokemons();
