let express =require("express");
let app = express();
app.use(express.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, OPTIONS, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
var port = process.env.PORT || 2410;
app.listen(port,()=>console.log(`Listening on port ${port}!`));

let {data} =require("./shopsData.js");
//console.log(data);
//console.log(data.shops);

app.get("/test",function(req, res){
    res.send("Test Response1234")
})



app.get("/shops",function(req, res){
    let shops=data.shops.map(shop=>{
        return {shopId:shop.shopId, name : shop.name}});
    res.send(shops);
});
app.get("/products",function(req, res){
    
    res.send(data.products);
});
app.get("/products/:id",function(req, res){
    let id= +req.params.id;
    let findProd=data.products.find((prod)=>prod.productId==id)
    res.send(findProd);
});

app.get("/purchases",function(req, res){
    let sort=req.query.sort;
    let product=req.query.product;
    let productArr=product?product.split(","):[];
    let productIdArr=[];
    let shop=req.query.shop;

    let shopJason=shop?data.shops.find(sh=>sh.name==shop):undefined;
    let shopId=shopJason?shopJason.shopId:undefined;
   if(product) 
   {
    for(let i=0; i<data.products.length; i++)
    {
        for(let j=0; j<productArr.length; j++)
        {
            if(productArr[j]==data.products[i].productName)
            {
                productIdArr.push(data.products[i].productId)
            }
        }
    }
    }
   

    console.log(sort);
    let arr1=data.purchases;
    arr1=shopId?arr1.filter(pur=>pur.shopId==shopId):arr1;
    arr1=product?arr1.filter(pur=>productIdArr.find(id=>id==pur.productid)):arr1;
    arr1=sort=="QtyAsc"?arr1.sort((p1,p2)=>p1.quantity - p2.quantity):arr1;
    arr1=sort=="QtyDesc"?arr1.sort((p1,p2)=>p2.quantity - p1.quantity):arr1;
    arr1=sort=="ValueAsc"?arr1.sort((p1,p2)=>(p1.quantity * p1.price) - (p2.quantity*p2.price)):arr1;
    arr1=sort=="ValueDesc"?arr1.sort((p1,p2)=>(p2.quantity * p2.price) - (p1.quantity*p1.price)):arr1;
    let purchases=arr1.map(pur=>{
        return {shopId:pur.shopId, productid : pur.productid,quantity : pur.quantity,price : pur.price}});
    res.send(purchases);
});
app.get("/purchases/shops/:id",function(req, res){
    let id= +req.params.id;
    let purArr=data.purchases.filter(pr=>pr.shopId==id)
    let purchases=purArr.map(pur=>{
        return {shopId:pur.shopId, productid : pur.productid,quantity : pur.quantity,price : pur.price}});
    res.send(purchases);
});
app.get("/purchases/products/:id",function(req, res){
    let id= +req.params.id;
    let purArr=data.purchases.filter(pr=>pr.productid==id)
    let purchases=purArr.map(pur=>{
        return {shopId:pur.shopId, productid : pur.productid,quantity : pur.quantity,price : pur.price}});
    res.send(purchases);
});

app.get("/totalPurchase/shop/:id",function(req, res){
    let id= +req.params.id;
    let finalArr=[];
    let purArr=data.purchases.filter(pr=>pr.shopId==id)
    let arr1=data.products.map((pro)=>{
        let proJason=purArr.reduce((acc,cur)=>{
            if(cur.productid==pro.productId && acc==undefined)
            return cur;
            else if(cur.productid==pro.productId )
            {
                acc.quantity+=cur.quantity;
                return acc;
            }
            else
            {
                return acc;
            }
            
        },undefined)

        return proJason;
    })
    console.log(arr1);
    for (let i=0; i<arr1.length; i++)
    {
        if(arr1[i]!=undefined)
        finalArr.push(arr1[i]);
    }
    let purchases=finalArr.map(pur=>{
        return {productid : pur.productid,quantity : pur.quantity,price : pur.price}});
    res.send(purchases);
});

app.get("/totalPurchase/product/:id",function(req, res){
    let id= +req.params.id;
    let finalArr=[];
    let purArr=data.purchases.filter(pr=>pr.productid==id)
    let arr1=data.shops.map((pro)=>{
        let proJason=purArr.reduce((acc,cur)=>{
            if(cur.shopId==pro.shopId && acc==undefined)
            return cur;
            else if(cur.shopId==pro.shopId )
            {
                acc.quantity+=cur.quantity;
                return acc;
            }
            else
            {
                return acc;
            }
            
        },undefined)

        return proJason;
    })
    console.log(arr1);
    for (let i=0; i<arr1.length; i++)
    {
        if(arr1[i]!=undefined)
        finalArr.push(arr1[i]);
    }
    let purchases=finalArr.map(pur=>{
        return { shopId:pur.shopId, productid : pur.productid,quantity : pur.quantity,price : pur.price}});
    res.send(purchases);
});


app.post("/shops",function(req, res){
    let body=req.body;
    console.log(body);
    let maxid=data.shops.reduce((acc,cur)=>cur.shopId>acc?cur.shopId:acc ,0);
    let newid=maxid+1;
    let newShop={shopId:newid, ...body}
    data.shops.push(newShop)
    res.send(newShop)
});



app.post("/products",function(req, res){
    let body=req.body;
    console.log(body);
    let maxid=data.products.reduce((acc,cur)=>cur.productId>acc?cur.productId:acc ,0);
    let newid=maxid+1;
    let newProduct={productId:newid, ...body};
    data.products.push(newProduct);
    res.send(newProduct);
});
app.post("/purchases",function(req, res){
    let body=req.body;
    console.log(body);
    let maxid=data.purchases.reduce((acc,cur)=>cur.purchaseId>acc?cur.purchaseId:acc ,0);
    let newid=maxid+1;
    let newPurchase={purchaseId:newid, ...body};
    data.purchases.push(newPurchase);
    res.send(newPurchase);
});

app.put("/products/:id",function(req, res){
    let id = +req.params.id;
    let body=req.body;
    let index=data.products.findIndex((pro)=>pro.productId==id);
    if(index>=0)
    {
    let newProduct={productId:id,productName:data.products[index].productName, ...body};
    data.products[index]=newProduct;
    res.send(newProduct)
    }
    else
    {
        res.status(404).send("No Product Found");
    }
})