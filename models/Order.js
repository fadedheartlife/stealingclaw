class Order {
    constructor(type, amount, price) {
        this.type = type; // 'buy' or 'sell'
        this.amount = amount;
        this.price = price;
        this.timestamp = new Date(); // Order creation timestamp
    }

    getOrderDetails() {
        return {
            type: this.type,
            amount: this.amount,
            price: this.price,
            timestamp: this.timestamp,
        };
    }
}

module.exports = Order;