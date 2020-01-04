"use strict";
const DRIVERS = [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE];

localforage.setDriver(DRIVERS).then(function () {
    console.log("LocalForage: Current driver set to " + localforage.driver() + ".")
});

const STORAGE = (function () {
    const CART_KEY = "howest-cart";

    return {
        getCart: function (cb) {
            localforage.getItem(CART_KEY, function (err, cart) {
                if(!err) cb(cart);
            });
        },

        getCartCount: function (cb) {
            this.getCart(function (cart) {
                let length = cart
                    .map(p => p.quantity)
                    .reduce((a,b) => a+b, 0);
                cb(length);
            })
        },

        setEmptyCart: function (cb) {
            localforage.setItem(CART_KEY, [] , cb())
        },

        addItemToCart: function (product, cb) {
            this.getCart(function (cart) {
                if(!cart.map(p => p.product_id).includes(product)){
                    cart.push({product_id: product, quantity: 1});
                } else {
                    cart.find(p => p.product_id === product).quantity++;
                }
                localforage.setItem(CART_KEY, cart, function () {
                    cb()
                });
            });
        },

        removeItemFromCart: function (product, cb) {
            this.getCart(function (cart) {
                cart = cart.map(p => p.product_id).filter(p => p !== product);
                localforage.setItem(CART_KEY, cart, function () {
                    cb()
                });
            });

        }
    }
})();