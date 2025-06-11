// Mafia format file parsing

function processMafiaFormatFile(data) {
  let lines = data.split("\n");
  lines.shift();
  let res = [];
  for (let line of lines) {
    line = line.split("//")[0];
    if (line[0] == "#") continue;
    if (line == "") continue;
    res.push(line.split("\t"));
  }
  return res;
}

// Fetching data

var result = { finished: false, eggs: {}, process_status: {} };

function processEggStatus(data) {
  result.last_update = new Date(data.lastUpdate);
  result.eggs = data.eggs;
  result.process_status.eggs = true;
}

function processMonsters(raw_data) {
  let data = processMafiaFormatFile(raw_data);
  result.monsters_by_id = {};
  for (let line of data) {
    let monster_id = parseInt(line[1]);
    if (monster_id <= 0) continue;
    let wiki_link = line[0];
    if (line[3].includes("Wiki: ")) {
      wiki_link = line[3].substr(
        line[3].indexOf("Wiki: ") + 7,
        line[3].indexOf('"', line[3].indexOf("Wiki: ") + 7) -
          line[3].indexOf("Wiki: ") -
          7,
      );
    }
    if (monster_id in result.monsters_by_id) continue;
    result.monsters_by_id[monster_id] = {
      id: monster_id,
      name: line[0],
      image: line[2].split(",")[0],
      wiki: wiki_link,
      copyable: !line[3].includes("NOCOPY"),
    };
  }
  result.process_status.monsters = true;
}

$.getJSON("/status", processEggStatus);
$.get(
  "https://raw.githubusercontent.com/kolmafia/kolmafia/main/src/data/monsters.txt",
  processMonsters,
);

result.required_status = ["eggs", "monsters"];

result.data_loading_check = setInterval(function () {
  let loading_finished = true;
  for (let data_type of result.required_status) {
    if (!(data_type in result.process_status)) {
      loading_finished = false;
      break;
    }
  }
  if (loading_finished) {
    result.finished = true;
    clearInterval(result.data_loading_check);
  }
}, 30);

window.onload = function () {
  result.initial_setup = setInterval(function () {
    if (result.finished) {
      clearInterval(result.initial_setup);
      initialSetup();
    }
  }, 30);
};

// Scotch List
result.scotch_list = {
  "must-have": [
    "ninja snowman assassin",
    "white lion",
    "whitesnake",
    "mountain man",
    "Black Crayon Frat Orc",
    "swarm of ghuol whelps",
    "big swarm of ghuol whelps",
    "giant swarm of ghuol whelps",
    "modern zmobie",
    "dirty old lihc",
    "Green Ops Soldier",
    "Skinflute",
    "Camel's Toe",
    "Astronomer",
    "forest spirit",
    "beanbat",
    "blur",
    "Baa'baa'bu'ran",
  ],
  "lower priority but still good one": [
    "red butler",
    "Witchess Knight",
    "Witchess Bishop",
    "Witchess Queen",
    "Witchess King",
    "Witchess Witch",
    "sausage goblin",
    "Black Crayon Man",
    "Black Crayon Beast",
    "Black Crayon Golem",
    "Black Crayon Undead Thing",
    "Black Crayon Manloid",
    "Black Crayon Beetle",
    "Black Crayon Hippy",
    "Black Crayon Demon",
    "Black Crayon Shambling Monstrosity",
    "Black Crayon Fish",
    "Black Crayon Goblin",
    "Black Crayon Pirate",
    "Black Crayon Flower",
    "Black Crayon Spiraling Shape",
    "Black Crayon Crimbo Elf",
    "Black Crayon Mer-kin",
    "Black Crayon Slime",
    "Black Crayon Penguin",
    "Black Crayon Elemental",
    "Black Crayon Constellation",
    "Black Crayon Hobo",
    "oil cartel",
    "Racecar Bob",
    "Bob Racecar",
    "Knight in White Satin",
    "pygmy witch accountant",
    "pygmy janitor",
    "erudite gremlin (tool)",
    "batwinged gremlin (tool)",
    "vegetable gremlin (tool)",
    "spider gremlin (tool)",
  ],
  "needed for folks with missing IotMs": [
    "War Frat Mobile Grill Unit",
    "lobsterfrogman",
    "fantasy bandit",
    "screambat",
  ],
  "nice-to-have": [
    "Knob Goblin Harem Girl",
    "dairy goat",
    "lynyrd skinner",
    "Bram the Stoker",
    "pygmy bowler",
    "dense liana",
  ],
};

result.scotch_list_ranking = {
  "must-have": 0,
  "lower priority but still good one": 1,
  "needed for folks with missing IotMs": 2,
  "nice-to-have": 3,
  default: 100,
};

// Setup

