export function cleanPhone(phone: string | null | undefined): string | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 7) return undefined;
    return cleaned;
}

export function validatePhoneFormat(phone: string): boolean {
    // Allows "1234567" or "123-4567"
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 7) return false;

    // Check if it matches visually allowed patterns if needed, 
    // but the user requirement effectively says:
    // "can be entered as xxx-xxxx or xxxxxxx But always max 7 numbers"
    // The visual format check (dash position) might be strict or loose. 
    // Assuming lenient input as long as it has 7 digits is safer for "cleanPhone",
    // but for UI feedback "xxx-xxxx" might be preferred.
    // For now, cleanPhone's length check is the critical backend validation.
    return true;
}

export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 7) {
        return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2');
    }
    return phone;
}

export function formatPhoneInput(value: string): string {
    // Strip all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 7 digits
    const truncated = numbers.substring(0, 7);

    // Format as 123-4567
    if (truncated.length > 3) {
        return `${truncated.substring(0, 3)}-${truncated.substring(3)}`;
    }

    return truncated;
}
