// pizza-data.js
const pizzaData = [
    {
        id: 1,
        name: "Маргарита",
        description: "Томатный соус, моцарелла, базилик",
        price: 450,
        available: "Y"
    },
    {
        id: 2,
        name: "Пепперони",
        description: "Томатный соус, моцарелла, пепперони",
        price: 550,
        available: "Y"
    },
    {
        id: 3,
        name: "Гавайская",
        description: "Томатный соус, моцарелла, курица, ананас",
        price: 500,
        available: "Y"
    },
    {
        id: 4,
        name: "Четыре сыра",
        description: "Сливочный соус, моцарелла, пармезан, дор блю, чеддер",
        price: 600,
        available: "Y"
    },
    {
        id: 5,
        name: "Вегетарианская",
        description: "Томатный соус, моцарелла, перец, грибы, оливки, кукуруза",
        price: 500,
        available: "Y"
    },
    {
        id: 6,
        name: "Карбонара",
        description: "Сливочный соус, моцарелла, бекон, яйцо, пармезан",
        price: 580,
        available: "H"
    },
    {
        id: 7,
        name: "Мясная",
        description: "Томатный соус, моцарелла, пепперони, ветчина, бекон, курица",
        price: 650,
        available: "Y"
    },
    {
        id: 8,
        name: "Трюфельная",
        description: "Сливочный соус, моцарелла, трюфельное масло, грибы, пармезан",
        price: 750,
        available: "N"
    },
    {
        id: 9,
        name: "Диабло",
        description: "Острый томатный соус, моцарелла, салями, перец халапеньо, чили",
        price: 570,
        available: "H"
    }
];

// Пиццы, которые никогда не могут быть пиццей дня
const excludedFromDaily = ["Маргарита", "Четыре сыра", "Вегетарианская"];