(function(w){
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
                                nodes.push(reverseElement(child));
                            }else if( checker.isJSON(child) && child.wholeText.trim() ){
                                nodes.push(child.wholeText.trim());
                            }
                        });
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

            function sanearSlugger(txt,espacio){
                if (typeof espacio != "string") {  espacio = "-"; }
                    var dpa = new DOMParser(),
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

            /**
             * @description Hace una busqueda profunda en las propiedades de un objeto de forma 'a.b.c.d.e' usando 
             * notacion separada por puntos, si el dato no se encuentra retorna un valor nulo.
             * @argument key, la propiedad que se está buscando ej. 'carrito.contenido.productos'
             * @argument object es el objeto desde donde se están intentando leer los datos.
            */
            function deepSearch(key,object){
                var keys = key.split("."),
                    root = keys[0],
                    rest = keys.slice(1).join(".");
                if(!root || 'object' !== typeof object || Array.isArray(object) ){ return null }
                else if( object.hasOwnProperty(root) ){
                    var nvoV = object[root];
                        if( !!rest ){ return deepSearch(rest,nvoV) }
                    return nvoV
                }
            }

            /**
             * Para hacer una sustitucion de texto con un arreglo ej:
             * "yo {$1} un {$2} {$0}".formatString(['normal', 'soy', 'ejemplo'])
             * ==> yo soy un ejemplo normal
            */
            String.prototype.formatString = function(parms){
                if(!Array.isArray(parms) ){
                    return false;
                }
                return this.replace(/\{\$\d\}/g,function(found){
                    var indx = found.match(/\d{1,}/g);
                    return 'string' == typeof parms[indx] ? parms[indx] : found;
                });
            }

            /**
             * @argument Object a el primer objeto
             * @argument Object b 2do objeto
             * @argument Object forceKeys son valores por defaul para forzar la seleccion, 
             * solo se recorren las llaves en este último si se incluye y se toma su valor como
             * un valor por default cuando el segundo objeto no cuenta con alguna llave
            */
            function mergeJson(a,b,forceKeys){
                var clona = Object.assign({},a),
                    clonb = Object.assign({},b);
                Object.keys( (!!forceKeys?forceKeys:b) ).forEach(function(k){
                    if(typeof v == 'object' && !Array.isArray(v)){
                        clona[k] = mergeJson(clona[k]||{}, forceKeys && !clonb[k]? forceKeys[k] : clonb[k])
                    }else{
                        clona[k] = forceKeys && !clonb[k]? forceKeys[k] : clonb[k];
                    }
                });
                return clona
            }


            function validator(){
                var defaulRules ={
                    curp:{
                        rgx:/^[A-Z][AEIOUX][A-Z]{2}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[MH]([ABCMTZ]S|[BCJMOT]C|[CNPST]L|[GNQ]T|[GQS]R|C[MH]|[MY]N|[DH]G|NE|VZ|DF|SP)[BCDFGHJ-NP-TV-Z]{3}[0-9A-Z][0-9]+$/,
                        test:true
                    },
                    empty:{
                        rgx:/.{1,}/,
                        test:true
                    },
                    telefono:{
                        rgx:/^\d{10}$/,
                        test:true
                    },
                    rfc:{
                        rgx:/^[A-Z&Ñ]{4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]+$/,
                        test:true
                    },
                    rfcMoral:{
                        rgx:/^[A-Z&Ñ]{3}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/,
                        test:true
                    },
                    correo:{
                        rgx:/^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/,
                        test:true
                    },
                    letras:{
                        rgx:/[^\w\u00C0-\u00D6]$/gim,
                        test:false
                    },
                    numeros:{
                        rgx:/\d{1,}(.\d{1,})?/,
                        test:true
                    }            
                },rules={};
                        
                function formValidator(config) {
                    var validator = this,
                        defaultConfig={ selector:"", onFieldError:false, forceValidation:false, fields:[] };

                    validator.config = mergeJson({},config,defaultConfig);
                    validator.form = self.document.querySelector(config.selector);
                    validator.fields = {};
                    validator.init();                
                    return {
                        isValid:function(){
                            return validator.is_valid;
                        },
                        validateField:function(name){
                            return validator.fields[name] && validator.fields[name].validate();
                        },
                        validateForm:function(){                                            
                            return validator.validateForm();
                        },
                        getUrlData:function(){
                            return validator.toUrlPath();
                        },
                        getData:function(){
                            return validator.getFormData();
                        },
                        toJson:function(){
                            return validator.toJson();
                        }
                    };
                }

                formValidator.prototype.init = function(){
                    var validator = this;
                    validator.config.fields.forEach(function(field){
                        validator.addField(field)
                    });
                    validator.form.addEventListener("submit",function(event){
                        if(!validator.is_valid && validator.config.forceValidation){
                            return false;
                        }
                    });
                }

                formValidator.prototype.addField = function(fc){
                    var validator = this,
                        field = {
                            node:validator.getFormNode(fc.input),
                            rules:fc.rules.map(function(rule){
                                return validator.getRule(rule);
                            }),
                            validate:function(){
                                return validator.validateField(this);
                            },
                            is_valid:false                        
                        };
                    if(!field.node || field.rules.length<1){
                        return false;
                    }
                    validator.fields[fc.input] = mergeJson({},fc,field);
                }

                formValidator.prototype.getRule=function(name){
                    var custom = rules.hasOwnProperty(name),
                        exist = custom || defaulRules.hasOwnProperty(name);
                    return {
                        name:name,
                        exist:exist,
                        custom:rules.hasOwnProperty(name),
                        cback:( custom? rules[name]:function(value,field){
                            return !exist?false:defaulRules[name].rgx.test(value) == defaulRules[name].test;
                        })
                    }
                }

                formValidator.prototype.getFields=function(){
                    validator = this;
                    return Object.keys(this.fields).map(function(name){
                        var field = validator.fields[name];
                        return {
                            node:field.node,
                            is_valid:field.is_valid
                        };
                    });
                }

                formValidator.prototype.getFormNode = function(name){
                    return this.form.querySelector("[name='"+name+"']");
                }

                formValidator.prototype.getNodeField=function(name){
                    return this.fields[name]?this.fields[name].node:false;
                }

                formValidator.prototype.getField=function(name){
                    var field = this.fields[name];
                    return field?{
                        node:field.node,
                        is_valid:this.validateField(name),
                    }:false;
                }

                formValidator.prototype.validateField=function(field,rule){
                    if(!rule || Array.isArray(rule)){
                        var validator = this,
                            rules = Array.isArray(rule)?rule:field.rules,
                            is_valid = true;;
                        rules.forEach(function(rule){
                            if(is_valid){
                                is_valid = is_valid && validator.validateField(field,rule);
                            }
                        });                    
                        return is_valid;
                    }
                    var activeRule = this.getRule(rule);
                    var check = activeRule.cback(field.node.value, field.node);
                        field.is_valid =check;                 
                    if(!check && 'function' == typeof this.config.onFieldError){
                        this.config.onFieldError(field.node, rule);
                    }
                    return check;
                }                       

                formValidator.prototype.validateForm = function(){
                    var validator = this,
                        is_valid = true;
                    Object.keys(this.fields).forEach(function(key){
                        is_valid =  is_valid && validator.fields[key].validate();                        
                    })
                    this.is_valid = is_valid;
                    return this.is_valid;
                }

                formValidator.prototype.getFormData=function(){
                    return new FormData(this.form);
                }

                formValidator.prototype.toJson=function(){
                    var js = {};
                    return this.getFormData().forEach(function(value, key){
                        js[key] = val;
                    });     
                    return js;              
                }

                formValidator.prototype.toUrlPath=function(){
                    var string = "",
                        iterator = 0;;
                    return this.getFormData().forEach(function(value, key){
                        if(iterator >0 ){
                            string +="&";
                        }
                        string += key+"="+value;
                        iterator++;
                    }); 
                    return encodeURI(string);
                }
            
                return {
                    create:function(config){
                        return new formValidator(config);
                    },
                    addRule:function(name, cback){
                        if(Array.isArray(name)){
                            var js = this;
                            name.forEach(function(rule){
                                js.addRule(rule.name, rule.cback);
                            })
                        }
                        else if(typeof name == "string" && 'function' == typeof cback && !defaulRules.hasOwnProperty(name) ){
                            rules[name] = cback;
                        }
                    },
                    removeRule:function(name){
                        delete rules[name];
                    }
                }
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
                });
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
                var mut = this;
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
                    body.addEventListener(evt,cback);
                }else if(checker.isJSON(evt) && evt.hasOwnProperty("trigger") && evt.hasOwnProperty("action")){
                    mutator.addEventListener(evt.trigger, evt.action);
                }else if(checker.isArray(evt)){
                    evt.forEach(function(e){
                        mutator.addEventListener(e);
                    })
                }
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
            },
            merger:mergeJson,
            jsearch:deepSearch,
            validator:(new validator())
        }
    })(self)
    Object.freeze(w.geDom)
