var IT = {};

IT.common = {
	inputInit: function(input,className) {
		var hasPlacehodlder = $.browser.msie || ($.browser.mozilla && $.browser.version <= '2');
		$(input).each(function(){
			if(hasPlacehodlder) {
				var defaultValue = $(this).attr("placeholder");
				$(this).val(defaultValue);
			}
			$(this).bind("focusin", function() {
				$(this).removeClass(className);
				if(hasPlacehodlder && $(this).val()==defaultValue) {
					$(this).val("");
				}
			});
			$(this).bind("blur", function() {
				if($(this).val()=="") {
					if(hasPlacehodlder){
						$(this).val(defaultValue);
					}
					$(this).addClass(className);
				}
			}).trigger("blur");
		});
	}
};

IT.DocClickMgr = {
	_isInit:null,
	_list: {},
	init: function() {
		if(this._isInit)
			return ;
		$("body").bind("click", function() {
			var list = IT.DocClickMgr._list;
			for(var n in list) {
				var node = list[n];
				if($.isFunction(node))
					node();
				else if(node.chide)
					node.chide();
			}
		});
		this._isInit = true;
	},
	/**
	 * 添加一个侦听到 点击管理器
	 * @param {Object} name
	 * @param {Object} obj		obj 可以是 Function，也可以是对象。如果是一个对象，则该对象需要实现 obj.chide() 方法，用来响应侦听到的click动作。
	 *
	 */
	add: function(name,obj) {
		if(this._list[name])
			return alert('[LayerMgr_ERROR]'+name+"is already registed!");
		this._list[name] = obj;
	},
	remove: function(name) {
		if(!this._list[name])
			return ;
		delete this._list[name];
	},
	trigger: function(name) {
		var node = this._list[name];
		if($.isFunction(node)) {
			node();
		} else if(node.chide)
			node.chide();
	}
};

IT.Mask = function(cfg){
	if(cfg.target){
		if (cfg.target == window) {
			var _h_b =  $("body").height();
			var _h_w = document.documentElement.clientHeight;
			cfg.width = "100%";
			cfg.height = _h_b > _h_w ? _h_b : _h_w;
			cfg.top = 0;
			cfg.left = 0;
		} else {
			var _tar = cfg.target;
			cfg.width = _tar[0].offsetWidth;
			cfg.height = _tar[0].offsetHeight;
			if(!cfg.noPosition){
				var pos = _tar.position();
				cfg.top = pos.top;
				cfg.left = pos.left;
			}
		}
	}
	this._mask = this.createMask(cfg);
};
IT.Mask._count = 0;
IT.Mask.prototype = {
	createMask:function(cfg){
		var base = cfg.base ? cfg.base : $('body');
		var id = 'mask_'+ IT.Mask._count;
		var mask_str = [
			'<div class="lt-mask" id="',
			id,
			'" style="width:',
			fixUnit(cfg.width),
			';height:',
			fixUnit(cfg.height),
			';top:',
			fixUnit(cfg.top),
			';left:',
			fixUnit(cfg.left)
		]
		if(cfg.zIndex){
			mask_str.push(';z-index:'+cfg.zIndex);
		}
		mask_str.push('">');
		if(!cfg.noIframe){
			mask_str.push('<iframe class="lt-mask-iframe" disabled="disabled"></iframe>');
		}
		mask_str.push('</div>');
		base.append(mask_str.join(''));
		IT.Mask._count++;
		function fixUnit(v){
			if(/(%|px)$/.test(v)) return v;
			else return v+ "px";
		}
		return id;
	},
	show:function(){
		$("#"+this._mask).show();
	},
	hide:function(){
		$("#"+this._mask).hide();
	},
	height:function(h){
		$("#"+this._mask).height(h);
	},
	destory:function(){
		$("#"+this._mask).remove();
	}
};

IT.ILike = {
	init:function(container,callback) {
		var that = this;
		container.delegate("div.user-action a","click", function(){
			var action = $(this).attr("action");
			if(callback && (typeof callback == "function")) {
				callback($(this));
			}
			return false;
		});
		//i like select
		container.delegate("div.user-action span.lt-clear","click", function() {
			var $ua = $(this).parent();
			that._actOption($ua);
		});
		//return container;
	},
	_actOption:function(node) {
		var curClass = node.attr("rel");
		node.find("li."+curClass).hide();
		node.find("ul").slideDown(200);
		node.find("li a").unbind("click").bind("click", function() {
			var tarClass = $(this).parent().attr("class");
			node.removeClass(curClass).addClass(tarClass).attr("rel",tarClass);
			node.find("div.ac-w1").html($(this).parent().html());
			hide();
		});
		var timer = null;
		node.hover(function(){
			if(timer){clearTimeout(timer);}
		}, function() {
			timer = setTimeout(hide,200);
		});

		function hide() {
			node.find("ul").hide().find("li").show();
		}
	}
};

