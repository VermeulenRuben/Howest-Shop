"use strict";

const PROGRAM = (function () {
    return {
        init: function () {
            STORAGE.getCart(function (cart) {
                let total = 0;
                FETCH.lineItemsOutCart(cart, function (products) {
                    products.forEach(p => {
                        p.quantity = cart.find(pr => pr.id = p.id).quantity;
                        total += p.price*p.quantity;
                    });
                    document.getElementById("cart").innerText = "";
                    VIEW.productsToCartView(products);
                    VIEW.showPriceTotal(total);
                });
            });
            VIEW.addCartEventListeners();
        }
    };
})();

document.addEventListener("DOMContentLoaded", PROGRAM.init);