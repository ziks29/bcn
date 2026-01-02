export function cleanPhone(phone: string | null | undefined): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 7) {
        return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2');
    }
    return phone;
}
