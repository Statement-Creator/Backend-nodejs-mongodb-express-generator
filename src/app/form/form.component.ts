import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  serverText:String;
  routesText:String;
  modelsText:String;

  modelFileTitle:String;

  generateScript(dbName,port,modelName,postRoute,getRoute,deleteRoute,queryDelete,modelProperties){

    this.modelFileTitle=modelName+".js";

    const serverText = `
    //importing modules

    var express = require('express');
    var mongoose = require('mongoose');
    var bodyparser = require('body-parser');
    var cors = require('cors');
    
    var app = express();
    
    const route = require('./route/routes.js');
    //connect to mongodb
    mongoose.connect('mongodb://localhost:27017/${dbName}');
    
    //on connection success warning
    mongoose.connection.on('connected', ()=>{
      console.log('Mongodb connected');
    });
    
    //on connection error warning
    mongoose.connection.on('error',(err)=>{
      console.log(err);
    });
    
    const PORT =${port};
    
    //adding middleware - cors
    app.use(cors());
    //adding middle -bodyparser
    app.use(bodyparser.json());
    //adding route
    app.use('/api', route);
    
    
    app.get('/',(req,res)=>{
      res.send('invalid endpoint');
    })
    
    app.listen(PORT, ()=>{
      console.log('server has been started:'+PORT)
    })` ;

    const routesTextBeginning = `
    var express = require('express');
    var router =express.Router();
    
    const ${modelName} = require('../model/${modelName}.js');`

    let routesTextPost;

    let routesTextGet;

    let routesTextDelete;

    if(postRoute.length == 0){
     routesTextPost= "";
    }else{
      routesTextPost = `
    //inserting data
    router.post('${postRoute}', (req,res,next)=>{
        let new${modelName} = new ${modelName} ({
          ${modelProperties}
        });
        new${modelName}.save((err,data)=>{
          if(err){
            res.json(err);
          }else{
            res.json({msg: 'data has been added'})
          }
        });
    });
    
    module.exports = router;
    `
    }
    if(getRoute.length == 0){
      routesTextGet = "";
    }else{
      routesTextGet =`
    //retrieving the data
    router.get('${getRoute}', (req, res, next)=>{
      ${modelName}.find(function(err,items){
        if(err){
          res.json(err);
        }else{
          res.json(items);
        }
      });
    });`
    }
    if(deleteRoute.length == 0){
      routesTextDelete = "";
    }else{
      routesTextDelete =`
      //delete the data
      router.delete('${deleteRoute}',(req,res,next)=>{
        ${modelName}.remove({${queryDelete}},function(err,result){
          if(err){
            res.json(err)
          }else{
            res.json(result)
          }
        })
      });`
    }

    const routesText= routesTextBeginning + routesTextDelete + routesTextGet + routesTextPost;

    const modelsText = `
    const mongoose = require('mongoose');

    const ${modelName}Schema = mongoose.Schema({
      ${modelProperties}
    });
    
    const ${modelName} = module.exports = mongoose.model('${modelName}', ${modelName}Schema);`

    this.modelsText = modelsText;
    this.routesText = routesText;
    this.serverText = serverText;

  }

}
