IT.timeline = {
	_boxId : "#timeline",
	init : function() {
		$box = $(this._boxId);
		var that = this;

		IT.AsyncTab.init({
			container: "#tab-title",
			selector: "li > a",
			target: "#tab-cnt",
			currentClass : "current"
		}, function(res){
			console.log(res.name);
		});
		IT.ZoomIn.init($box,'div.item-imgs a');
		IT.ILike.init($box, function(node){
			//alert(node.attr("action"));
			/**
			*url: /message/settype
			*id=ead98a0fd7de9da0
			*type=want/have/favorite
			*/
			var url = '/message/settype';
			var data = {
				id : 'ead98a0fd7de9da0',
				type : node.attr("action")
			}
			$.ajax({
				url: url,
				dataType: 'json',
				data: data,
				success: function(res){
					alert('success');
				}
			});
			return false;
		});
		//retweet
		that._doRetweet($box);
		//reply
		that._doReply($box);
		
		IT.Follow.init($('#follow-link'));
	},
	_doRetweet:function(box) {
		var that = this;
		box.delegate("a.act-rt", "click", function(){
			var item = $(this).parents("div.tl-item"),
				mask = that._creatRetweetMask(item);
			var $dRT = $("#dialog-rt");
			$dRT.find("div.item-imgs a").attr("href","").bind("click", function(event){
				event.preventDefault();
				return false;
			});
			IT.common.inputInit('#tweet','inactive');
			$dRT.find("button").bind("click", function(){
				that._retweetClick(mask,$dRT);
				that._closeRetweet(mask,$dRT);
			});
			$dRT.find("span.close").bind("click", function() {
				that._closeRetweet(mask,$dRT);
			});

			var t = $(window).height() - $dRT.outerHeight();
			$dRT.css({
				left: item.offset().left - 4,
				top: $(document).scrollTop() + (t>40 ? t/2 : 20)
			}).fadeIn(200);

			return false;
		});
	},
	_creatRetweetMask:function(obj) {
		var mask = new IT.Mask({
				target: window,
				noIframe: true
			});
		var temp = '<div class="dialog-rt" id="dialog-rt">\
					<div class="dialog-bg"></div>\
					<div class="dialog-body">\
						<div class="dialog-title">\
							<span class="close">close</span>\
							<h3 class="lt-f16 lt-b">Retweet</h3>\
						</div>\
						<div class="dialog-cnt lt-fix">\
							<textarea id="tweet" class="common inactive" placeholder="Type product name here and wait a moment..."></textarea>\
							<button class="retweet lt-fr">Retweet</button>\
						</div>\
					</div>\
				</div>';
		$(temp).appendTo("body").find("div.dialog-cnt").prepend(obj.find("div.item-detail").clone());
		return mask;
	},
	_retweetClick:function(mask,box) {
		/**
		* url : /message/forward
		* id=2d0fe9d98a0f9ca0
		* content=zzz
		*/
		var that = this,
			url = '/message/forward',
			data = {
				id : '2d0fe9d98a0f9ca0',
				content : $('#tweet').val()
			}
		$.ajax({
			url: url,
			dataType: 'json',
			data: data,
			success: function(res){
				alert('success');
				that._closeRetweet(mask,box);
			}
		});
	},
	_closeRetweet:function(mask,box) {
		mask.destory();
		box.fadeOut(100).remove();
	},
	_doReply:function(box) {
		var that = this;
		box.delegate("a.act-rp", "click", function(){
			var item = $(this).parents("div.tl-item");
			if(item.find("div.reply-box").length>0){
				item.find("div.reply-box").remove();
				return false;
			};
			
			var turl = 'json.php';
			var data = {
				id : item.attr('rel')
			}
			$.ajax({
				url: turl,
				dataType: 'json',
				data: data,
				success: function(res){
					var d = {
						msgmore : 122,
						msglist : [{
							userid   : 'qwert12345',
							username : 'interbobo',
							userfoto : 'http://img1.cache.netease.com/cnews/2011/6/10/20110610115815108ef.jpg',
							replytxt : 'hello world',
							msgid : 'aaa00001'
						},{
							userid   : 'asdfg23456',
							username : 'ryoko',
							userfoto : 'http://img4.cache.netease.com/blog/2011/4/26/2011042617321982319.jpg',
							replytxt : 'incredibly fast and simple to use. All it takes is a swipe',
							msgid : 'bbb00002'
						},{
							userid   : 'zxcvb34567',
							username : 'interbobo',
							userfoto : 'http://img4.cache.netease.com/blog/2011/4/26/2011042617182174d84.jpg',
							replytxt : 'a fair bit of hands-on time with this guy, keep it locked for our impressions',
							msgid : 'ccc00003'
						},{
							userid   : 'mnbvc45678',
							username : 'ryoko',
							userfoto : 'http://img4.cache.netease.com/blog/2011/5/3/2011050316545633bd3.jpg',
							replytxt : 'a fair bit of hands-on time with this guy, keep it locked for our impressionsa fair bit of hands-on time with this guy, keep it locked for our impressions',
							msgid : 'ddd00004'
						},{
							userid   : 'poiuy56789',
							username : 'ryoko',
							userfoto : 'http://img3.cache.netease.com/blog/2011/4/26/2011042617241441f33.jpg',
							replytxt : 'Have you ever held a thunderstorm in your hand?',
							msgid : 'eee00005'
						},{
							userid   : 'lkjhg67890',
							username : 'interbobo',
							userfoto : 'http://img3.cache.netease.com/blog/2011/4/26/201104261720320c9cc.jpg',
							replytxt : 'HTC Flyer, A sleek tablet and a magic pen that transforms any situation',
							msgid : 'fff00006'
						}]
					},
					msgmore = d.msgmore,
					msglist = d.msglist;
					
					var temp = '<div class="reply-box lt-fr" id="' + item.attr('rel') + '">\
									<div class="mod-head lt-clear"></div>\
									<div class="mod-body lt-fix">\
										<textarea class="lt-fl"></textarea>\
										<button class="common lt-fl">Reply</button>';
					
					if(msglist.length > 0){
						temp += '<ul>';
						for(var i=0;i<msglist.length;i++) {
							temp += '<li class="lt-clr lt-fix' + (i%2==0?" to-del":"") + '" id="msg-' + msglist[i].msgid + '">\
												<span class="lt-fl user-foto">\
													<a href="http://www.itemteam.com/' + msglist[i].userid + '">\
														<img src="' + msglist[i].userfoto + '" alt="' + msglist[i].username + '" />\
													</a>\
												</span>\
												<span class="lt-fl reply-text">' + msglist[i].replytxt + '</span>\
												<span class="close" title="delete this reply">X</span>\
												<a class="lt-ul re-reply" href="#">Reply</a></li>';
						}
						temp += '</ul>';
						
						if(msgmore > 0){
							temp += '<p class="lt-clr lt-ar lt-ul"><a href="#">See Other ' + msgmore + ' Replys</a></p>';
						}
					}
					
					temp += '</div>\
									<div class="mod-foot lt-clear"></div>\
								</div>';
					$(temp).find("button").bind("click", function(){
						that._replyClickHandler($(this).parent());
					}).end().appendTo(item);
					item.delegate('a.re-reply', 'click', function(){
						$(this).parents('div.mod-body').find('textarea').val('@'+$(this).parent().find('img').attr('alt')+':');
						return false;
					});
				}
			});
			return false;
		});
		box.delegate("li.to-del span.close", "click", function(){
			var msg = $(this).parent(),
				durl = "json.php",
				data = {
					id : msg.attr("id").substr(4)
				};
			$.ajax({
				url: durl,
				dataType: 'json',
				data: data,
				success: function(res){
					msg.fadeOut(300, function(){
						msg.remove();
					});
				}
			});
		});
	},
	_replyClickHandler:function(node) {
		var msg = node.find("textarea").val();
		if(msg=="") return false;
		/**
		*url: /reply/reply
		*POST
		*id=2d0fe9d98a0f9ca0
		*content=XXXXX
		*/
		var that = this,
			url = '/reply/reply',
			data = {
				id : node.parents("div.tl-item").attr('rel'),
				content : msg
			}
		/*
		$.ajax({
			url: url,
			dataType: 'json',
			data: data,
			success: function(res){
				var r = '<li class="lt-clr lt-fix" id="msg-00000001">\
							<span class="lt-fl user-foto">\
								<a href="#">\
									<img src="http://img3.cache.netease.com/blog/2011/4/26/2011042617241441f33.jpg" alt="username" />\
								</a>\
							</span>\
							<span class="lt-fl reply-text">' + msg + '</span>\
							<span class="close" title="delete this reply">X</span>\
							<a class="lt-ul re-reply" href="#">Reply</a></li>';
				$(r).prependTo(node.find("ul"));
			}
		});
		*/
				var r = '<li class="lt-clr lt-fix" id="msg-00000001">\
							<span class="lt-fl user-foto">\
								<a href="#">\
									<img src="http://img3.cache.netease.com/blog/2011/4/26/2011042617241441f33.jpg" alt="username" />\
								</a>\
							</span>\
							<span class="lt-fl reply-text">' + msg + '</span>\
							<span class="close" title="delete this reply">X</span>\
							<a class="lt-ul re-reply" href="#">Reply</a></li>';
				$(r).prependTo(node.find("ul"));
	}
};