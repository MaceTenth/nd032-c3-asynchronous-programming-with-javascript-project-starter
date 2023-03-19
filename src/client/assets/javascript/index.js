// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      //   // Race track form field
      //   if (target.matches(".card.track")) {
      //     handleSelectTrack(target);
      //   } else if (target.parentElement.matches(".card.track")) {
      //     handleSelectTrack(target.parentElement);
      //   }

      //   // Podracer form field
      //   if (target.matches(".card.podracer")) {
      //     handleSelectPodRacer(target);
      //   } else if (target.parentElement.matches(".card.podracer")) {
      //     handleSelectPodRacer(target.parentElement);
      //   }

      function matchesOrParentMatches(target, selector) {
        return (
          target.matches(selector) ||
          (target.parentElement && target.parentElement.matches(selector))
        );
      }

      if (matchesOrParentMatches(target, ".card.track")) {
        const selectedTrack = target.matches(".card.track")
          ? target
          : target.parentElement;
        handleSelectTrack(selectedTrack);
      }

      if (matchesOrParentMatches(target, ".card.podracer")) {
        const selectedPodRacer = target.matches(".card.podracer")
          ? target
          : target.parentElement;
        handleSelectPodRacer(selectedPodRacer);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate();
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI

  // TODO - Get player_id and track_id from the store
  const { player_id, track_id } = store;

  if (!player_id || !track_id) {
    const missingInfo = checkMissingSelection(player_id, track_id);
    displayErrorMessage(`Please select also a ${missingInfo}!`);
    return;
  }

  // const race = TODO - invoke the API call to create the race, then save the result
  const raceId = await createRace(player_id, track_id);

  // TODO - update the store with the race id
  renderAt("#race", renderRaceStartView(raceId.Track));

  // For the API to work properly, the race id should be race id - 1
  updateStore({ race_id: raceId.ID });
  //   Object.assign(store, { race_id: raceId.ID });
  // The race has been created, now start the countdown
  // TODO - call the async function runCountdown
  await runCountdown();
  // TODO - call the async function startRace
  await startRace(store.race_id);
  // TODO - call the async function runRace
  runRace(store.race_id);
}

