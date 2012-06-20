IT.looking = {
	_timeout : 200,
	_timer : null,
	_active : false,
	_conId : "#looking-type",
	_ctrlId:"#nav-type",
	_menuId : "#type-name-list",
	_selectedType : "",
	_pageNum:1,
	init: function(){
		var that = this;
		$(this._ctrlId).hover(function(){
			if($(this).hasClass("active")){
				that.show();
			} else {
				if($(this).hasClass("selected")){
					that._selectedType = $(this).text();
				}
				that.changestate("hover");
			}
		}, function(){
			if($(this).hasClass("hover")){
				that.changestate("default");
			}
		}).bind("click", function(){
			that.changestate("active");
			that.show();
			$(that._conId).hover(function(){
				that.canceltimer();
		        }, function(){
				that.timer();
			});
		});
		$(that._menuId+" a").bind("click", function(){
			var typeName = $(this).text();
			that.changestate("selected");
			$(that._ctrlId).text(typeName);
			$("#type-name").val(typeName);
			if(that._selectedType == "") {
				$("#product-name").fadeIn(200);
			}
			that._selectedType = typeName;
			that.hide(that);
			IT.common.inputInit('#product-name','inactive');
			return false;
		});

		this.searchProduct();
		IT.common.inputInit('#searchBar','inactive');
		this._initWriteTo();
	},
	show : function(){
		this.canceltimer();
		if(this._active) return;
		$(this._menuId).slideDown(200);
		this._active = true;
	},
	hide : function(that){
		$(that._menuId).slideUp("fast",function(){
			if(that._selectedType == ""){
				that.changestate("default");
			} else {
				that.changestate("selected");
				$(that._ctrlId).text(that._selectedType);
			}
		});
		that._active = false;
	},
	timer : function(){
		var that = this;
		this._timer = setTimeout(this.hide(that), this._timeout);
	},
	canceltimer : function(){
		if (this._timer != null) {
			clearTimeout(this._timer);
			this._timer = null;
		}
	},
	changestate : function(st){
		var $ctrl = $(this._ctrlId);
		$ctrl.removeClass();
		switch(st){
			case "hover" :
				$ctrl.addClass("hover").text("I'm looking for a ...");
				break;
			case "active" :
				$ctrl.addClass("active");
				break;
			case "selected" :
				$ctrl.addClass("selected");
				break;
			default :
				$ctrl.addClass("default").text("What r u looking for?");
		}
	},
	searchProduct:function(){
		var that = this;
		var t = null;
		$("#product-name").keyup(function(event){
			if (event.keyCode == '13') {
				event.preventDefault();
			}
			if (t!=null) {
				clearTimeout(t);
			}
			t = setTimeout(function(){that.getSuggest(that)}, 500);
		});
		$("body").bind("click",function(){
			$("#looking-prod").removeClass("prod-show-suggest");
			$("#search-suggest").slideUp("fast");
		});
		$("#search-suggest").bind("click", function(event){
			event.stopPropagation();
			return false;
		});
	},
	getSuggest:function(that){
		$("#looking-prod").addClass("prod-show-suggest");
		that.sendRequest();
		$("#search-suggest").slideDown("fast");
	},
	createSuggest:function(){
		var that = this;
		$("#search-suggest-ul li").remove();
		$("#search-page").remove();

		var liList = [];
		for(var i=0;i < Math.min(suggestInfo.data.length,4) ; i++){
			var pTitle = this.node('p',[this.text(suggestInfo.data[i].title)],{
				'class':'c3'
			});
			var pPrice = this.node('p',[this.text(suggestInfo.data[i].price)],{
				'class':'c9'
			});
			var divCon = this.node('div',[pTitle,pPrice],{
				'class':'suggest-cont lt-fl'
			})
			var img = this.node('img',null,{
				'src':suggestInfo.data[i].imgUrl
			});
			var divImg = this.node('div',[img],{
				'class':'suggest-img lt-fl'
			});
			var li = this.node('li',[divImg,divCon]);
			liList.push(li);
		}
		$("#search-suggest-ul").append(liList);
		that.createPage();
	},
	createPage:function(){
		var maxPage = Math.ceil(suggestInfo.count/4),
				that = this,
				aList = [];

		if(this._pageNum == 1){
			var previous = this.node('span',[this.text('Previous')]);
		}else{
			var previous = this.node('a',[this.text('Previous')],{
				'href':'#',
				'value':this._pageNum-1
			});
		}

		var text = this.text(' | Page:');
		aList.push(previous);
		aList.push(text);
		if(this._pageNum == maxPage){
			var aNext = this.node('span',[this.text('Next')]);
		}else{
			var aNext = this.node('a',[this.text('Next')],{
				'href':'#',
				'value':this._pageNum + 1
			});
		}

		if(this._pageNum <= 3 || maxPage == 4){
			for(var i = 1; i < Math.min(maxPage + 1,6) ; i++){
				if(this._pageNum == i){
					aPage = this.node('span',[this.text(i)]);
				}else{
					var aPage = this.node('a',[this.text(i)],{
						'href':'#',
						'value':i
					});
				}

				aList.push(aPage);
			}
		}else if(maxPage - this._pageNum <= 2){
			for(var i = 0; i < Math.min(5,maxPage) ; i++){
				if(maxPage - this._pageNum + i == 4){
					var aPage = this.node('span',[this.text(this._pageNum)]);
				}else{
					var aPage = this.node('a',[this.text(maxPage - 4 + i)],{
						'href':'#',
						'value':maxPage - 4 + i
					});
				}

				aList.push(aPage);
			}
		}else{
			for(var i = 0; i < Math.min(5,maxPage) ; i++){
				if(i == 2){
					var aPage = this.node('span',[this.text(this._pageNum)]);
				}else{
					var aPage = this.node('a',[this.text(this._pageNum + i - 2)],{
						'href':'#',
						'value':this._pageNum + i - 2
					});
				}

				aList.push(aPage);
			}
		}
		text = this.text(' | ');
		aList.push(text);
		aList.push(aNext);

		var divpage = this.node('div',aList,{
			'class':'suggest-page lt-f12',
			'id':'search-page'
		});

		$("#search-suggest").append(divpage);

		$("#search-page").delegate("a","click",function(){
			that._pageNum = parseInt($(this).attr("value"));
			that.sendRequest();
			return false;
		});

		$('#search-suggest-ul li').bind('click',function(){
			var $write = $("#write-to"),
					$li = $(this);
			$('#looking-for').slideUp('fast');
			$("#search-suggest-ul li").remove();
			$("#search-page").remove();
			$('#item-detail').html($li.html());
			$write.find("input.item-id").val($li.attr("rel"))
			.end().find("input.item-img").val($li.find("img").attr("src"))
			.end().find("input.item-title").val($li.find("p.c3").text())
			.end().find("input.item-price").val($li.find("p.c9").text())
			.end().slideDown('fast');
		});
	},
	sendRequest:function(){
		var that = this;
		var url = 'json.js?pageNum=' + this._pageNum;
		$.getScript(
			url,
			function(){
				that.createSuggest();
			}
		);
	},
	_initWriteTo:function(){
		IT.ILike.init($("#write-to"), function(node){
			$("#write-to").find("input.user-act").val(node.attr("action"));
		});
		$("#write-to span.close").bind("click", function(){
			$('#item-detail').empty();
			$("#write-to").fadeOut(500, function(){
				$("#looking-for").slideDown(500);
			});
		});
		IT.common.inputInit($("#write-to .inactive"), "inactive");
	},
	node:function(tagName, children, attributes){
		var element = document.createElement(tagName);

		if (attributes !== null) {
			for (var key in attributes) {

				if(key=='end') break;
				if (key == "class") {
					element.className = attributes[key];
				}
				else {
					element.setAttribute(key, attributes[key]);
				}
			}
		}
		if (children !== null) {
			for (var i = 0; i < children.length; i++) {
				element.appendChild(children[i]);
			}
		}
			return element;
	},
	text:function(content){
		var element = document.createTextNode(content);
		return element;
	}
};