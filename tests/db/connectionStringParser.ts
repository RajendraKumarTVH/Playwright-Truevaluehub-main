export function parseDotNetConnectionString(conn: string) {
    const parts = conn.split(';').filter(Boolean);
    const map: Record<string, string> = {};

    for (const part of parts) {
        const [key, value] = part.split('=');
        map[key.trim().toLowerCase()] = value?.trim();
    }

    return {
        server: map['data source'],
        database: map['initial catalog'],
        user: map['uid'],
        password: map['password']
    };
}
