export async function storeMatches(matches) {
    // matches is array of { id, encryptedMatch, iv }
    const payload = matches.map(m => ({
        id: m.id,
        encryptedMatch: m.encryptedMatch,
        iv: m.iv
    }));

    const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: payload }),
    });

    if (!response.ok) {
        throw new Error('Failed to store matches');
    }

    return response.json();
}

export async function getMatch(id) {
    const response = await fetch(`/api/reveal?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch match');
    }
    return response.json();
}

export async function sendEmails(notifications) {
    // notifications: Array of { name, email, link }
    const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send emails');
    }

    return response.json();
}
