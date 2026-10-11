// Voltcart: a deliberately imperfect demo store for QA practice.
const PRODUCTS=[
{id:1,name:"iPhone 13 128GB",cat:"Phones",price:520000,stock:5,i:"📱"},
{id:2,name:"Samsung Galaxy A54",cat:"Phones",price:310000,stock:8,i:"📱"},
{id:3,name:"Tecno Spark 20",cat:"Phones",price:145000,stock:12,i:"📱"},
{id:4,name:"HP Pavilion 15 Laptop",cat:"Laptops",price:680000,stock:3,i:"💻"},
{id:5,name:"Lenovo ThinkPad E14",cat:"Laptops",price:750000,stock:2,i:"💻"},
{id:6,name:"AirPods Pro",cat:"Audio",price:185000,stock:10,i:"🎧"},
{id:7,name:"JBL Flip 6 Speaker",cat:"Audio",price:95000,stock:7,i:"🔊"},
{id:8,name:"Anker 20W Charger",cat:"Accessories",price:12500,stock:40,i:"🔌"},
{id:9,name:"USB-C Cable 1m",cat:"Accessories",price:4500,stock:100,i:"🔗"},
{id:10,name:"Apple Watch SE",cat:"Wearables",price:260000,stock:0,i:"⌚"},
{id:11,name:"Mi Band 8",cat:"Wearables",price:38000,stock:15,i:"⌚"},
{id:12,name:"Power Bank 20000mAh",cat:"Accessories",price:22000,stock:25,i:"🔋"}];
const COUPONS={SAVE10:0.10,WELCOME5:0.05};
const $=s=>document.querySelector(s);
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const money=n=>"₦"+Number(n).toLocaleString("en-NG");
let view="shop",q="",cat="All",sort="none",authTab="login",coupon=null;

function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",2500)}
function go(v){view=v;render()}
function user(){return get("session",null)}
function cart(){return get("cart",[])}
function totals(){
  const sub=cart().reduce((s,l)=>s+PRODUCTS.find(p=>p.id===l.id).price*l.qty,0);
  const delivery=sub===0?0:(sub>500000?0:2000); // spec: free delivery at ₦500,000 or more
  const disc=coupon?Math.round(sub*COUPONS[coupon.code]*coupon.times):0;
  return{sub,delivery,disc,total:sub+delivery-disc};
}

function render(){
  $("#cart-count").textContent=cart().reduce((s,l)=>s+l.qty,0);
  const u=user(); $("#nav-auth").textContent=u?"Log out ("+u.name+")":"Log in";
  $("#app").innerHTML={shop:shopView,cart:cartView,auth:authView,checkout:checkoutView,orders:ordersView}[view]();
  if(view==="shop")renderGrid();
}

/* ---------- Shop ---------- */
function shopView(){
  const cats=["All",...new Set(PRODUCTS.map(p=>p.cat))];
  return `<h2>Gadgets</h2><div class="bar">
  <input id="search" placeholder="Search products" value="${q}" oninput="q=this.value;renderGrid()" data-testid="search">
  <select onchange="cat=this.value;renderGrid()" data-testid="category">${cats.map(c=>`<option ${c===cat?"selected":""}>${c}</option>`).join("")}</select>
  <select onchange="sort=this.value;renderGrid()" data-testid="sort">
    <option value="none">Sort: Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select>
  </div><div class="grid" id="grid"></div>`;
}
function renderGrid(){
  let list=PRODUCTS.filter(p=>p.name.includes(q)&&(cat==="All"||p.cat===cat)); // BUG-02 lives here
  if(sort==="asc")list.sort((a,b)=>a.price-b.price);
  if(sort==="desc")list.sort((a,b)=>String(b.price).localeCompare(String(a.price))); // BUG-01
  $("#grid").innerHTML=list.length?list.map(p=>`<div class="card" data-testid="product-${p.id}">
    <div class="pic">${p.i}</div><strong>${p.name}</strong><span class="muted">${p.cat}</span>
    <span class="price">${money(p.price)}</span>
    <span class="muted">${p.stock>0?p.stock+" in stock":"Out of stock"}</span>
    <button class="btn" ${p.stock===0?"disabled":""} onclick="add(${p.id})" data-testid="add-${p.id}">Add to cart</button></div>`).join("")
    :`<p data-testid="no-results">No products match "${q}". Try a different search.</p>`;
}
function add(id){
  const c=cart(),l=c.find(x=>x.id===id);
  l?l.qty++:c.push({id,qty:1}); // BUG-05: stock limit never checked
  set("cart",c);toast("Added to cart");render();
}

