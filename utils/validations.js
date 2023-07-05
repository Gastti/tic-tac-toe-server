import validator from "validator";

const checkPlayer = (player) => {
    // Check if player is an object
    if (typeof player !== "object") return false;

    const { id, name, avatar } = player;

    // Check if is a string
    if (typeof id !== "string") return false;
    if (typeof name !== "string") return false;
    if (typeof avatar !== "string") return false;

    // Delete spaces
    const trimedId = id.trim()
    const trimedName = name.trim();
    const trimedAvatar = avatar.trim();

    // Replace special caracters like "<, >, etc"
    const escapedId = validator.escape(trimedId)
    const escapedName = validator.escape(trimedName);
    const escapedAvatar = validator.escape(trimedAvatar);
    const unescapedAvatar = escapedAvatar.replace(/&#x2F;/g, "/")

    // Validate length
    if (escapedName.length < 3 || escapedName.length > 15 || unescapedAvatar.length > 28 || escapedId.length !== 36) {
        return {
            ok: false,
            data: null
        }
    }

    return {
        ok: true,
        data: {
            playerId: escapedId,
            playerName: escapedName,
            playerAvatar: unescapedAvatar,
        }
    };
}

const checkLobbyId = (id) => {

    // Check if is a string
    if (typeof id !== "string") return false;

    // Delete spaces
    const trimedId = id.trim()

    // Replace special caracters like "<, >, etc"
    const escapedId = validator.escape(trimedId)

    // Validate length
    if (escapedId.length !== 6) return { ok: false, data: null };

    return { ok: true, data: { id: escapedId } };
}

const checkMove = (data) => {
    const { marker, index } = data;
    if (typeof marker !== "string" || (marker !== "X" && marker !== "O") || typeof index !== "number") return false;
    return true;
}

export { checkPlayer, checkLobbyId, checkMove }