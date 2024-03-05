import { initializeDarkMode, loader } from "./functions.js";

const cards = document.querySelector(".cards");
const newCards = document.querySelector(".newCards");
const input = document.querySelector("#search");
const searchIcon = document.querySelector(".searchImg");
const select = document.querySelector("#select");

// Dark Mode
initializeDarkMode();

//Kartani yaratish
function createCard(country) {
  return `<div class="card"><img src="${country.flags.svg}" alt="">
              <div class="text">
                  <h3 data-id="${country.name.slug}">${country.name.common}</h3>
                  <p>Population: <span>${country.population.toLocaleString(
                    "en-uz"
                  )}</span></p>
                  <p>Region: <span>${country.continents[0]}</span></p>
                  <p>Capital: <span>${country.capital[0]}</span></p>
              </div>
          </div>`;
}

// Kartalarda bosish hodisasi
function handleCardClick(element) {
  let id = element.querySelector("h3").getAttribute("data-id");
  if (id) {
    let domain = window.location.href.substring(
      0,
      window.location.href.search("index")
    );
    window.location.assign(`${domain}pages/page.html?id=${id}`);
  }
}

// API dan ma'lumotlarni olish funktsiyasi
function fetchData(url, successCallback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      successCallback(data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // API-dan ma'lumotlarni olish va kartalar yaratish
  fetchData(
    "https://frontend-mentor-apis-6efy.onrender.com/countries",
    (data) => {
      if (Array.isArray(data.data)) {
        data.data.forEach((country) => {
          let cardHtml = createCard(country);
          let parser = new DOMParser();
          let doc = parser.parseFromString(cardHtml, "text/html");
          let card = doc.body.firstChild;
          cards.appendChild(card);
          newCards.style.display = "none";

          if (card instanceof HTMLElement) {
            card.addEventListener("click", () => handleCardClick(card));
          } else {
            console.error("Invalid card element:", card);
          }
        });
      } else {
        console.error("Unexpected response format:", data);
      }
    }
  );

  //Davlatni nomi bo'yicha
  searchIcon &&
    searchIcon.addEventListener("click", function (e) {
      e.preventDefault();
      let countryName = input.value.toLowerCase().trim().split(/\s+/);
      if (countryName.length >= 2) {
        countryName = countryName.join("-");
      }

      fetchData(
        `https://frontend-mentor-apis-6efy.onrender.com/countries/${countryName}`,
        (data) => {
          if (data) {
            let searchedCountry = createCard(data);
            cards.innerHTML = searchedCountry;
            cards.addEventListener("click", () => handleCardClick(cards));
          } else {
            alert("No results found");
          }
        }
      );
    });

  //Variantlarni to'ldirish uchun ma'lumotlarni olish
  fetchData(
    `https://frontend-mentor-apis-6efy.onrender.com/countries`,
    (data) => {
      select.addEventListener("change", function () {
        if (this.options[this.selectedIndex].text == "Filter by Region") {
          alert("Choose type of continent");
        } else {
          let continentName = this.options[this.selectedIndex].text;
          // Region bo'yicha ma'lumotni olish
          fetchData(
            `https://frontend-mentor-apis-6efy.onrender.com/countries?region=${continentName}`,
            (data) => {
              newCards.style.display = "grid";
              cards.style.display = "none";

              data.data.forEach((country) => {
                let card = createCard(country);
                newCards.innerHTML += card;
              });
            }
          );
        }
      });
    }
  );
  loader();
});
