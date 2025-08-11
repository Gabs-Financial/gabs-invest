/**
 * Convert a kobo amount to naira as a number.
 * @param kobo - Amount in kobo (e.g. 12345)
 * @returns Naira amount (e.g. 123.45)
 */
export function koboToNaira(kobo: number): number {
    return kobo / 100;
}

/**
 * Convert a kobo amount to a formatted naira string.
 * @param kobo - Amount in kobo (e.g. 12345)
 * @param options - Intl.NumberFormat options (optional)
 * @returns Formatted string (e.g. "₦123.45")
 */
export function formatKoboAsNaira(
    kobo: number,
    options?: Intl.NumberFormatOptions
): string {
    const naira = koboToNaira(kobo);
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        ...options,
    }).format(naira);
}
