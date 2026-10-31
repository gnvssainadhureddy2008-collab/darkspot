export const asArray = (value) => (Array.isArray(value) ? value : (value?.items ?? []));

export const shortId = (value) => String(value || "").slice(-6);