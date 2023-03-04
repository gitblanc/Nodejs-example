const express = require("express"); //load express library
const fs = require("fs"); //library fileSystem for access information stored
const app = express(); //express app initializing

//for adding items with post requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//petition get to the root directory, 2nd param is callback function
app.get("/", (request, response) => {
  //we have to set what we're going to do with response and request
  return response.send("Hello world!"); //prints hello world
});

//Create an endpoint
app.get("/todos", (request, response) => {
  //filter all the complete todos ones
  const showPending = request.query.showpending;
  //To read the file we stored on store directory with utf-8 encoding
  //Last parameter is the callback function
  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    //Handling errors
    if (err) {
      return response.status(500).send("Something went wrong :("); //http code 500 (error) with a special message
    } //the next code will not execute

    //We are parsing data to JSON because data is actually a string
    const todos = JSON.parse(data);

    //if the query paramenter showpending is not equals to the string "1"
    if (showPending !== "1") {
      return response.json({ todos: todos }); //we return a list like the todos.json
    } else {
      //filter them (return only those which are not completed)
      return response.json({
        todos: todos.filter((t) => {
          return t.complete === false;
        }),
      });
    }
  });
});

//To complete todos on the list
app.put("/todos/:id/complete", (request, response) => {
  const id = request.params.id; //The id of the todo
  //function that finds a todo by its id
  const findTodoById = (todos, id) => {
    //go through the items of the todos list
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].id === parseInt(id)) {
        //parseInt necessary because express treats const as strings by default
        //if the element's id coincides
        return i;
      }
    }
    return -1; //if not found
  };

  //To change the value on the file
  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    //Handling errors
    if (err) {
      return response.status(500).send("Something went wrong :("); //http code 500 (error) with a special message
    } //the next code will not execute
    //We are parsing data to JSON because data is actually a string
    let todos = JSON.parse(data); //let allow to modify the content (different from const)
    const todoIndex = findTodoById(todos, id);

    if (todoIndex == -1) {
      return response.status(404).send("File not found");
    }

    todos[todoIndex].complete = true; //we put the value as true

    //we write changes to the file with todos data being stringify (converted back to)
    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return response.json({ status: "ok" }); //we return ok as it has been modified
    });
  });
}); //quick request to mark a todo

//add items with post requests
app.post("/todo", (request, response) => {
  if (!request.body.name) {
    return response.status(400).send("Missing name");
  }
  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    //Handling errors
    if (err) {
      return response.status(500).send("Something went wrong :("); //http code 500 (error) with a special message
    } //the next code will not execute

    const todos = JSON.parse(data);
    //We find the max id on the file
    const maxId = Math.max.apply(
      Math,
      todos.map((t) => {
        return t.id;
      })
    );

    //We add a new value with a new id higher that higher obtained
    todos.push({
      id: maxId + 1,
      complete: false,
      name: request.body.name,
    });

    //Write changes to the file
    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return response.json({ status: "ok" }); //we return ok as it has been modified
    });
  });
});

//Port listening the inbound traffic
app.listen(3000, () => {
  console.log("App running on http://localhost:3000");
});
