
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// main().catch(err => console.log(err));

// async function main() {

  // mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

  mongoose.connect('mongodb+srv://Hariharan_A:PASSWORD@cluster0.awnduiy.mongodb.net/todolistDB');

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const item = mongoose.model("Item", itemsSchema);

  const item1 = new item({
    name: "Welcome to your To Do List!"
  });

  const item2 = new item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new item({
    name: "<-Hit this to delete a item."
  });

  const defaultItems= [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);

  app.get("/", async (req, res)=>{

    try{

      const foundItems = await item.find({});

      if(foundItems.length === 0){

        item.insertMany(defaultItems).then(
          (result) => {
              console.log("Successfully saved default items to itemsDB");
              res.redirect("/");
          }
          ).catch(
            (err) => {
                console.log(err);
            }
          )
      }

      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

    }
    catch(error){
      throw error
    }
  })

// }

app.get("/:customListName", async (req, res) => {

  const customListName = _.capitalize(req.params.customListName);

  const doc = await List.findOne({ name: customListName })

  if(!doc){

    const list = new List({
      name: customListName,
      items: defaultItems
    });
  
    list.save();

    res.redirect("/" + customListName);
  }
  else{
    res.render("list", {listTitle: doc.name, newListItems: doc.items});
  }

})

app.post("/", async (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new item({
    name: itemName
  });

  if(listName === "Today"){

    item4.save();
    res.redirect("/");

  }
  else{

    const docs = await List.findOne({ name: listName })

    docs.items.push(item4);
    docs.save();

    res.redirect("/" + listName);
  }

});

app.post("/delete", async (req, res) =>{

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if ( listName === "Today"){

    await item.deleteOne({_id : checkedItemId});

    res.redirect("/");
  }
  else{

    await List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemId}}})

    res.redirect("/" + listName);
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