/* ---------- Cart ---------- */
function cartView(){
  const c=cart(); if(!c.length)return `<div class="panel" data-testid="empty-cart"><h2>Your cart is empty</h2><button class="btn" onclick="go('shop')">Browse gadgets</button></div>`;
  const t=totals();
  return `<h2>Cart</h2><div class="panel">${c.map(l=>{const p=PRODUCTS.find(x=>x.id===l.id);
    return `<div class="row"><span>${p.i} ${p.name}<br><span class="muted">${money(p.price)} each</span></span>
    <input type="number" min="1" value="${l.qty}" onchange="setQty(${p.id},this.value)" data-testid="qty-${p.id}" aria-label="Quantity for ${p.name}">
    <strong>${money(p.price*l.qty)}</strong>
    <button class="btn alt" onclick="removeItem(${p.id})" data-testid="remove-${p.id}">Remove</button></div>`}).join("")}</div>
  <div class="panel"><div class="bar"><input id="coupon" placeholder="Coupon code" data-testid="coupon-input">
    <button class="btn alt" onclick="applyCoupon()" data-testid="coupon-apply">Apply coupon</button></div>
    <div class="err" id="coupon-msg" data-testid="coupon-msg">${coupon?`<span class="ok">${coupon.code} applied</span>`:""}</div>
    <div class="row"><span>Subtotal</span><span data-testid="subtotal">${money(t.sub)}</span></div>
    <div class="row"><span>Delivery</span><span data-testid="delivery">${t.delivery?money(t.delivery):"Free"}</span></div>
    <div class="row"><span>Discount</span><span data-testid="discount">-${money(t.disc)}</span></div>
    <div class="row total"><span>Total</span><span data-testid="total">${money(t.total)}</span></div>
    <button class="btn" onclick="toCheckout()" data-testid="checkout-btn">Go to checkout</button></div>`;
}
function setQty(id,v){
  let n=parseInt(v,10); const c=cart(); if(isNaN(n))n=1;
  const l=c.find(x=>x.id===id); l.qty=n; // BUG-08: negative/zero quantities accepted
  set("cart",c);render();
}
function removeItem(id){set("cart",cart().filter(l=>l.id!==id));render()}
function applyCoupon(){
  const code=$("#coupon").value.trim().toUpperCase();
  if(!COUPONS[code]){$("#coupon-msg").textContent="Invalid coupon code.";return}
  coupon={code,times:(coupon&&coupon.code===code?coupon.times:0)+1}; // BUG-03: coupon stacks when re-applied
  render();
}
function toCheckout(){
  if(!user()){toast("Log in to check out");authTab="login";return go("auth")}
  go("checkout");
}

