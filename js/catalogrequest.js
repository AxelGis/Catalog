"use strict"
function CatalogRequest(e) {
	
	var CR = this;
	var DOM = e;
	const UI = UIkit.util;
	this.catalog = {};
	this.langs = ['RU','EN','ES'];
	this.table = null;
	
	//редактируем справочник с колонками
	this.edit = function(){
		let e = UI.$('#modalContent');
		UI.empty(e);
		const form = createElement('form','uk-form-stacked');
		const grid = createElement('div','uk-grid');
		UI.append(form,grid);
		CR.langs.map((lang)=>{
			let div = createElement('div','uk-width-1-4@s');
			let divmarg = createElement('div','uk-margin');
			let label = createElement('label','uk-form-label',{'html':'Название '+lang,'for':'name'+lang});
			let inputdiv = createElement('div','uk-form-controls');
			let input = createElement('input','uk-input names name'+lang,{'type':'text','placeholder':'Название'+lang,'id':'name'+lang});
			input.value = CR.catalog.Name[lang] === undefined ? "" : CR.catalog.Name[lang];
			UI.append(inputdiv,input);
			UI.append(divmarg,label);
			UI.append(divmarg,inputdiv);
			UI.append(div,divmarg);
			UI.append(grid,div);
		});
		let div = createElement('div','uk-width-1-4@s');
		let label = createElement('label','',{'html':'Active','for':'activecat'});
		let inputdiv = createElement('div','uk-form-controls');
		let input = createElement('input','uk-checkbox',{'type':'checkbox','checked':true,'id':'activecat'});
		input.checked = CR.catalog.isActive;
		UI.append(div,label);
		UI.append(inputdiv,input);
		UI.append(div,inputdiv);
		UI.append(grid,div);
		
		let btnAdd = createElement('a','btnAdd uk-button uk-button-default uk-margin',{'html':'<span uk-icon="icon: plus"></span> Добавить параметр'});
		UI.append(form,btnAdd);
		UI.append(UI.$(e),form);
		
		CR.catalog.columns.map((col)=>addCol(col));
		
		UI.on(btnAdd,'click',addCol);
	};

	function addCol(col){
		const cnt = UI.$$('.catparam').length + 1;
		let grid = createElement('div','uk-grid catparam',{'data-id':cnt});
		let divl = createElement('div','uk-width-1-4@s');
		let del = createElement('a','',{'href':'#','uk-icon':'icon: close'});
		let label = createElement('span','uk-margin',{'html':'Параметр ' + cnt});
		UI.append(divl,label);
		UI.append(divl,del);
		UI.append(grid,divl);
		CR.langs.map((lang)=>{
			let div = createElement('div','uk-width-1-4@s');
			let input = createElement('input','uk-input colparam colparam'+lang,{'type':'text','placeholder':lang,'id':'colparam'+cnt+lang});
			input.value = col === undefined || col[lang] === undefined ? '' : col[lang];
			UI.append(div,input);
			UI.append(grid,div);
		});
		UI.after('.btnAdd',grid);
		UI.on(del,'click',function(){
			UI.parents(this,'.catparam')[0].remove();
		});
	}

	//сохраняем колонки
	this.save = function(e){
		let check = true;
		let names = {};
		
		UI.$$('.colparam,.names').map((elem)=>{
			if(UI.$(elem).value.trim() == ""){
				UI.$(elem).classList.add("uk-form-danger");
				check = false;
			}
		});
		if(!check)	return false;
		
		CR.langs.map((lang)=>{
			CR.catalog.Name[lang] = UI.$('.name'+lang).value;
		});
		CR.catalog.columns = [];
		UI.$$('.catparam').map((elem)=>{
			let col = {};
			let id = UI.data(elem,'id');
			CR.langs.map((lang)=>{
				col[lang] = UI.$('#colparam'+id+lang).value;
			}); 
			CR.catalog.columns.unshift(col);		
		});
		CR.catalog.isActive = UI.$('#activecat').checked;
		drawCatalog();
		UIkit.toggle(UI.$('#modal'));
	}
	
	//названия справочников
	function setNames(){
		for(const lang in CR.catalog.Name){
			UI.html(UI.$('.catname'+lang),CR.catalog.Name[lang])
		}
	}
	//составляем таблицу
	function setTable(){
		UI.empty(UI.children(UI.$(DOM),'#catalogtable'));
		CR.table = createElement('table','uk-table uk-table-striped uk-table-justify');
		let thead = createElement('thead');
		let tbody = createElement('tbody');
		let tr = createElement('tr');
		let tdnum = createElement('th','',{'html':'#','colspan':'3'});
		UI.append(tr,tdnum);
		UI.append(CR.table,thead);
		UI.append(CR.table,tbody);
		UI.append(thead,tr);
		
		CR.catalog.columns.map((col)=>{
			CR.langs.map((lang)=>{
				let td = createElement('th','filtered',{'data-lang':lang,'html':col[lang]||''});
				UI.append(tr,td);
			})
		});
		UI.append(UI.children(UI.$(DOM),'#catalogtable'),CR.table);
	}
	//заполняем таблицу
	function addRow(row){
		let cnt = row!==undefined?row.id:(UI.$('.items td')!==undefined?parseInt(UI.$('.items td').textContent)+1:1);
		let tr = createElement('tr','items item'+cnt,{'data-id':cnt});
		UI.prepend(CR.table,tr);
		let td = createElement('td');
		UI.html(td,cnt.toString());
		UI.append(tr,td);
		td = createElement('td','edits uk-padding-remove-horizontal');
		let active = createElement('input','uk-checkbox activerow',{'type':'checkbox'});
		active.checked = row!==undefined&&row.isActive;
		UI.append(td,active);
		UI.append(tr,td);
		td = createElement('td','edits uk-padding-remove-horizontal');
		let del = createElement('a','',{'href':'#','uk-icon':'icon: close'});
		UI.append(td,del);
		UI.append(tr,td);
		CR.catalog.columns.map((col)=>{
			CR.langs.map((lang)=>{
				td = createElement('td','filtered',{'contenteditable':'true','data-lang':lang,'data-col':col.EN,'html':row!==undefined&&row.content[col.EN]!==undefined?row.content[col.EN][lang]:''});
				UI.append(tr,td);
			});
		});
		UI.on(del,'click',function(){
			UI.parents(this,'.items')[0].remove();
		});
	}
	//кнопки управления
	function setEdits(){
		UI.empty(UI.children(UI.$(DOM),'#catalogedit'));
		let btnAdd = createElement('a','uk-button uk-button-default addrow',{'html':'<span uk-icon="icon: plus"></span> Добавить строку'});
		UI.append(UI.children(UI.$(DOM),'#catalogedit'),btnAdd);
		
		//добавляем строку
		UI.on(btnAdd,'click',function(){
			addRow();
			CR.setLang();
		});
	}
	
	function createElement(elem,classname,options){
		classname = classname ? classname : "";
		const obj = Object.assign(document.createElement(elem),{className:classname});
		for(const opt in options){
			opt == 'html' ? UI.html(obj,options[opt]) : UI.attr(obj,opt,options[opt]);
		}
		return obj;
	}
	//фильтр языка
	this.setLang = function(){
		let elem = UI.$('#filter li.uk-active a');
		let lang = UI.data(elem,'lang');
		UI.$$('.filtered').map((elem)=>{
			let datalang = UI.data(elem,'lang');
			lang === undefined || datalang == lang ? UI.$(elem).classList.remove("uk-hidden") : UI.$(elem).classList.add("uk-hidden");
		});
	}
	function drawCatalog(){
		setNames();
		setTable();
		setEdits();
		CR.catalog.items.map((row)=>addRow(row));
		CR.setLang();		
	}
	//загрузка каталога с сервера
	this.loadCatalog = function(){
		UI.ajax('/catalog/json/catalog.json', { responseType: 'json' })
		  .then(function(xhr) {
			CR.catalog = xhr.response;
			drawCatalog();
		});
	}	
	this.json = function(){
		CR.catalog.items = [];
		UI.$$('#catalogtable .items').map((row)=>{
			let item = {content:{}};
			item.id = UI.data(row,'id');
			item.isActive = UI.$('.activerow',row).checked;
			UI.$$('.filtered',row).map((elem)=>{
				let col = UI.data(elem,'col');
				let lang = UI.data(elem,'lang');
				item.content[col] = item.content[col] || {};
				item.content[col][lang] = elem.textContent;
			});
			CR.catalog.items.unshift(item);
		});
		
		console.log(CR.catalog);
		
		UI.ajax('/updates/test', { responseType: 'json', method: 'POST', data: JSON.stringify(CR.catalog) })
		  .then(function(xhr) {
			//...toServer
		});
	}

}