function initialSetup() {
  // Init settings
  result.settings = { current_tab: getCookie("EGGNET_current_tab", "name") };
  for (let element of document.getElementsByClassName("setting")) {
    result.settings[element.getAttribute("setting")] =
      getCookie("EGGNET_setting_" + element.getAttribute("setting"), "0") !=
      "0";
  }

  // Set 0 eggs for copyable monsters
  for (let monster_id in result.monsters_by_id) {
    if (
      result.monsters_by_id[monster_id].copyable &&
      !(monster_id in result.eggs)
    ) {
      result.eggs[monster_id] = 0;
    }
  }

  // Set last update time
  document.getElementById("last_update").textContent =
    result.last_update.toGMTString();

  // Set egg counts
  let total_eggs = 0;
  let collected_eggs = 0;
  for (let monster_id in result.eggs) {
    total_eggs += 100;
    collected_eggs += result.eggs[monster_id];
  }
  document
    .getElementById("total_progress")
    .getElementsByClassName("barfill")[0]
    .style.setProperty(
      "--percentage",
      (100 * collected_eggs) / total_eggs + "%",
    );
  document
    .getElementById("total_progress")
    .getElementsByClassName("eggs-total")[0].textContent =
    collected_eggs +
    "/" +
    total_eggs +
    " eggs donated (" +
    Math.round((10000 * collected_eggs) / total_eggs) / 100 +
    "%)";

  // Create monster divs
  result.monster_divs = {};
  result.monster_list = [];
  for (let monster_id in result.eggs) {
    let monster_data = result.monsters_by_id[monster_id];
    if (!(monster_id in result.monsters_by_id)) {
      monster_data = {
        id: monster_id,
        name: "Monster #" + monster_id,
        image: "blank.gif",
        copyable: true,
        wiki: "Monster #" + monster_id,
      };
    }

    let div = document.createElement("div");
    div.className = "monster";
    div.setAttribute("monster_id", monster_id);

    let barfill = document.createElement("div");
    barfill.className = "barfill";
    barfill.style.setProperty("--percentage", result.eggs[monster_id] + "%");
    div.appendChild(barfill);

    let image = document.createElement("img");
    image.className = "monster-image";
    image.src = IMAGES_SERVER + "/adventureimages/" + monster_data.image;
    div.appendChild(image);

    let name = document.createElement("p");
    name.className = "monster-name";
    name.innerHTML =
      "<a href='" +
      WIKI_WEBPAGE +
      "/" +
      monster_data.wiki +
      "' target='_blank'>" +
      monster_data.name +
      "</a>" +
      (result.eggs[monster_id] == 100
        ? ""
        : " (" + result.eggs[monster_id] + "/100 eggs)");
    div.appendChild(name);

    for (let category in result.scotch_list) {
      for (let monster of result.scotch_list[category]) {
        if (monster_data.name == monster) {
          let badge = document.createElement("p");
          badge.className = "monster-badge";
          badge.innerHTML = category;
          div.appendChild(badge);
          monster_data.badge = category;
          break;
        }
      }
    }

    result.monster_divs[monster_id] = div;
    result.monsters_by_id[monster_id] = monster_data;
    result.monster_list.push(monster_data);
  }

  selectTab(result.settings.current_tab);
  for (let element of document.getElementsByClassName("setting")) {
    if (result.settings[element.getAttribute("setting")])
      element.checked = true;
  }
}

// Settings

function toggleSetting(setting, value) {
  result.settings[setting] = value;
  setCookie("EGGNET_setting_" + setting, value ? "1" : "0");
  console.log("set " + setting + " to " + value);

  refreshMonsterList();
}

function selectTab(tab) {
  let tabbar = document.getElementsByClassName("tabbar")[0];
  for (let element of tabbar.getElementsByClassName("button")) {
    element.classList.remove("active");
    if (element.getAttribute("tab") == tab) element.classList.add("active");
  }

  result.settings.current_tab = tab;
  setCookie("EGGNET_current_tab", tab);

  refreshMonsterList();
}

function refreshMonsterList() {
  // Clear and sort
  let parent = document.getElementsByClassName("monsterlist")[0];
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  result.monster_list.sort(function (x, y) {
    if (result.settings.current_tab == "id") return cmp(x.id, y.id);
    if (result.settings.current_tab == "name") {
      if (x.name != y.name) return cmp(x.name, y.name);
      else return cmp(x.id, y.id);
    }
    if (result.settings.current_tab == "completion") {
      if (result.eggs[x.id] != result.eggs[y.id])
        return -cmp(result.eggs[x.id], result.eggs[y.id]);
      else return cmp(x.id, y.id);
    }
    if (result.settings.current_tab == "ascension") {
      if (
        result.scotch_list_ranking[x.badge ? x.badge : "default"] !=
        result.scotch_list_ranking[y.badge ? y.badge : "default"]
      )
        return cmp(
          result.scotch_list_ranking[x.badge ? x.badge : "default"],
          result.scotch_list_ranking[y.badge ? y.badge : "default"],
        );
      else return cmp(x.id, y.id);
    }
  });

  for (let monster of result.monster_list) {
    if (result.settings.hide_completed && result.eggs[monster.id] == 100)
      continue;
    parent.appendChild(result.monster_divs[monster.id]);
  }
}
