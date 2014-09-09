//TODO: add double buffering https://coderwall.com/p/p4crrq
//TODO: add tooltips
//TODO: settings


var diagram = (function() {
	'use strict';
	function Column(ctx, view_info, pos, params) {
		var self = {};
		var c   = ctx,
			vi  = view_info,
			p   = pos,
			par = params;

		self.view = {};
		self.draw = function() {
			var v = self.view;
			v.x = vi.base_x + vi.col_margin + pos * vi.col_window;
			v.h = vi.col_seg_height * par.value;
			v.y = vi.base_y - v.h;
			v.w = vi.col_width;
			var def = c.fillStyle;
			c.fillStyle = par.color;
			c.fillRect(v.x, v.y, v.w, v.h);
			c.fillStyle = def;
		};
		return self;
	}

	function Container(ctx, view_info) {
		var self = {};
		var c    = ctx,
			vi   = view_info;

		//legend on text size
		self.draw = function() {
			//draw outer border
			c.rect(0,0, vi.width, vi.height);
			//draw chart border
			c.moveTo(vi.base_x, vi.base_y);
			c.lineTo(vi.width,	vi.base_y);
			c.moveTo(vi.base_x, vi.base_y);
			c.lineTo(vi.base_x, 0);

			//draw legend
			var k, cur_y, n,text, offset ;
			for(k=0;k<vi.legend.seg_no;k++) {
				cur_y = vi.base_y - vi.legend.seg_height * k;
				c.moveTo(vi.base_x, cur_y);
				c.lineTo(vi.base_x - vi.base_x / 2, cur_y);
				n = k*vi.legend.seg_cost;//TODO:responsive text size
				text = n.toString();
				offset = cur_y - vi.legend.font_px;
				//c.font = 2*vi.legend.font_px + "px Arial";
				c.font = "bold " + 2*vi.legend.font_px + "px Monospace";
				console.log(c.font);
				c.fillText(n.toString(), vi.legend.padding, offset);//TODO: to settings
			}
			c.stroke();
		};
		return self;
	}

	function Diagram(opt) {
		var self = {};
		var o = lib.def(opt,{});
		var width = lib.def(o.width, 640),
			height = lib.def(o.height,480),
			url = lib.def(o.url,'data.json'),
			el = lib.def(o.el,'diagram');

		self.el = '';
		self.ctx = '';
		self.view_info = {};
		self.view_info.legend = {};
		self.seq = [];
		self.figs = [];

		self.init = function() {
			self.el = lib.byid(el);
			self.el.width = width;
			self.el.height = height;
			if(self.el.getContext) {
				self.ctx = self.el.getContext('2d');
			}
			else {
			}
			lib.ajax(url, self.onload, self.onerror);
		};

		self.calc_seq_vals = function() {
			var i,l,
				s = self.seq,
				max_val = s[0].value;
			for(i=1;i<s.length;i++) {
				if(s[i].value > max_val) max_val = s[i].value;
			}
			self.view_info.legend.max = lib.c_10(max_val);
		};

		self.calc_view_info = function() {
			var vi = self.view_info;
			vi.width = self.el.width;
			vi.height = self.el.height;

			vi.legend.seg_no = 10;//TODO: to settings
			vi.legend.size = Math.max(vi.width, vi.height)*0.05;//TODO:to settings
			vi.base_x = vi.legend.size;
			vi.base_y = vi.height - vi.legend.size;
			vi.legend.seg_height = vi.base_y / vi.legend.seg_no;
			vi.legend.padding = vi.base_x / 5;//TODO: to settings
			vi.legend.seg_cost = vi.legend.max / vi.legend.seg_no;
			vi.legend.font_px = vi.base_x / 5;

			vi.col_window = (vi.width - vi.base_x) / self.seq.length;
			vi.col_margin = vi.col_window*0.1;//TODO: to settings
			vi.col_seg_height = vi.base_y / vi.legend.max;
			vi.col_width = vi.col_window - 2*vi.col_margin;
			console.log(vi);
		};

		self.create_figs = function() {
			var c,i,
				vi = self.view_info,
				cont = Container(self.ctx, vi);
			self.figs.push(cont);
			for(i=0;i<self.seq.length;i++) {
				c = Column(self.ctx, vi, i, self.seq[i]);
				self.figs.push(c);
			}
		};

		self.redraw = function() {
			//TODO:need normal double buffering
			self.el.style.visibility = 'hidden';
			var i;
			for(i=0;i<self.figs.length;i++) {
				self.figs[i].draw();
			}
			self.el.style.visibility = 'visible';
		};

		self.onload = function(obj) {
			window.addEventListener('resize', self.onresize, false);
			var vi = self.view_info;
			self.seq = obj.chart.set;
			if(!self.seq.length) {}
			self.calc_seq_vals();
			self.calc_view_info();
			self.create_figs();
			self.redraw();
		};

		self.onerror = function(err) {
			console.log(err);
		};

		self.onresize = function() {
			if(window.innerWidth < width || window.innerHeight < height) {
				console.log('need redraw');
				self.el.width = window.innerWidth;
				self.el.height = window.innerHeight;
				self.calc_view_info();
				self.redraw();
			}
			else if(window.innerWidth > width || window.innerHeight > height) {
				console.log("expected size");
				self.el.width = width;
				self.el.height = height;
				self.calc_view_info();
				self.redraw();
			}
		};
		return self;
	}

	return {
		diagram : Diagram
	};
})();

var d = diagram.diagram();
d.init();
