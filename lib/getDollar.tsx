export async function getDollarRate() {
    try {
        const response = await fetch("https://api.bluelytics.com.ar/v2/latest", {
            next: { revalidate: 3600 }
        });
        const data = await response.json();
        return data.oficial.value_sell;
    } catch (error) {
        console.error("Error fetching dollar:", error);
        return null;
    }
}