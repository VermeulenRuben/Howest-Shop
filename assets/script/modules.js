// ------- With OAuth2.0 --------

// const FETCH = (function () {
//
//     let apiRoot = "http://localhost/howest-shop/wp-json/wc/v3";
//     let apiToken = "Bearer nSEsSlrXl5Pn";
//     let fetchRequest = function(link, config, cb){
//         fetch(link, config).then((response) => {
//             return response.json()
//         }).then((json) => {
//             cb(json);
//         })
//     };
//
//     return {
//         lineItemsOutCart: function (cart, cb) {
//             Promise.all(cart.map(p =>
//                 fetch(`${apiRoot}/products/${p.product_id}`, {
//                     headers: {'Authorization': apiToken}
//                 }).then((response) => {
//                     response = response.json();
//                     return response;
//                 })
//             )).then(function (products) {
//                 products = products.map(MAPPING.json2Product);
//                 cb(products)
//             });
//         },
//
//         products: function (cb) {
//             fetchRequest(`${apiRoot}/products`,
//                 {
//                     headers: {'Authorization': apiToken}
//                 }, cb);
//         },
//         sendOrder: function (body, cb) {
//             fetchRequest(`${apiRoot}/orders`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': apiToken
//                     },
//                     body: JSON.stringify(body)
//                 }, cb)
//         }
//     }
// })();

// ------- With Legacy Api --------
// The worst way, but only one that worked on Combell

const FETCH = (function () {

    let apiRoot = "https://ruwbz.be/wp-json/wc/v3";

    function getParams(path ,cb) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', path, true);
        xobj.onload = function () {
            if(xobj.status ===  200){
                let json = JSON.parse(xobj.responseText);

                let array = [];
                Object.keys(json).forEach(function (key) {
                    let partArray = [];
                    partArray.push(key,"=",json[key]);
                    array.push(partArray.join(""))
                });
                cb(`?${array.join("&")}`);
            }
        };
        xobj.send(null);
    }

    let fetchRequest = function(link, config, cb, path){
        getParams(path ,function (params) {
            fetch(`${link}${params}`, config,).then((response) => {
                return response.json()
            }).then((json) => {
                cb(json);
            });
        });
    };

    return {
        lineItemsOutCart: function (cart, cb) {
            getParams("../../consumerCred.json" ,function ( params) {
                Promise.all(cart.map(p =>
                    fetch(`${apiRoot}/products/${p.product_id}${params}`)
                        .then((response) => {
                            response = response.json();
                            return response;
                        })
                )).then(function (products) {
                    products = products.map(MAPPING.json2Product);
                    cb(products)
                });
            })
        },

        productsOutCart: function (cart, cb) {
            getParams("../../consumerCred.json" ,function ( params) {
                Promise.all(cart.map(p =>
                    fetch(`${apiRoot}/products/${p.product_id}${params}`)
                        .then((response) => {
                            response = response.json();
                            return response;
                        })
                )).then(function (products) {
                    cb(products)
                });
            })
        },

        products: function (path, cb) {
            fetchRequest(`${apiRoot}/products`,
                {}, cb, path);
        },
        sendOrder: function (body, cb) {
            fetchRequest(`${apiRoot}/orders`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                }, cb, "../../consumerCred.json")
        }
    }
})();

const MAPPING = (function () {
    return {
        json2Product: function(product){
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                href: product._links.self[0].href,
                categories: product.categories,
                images: product.images
            }
        },

        product2LineItem: function (product_id) {
            return {
                product_id: product_id,
                quantity: 1
            }
        }
    }
})();

const VIEW = (function () {
    return {
        productsToCartView: function (products) {
            document.getElementById("cart").innerText = "";
            products.forEach(product =>{
                let e = document.createElement("li");
                let p1 = document.createElement("p");
                let p2 = document.createElement("p");
                let p3 = document.createElement("p");
                let x = document.createElement("p");
                x.id = product.id;
                p1.innerText = product.name;
                p2.innerText = `${product.price} EUR x ${product.quantity}`;
                p3.innerText = `${product.price*product.quantity} EUR`;
                x.innerText = "x";
                x.classList.add("cart-remove");
                e.classList.add("cart-product");
                e.id = product.id;
                e.appendChild(p1); e.appendChild(p2);
                e.appendChild(p3); e.appendChild(x);
                document.getElementById("cart").appendChild(e);
            })
        },
        showProducts: function (products) {
            document.getElementById("shop").innerText = "";
            products.forEach(pr => {
                let e = document.createElement("li");
                let i = document.createElement("img");
                let p = document.createElement("p");
                let s = document.createElement("span");
                let b = document.createElement("button");

                e.classList.add("shop-product");
                b.classList.add("shop-product-button");
                b.id = pr.id;
                b.innerText = "Add to Cart";
                if(pr.images.length > 0) i.src = pr.images[0].src;
                else i.src = "https://ruwbz.be/wp-content/uploads/woocommerce-placeholder.png";
                p.innerText = pr.name;
                s.innerText = `${pr.price} EUR`;
                e.appendChild(i); e.appendChild(p);
                e.appendChild(s); e.appendChild(b);
                document.getElementById("shop").appendChild(e);
            })
        },
        addCartEventListeners: function () {
            document.getElementById("order").addEventListener('click', function (e) {
                e.preventDefault();
                let form = document.getElementById("order-form");
                if(form.style.display === "none") form.style.display = "block";
                else form.style.display = "none";
            });

            document.getElementById("order-form").addEventListener('submit', function (e) {
                e.preventDefault();
                let inputs = Array.from(document.getElementById("order-form").querySelectorAll('input[type=text]'));
                if(!(inputs.filter(i => i.value === "") > 0 && inputs.some(r => ["address_2", "state"].includes(r.id))))
                {
                    let billing = {};
                    for(let i = 0; i<inputs.length; i++){
                        billing[inputs[i].id] = inputs[i].value;
                    }
                    STORAGE.getCart(function (line_items) {
                        let data = {
                            set_paid: true,
                            billing: billing,
                            line_items: line_items
                        };
                        FETCH.sendOrder(data, function (response) {
                            STORAGE.setEmptyCart(function () {
                                alert("Send succesfully");
                            })
                        })
                    })
                }
            });

            document.addEventListener('click', function (e) {
                e.preventDefault();
                if(e.target && e.target.classList.contains("cart-remove")){
                    STORAGE.removeItemFromCart(e.target.id, function (line_items) {
                        let total = 0;
                        FETCH.productsOutCart(line_items, function (products) {
                            products.forEach(p => {
                                p.quantity = line_items.find(pr => pr.id = p.id).quantity;
                                total += p.price*p.quantity;
                            });
                            document.getElementById("cart").innerText = "";
                            VIEW.productsToCartView(products);
                            VIEW.showPriceTotal(total);
                        })
                    });
                }
            });
        },

        addShopEventListeners: function () {
            document.addEventListener('click', function (e) {
                e.preventDefault();
                if(e.target && e.target.classList.contains("shop-product-button")){
                    STORAGE.addItemToCart(e.target.id, function () {
                        VIEW.showProductCount();
                    });
                }
            });

            document.getElementById("amountProducts")
                .addEventListener('click', function (e) {
                    e.preventDefault();
                    document.location.href = "/Howest-Shop/assets/pages/cart.html";
                })
        },
        showProductCount: function () {
            STORAGE.getCartCount(function (count) {
                document.getElementById("amountProducts")
                    .getElementsByTagName("p")[0]
                    .innerText = count;
            })
        },
        showPriceTotal: function (totalPrice) {
            document.getElementById("totalPrice").innerText = totalPrice;
        }
    }
})();
