console.log('Shop loaded');


function openNav(){
	document.querySelector("#nav").style.height = "100%";
};

function closeNav(){
	document.querySelector("#nav").style.height = "0%";
};

let rangeInput = document.querySelector('#range-input');
let rangeTitle = document.querySelector('#range-title');


function getRangeValue(){
	let rangeValue = Number(rangeInput.value);
	rangeTitle.textContent = 'Value: $' + rangeValue;

	rangeInput.style.background = `linear-gradient(90deg,var(--color_main)${rangeValue+ 0.6 + '%'}, #fff ${rangeValue + '%'}) `;	
}
rangeInput.oninput = function(){
	getRangeValue();
};
getRangeValue();


const cartBtn = document.querySelector(".header__icons");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".cart__clear");
const checkCartBtn = document.querySelector(".cart__checkout");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart__overlay");
const cartItems = document.querySelector(".cart__items");
const cartTotal = document.querySelector(".cart__total");
const cartContent = document.querySelector(".cart__content");
const productsDOM = document.querySelector(".products__center");

// cart

let cart = [];
// buttons
let buttonsDOM = [];

//getting the products

class Products{
	async getProducts(){

		try{
			let result = await fetch('items.json');
			let data = await result.json();
			let products = data.items;
			products = products.map(item => {
				const {title, price, category} = item.fields;
				const {id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return {title, price, category, id, image};
			});
			return products;
		}catch(error){
			console.log(error);
		}
		
	}
	
}

// display products

class UI {
	displayProducts(products){
		let result =  '';
		products.forEach(product => {
			result += `
			<article class="product">
			<div class="img-container">
				<img src=${product.image} alt="fox" class="product__img">
				<div class="button__pos">
					<button class="bag-btn" data-id=${product.id}>
						<i class="fa-solid fa-plus"></i><br>
						Add
					</button>
				</div>
				
			</div>
			<div class="data-container">
				<h3 class="item__title">${product.title}</h3>
				<h4 class="item__price">$${product.price}</h4>
				<span><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></span>
				<h5 class="item__range">${product.category}</h5>
			</div>
		</article>`;
		});
		productsDOM.innerHTML = result;
	
	}
	getBagButtons(){
		const buttons = [...document.querySelectorAll(".bag-btn")];
		buttonsDOM = buttons;
		buttons.forEach(button => {
			let id = button.dataset.id;
		let inCart = cart.find(item => item.id === id);
		if(inCart){
			button.innerText = "In Bag";
			button.disabled = true;
		}
		button.addEventListener('click', (event) => {
			event.target.innerText = "In Bag";
			event.target.disabled = true;
			// get product from products
			let cartItem = {...Storage.getProduct(id), amount: 1};			
			// add product to the cart
			cart = [...cart, cartItem];		
			// save cart in local storage
			Storage.saveCart(cart);
			// set cart values
			this.setCartValues(cart);
			// display cart item
			this.addCartItem(cartItem);
			// show the cart
			this.showCart();
			

			});
		
		});
	}
	setCartValues(cart){
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map(item => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount; 
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;		
	}
	addCartItem(item){
		const div = document.createElement('div');
		div.classList.add('cart__item');
		div.innerHTML = `
		<div class="cart__item-img">
		<img class="cart__img"src=${item.image} alt="fox">														
		<div class="cart__data">
			<h4 class="title">${item.title}</h4>
			<h3 class="price">$${item.price}</h3>									
		</div>
	</div>
	<div class="cart__count">								
		<div class="item__count">
			<div class="value-button down" data-id=${item.id} >-</div>
			<div class="item__amount">${item.amount}</div>
			<div class="value-button up" data-id=${item.id} >+</div>
		</div>
		<div class="item__remove" >
			<p class="remove rem" data-id=${item.id}>Remove </p>
													
		</div>
	</div>
		`;
		cartContent.appendChild(div);
		
	}
	showCart(){
		cartOverlay.classList.add('transparentBcg');
		cartDOM.classList.add('showCart');
	}
	setupAPP(){
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideCart);
	}
	populateCart(cart){
		cart.forEach(item => this.addCartItem(item));
	}
	hideCart(){
		cartOverlay.classList.remove('transparentBcg');
		cartDOM.classList.remove('showCart');
	}
	cartLogic(){
		// clear cart button
		clearCartBtn.addEventListener('click', () => {
			this.clearCart();
		});
		// cart functionality
		cartContent.addEventListener('click', event => {
			if(event.target.classList.contains('rem'))
			{
				let removeItem = event.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
				this.removeItem(id);
			}else if(event.target.classList.contains('up')){
				let addAmount = event.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find(item => item.id ===id);
				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.previousElementSibling.innerHTML = tempItem.amount;
			}else if(event.target.classList.contains('down')){
				let lowerAmount = event.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find(item => item.id ===id);
				tempItem.amount = tempItem.amount - 1;
				if(tempItem.amount > 0){
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.nextElementSibling.innerText = tempItem.amount;
				}else{
					cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});

		checkCartBtn.addEventListener('click', () => {
			console.log(cartTotal);
		});
	}
	clearCart(){
		let cartItems = cart.map(item => item.id);
		cartItems.forEach(id => this.removeItem(id));
		console.log(cartContent.children);

		while(cartContent.children.length > 0){
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	
	}
	removeItem(id){
		cart = cart.filter(item => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `<i class="fa-solid fa-plus"></i><br>
		Add`;
	}
	getSingleButton(id){
		return buttonsDOM.find(button => button.dataset.id === id);
	}
	
}

// local storage

class Storage{
	static saveProducts(products){
		localStorage.setItem("products", JSON.stringify(products));
	}
	static getProduct(id){
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find(product => product.id === id);
	}
	static saveCart(cart){
		localStorage.setItem("cart", JSON.stringify(cart));
	}
	static getCart(){
		return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')): [];
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const ui = new UI();
	const products = new Products();
	// setup app
	ui.setupAPP();

	// get all products
	products.getProducts().then(products =>{ 
		ui.displayProducts(products);
		Storage.saveProducts(products);
		console.log(products);
	}).then(() => {
		ui.getBagButtons();
		ui.cartLogic();
	});
});


