// Founding Hosts. Fill in as each one confirms: real portraits only, never stock faces.
// While `name` is empty the slot shows an amber "Soon" circle with [Host name] beneath.
export type Host = { name: string; role: string; company: string; photo?: string };

export const hosts: Host[] = Array.from({ length: 6 }, () => ({ name: "", role: "", company: "" }));
