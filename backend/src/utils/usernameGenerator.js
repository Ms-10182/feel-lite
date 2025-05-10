const adjectives = ['Silent', 'Quiet', 'Lonely', 'Bright', 'Blue', 'Shy', 'Mysterious', 'Wild', 'Happy', 'Dreamy'];
const nouns = ['Tiger', 'Moon', 'Star', 'Ocean', 'River', 'Forest', 'Mountain', 'Sky', 'Wolf', 'Tree'];

function generateUsername() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${adjective}${noun}${randomNumber}`;
}

export {generateUsername}
