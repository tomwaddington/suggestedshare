function loadSuggestedShare() {
	FB.subclass('XFBML.SuggestedShare', 'XFBML.Element', null, {
		
	share: function(id) {
		FB.ui({ 
			method: 'stream.publish',
			attachment: {
				"href":window.location.href,
				"name":document.title
			},
			target_id: id
		});
	},
	
	render: function() {
		this.dom.innerHTML = this._title ? '<h4>'+this._title+'</h4>Share on Facebook with ' : 'Click a name to share on Facebook with '
		current_node = document.createElement('span')
		fan_nodes = []
		self = this
		FB.Array.forEach(this.fans.value, this.bind(function(fan,i,fans) {
			fan_node = document.createElement('a');
			fan_node.href = "#"
			n = document.createTextNode(fan.name);
			fan_node.appendChild(n)
			fan_node.onclick = this.bind(function() {
				this._method ? eval(this._method+"("+fan.id+")") : this.share(fan.id)
				return false
			});						
			fan_nodes.push(fan_node)
		}));
		more_btn = undefined;
		switch(fan_nodes.length) {
			case 0:
				str = "You have no friends who like "
				this.dom.style.display = 'none'
				break;
			case 1:
				this.dom.appendChild(fan_nodes.shift())
				str = " who likes "
				break;
			case 2:
				this.dom.appendChild(fan_nodes.shift())
				this.dom.appendChild(document.createTextNode(' or '))			
				this.dom.appendChild(fan_nodes.shift())
				str = " who both like "
				break;
			case 3:
				this.dom.appendChild(fan_nodes.shift())
				this.dom.appendChild(document.createTextNode(', '))			
				this.dom.appendChild(fan_nodes.shift())
				this.dom.appendChild(document.createTextNode(' or '))			
				this.dom.appendChild(fan_nodes.shift())
				str = " who all like "
				break;
			default:
				this.dom.appendChild(fan_nodes.shift())
				this.dom.appendChild(document.createTextNode(', '))							
				this.dom.appendChild(fan_nodes.shift())
				this.more = document.createElement('span')
				this.more.style.display = 'none'
				this.more.appendChild(document.createTextNode(', '))							
				FB.Array.forEach(fan_nodes, this.bind(function(fan,i,fans) {
					this.more.appendChild(fan)
					this.more.appendChild(document.createTextNode((i==fans.length - 2) ? ' or ' : ', '))			
				}))
				this.more_holder = document.createElement('span')
				this.more_holder.appendChild(document.createTextNode(' and '))

				more_btn = document.createElement('a');
				more_btn.href = '#'
				
				more_btn.appendChild(document.createTextNode(fan_nodes.length+'\u00A0others'))							
				this.more_holder.appendChild(more_btn)
				this.dom.appendChild(this.more_holder)
				this.dom.appendChild(this.more)

				
				str = " who like "
				break;
		}
		if(more_btn != undefined) {
			more_btn.onclick = this.bind(function() {
				this.more_holder.style.display = 'none'
				this.more.style.display = 'inline';
				return false;
			})
		}
		this.dom.appendChild(document.createTextNode(str))

		
		if(this._interest != '') {
			this.dom.appendChild(document.createTextNode(this._interest))
			
		} else {
			FB.Array.forEach(this.pages.value, this.bind(function(page,i,pages) {
				page_node = document.createElement('a');
				n = document.createTextNode(page.name);
				page_node.href= FB._domain.www + 'profile.php?id=' + page.page_id
				page_node.appendChild(n)
				this.dom.appendChild(page_node)
				if(i < this.pages.length-2) {
					this.dom.appendChild(document.createTextNode(", "))
				} else if(i < pages.length - 1) {
					this.dom.appendChild(document.createTextNode(" or "))
				}
			}))
		}
		
		if(this._show_faces) {
			this.dom.appendChild(document.createElement("br"))
			FB.Array.forEach(this.fans.value, this.bind(function(fan,i,fans) {
			if(i < 5) {
				face = document.createElement('fb:profile-pic');
				face.setAttribute('uid',fan.id)
				face.setAttribute('size','q')
				face.setAttribute('width','30')
				face.setAttribute('height','30')
				face.setAttribute('style','margin:0 5px 5px 0')
				
				this.dom.appendChild(face)
				FB.XFBML._processElement(face, { localName: 'profile-pic', className: 'FB.XFBML.ProfilePic'}, null);
				face.onclick = this.bind(function() {
					this._method ? eval(this._method+"("+fan.id+")") : this.share(fan.id)
					return false
				});
			}
			}))
		}
		
	},
	
	process: function() {
		FB.Event.subscribe('auth.statusChange', FB.bind(this.process, this));
    	this._ids = this.getAttribute("ids")
    	this._method = this.getAttribute("method") || false
    	this._title = this.getAttribute("title")

		if(this._interest == undefined) {
    		this._interest = this.dom.innerHTML
		}
    	this._show_faces = this.getAttribute("show_faces")
		if(FB.getSession()) {
			this.dom.innerHTML = this._title ? '<h4>'+this._title+'</h4>Loading...' : 'Loading...'
			if(this._ids) {
				var pages = FB.Data.query('SELECT page_id, name FROM page WHERE page_id IN ('+this._ids+')');
				var fans = FB.Data.query('SELECT id, name, pic FROM profile WHERE id IN \
			(SELECT uid FROM page_fan WHERE uid IN \
				(SELECT uid2 FROM friend WHERE uid1={0}) AND page_id IN \
				('+ (this._ids) +') \
				) LIMIT 20', FB.getSession().uid);
			
	 			FB.Data.waitOn([fans, pages], this.bind(function(args) {
					this.fans = fans
					this.pages = pages
					this.render();
				}))
			}
		} else {
			this.dom.style.display = 'none'
		}
		
	}})


	FB.XFBML.registerTag({	xmlns: 'fb', localName: 'suggested-share', className: 'FB.XFBML.SuggestedShare'});
}