/* ---------- Auth ---------- */
function authView(){
  const u=user();
  if(u)return `<div class="panel"><h2>Hi, ${u.name}</h2><button class="btn" onclick="logout()" data-testid="logout">Log out</button></div>`;
  const reg=authTab==="register";
  return `<div class="panel" style="max-width:420px;margin:auto"><div class="tabs">
    <button class="btn ${reg?"alt":""}" onclick="authTab='login';render()" data-testid="tab-login">Log in</button>
    <button class="btn ${reg?"":"alt"}" onclick="authTab='register';render()" data-testid="tab-register">Register</button></div>
    <form onsubmit="event.preventDefault();${reg?"register()":"login()"}">
    ${reg?`<label for="name">Full name</label><input id="name" data-testid="name">`:""}
    <label for="email">Email</label><input id="email" data-testid="email">
    <label for="password">Password (min 8 characters)</label><input id="password" type="password" data-testid="password">
    <div class="err" id="auth-err" data-testid="auth-err"></div>
    <button class="btn" data-testid="auth-submit">${reg?"Create account":"Log in"}</button></form></div>`;
}
function authErr(m){$("#auth-err").textContent=m}
function register(){
  const name=$("#name").value.trim(),email=$("#email").value.trim().toLowerCase(),pw=$("#password").value;
  if(!name)return authErr("Enter your full name.");
  if(!email.includes("@"))return authErr("Enter a valid email address."); // BUG-04: "a@b" passes
  if(pw.length<8)return authErr("Password must be at least 8 characters.");
  const users=get("users",[]);
  if(users.some(x=>x.email===email))return authErr("An account with this email already exists.");
  users.push({name,email,pw});set("users",users);set("session",{name,email});
  toast("Account created");go("shop");
}
function login(){
  const email=$("#email").value.trim().toLowerCase(),pw=$("#password").value;
  const u=get("users",[]).find(x=>x.email===email&&x.pw===pw);
  if(!u)return authErr("Email or password is incorrect.");
  set("session",{name:u.name,email:u.email});toast("Logged in");go(cart().length?"cart":"shop");
}
function logout(){localStorage.removeItem("session");toast("Logged out");go("shop")}

/* ---------- Checkout ---------- */
function checkoutView(){
  const t=totals();
  return `<div class="panel" style="max-width:520px;margin:auto"><h2>Checkout</h2>
  <form onsubmit="event.preventDefault();placeOrder()">
  <label for="c-name">Recipient name</label><input id="c-name" data-testid="c-name">
  <label for="c-phone">Phone (11 digits)</label><input id="c-phone" data-testid="c-phone">
  <label for="c-addr">Delivery address</label><input id="c-addr" data-testid="c-addr">
  <label for="c-pay">Payment method</label><select id="c-pay" data-testid="c-pay">
    <option value="">Select</option><option>Card</option><option>Bank transfer</option><option>Pay on delivery</option></select>
  <div class="err" id="co-err" data-testid="co-err"></div>
  <p class="total">Pay ${money(t.total)}</p>
  <button class="btn" data-testid="place-order">Place order</button></form></div>`;
}
function placeOrder(){
  const name=$("#c-name").value.trim(),phone=$("#c-phone").value.trim(),addr=$("#c-addr").value.trim(),pay=$("#c-pay").value;
  const e=m=>$("#co-err").textContent=m;
  if(!name)return e("Enter the recipient name.");
  if(phone.length<11)return e("Enter an 11-digit phone number."); // BUG-07: letters accepted
  if(addr.length<5)return e("Enter a full delivery address.");
  if(!pay)return e("Select a payment method.");
  const t=totals(),id="VC"+Date.now().toString().slice(-6);
  const orders=get("orders",[]);
  orders.unshift({id,email:user().email,date:new Date().toLocaleString(),items:cart(),total:t.total,pay,status:"Processing"});
  set("orders",orders);set("cart",[]);coupon=null;
  $("#app").innerHTML=`<div class="panel" data-testid="confirmation"><h2 class="ok">Order placed</h2>
  <p>Order number: <strong data-testid="order-id">${id}</strong></p><p>Total paid: ${money(t.total)}</p>
  <button class="btn" onclick="go('orders')">View orders</button></div>`;
  $("#cart-count").textContent="0";
}

/* ---------- Orders ---------- */
function ordersView(){
  if(!user())return `<div class="panel"><h2>Orders</h2><p>Log in to see your orders.</p><button class="btn" onclick="go('auth')">Log in</button></div>`;
  const list=get("orders",[]).filter(o=>o.email===user().email);
  if(!list.length)return `<div class="panel" data-testid="no-orders"><h2>No orders yet</h2><p>Your orders will appear here.</p></div>`;
  return `<h2>Your orders</h2>`+list.map(o=>`<div class="panel" data-testid="order-${o.id}"><div class="row"><strong>${o.id}</strong><span>${o.status}</span></div>
  <p class="muted">${o.date} | ${o.pay}</p>${o.items.map(l=>{const p=PRODUCTS.find(x=>x.id===l.id);return `<div>${p.name} x ${l.qty}</div>`}).join("")}
  <p class="total">${money(o.total)}</p></div>`).join("");
}
render();
