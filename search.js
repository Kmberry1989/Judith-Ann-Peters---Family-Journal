fetch("data/people.json")
  .then(response => response.json())
  .then(data => {
    const people = data;
    const peopleById = {};
    people.forEach(person => { peopleById[person.id] = person; });

    const idx = lunr(function() {
      this.ref("id");
      this.field("name");
      this.field("birth_date");
      this.field("birth_place");
      this.field("death_date");
      this.field("death_place");
      this.field("spouse_names");
      this.field("parent_names");
      people.forEach(person => {
        person.spouse_names = person.spouses.map(s => s.name).join(" ");
        let parentNames = [];
        if (person.father_id && peopleById[person.father_id]) {
          parentNames.push(peopleById[person.father_id].name);
        }
        if (person.mother_id && peopleById[person.mother_id]) {
          parentNames.push(peopleById[person.mother_id].name);
        }
        person.parent_names = parentNames.join(" ");
        this.add(person);
      }, this);
    });

    const resultsDiv = document.getElementById("results");
    const searchInput = document.getElementById("searchBox");

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (query.length === 0) {
        resultsDiv.innerHTML = "<p>Please enter a search term above to find individuals.</p>";
        return;
      }
      const results = idx.search(query);
      if (results.length === 0) {
        resultsDiv.innerHTML = "<p><em>No results found.</em></p>";
      } else {
        let html = "";
        results.forEach(result => {
          const person = peopleById[result.ref];
          html += `<div class="result-item">`;
          html += `<h3>${person.name}</h3>`;
          if (person.birth_date || person.birth_place) {
            let birthInfo = person.birth_date ? person.birth_date : "Unknown date";
            if (person.birth_place) birthInfo += " in " + person.birth_place;
            html += `<p><strong>Born:</strong> ${birthInfo}</p>`;
          }
          if (person.death_date || person.death_place) {
            let deathInfo = person.death_date ? person.death_date : "Unknown date";
            if (person.death_place) deathInfo += " in " + person.death_place;
            html += `<p><strong>Died:</strong> ${deathInfo}</p>`;
          }
          if (person.father_id || person.mother_id) {
            const fatherName = person.father_id ? (peopleById[person.father_id]?.name || "Unknown") : "Unknown";
            const motherName = person.mother_id ? (peopleById[person.mother_id]?.name || "Unknown") : "Unknown";
            html += `<p><strong>Parents:</strong> ${fatherName} / ${motherName}</p>`;
          }
          if (person.spouses.length > 0) {
            const spouseNames = person.spouses.map(s => s.name).join(", ");
            html += `<p><strong>Spouse(s):</strong> ${spouseNames}</p>`;
          }
          if (person.children_ids.length > 0) {
            const childNames = person.children_ids
              .map(cid => peopleById[cid]?.name || "Unknown")
              .join(", ");
            html += `<p><strong>Children:</strong> ${childNames}</p>`;
          }
          html += `</div>`;
        });
        resultsDiv.innerHTML = html;
      }
    });
  });
