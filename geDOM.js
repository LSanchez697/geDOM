 w.geDom = (function(){
    'use strict'
    var path = w.location.pathname,
    checker={
        isArray:function(){
            return Array.isArray(arguments[0]);
        },
        isString:function(){
            return "string" == typeof arguments[0]
        },
        isFunction:function(){
            return "function" == typeof arguments[0]
        },
        isJSON:function(){
            return "object" == typeof arguments[0] && !this.isArray(arguments[0])
        },
        hasKeys:function(o,v){
            if(this.isJSON(o)){
                if(this.isString(v)){
                    return o.hasOwnProperty(p)
                }else if(this.isArray(v)){
                    var estatus = true;
                    v.forEach(function(e){
                        estatus = estatus && this.hasKeys(o,e)
                    })
                    return estatus
                }
            }
        }
    }   

    function deepJsonMerge(){

    }
    function deepFineder(j){

    }
    function dibujason(config){
        if(!checker.isJSON(config) || !config.hasOwnProperty("tag")){
          return;
        }
        var e = document.createElement(config.tag),
            mut = new NodeMutator(e);
        if(config.hasOwnProperty("class") && config.class)
          mut.addClass(config.class)
        if(config.hasOwnProperty("attrs") && config.attrs)
          Object.keys(config.attrs).forEach(function(key){ mut.attr(key,config.attrs[key]) })
        if(config.hasOwnProperty("style") && config.style)
          Object.keys(config.style).forEach(function(key){ mut.style(key,config.style[key]) })
        if(config.hasOwnProperty("content") && config.content)
          mut.addContent(config.content)
        if(config.hasOwnProperty('evt') )
            mut.addEventListener(config.evt)
        return e;
    }
    function reverseElement(element){
        if(!element)
          return false;
        var
          getAttributes = function (){
            var attrs = {};
            element.getAttributeNames().forEach(function(attr){
              if(attr != "class" && attr != "style"){
                attrs[attr] = element.getAttribute(attr)
              }
            })
            return Object.keys(attrs).length?attrs:null;
          },
          getStyle = function(){
            var style = {};
            element.style.cssText.split(";").forEach(function(st){
             if(!!st){ var sp = st.split(":"); style[sp[0].trim()] = sp[1].trim()}
            })
            return Object.keys(style).length?style:null;
          },
          diveNodes = function(){
            var nodes =  [];
            element.childNodes.forEach(function(child){
              if(child.tagName){
                nodes.push(reverseElement(child))
              }else if( checker.isJSON(child) && child.wholeText.trim() ){
                nodes.push(child.wholeText.trim())
              }
            })
            return nodes;
          }

      return {
        "tag":element.tagName.toLocaleLowerCase(),
        attrs:getAttributes(),
        class:element.classList.toString(),
        style:getStyle(),
        content:diveNodes()
      };
    }
    function NodeMutator(element){
      this.body = element
      this.parent = element.parentElement
      this.next = element.nextElementSibling
      this.prev = element.previousElementSibling
    }
        NodeMutator.prototype.style=function(attr,val){
          if(!val){
            return this.body.style[attr]
          }
          this.body.style[attr] = val
          return this
        }
        NodeMutator.prototype.addClass=function(cl){
          if(!cl || "string" != typeof cl)
             return false;
          var mutator = this
          cl.split(" ").forEach(function(c){ mutator.body.classList.add(c)})
          return this
        }
        NodeMutator.prototype.removeClass=function(cl){
          this.body.classList.remove(cl);
          return this
        }
        NodeMutator.prototype.hasClass=function(cl){
          return this.body.classList.contains(cl)
        }
        NodeMutator.prototype.toggleClass=function(cl){
            var mutator = this;
            cl.split(" ").forEach(function(c){
                if(!mutator.hasClass(c)){
                     mutator.addClass(c)
                }else{
                    mutator.removeClass(c)
                }
            })
          return this
        }
        NodeMutator.prototype.attr=function(k,v){
          if(!v)
              return this.body[k]
          this.body.setAttribute(k,v)
          return this;
        }
        NodeMutator.prototype.removeAttr=function(attr){
            this.body.removeAttribute(attr)
        }
        NodeMutator.prototype.addContent=function(content){
            var mut = this
            if(checker.isArray(content)){
              content.forEach(function(co){
                mut.addContent(co)
              })
            }else if(checker.isJSON(content)){
              mut.body.append(dibujason(content))
            }else if(checker.isString(content) || content.tagName){
                mut.body.append(content)
            }else if(checker.isFunction(content)){
                mut.addContent(content())
            }

        }
        NodeMutator.prototype.addEventListener=function(evt,cback){
            var mutator = this,
                body = mutator.body;
            if(checker.isString(evt) && checker.isFunction(cback)){
                body.addEventListener(evt,cback)
            }else if(checker.isJSON(evt) && evt.hasOwnProperty("trigger") && evt.hasOwnProperty("action")){
                mutator.addEventListener(evt.trigger, evt.action)
            }else if(checker.isArray(evt)){
                evt.forEach(function(e){
                    mutator.addEventListener(e)
                })
            }
        }
    //builder:docBuilder,
    //request:new Request()
    function sanearSlugger(txt,espacio){
        if (typeof espacio != "string") {  espacio = "-"; }
        var dpa = new DOMParser();
        txt = dpa.parseFromString(txt,"text/html").body.textContent;
          return txt.trim()
            .toLowerCase()
            .replace(/[\u00E0-\u00E6]/g,'a')
            .replace(/[\u00E8-\u00EB]/g,'e')
            .replace(/[\u00EC-\u00EF]/g,'i')
            .replace(/[\u00F2-\u00F6]/g,'o')
            .replace(/[\u00F9-\u00FC]/g,'u')
            .replace(/[\u00F1]/g,'n')
            .replace(/[^\sA-Z0-9_\-]|[\-\_\s]{2,}/gi,'')
            .replace(/\s/g,espacio);
    }
    function sanearTexto(texto){
        return texto.replace(/[^\w \u00C0-\u00D6\-\?\!\¿\¡]/gi,"")
    }
    return {
      checker:checker,
      m:NodeMutator,
      draw:dibujason,
      toJson:reverseElement,
      slugify:sanearSlugger,
      cleanText:sanearTexto,
      path:function(step){
        if(!step){
            return path;
        }
        return path.split("/").slice(0,step+((step*1)/step)).join("/")
      },
      enviajx:function(c,data){
        $.ajax({
            url:c.url||path+c.slice,
            type:c.type||"GET",
            data:data || c.data,
            processData:c.hasOwnProperty("processData")?c.processData:true,
            contentType:c.hasOwnProperty("contentType")?c.contentType:true
        }).done(c.done||function(){})
          .fail(c.fail || function(){
            showAlert("Ocurrío un error :(")
          })
          .always(c.always || function(){});
      }
    }
})()
Object.freeze(w.geDom)
