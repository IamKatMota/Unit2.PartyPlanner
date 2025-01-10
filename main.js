const COHORT = "2409-GHP-ET-WEB-PT";
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;

const state = {
    parties: [],
}

//upates state (data sitting on our webpage) with parties from API
async function getParties() {
    try {
        const promise = await fetch(API_URL);
        const response = await promise.json()
        if (!response.success) {
            throw response.error
        }
        console.log(response.data)
        state.parties = response.data
    } catch (error) {
        alert("unable to load parties")
    }

}
/** Asks the API to create a new party based on the given `party` */
async function addParty(party) {
    try {
        const promise = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(party),
        });
        const response = await promise.json();
        if (!response.success) {
            throw response.error;
        }
        console.log(response);
        render(); // Reload state and re-render
    } catch (error) {
        console.error("Error adding party:", error);
        alert("Unable to add party. Please try again.");
    }
}

//remove event
const removeEvent = async (eventId) => {
    try {
        // TODO
        const promise = await fetch(`${API_URL}/${eventId}`, {
            method: 'DELETE'
        })
        
        console.log(`Removed event #${eventId}`); // Debug: Log the removed event

    } catch (err) {
        console.error(
            `Whoops, trouble removing event #${eventId} from the roster!`,
            err
        );
    }
};

// === Render ===

/** Renders parties from state */
function renderParties() {
    const ul = document.getElementById("parties")
    ul.innerHTML = '' //makes sure the contents are cleared 
    state.parties.forEach((party) => {
        const partyName = document.createElement("li");
        partyName.textContent = party.name;
        ul.appendChild(partyName);

        const partyDate = document.createElement("li");
        // partyDate.textContent = Date.parse(party.date);
        const date = new Date (party.date)
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        partyDate.textContent = date.toLocaleDateString() + " " + hours + ": " + minutes

        ul.appendChild(partyDate);

        const partyDescription = document.createElement("li");
        partyDescription.textContent = party.description;
        ul.appendChild(partyDescription);

        //delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'delete'
        deleteButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await removeEvent(party.id); //removes event 
            await getParties(); // refresh state with updated list 
            renderParties();
        })
        //append button to li
        ul.appendChild(deleteButton)
    })
}

async function render() {
    await getParties();
    renderParties();
    const form = document.getElementById("addParty")
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form)
        const name = formData.get("partyName")
        const date = formData.get("date")
        const time = formData.get("time")
        const location = formData.get("location")
        const description = formData.get("description")

        try {
            // Combine `date` and `time` into a full ISO-8601 DateTime
            const combinedDateTime = new Date(`${date}T${time}:00Z`).toISOString();

            console.log("Converted ISO DateTime:", combinedDateTime);

            const party = {
                name: name,
                date: combinedDateTime, // Full ISO-8601 DateTime
                location: location,
                description: description,
            };

            addParty(party);
        } catch (error) {
            console.error("Error processing date/time:", error);
            alert("Invalid date or time. Please check your inputs.");
        }
    })
}

// === Script ===

render();