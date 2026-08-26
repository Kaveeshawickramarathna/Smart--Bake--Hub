const axios = require('axios');

async function test() {
    try {
        const [sales, payments, inv, book] = await Promise.all([
            axios.get('http://localhost:5000/api/reports/sales').catch(e => e.response),
            axios.get('http://localhost:5000/api/reports/payments').catch(e => e.response),
            axios.get('http://localhost:5000/api/reports/inventory').catch(e => e.response),
            axios.get('http://localhost:5000/api/reports/bookings').catch(e => e.response)
        ]);

        console.log("Sales keys:", sales.data ? Object.keys(sales.data) : sales.status);
        if (sales.data) {
            console.log("Sales topItems:", !!sales.data.topItems);
        }

        console.log("Payments keys:", payments.data ? Object.keys(payments.data) : payments.status);
        console.log("Inventory keys:", inv.data ? Object.keys(inv.data) : inv.status);
        if (inv.data) {
            console.log("Inventory categories:", !!inv.data.categories);
            console.log("Inventory lowStockItems:", !!inv.data.lowStockItems);
        }

        console.log("Bookings keys:", book.data ? Object.keys(book.data) : book.status);
        if (book.data) {
            console.log("Bookings upcoming:", !!book.data.upcoming);
        }
    } catch (e) {
        console.error(e.message);
    }
}
test();