function runRace(raceID) {
  return new Promise((resolve) => {
    // TODO - use Javascript's built in setInterval method to get race info every 500ms

    const raceInterval = setInterval(async function () {
      try {
        const fetchRaceInfo = await getRace(raceID - 1);
        const raceInfo = await fetchRaceInfo.json();

        if (raceInfo.status.includes("in-progress")) {
          // clearInterval(getRaceId);
          renderAt("#leaderBoard", raceProgress(raceInfo.positions));
          resolve(raceInfo);
          // return raceInfo;
        } else {
          const racerResults = raceInfo.positions.find(
            (racer) => racer.id === store.player_id
          );
          //   Object.assign(store,{race_status: raceInfo.status, final_position:racerResults.final_position})
          updateStore({
            race_status: raceInfo.status,
            final_position: racerResults.final_position,
          });
          clearInterval(raceInterval); // to stop the interval from repeating
          renderAt("#race", resultsView(raceInfo.positions)); // to render the results view
          resolve(raceInfo); // resolve the promise
        }
      } catch (error) {
        console.log("Error!: ,", error);
      }
    }, 500);

    /* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
	*/

    /* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
  });
  // remember to add error handling for the Promise
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // TODO - use Javascript's built in setInterval method to count down once per second

      // run this DOM manipulation to decrement the countdown for the user

      const countDownInterval = setInterval(function () {
        document.getElementById("big-numbers").innerHTML = --timer;
        if (timer === 0) {
          document.getElementById("big-numbers").innerHTML = "GO!";
          clearInterval(countDownInterval);
          resolve();
        }
      }, 1000);

      // TODO - if the countdown is done, clear the interval, resolve the promise, and return
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSelectPodRacer(target) {
  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // TODO - save the selected racer to the store
  //   Object.assign(store, { player_id: Number(target.id) });
  updateStore({ player_id: Number(target.id) });
}

function handleSelectTrack(target) {
  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // TODO - save the selected track id to the store
  //   Object.assign(store, { track_id: target.id });
  updateStore({ track_id: target.id });
}

function handleAccelerate() {
  // TODO - Invoke the API call to accelerate
  accelerate(store.race_id - 1);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>Driver Name: ${driver_name}</h3>
			<p>Top Speed: ${top_speed} MP/h</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name, segments } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
			<h4>No. of segments: ${segments.length}</h4>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>
			<section id="race-view">
			 <canvas id="race-canvas" width="800" height="400"></canvas>
		    </section>
			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Finished! Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			${finishingMessage(store.final_position)}
			<a href="/race" class="button">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
					<h4>Speed: ${p.speed} MP/h</h4>
				</td>
			</tr>
		`;
  });

  renderCanvas(store.track_id, positions);

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function finishingMessage(status) {
  const suffix = {
    1: "st",
    2: "nd",
    3: "rd",
    4: "th",
    5: "th",
  };

  const finalSuffix = suffix[status];

  return `<h4>Congradulations! You finished ${status}${finalSuffix}!</h4>`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:3001";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

async function getTracks() {
  // GET request to `${SERVER}/api/tracks`
  try {
    const tracks = await fetch(`${SERVER}/api/tracks`);
    const tracksResponse = await tracks.json();

    return tracksResponse;
  } catch (error) {
    console.log("Error!: ,", error);
  }
}

async function getRacers() {
  // GET request to `${SERVER}/api/cars`
  try {
    const racers = await fetch(`${SERVER}/api/cars`);
    const carsResponse = await racers.json();

    return carsResponse;
  } catch (error) {
    console.log("Error!: ,", error);
  }
}

async function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  try {
    const res = await fetch(`${SERVER}/api/races`, {
      method: "POST",
      ...defaultFetchOpts(),
      dataType: "jsonp",
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    return console.log("Problem with createRace request::", err);
  }
}

async function getRace(id) {
  // GET request to `${SERVER}/api/races/${id}`
  const racer = `${SERVER}/api/races/${id}`;
  const racerId = fetch(racer);
  const response = await racerId;

  return response;
}

async function startRace(id) {
  try {
    const racing = parseInt(id) - 1;
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    return fetch(`${SERVER}/api/races/${racing}/start`, fetchOptions).catch(
      (err) => console.log("Problem with the request:", err)
    );
  } catch (error) {
    console.log(`startRace: ${error}`);
  }
}

async function accelerate(id) {
  try {
    const accelerateRaceId = id;
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (store.race_status !== "finished") {
      return fetch(
        `${SERVER}/api/races/${accelerateRaceId}/accelerate`,
        fetchOptions
      ).catch((err) => console.log("Problem with the request:", err));
    }
  } catch (error) {
    console.log(`startRace: ${error}`);
  }
}

function updateStore(updates) {
  Object.assign(store, updates);
}

function displayErrorMessage(message) {
  const errorMessageContainer = document.getElementById("error-message");
  errorMessageContainer.innerText = message;
  errorMessageContainer.classList.remove("hidden");

  setTimeout(() => {
    errorMessageContainer.classList.add("hidden");
  }, 3000);
}

function checkMissingSelection(player_id, track_id) {
  let missingInfo;

  switch (true) {
    case !player_id && !track_id:
      missingInfo = "player and a track";
      break;
    case !player_id:
      missingInfo = "track";
      break;
    case !track_id:
      missingInfo = "player";
      break;
  }

  return missingInfo;
}

async function renderCanvas(trackId, positions) {
	const track = (await getTracks()).find((t) => t.id === +trackId);
  
	const canvas = document.getElementById("race-canvas");
	const ctx = canvas.getContext("2d");
  
	const trackWidth = canvas.width;
	const trackHeight = canvas.height;
  
	// Clear the canvas
	ctx.clearRect(0, 0, trackWidth, trackHeight);
  
	// Draw the track background
	ctx.fillStyle = "#eee";
	ctx.fillRect(0, 0, trackWidth, trackHeight);
  
	// Calculate car width and height based on canvas size
	const carWidth = 30;
	const carHeight = 60;
  
	// Draw each car
	positions.forEach((position, index) => {
	  const segmentPercentage = position.segment / track.segments.length;
	  const x = segmentPercentage * trackWidth;
	  const y = (index * (carHeight + 10)) % trackHeight;
  
	  // Draw car
	  ctx.fillStyle = position.id === store.player_id ? "blue" : "red";
	  ctx.fillRect(x, y, carWidth, carHeight);
  
	  // Draw driver name
	  ctx.fillStyle = "black";
	  ctx.font = "14px Arial";
	  ctx.fillText(position.driver_name, x + carWidth + 5, y + carHeight / 2);
	});
  }
  
  
