/**
 * Simple Card View
 */
var Card = Backbone.Model.extend({	
	defaults: function() {
		return {
			name: 'Player Name',
			position: 'Player Position',
			team: 'Player Team'
		};
	}
});


/**
 * Collection of Cards or a Deck
 */
var Deck = Backbone.Collection.extend({
	/* collection of cards */
	model: Card,
	
	/* save the deck to local storage */
	localStorage: new Backbone.LocalStorage('baseball-hackday-decks'),
	
	/* functions */
	/**
	 * complete: checks to see if the deck is complete
	 */
	complete: function() {
		/* we must have at least 25 cards */
		if (this.length == 25) {
			return true;
		}		
		return false;
	}
});


var CardView = Backbone.View.extend({
	/* each card will be a list item */
	tagName: 'li',
	
	className: 'card',
	
	/* set our template from the ui */
	template: _.template($('#card-template').html()),
	
	/* tag events */
	events: {
		'dblclick .view' : 'details',
		'click a.discard'  : 'discard'		
	},
	
	/* view initialization, watch the change and remove events on the model */
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'remove', this.remove);
	},
	
	/* render function, updates the card display */
	render: function() {
		/* update the element html to match the model json */
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
	/* remove the card */
	discard: function() {
		this.model.destroy();
	},
	
	/* display the card details in an overlay */
	details: function() {
		alert('display details!');
	}
});