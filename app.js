const API_BASE = 'https://deckofcardsapi.com/api/deck';

let deckId = null;

async function drawCards() {
    if (!deckId) {
        const deckData = await fetch(`${API_BASE}/new/shuffle/?deck_count=1`).then(res => res.json());
        deckId = deckData.deck_id;
    }

    const cardData = await fetch(`${API_BASE}/${deckId}/draw/?count=5`).then(res => res.json());
    displayCards(cardData.cards);
    const handResult = evaluatePokerHand(cardData.cards);
    document.getElementById('result').textContent = `Best Hand: ${handResult}`;
}

function displayCards(cards) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('img');
        cardElement.src = card.image;
        cardsContainer.appendChild(cardElement);
    });
}

function evaluatePokerHand(cards) {
    // Convert card values
    const values = cards.map(card => {
        switch (card.value) {
            case 'ACE': return 14;
            case 'KING': return 13;
            case 'QUEEN': return 12;
            case 'JACK': return 11;
            default: return parseInt(card.value, 10);
        }
    }).sort((a, b) => b - a);

    const suits = cards.map(card => card.suit);

    // Check for flush (all same suit)
    const isFlush = suits.every(suit => suit === suits[0]);

    // Check for straight
    const isStraight = values.every((value, index, arr) => {
        if (index === 0) return true;
        return arr[index - 1] - value === 1;
    });

    // Check for duplicates (pairs, three of a kind, etc.)
    const valueCounts = {};
    values.forEach(value => {
        if (!valueCounts[value]) {
            valueCounts[value] = 0;
        }
        valueCounts[value]++;
    });

    const duplicates = Object.values(valueCounts);
    const maxDuplicate = Math.max(...duplicates);

    if (isFlush && isStraight && values[0] === 14) return 'Royal Flush';
    if (isFlush && isStraight) return 'Straight Flush';
    if (maxDuplicate === 4) return 'Four of a Kind';
    if (duplicates.includes(3) && duplicates.includes(2)) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (maxDuplicate === 3) return 'Three of a Kind';
    if (duplicates.filter(val => val === 2).length === 2) return 'Two Pair';
    if (maxDuplicate === 2) return 'One Pair';

    return `High Card: ${values[0]}`;
}