IT.Follow = {
	init:function(container){
		container.delegate('a', 'click', function(){
			var act = $(this).attr('action'),
					furl = '/follow/' + act,
					data = {uid : container.attr('rel')},
					afterBtn = {
						'dofo' : '<a href="#" class="unfo" action="unfo"><em>Following</em><em>Unfollow</em></a>',
						'unfo' : '<a href="#" class="dofo" action="dofo"><em>Follow</em></a>'
					};
			$.ajax({
				url: furl,
				dataType: 'json',
				data: data,
				success: function(res){
					if(res.c && res.c == "0"){
						container.html(afterBtn[act]);
					}
				}
			});
			return false;
		});
	}
};

IT.ZoomIn = {
	/**
	 * @param box 外层容器元素，jquery对象;
	 * @param selector 选择器（字符串），如：div.item-imgs a
	 */
	init:function(box,selector) {
		var that = this;
		box.delegate(selector,"click", function(event){
			var imgUrl = $(this).attr("href"),
				mask = that._creatZoomInMask(imgUrl),
				imgBox = that._creatZoomMaskBox();
			
			//关闭遮罩层
			that._closeImgZoomIn(mask,imgBox);
			event.preventDefault();
			return false;
		});
	},
	_creatZoomInMask:function(imgUrl) {
		var mask = new IT.Mask({
				target: window,
				noIframe: true
			});
		var temp = '<div id="zoomIn" class="zoomInImg"><img src='+ imgUrl +' class="foto" alt="" /><img src="images/loading.gif" class="loading" alt="" /></div>';
		$(temp).bind("click", function() {
			return false;
		}).appendTo("body");
		return mask;
	},
	_creatZoomMaskBox:function() {
		var $imgBox = $("#zoomIn"),
			o_t = $(document).scrollTop(),
			w_h = $(window).height(),
			w_w = $(window).width(),
			z_h = $imgBox.outerHeight(),
			z_w = $imgBox.outerWidth();
		$imgBox.css({
			"left" : (w_w - z_w)/2,
			"top": o_t + ((w_h - z_h) > 40 ? (w_h - z_h)/2 : 20)
		});
		$("#zoomIn img.foto").load( function() {
			var i_h = $(this).height(),
			i_w = $(this).width();
			$("#zoomIn img.loading").remove();
			$("#zoomIn").animate({
				"width" : i_w,
				"height" : i_h,
				"left" : (w_w - i_w)/2 - 20,
				"top": o_t -20 + ((w_h - i_h) > 80 ? (w_h - i_h)/2 : 40)
			}, 600, function() {
				$("#zoomIn img.foto").fadeIn(200);
			});
		});
		return $imgBox;
	},
	_closeImgZoomIn:function(mask,box) {
		IT.DocClickMgr.init();
		IT.DocClickMgr.remove('itemImg');
		IT.DocClickMgr.add("itemImg", function() {
			mask.destory();
			box.remove();
		});
	}
};

IT.AsyncTab = {
	init: function(config, callback){
		var that = this,
			container = $(config.container),
			currentTab = container.find(config.selector+'.'+config.currentClass);
		
		container.delegate(config.selector, "click", function(e){
			if(config.currentClass){
				$(this).parent().siblings().removeClass(config.currentClass);
				$(this).parent().addClass(config.currentClass);
			}
			var target = $(config.target);
			var url = $(this).attr("href");
			if(url != "#" && $.isFunction(callback)) {
				$.ajax({
					url: url,
					dataType: 'json',
					success: function(res){
						callback(res);
					},
					complete: function(){
						//$(config.target).find("div.loading").remove();
					}
				});
				//target.html('<div class="loading lt-ac"><img src="images/loading.gif" alt="" /></div>');
			}
			if(config.target && config.targetSameClass){
				var targetClass = $(this).attr("class");
				target.removeClass(target.attr("rel")).addClass(targetClass).attr("rel", targetClass);
			}
			
			e.preventDefault();
			return false;
		});
		
		var defaultTab = (currentTab.length > 0) ? currentTab[0] : container.find(config.selector+":first");
		defaultTab.trigger("click");
	}
};
