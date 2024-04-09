// Decks that will hold the list of cards in them.
class Deck {
    constructor(name) {
        this.name = name;
        this.cards = [];
    }

    addCard(name, cost, attack, health, quantity) {
        this.cards.push(new Card(name, cost, attack, health, quantity));
    }
}

// Each card that will be in a deck. Quantity is used since the delete function uses name, if there were multiple with the same name it would clear them, so making them host their own quantity made sense.
class Card {
    constructor(name, cost, attack, health, quantity) {
        this.name = name;
        this.cost = cost;
        this.attack = attack;
        this.health = health;
        this.quantity = quantity;
    }
}

// All the functions needed to interact with the mockAPI.
class deckBuilder {
    static url = "https://65f5ee0c41d90c1c5e0a66da.mockapi.io/Promineo_API/deck";

    static getAllDecks() {
        return $.get(this.url);
    }

    static getDeck(id) {
        return $.get(this.url + `/${id}`);
    }

    static createDeck(deck) {
        return $.post(this.url, deck);
    }

    static updateDeck(deck) {
        return $.ajax({
            url: this.url + `/${deck.id}`,
            dataType: 'json',
            data: JSON.stringify(deck),
            contentType: 'application/json',
            type: 'PUT'
        });
    }
    static deleteDeck(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

// Using the functions of the deckbuilder to interact with the DOM, making the menus and UI elements
class DOMManager {
    static decks;

    static getAllDecks() {
        deckBuilder.getAllDecks().then(decks => this.render(decks));
    }

    static createDeck(name) {
        deckBuilder.createDeck(new Deck(name))
        .then(() =>{
            return deckBuilder.getAllDecks();
        })
        .then((decks) => this.render(decks));
    }

    static deleteDeck(id) {
        deckBuilder.deleteDeck(id)
        .then(() => {
            return deckBuilder.getAllDecks();
        })
        .then((decks) => this.render(decks));
    }

    static addCard(id) {
        for (let deck of this.decks) {
            if (deck.id == id) {
                deck.cards.push(new Card($(`#${deck.id}-card-name`).val(), $(`#${deck.id}-card-cost`).val(), $(`#${deck.id}-card-attack`).val(), $(`#${deck.id}-card-health`).val(), $(`#${deck.id}-card-quantity`).val()));
                deckBuilder.updateDeck(deck) 
                    .then(() => {
                        return deckBuilder.getAllDecks();
                    })
                    .then((decks)=> this.render(decks));
            }
        }
    }

    static deleteCard(deckId, cardName) {
        for (let deck of this.decks) {
            if (deck.id == deckId) {
                const cardIndex = deck.cards.findIndex(card => card.name === cardName);
                if (cardIndex !== -1) {
                    deck.cards.splice(cardIndex, 1);
                    deckBuilder.updateDeck(deck)
                    .then(() => {
                        return deckBuilder.getAllDecks();
                    })
                    .then((decks) => this.render(decks));
                    break; // Exit once the card is found and deleted
                }
            }
        }
    }
    

    static render(decks) {
        this.decks = decks;
        $('#app').empty();
        for (let deck of decks) {
            $('#app').prepend(
                `<div id="${deck.id}" class="card">
                    <div class="card-header">
                        <h2>${deck.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteDeck('${deck.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${deck.id}-card-name" class ="form-control" placeholder="Card Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${deck.id}-card-cost" class ="form-control" placeholder="Card Cost">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${deck.id}-card-attack" class ="form-control" placeholder="Card Attack">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${deck.id}-card-health" class ="form-control" placeholder="Card Health">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${deck.id}-card-quantity" class ="form-control" placeholder="Card Quantity">
                                </div>
                            </div>
                            <button id="${deck.id}-new-card" onclick="DOMManager.addCard('${deck.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`

            );

            for (let card of deck.cards) {
                $(`#${deck.id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${card.id}"><strong>Name: </strong> ${card.name}</span>
                    <span id="name-${card.id}"><strong>Cost: </strong> ${card.cost}</span>
                    <span id="name-${card.id}"><strong>Attack: </strong> ${card.attack}</span>
                    <span id="name-${card.id}"><strong>Health: </strong> ${card.health}</span>
                    <span id="name-${card.id}"><strong>Quantity: </strong> ${card.quantity}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deleteCard('${deck.id}', '${card.name}')">Delete Card</button>`
                );
            }
        }
    }
}

$('#create-new-deck').click(() => {
    DOMManager.createDeck($('#new-deck-name').val());
    $('#new-deck-name').val('');
});

DOMManager.getAllDecks();