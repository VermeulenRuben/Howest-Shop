"use strict";

const PROGRAM = (function () {
    return {
        init: function () {
            FETCH.products("consumerCred.json", function (array) {
                VIEW.showProducts(array.map(MAPPING.json2Product));
                VIEW.addShopEventListeners();
                VIEW.showProductCount();
            });
            STORAGE.setEmptyCart(function () {
                // Do Nothing
            });
        }
    };
})();

document.addEventListener("DOMContentLoaded", PROGRAM.init);