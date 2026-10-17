function decodeJwtPayload(token: string): any | null {
    try {
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
        const parts = cleanToken.split(".");
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export const isTokenExpired = (token?: string): boolean => {
    if(!token) return true;

    const payload = decodeJwtPayload(token);

    if(!payload || !payload.exp) return false;

    const expiredTime = payload.exp * 1000;
    const now = Date.now();

    return now > expiredTime;
}